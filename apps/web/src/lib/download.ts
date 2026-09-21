/**
 * Download and clipboard helpers.
 *
 * The app is a static export with no server, so products are generated in the
 * browser and handed to the user as a Blob.
 */

/** Triggers a real file download of `content` as `filename`. */
export function downloadText(filename: string, content: string, mime = 'text/markdown'): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Revoke on the next tick so the download has started.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * Copies `text` to the clipboard.
 *
 * `navigator.clipboard` requires a secure context and rejects rather than
 * throwing, so fall back to a hidden textarea and `execCommand` — which still
 * works on plain http, e.g. a local dev server on a LAN address.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }

  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Builds a filename like SENTINEL_RESOLVE_WARNORD_191400Z.md */
export function productFilename(
  operationName: string,
  productId: string,
  extension: 'md' | 'txt'
): string {
  const slug = (s: string) =>
    s.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const dtg = `${pad(now.getUTCDate())}${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}Z`;
  return `${slug(operationName)}_${slug(productId)}_${dtg}.${extension}`;
}
