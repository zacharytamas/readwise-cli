import { EXIT_CODES } from "./constants";
import { exitWithError } from "./errors";

export async function loadHtmlFromFile(path: string): Promise<string> {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    exitWithError(`HTML file not found: ${path}`, EXIT_CODES.usage);
  }
  return await file.text();
}
