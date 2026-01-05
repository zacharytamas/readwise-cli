import { apiRequest } from "../../api";
import { resolveContext } from "../../context";
import { EXIT_CODES } from "../../constants";
import { exitWithError } from "../../errors";
import { formatJsonOutput } from "../../format";
import type { DocumentDeleteOptions } from "../../types";
import { parseOptionalBoolean } from "../../utils";

export async function handleDocumentDelete(id: string, options: DocumentDeleteOptions) {
  const { token, outputMode, quiet, dryRun, timeoutMs } = resolveContext(options);

  const force = parseOptionalBoolean(options.force, "--force") ?? false;
  if (!force) {
    exitWithError("Delete requires --force.", EXIT_CODES.usage);
  }

  if (dryRun) {
    const payload = {
      dryRun: true,
      method: "DELETE",
      url: `/delete/${id}/`,
    };
    if (!quiet) {
      if (outputMode === "json") {
        console.log(formatJsonOutput(payload));
      } else {
        console.log(`DRY-RUN DELETE /delete/${id}/`);
      }
    }
    return;
  }

  await apiRequest("DELETE", `/delete/${id}/`, { timeoutMs }, token);

  if (!quiet) {
    if (outputMode === "json") {
      console.log(formatJsonOutput({ deleted: true, id }));
    } else {
      console.log(id);
    }
  }
}
