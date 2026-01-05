#!/usr/bin/env bun
import { ApiError } from "./api";
import { exitWithError } from "./errors";
import { runCli } from "./cli";

runCli().catch((error) => {
  if (error instanceof ApiError) {
    exitWithError(`API error (${error.status}): ${error.message}`);
  }
  if (error instanceof Error && error.name === "AbortError") {
    exitWithError("Request timed out.");
  }
  const message = error instanceof Error ? error.message : String(error);
  exitWithError(message);
});
