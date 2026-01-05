import { apiRequest } from "../../api";
import { resolveContext } from "../../context";
import { EXIT_CODES } from "../../constants";
import { exitWithError } from "../../errors";
import { formatIdAndUrl, formatJsonOutput } from "../../format";
import type { DocumentUpdateOptions, JsonObject } from "../../types";
import { parseCsvList, parseOptionalBoolean } from "../../utils";

export async function handleDocumentUpdate(id: string, options: DocumentUpdateOptions) {
  const { token, outputMode, quiet, dryRun, timeoutMs } = resolveContext(options);

  const tags = parseCsvList(options.tags);
  const seenFlag = parseOptionalBoolean(options.seen, "--seen");
  const unseenFlag = parseOptionalBoolean(options.unseen, "--unseen");

  if (seenFlag !== undefined && unseenFlag !== undefined) {
    exitWithError("Use only one of --seen or --unseen.", EXIT_CODES.usage);
  }

  const body: JsonObject = {};

  if (options.title) {
    body.title = String(options.title);
  }
  if (options.author) {
    body.author = String(options.author);
  }
  if (options.summary) {
    body.summary = String(options.summary);
  }
  if (options.publishedDate) {
    body.published_date = String(options.publishedDate);
  }
  if (options.imageUrl) {
    body.image_url = String(options.imageUrl);
  }
  if (options.location) {
    body.location = String(options.location);
  }
  if (options.category) {
    body.category = String(options.category);
  }
  if (tags.provided) {
    body.tags = tags.values;
  }
  if (seenFlag !== undefined) {
    body.seen = seenFlag;
  } else if (unseenFlag === true) {
    body.seen = false;
  }

  if (Object.keys(body).length === 0) {
    exitWithError("No fields provided to update.", EXIT_CODES.usage);
  }

  if (dryRun) {
    const payload = {
      dryRun: true,
      method: "PATCH",
      url: `/update/${id}/`,
      body,
    };
    if (!quiet) {
      if (outputMode === "json") {
        console.log(formatJsonOutput(payload));
      } else {
        console.log(`DRY-RUN PATCH /update/${id}/`);
      }
    }
    return;
  }

  const response = (await apiRequest("PATCH", `/update/${id}/`, { body, timeoutMs }, token)) as JsonObject;
  if (!quiet) {
    if (outputMode === "json") {
      console.log(formatJsonOutput(response));
    } else if (response && typeof response === "object") {
      console.log(formatIdAndUrl(response));
    }
  }
}
