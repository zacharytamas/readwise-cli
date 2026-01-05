import { apiRequest } from "../../api";
import { resolveContext } from "../../context";
import { EXIT_CODES } from "../../constants";
import { exitWithError } from "../../errors";
import { formatDocumentLine, formatJsonOutput } from "../../format";
import type { ApiResponse, DocumentGetOptions } from "../../types";

export async function handleDocumentGet(id: string, options: DocumentGetOptions) {
  const { token, outputMode, quiet, timeoutMs } = resolveContext(options);

  const response = (await apiRequest(
    "GET",
    "/list/",
    {
      query: { id },
      timeoutMs,
    },
    token
  )) as ApiResponse;

  const results = Array.isArray(response?.results) ? response?.results : [];
  if (results.length === 0) {
    exitWithError(`Document not found: ${id}`, EXIT_CODES.failure);
  }

  const document = results[0];
  if (!quiet) {
    if (outputMode === "json") {
      console.log(formatJsonOutput(document));
    } else if (document && typeof document === "object") {
      console.log(formatDocumentLine(document as Record<string, unknown>));
    }
  }
}
