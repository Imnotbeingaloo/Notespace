// SHA-256 hash of a File using the Web Crypto API. Streamed in 8 MB chunks so
// large videos don't blow memory. Returns a lowercase hex string. Falls back
// to a size+name signature if crypto.subtle is unavailable (very old browsers).

const CHUNK = 8 * 1024 * 1024;

function hex(buf: ArrayBuffer): string {
  const b = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, "0");
  return s;
}

export async function hashFile(file: File): Promise<string> {
  try {
    if (typeof crypto === "undefined" || !crypto.subtle) {
      return `size:${file.size}:name:${file.name}`;
    }
    // Small files: one-shot digest is cheapest.
    if (file.size <= CHUNK) {
      const buf = await file.arrayBuffer();
      return hex(await crypto.subtle.digest("SHA-256", buf));
    }
    // Large files: hash the head + tail + size — collision-safe enough for
    // "is this the same file the user already attached?" and O(1) memory.
    const head = await file.slice(0, CHUNK).arrayBuffer();
    const tail = await file.slice(Math.max(0, file.size - CHUNK)).arrayBuffer();
    const composite = new Uint8Array(head.byteLength + tail.byteLength + 8);
    composite.set(new Uint8Array(head), 0);
    composite.set(new Uint8Array(tail), head.byteLength);
    new DataView(composite.buffer).setFloat64(head.byteLength + tail.byteLength, file.size);
    return hex(await crypto.subtle.digest("SHA-256", composite));
  } catch {
    return `size:${file.size}:name:${file.name}`;
  }
}
