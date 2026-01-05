import { DEFAULT_TIMEOUT_MS, EXIT_CODES } from "./constants";
import { exitWithError } from "./errors";
import type { CommandContext, GlobalOptions, OutputMode } from "./types";
import { parseOptionalBoolean, parsePositiveInt } from "./utils";

export function resolveOutputMode(options: GlobalOptions): OutputMode {
  const jsonFlag = parseOptionalBoolean(options.json, "--json");
  const plainFlag = parseOptionalBoolean(options.plain, "--plain");

  if (jsonFlag && plainFlag) {
    exitWithError("--json and --plain are mutually exclusive.", EXIT_CODES.usage);
  }

  if (plainFlag) {
    return "plain";
  }

  if (jsonFlag === false) {
    return "plain";
  }

  return "json";
}

export function resolveTimeout(options: GlobalOptions): number {
  const timeout = parsePositiveInt(options.timeout, "--timeout");
  return timeout ?? DEFAULT_TIMEOUT_MS;
}

export function resolveContext(options: GlobalOptions): CommandContext {
  const outputMode = resolveOutputMode(options);
  const quiet = parseOptionalBoolean(options.quiet, "--quiet") ?? false;
  const verbose = parseOptionalBoolean(options.verbose, "--verbose") ?? false;
  const dryRun = parseOptionalBoolean(options.dryRun, "--dry-run") ?? false;
  const timeoutMs = resolveTimeout(options);

  if (quiet && verbose) {
    exitWithError("--quiet and --verbose are mutually exclusive.", EXIT_CODES.usage);
  }

  const token = Bun.env.READWISE_API_TOKEN;
  if (!token) {
    exitWithError("READWISE_API_TOKEN is required.", EXIT_CODES.auth);
  }

  return { token, outputMode, quiet, verbose, dryRun, timeoutMs };
}
