# Local inference setup

The assistant needs an OpenAI-compatible endpoint on this machine. This is how
it is installed here.

## Where things live

| What | Path |
|---|---|
| Ollama | `/Applications/Ollama.app` |
| Models (~15 GB) | `~/.ollama/models` |
| Auto-start | `~/Library/LaunchAgents/com.ollama.serve.plist` |
| Log | `~/Library/Logs/ollama.log` |

Both the application and the models previously sat in a session scratch
directory under `/private/tmp`, which is temporary storage. They would have
been deleted without warning — most likely the first time the machine was
restarted, and quite possibly the night before a demo.

## Models

| Model | Role |
|---|---|
| `llama3.1:8b` | Text: task extraction, COA drafting and critique |
| `qwen3-vl:8b` | Vision: transcribing scanned orders and photographed documents |
| `llama3.2:3b`, `qwen3:4b` | Benchmark comparators, kept for reference only |

`llama3.1:8b` is the default from measured behaviour, not size. Reasoning
models burn hundreds of hidden tokens before answering, and 3B-class models are
unstable on extraction — three identical runs of `llama3.2:3b` returned 4, 8
and 1 tasks. `llama3.1:8b` returned 6, 5, 5.

## Auto-start

The LaunchAgent starts the server at login and restarts it if it exits, since
the tool is unusable without inference and a demo is the worst possible place
to discover that. It binds `127.0.0.1:11434` — nothing off this machine can
reach the model, which is the point of running inference locally.

```bash
launchctl list | grep ollama          # is it running
tail -f ~/Library/Logs/ollama.log     # what it is doing
launchctl unload ~/Library/LaunchAgents/com.ollama.serve.plist   # stop it
launchctl load -w ~/Library/LaunchAgents/com.ollama.serve.plist  # start it
```

Do not also launch `Ollama.app` from the Dock. Both would try to bind 11434.

## Before a demo

1. `launchctl list | grep ollama` returns a line with exit status `0`.
2. In the app, open assistant settings and press **Test connection**.
3. Run one extraction against `fixtures/ingest/PLANORD_scanned.pdf`. The first
   call after a restart loads the model from disk and takes roughly 35 seconds;
   later calls are faster. Warm it up before anyone is watching.
