import cac from "cac";
import { DEFAULT_TIMEOUT_MS, EXIT_CODES } from "./constants";
import { exitWithError } from "./errors";
import {
  handleDocumentDelete,
  handleDocumentGet,
  handleDocumentList,
  handleDocumentSave,
  handleDocumentTags,
  handleDocumentUpdate,
} from "./commands/document/index";
import type { DocumentCommandOptions, DocumentDeleteOptions, DocumentGetOptions } from "./types";

export async function runCli() {
  const pkgUrl = new URL("../package.json", import.meta.url);
  const pkg = await Bun.file(pkgUrl).json();
  const version = typeof pkg?.version === "string" ? pkg.version : "0.0.0";

  const cli = cac("readwise");

  cli.usage("[global flags] <resource> <command> [args]");
  cli.option("--json", "Output JSON (default)");
  cli.option("--plain", "Output stable line-based text");
  cli.option("-q, --quiet", "Suppress stdout output");
  cli.option("-v, --verbose", "Extra diagnostics to stderr");
  cli.option("--no-color", "Disable color (also respects NO_COLOR)");
  cli.option(
    "--timeout <ms>",
    `Request timeout in milliseconds (default: ${DEFAULT_TIMEOUT_MS})`
  );
  cli.option("--dry-run", "Validate and print the request without sending it");
  cli.example("readwise document list --updated-after 2024-01-01T00:00:00Z");
  cli.example("readwise document save https://example.com --tags reading,essay");
  cli.example("readwise document delete 01gwfvp9pyaabcdgmx14f6ha0 --force");

  cli.version(version, "--version");
  cli.help();

  const documentCommand = cli
    .command("document [action] [target]", "Reader API documents")
    .usage(
      `document <action> [target]\n\nActions:\n  list\n  tags\n  get <id>\n  save <url>\n  update <id>\n  delete <id>`
    )
    .option("--id <id>", "Filter to a specific document id")
    .option("--updated-after <iso8601>", "Only documents updated after this timestamp")
    .option("--location <value>", "One of: new, later, shortlist, archive, feed")
    .option(
      "--category <value>",
      "One of: article, email, rss, highlight, note, pdf, epub, tweet, video"
    )
    .option("--tag <value>", "Filter by tag key (repeatable, empty for untagged)")
    .option("--page-cursor <cursor>", "Start from a specific page cursor")
    .option("--with-html-content", "Include html_content in results")
    .option("--with-raw-source-url", "Include raw_source_url in results")
    .option("--all", "Fetch all pages")
    .option("--limit <n>", "Stop after n results")
    .option("--title <text>", "Override document title")
    .option("--author <text>", "Override document author")
    .option("--summary <text>", "Document summary")
    .option("--published-date <iso8601>", "Published date in ISO 8601 format")
    .option("--image-url <url>", "Cover image URL")
    .option("--saved-using <text>", "Source label")
    .option("--tags <csv>", "Comma-separated tags")
    .option("--notes <text>", "Top-level note")
    .option("--html <string>", "HTML content")
    .option("--html-file <path>", "HTML content from file")
    .option("--clean-html", "Clean HTML and parse metadata")
    .option("--seen", "Mark as seen")
    .option("--unseen", "Mark as unseen")
    .option("--force", "Confirm deletion")
    .example("readwise document list --updated-after 2024-01-01T00:00:00Z")
    .example("readwise document tags --all --plain")
    .example("readwise document save https://example.com --tags reading,essay")
    .action(async (action?: string, target?: string, options?: DocumentCommandOptions) => {
      const resolvedAction = action ?? "";
      if (!resolvedAction) {
        documentCommand.outputHelp();
        process.exit(EXIT_CODES.usage);
      }

      const resolvedOptions = (options ?? {}) as DocumentCommandOptions;

      switch (resolvedAction) {
        case "list":
          await handleDocumentList(resolvedOptions);
          return;
        case "tags":
          await handleDocumentTags(resolvedOptions);
          return;
        case "get":
          if (!target) {
            exitWithError("Missing document id.", EXIT_CODES.usage);
          }
          await handleDocumentGet(target, resolvedOptions as DocumentGetOptions);
          return;
        case "save":
          if (!target) {
            exitWithError("Missing document URL.", EXIT_CODES.usage);
          }
          await handleDocumentSave(target, resolvedOptions);
          return;
        case "update":
          if (!target) {
            exitWithError("Missing document id.", EXIT_CODES.usage);
          }
          await handleDocumentUpdate(target, resolvedOptions);
          return;
        case "delete":
          if (!target) {
            exitWithError("Missing document id.", EXIT_CODES.usage);
          }
          await handleDocumentDelete(target, resolvedOptions as DocumentDeleteOptions);
          return;
        default:
          exitWithError(`Unknown document command: ${resolvedAction}`, EXIT_CODES.usage);
      }
    });

  cli.on("command:*", (command) => {
    console.error(`Error: Unknown command ${command.join(" ")}.`);
    cli.outputHelp();
    process.exit(EXIT_CODES.usage);
  });

  if (process.argv.slice(2).length === 0) {
    cli.outputHelp();
    process.exit(EXIT_CODES.usage);
  }

  cli.parse(process.argv, { run: false });
  await cli.runMatchedCommand();
}
