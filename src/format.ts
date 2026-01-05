export function formatJsonOutput(data: unknown): string {
  const space = process.stdout.isTTY ? 2 : 0;
  return JSON.stringify(data, null, space);
}

export function formatDocumentLine(document: Record<string, unknown>): string {
  const id = typeof document.id === "string" ? document.id : "";
  const title =
    (typeof document.title === "string" && document.title) ||
    (typeof document.source_url === "string" && document.source_url) ||
    (typeof document.url === "string" && document.url) ||
    "";
  return [id, title].filter((part) => part.length > 0).join("\t");
}

export function formatTagLine(tag: Record<string, unknown>): string {
  const key = typeof tag.key === "string" ? tag.key : "";
  const name = typeof tag.name === "string" ? tag.name : "";
  return [key, name].filter((part) => part.length > 0).join("\t");
}

export function formatIdAndUrl(data: Record<string, unknown>): string {
  const id = typeof data.id === "string" ? data.id : "";
  const url = typeof data.url === "string" ? data.url : "";
  return [id, url].filter((part) => part.length > 0).join("\t");
}
