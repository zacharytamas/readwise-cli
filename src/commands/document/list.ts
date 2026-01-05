import { apiRequest } from "../../api";
import { resolveContext } from "../../context";
import { exitWithError } from "../../errors";
import { formatDocumentLine, formatJsonOutput } from "../../format";
import type { ApiResponse, DocumentListOptions, RequestOptions } from "../../types";
import { normalizeStringArray, parseOptionalBoolean, parsePositiveInt } from "../../utils";

export async function handleDocumentList(options: DocumentListOptions) {
  const { token, outputMode, quiet, verbose, timeoutMs } = resolveContext(options);

  const query: RequestOptions["query"] = {};
  if (options.id) {
    query.id = String(options.id);
  }
  if (options.updatedAfter) {
    query.updatedAfter = String(options.updatedAfter);
  }
  if (options.location) {
    query.location = String(options.location);
  }
  if (options.category) {
    query.category = String(options.category);
  }
  const tags = normalizeStringArray(options.tag);
  if (tags) {
    query.tag = tags;
  }
  if (options.pageCursor) {
    query.pageCursor = String(options.pageCursor);
  }
  const withHtmlContent = parseOptionalBoolean(options.withHtmlContent, "--with-html-content");
  if (withHtmlContent !== undefined) {
    query.withHtmlContent = withHtmlContent;
  }
  const withRawSourceUrl = parseOptionalBoolean(options.withRawSourceUrl, "--with-raw-source-url");
  if (withRawSourceUrl !== undefined) {
    query.withRawSourceUrl = withRawSourceUrl;
  }

  const fetchAll = parseOptionalBoolean(options.all, "--all") ?? false;
  const limit = parsePositiveInt(options.limit, "--limit");

  if (!fetchAll) {
    const response = (await apiRequest("GET", "/list/", { query, timeoutMs }, token)) as ApiResponse;
    if (!response || typeof response !== "object") {
      exitWithError("Unexpected response from list endpoint.");
    }
    const results = Array.isArray(response.results) ? response.results : [];
    const limitedResults = limit ? results.slice(0, limit) : results;
    const output: ApiResponse = {
      ...response,
      results: limitedResults,
    };

    if (!quiet) {
      if (outputMode === "json") {
        console.log(formatJsonOutput(output));
      } else {
        for (const item of limitedResults) {
          if (item && typeof item === "object") {
            console.log(formatDocumentLine(item as Record<string, unknown>));
          }
        }
      }
    }
    return;
  }

  const aggregated: Record<string, unknown> = { results: [] as unknown[] };
  let cursor = options.pageCursor ? String(options.pageCursor) : undefined;
  let totalCount: number | undefined;
  let nextPageCursor: string | null | undefined = cursor ?? null;

  while (true) {
    const pageQuery = { ...query };
    if (cursor) {
      pageQuery.pageCursor = cursor;
    } else {
      delete pageQuery.pageCursor;
    }

    if (verbose) {
      console.error(`Fetching page cursor: ${cursor ?? "<initial>"}`);
    }

    const response = (await apiRequest("GET", "/list/", { query: pageQuery, timeoutMs }, token)) as ApiResponse;
    if (!response || typeof response !== "object") {
      exitWithError("Unexpected response from list endpoint.");
    }

    if (typeof response.count === "number" && totalCount === undefined) {
      totalCount = response.count;
    }

    const results = Array.isArray(response.results) ? response.results : [];
    const aggregatedResults = aggregated.results as unknown[];
    aggregatedResults.push(...results);

    nextPageCursor = response.nextPageCursor ?? null;

    if (limit && aggregatedResults.length >= limit) {
      aggregated.results = aggregatedResults.slice(0, limit);
      break;
    }

    if (!nextPageCursor) {
      break;
    }

    cursor = nextPageCursor;
  }

  aggregated.count = totalCount ?? (aggregated.results as unknown[]).length;
  aggregated.nextPageCursor = nextPageCursor;

  if (!quiet) {
    if (outputMode === "json") {
      console.log(formatJsonOutput(aggregated));
    } else {
      for (const item of aggregated.results as unknown[]) {
        if (item && typeof item === "object") {
          console.log(formatDocumentLine(item as Record<string, unknown>));
        }
      }
    }
  }
}
