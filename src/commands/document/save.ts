import { apiRequest } from "../../api";
import { resolveContext } from "../../context";
import { EXIT_CODES } from "../../constants";
import { exitWithError } from "../../errors";
import { formatIdAndUrl, formatJsonOutput } from "../../format";
import { loadHtmlFromFile } from "../../io";
import type { DocumentSaveOptions, JsonObject } from "../../types";
import { parseCsvList, parseOptionalBoolean } from "../../utils";

export async function handleDocumentSave(url: string, options: DocumentSaveOptions) {
  const { token, outputMode, quiet, dryRun, timeoutMs } = resolveContext(options);

  if (options.html && options.htmlFile) {
    exitWithError("Use only one of --html or --html-file.", EXIT_CODES.usage);
  }

  let html: string | undefined;
  if (options.html) {
    html = String(options.html);
  } else if (options.htmlFile) {
    html = await loadHtmlFromFile(String(options.htmlFile));
  }

  const cleanHtml = parseOptionalBoolean(options.cleanHtml, "--clean-html");
  if (cleanHtml !== undefined && !html) {
    exitWithError("--clean-html requires --html or --html-file.", EXIT_CODES.usage);
  }

  const tags = parseCsvList(options.tags);

  const body: JsonObject = {
    url,
  };

  if (html) {
    body.html = html;
  }
  if (cleanHtml !== undefined) {
    body.should_clean_html = cleanHtml;
  }
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
  if (options.savedUsing) {
    body.saved_using = String(options.savedUsing);
  }
  if (tags.provided) {
    body.tags = tags.values;
  }
  if (options.notes) {
    body.notes = String(options.notes);
  }

  if (dryRun) {
    const payload = {
      dryRun: true,
      method: "POST",
      url: "/save/",
      body,
    };
    if (!quiet) {
      if (outputMode === "json") {
        console.log(formatJsonOutput(payload));
      } else {
        console.log("DRY-RUN POST /save/");
      }
    }
    return;
  }

  const response = (await apiRequest("POST", "/save/", { body, timeoutMs }, token)) as JsonObject;
  if (!quiet) {
    if (outputMode === "json") {
      console.log(formatJsonOutput(response));
    } else if (response && typeof response === "object") {
      console.log(formatIdAndUrl(response));
    }
  }
}
