#!/usr/bin/env python3
"""
Analysis for the time-to-WARNORD trial.

Reads the raw JSON exported from the trial console and prints the paired
comparison, optionally merging blind completeness scores.

Standard library only, deliberately. The trial machine is the air-gapped one,
and a script that needs pip is a script that does not run on the day.

Usage:
    python3 scripts/trial/analyze.py jpe-trial-raw-*.json
    python3 scripts/trial/analyze.py raw.json --scores docs/trial/completeness.csv
"""

from __future__ import annotations

import argparse
import csv
import itertools
import json
import statistics
import sys
from pathlib import Path

IDLE_THRESHOLD_MS = 120_000


# ---------------------------------------------------------------- derivation


def metrics(session: dict) -> dict:
    """Mirrors apps/web/src/lib/telemetry/metrics.ts.

    Recomputed here from the raw log rather than read from the CSV, so the
    published numbers can be regenerated from the published data by someone
    who does not trust the app that produced them.
    """
    events = session["events"]
    last = events[-1]["t"] if events else 0

    idle = sum(
        b["t"] - a["t"]
        for a, b in zip(events, events[1:])
        if b["t"] - a["t"] > IDLE_THRESHOLD_MS
    )

    def milestone(mid: str):
        for e in events:
            if e["kind"] == "milestone" and e.get("detail", {}).get("id") == mid:
                return e["t"]
        return None

    edits = [e for e in events if e["kind"] == "field.edit"]
    ai_results = [e for e in events if e["kind"] == "ai.result"]

    return {
        "participant": session["participant"],
        "arm": session["arm"],
        "packet": session["packet"],
        "order": session["order"],
        "wall_s": last / 1000,
        "active_s": (last - idle) / 1000,
        "idle_s": idle / 1000,
        "to_warnord_s": (milestone("warnord.complete") or 0) / 1000 or None,
        "edits": len(edits),
        "fields": len({e["detail"]["path"] for e in edits if "path" in e.get("detail", {})}),
        "ai_calls": len([e for e in events if e["kind"] == "ai.request"]),
        "ai_wait_s": sum(e.get("detail", {}).get("ms", 0) for e in ai_results) / 1000,
        "notes": session.get("observerNotes", ""),
    }


# ----------------------------------------------------------------- statistics


def wilcoxon_exact(deltas: list[float]) -> tuple[float, float]:
    """Exact two-sided Wilcoxon signed-rank p-value by enumeration.

    Exact rather than the normal approximation because the approximation is
    meaningless at this sample size. Enumerating 2^n sign assignments is
    instant for n under about 20.

    Returns (W, p). Zero differences are dropped, per the standard treatment.
    """
    nonzero = [d for d in deltas if d != 0]
    n = len(nonzero)
    if n == 0:
        return 0.0, 1.0

    order = sorted(range(n), key=lambda i: abs(nonzero[i]))
    ranks = [0.0] * n
    i = 0
    while i < n:
        j = i
        while j + 1 < n and abs(nonzero[order[j + 1]]) == abs(nonzero[order[i]]):
            j += 1
        shared = (i + j + 2) / 2  # average rank, 1-based
        for k in range(i, j + 1):
            ranks[order[k]] = shared
        i = j + 1

    w_plus = sum(r for d, r in zip(nonzero, ranks) if d > 0)

    total = sum(ranks)
    observed = min(w_plus, total - w_plus)
    count = 0
    for signs in itertools.product([0, 1], repeat=n):
        wp = sum(r for s, r in zip(signs, ranks) if s)
        if min(wp, total - wp) <= observed:
            count += 1

    return w_plus, count / (2 ** n)


def smallest_possible_p(n: int) -> float:
    """The best two-sided p this design can produce at a given n."""
    if n == 0:
        return 1.0
    return 2 / (2 ** n)


# --------------------------------------------------------------------- report


def load_sessions(paths: list[Path]) -> list[dict]:
    out = []
    for p in paths:
        payload = json.loads(p.read_text())
        out.extend(payload["sessions"] if isinstance(payload, dict) else payload)
    return [s for s in out if s.get("endedAt")]


def load_scores(path: Path) -> dict[tuple[str, str], float]:
    """completeness.csv -> {(participant, arm): mean score across scorers}."""
    buckets: dict[tuple[str, str], list[float]] = {}
    with path.open() as fh:
        for row in csv.DictReader(fh):
            key = (row["participant"].strip().upper(), row["arm"].strip().lower())
            buckets.setdefault(key, []).append(float(row["score"]))
    return {k: statistics.mean(v) for k, v in buckets.items()}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("raw", nargs="+", type=Path)
    ap.add_argument("--scores", type=Path, help="Blind completeness scores CSV.")
    args = ap.parse_args()

    rows = [metrics(s) for s in load_sessions(args.raw)]
    if not rows:
        print("No completed sessions found.", file=sys.stderr)
        return 1

    scores = load_scores(args.scores) if args.scores else {}

    print("\nPER-SESSION")
    print("-" * 78)
    head = f"{'code':<6}{'arm':<10}{'pkt':<5}{'run':<5}{'to WARNORD':>12}{'active':>9}{'AI wait':>9}"
    if scores:
        head += f"{'score':>8}"
    print(head)
    for r in sorted(rows, key=lambda r: (r["participant"], r["arm"])):
        line = (
            f"{r['participant']:<6}{r['arm']:<10}{r['packet']:<5}{r['order']:<5}"
            f"{fmt(r['to_warnord_s']):>12}{fmt(r['active_s']):>9}{fmt(r['ai_wait_s']):>9}"
        )
        if scores:
            s = scores.get((r["participant"], r["arm"]))
            line += f"{(f'{s:.1f}' if s is not None else '—'):>8}"
        print(line)

    # Pair each participant against themselves.
    by_code: dict[str, dict[str, dict]] = {}
    for r in rows:
        by_code.setdefault(r["participant"], {})[r["arm"]] = r

    paired = [
        (code, arms["baseline"], arms["tool"])
        for code, arms in sorted(by_code.items())
        if "baseline" in arms and "tool" in arms
    ]
    unpaired = [c for c, a in by_code.items() if len(a) < 2]

    if not paired:
        print("\nNo participant has completed both conditions yet.")
        return 0

    print("\n\nPAIRED — time to WARNORD")
    print("-" * 78)
    print(f"{'code':<8}{'current':>10}{'JPE':>10}{'delta':>10}{'change':>10}")
    deltas = []
    for code, base, tool in paired:
        if base["to_warnord_s"] is None or tool["to_warnord_s"] is None:
            print(f"{code:<8}{'incomplete — no WARNORD milestone in one condition':>60}")
            continue
        d = base["to_warnord_s"] - tool["to_warnord_s"]
        pct = 100 * d / base["to_warnord_s"]
        deltas.append(d)
        print(f"{code:<8}{fmt(base['to_warnord_s']):>10}{fmt(tool['to_warnord_s']):>10}"
              f"{fmt(d):>10}{pct:>9.0f}%")

    if deltas:
        faster = sum(1 for d in deltas if d > 0)
        w, p = wilcoxon_exact(deltas)
        floor = smallest_possible_p(len(deltas))
        print("-" * 78)
        print(f"n = {len(deltas)} paired   faster with JPE: {faster}/{len(deltas)}")
        print(f"median delta: {fmt(statistics.median(deltas))}  "
              f"range: {fmt(min(deltas))} to {fmt(max(deltas))}")
        print(f"Wilcoxon signed-rank: W+ = {w:.1f}, exact two-sided p = {p:.4f}")
        print(f"floor for this n: the smallest p obtainable is {floor:.4f}")
        if floor > 0.05:
            print("  -> At this n no result can reach p < 0.05. Report the paired")
            print("     differences as a pilot measurement, not as a significance claim.")

    if scores:
        print("\n\nPAIRED — WARNORD completeness (blind-scored)")
        print("-" * 78)
        print(f"{'code':<8}{'current':>10}{'JPE':>10}{'delta':>10}")
        sd = []
        for code, _, _ in paired:
            b = scores.get((code, "baseline"))
            t = scores.get((code, "tool"))
            if b is None or t is None:
                continue
            sd.append(t - b)
            print(f"{code:<8}{b:>10.1f}{t:>10.1f}{t - b:>+10.1f}")
        if sd:
            print("-" * 78)
            print(f"median delta: {statistics.median(sd):+.1f} points  "
                  f"better with JPE: {sum(1 for d in sd if d > 0)}/{len(sd)}")
            print("A speed gain that costs completeness is not a gain. Report both.")

    if unpaired:
        print(f"\nUnpaired participants (one condition only): {', '.join(sorted(unpaired))}")
        print("Report these too. Dropping them after seeing the numbers is how a")
        print("five-person trial turns into a five-person advertisement.")

    print()
    return 0


def fmt(seconds: float | None) -> str:
    if seconds is None:
        return "—"
    sign = "-" if seconds < 0 else ""
    s = abs(seconds)
    return f"{sign}{int(s // 60)}:{int(s % 60):02d}"


if __name__ == "__main__":
    raise SystemExit(main())
