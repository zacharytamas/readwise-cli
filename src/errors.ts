import { EXIT_CODES } from "./constants";

export function exitWithError(message: string, code = EXIT_CODES.failure): never {
  console.error(`Error: ${message}`);
  process.exit(code);
}
