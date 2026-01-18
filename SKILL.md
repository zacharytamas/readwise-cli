---
name: readwise-cli
description: Non-interactive CLI skill for the Readwise Reader API. Use when you need to list, fetch, save, update, or delete Reader documents, or list tags.
compatibility: Requires Bun, network access to https://readwise.io/api/v3/, and READWISE_API_TOKEN set in the environment.
---

Use this skill to operate the Readwise Reader API via the `readwise` CLI.

## Preconditions

- Ensure `READWISE_API_TOKEN` is set in the environment.
- Optional: set `READWISE_API_BASE_URL` to override the API base URL (testing).
- CLI invocation:
  - Installed: `readwise ...`
  - Local dev: `bun run src/index.ts -- ...`

## Command pattern

```
readwise [global flags] document <command> [args]
```

Global flags:

- `-h, --help` Show help
- `--version` Print version
- `--json` Output JSON (default)
- `--plain` Output stable line-based text
- `-q, --quiet` Suppress stdout output
- `-v, --verbose` Extra diagnostics to stderr
- `--no-color` Disable color (also respects `NO_COLOR`)
- `--timeout <ms>` Request timeout in milliseconds (default: 30000)
- `--dry-run` Validate and print request without sending (save/update/delete)

## Commands

### `document list`

List documents from Reader.

Flags:

- `--id <id>` Filter to a specific document id
- `--updated-after <iso8601>` Only documents updated after this timestamp
- `--location <value>` One of: `new`, `later`, `shortlist`, `archive`, `feed`
- `--category <value>` One of: `article`, `email`, `rss`, `highlight`, `note`, `pdf`, `epub`, `tweet`, `video`
- `--tag <value>` Filter by tag key (repeatable, empty for untagged)
- `--page-cursor <cursor>` Start from a specific page cursor
- `--with-html-content` Include `html_content` in results
- `--with-raw-source-url` Include `raw_source_url` in results
- `--all` Fetch all pages
- `--limit <n>` Stop after n results

### `document tags`

List tags from Reader.

Flags:

- `--page-cursor <cursor>` Start from a specific page cursor
- `--all` Fetch all pages
- `--limit <n>` Stop after n results

### `document get`

Fetch a single document by id.

```
readwise document get <id>
```

### `document save`

Save a document by URL.

```
readwise document save <url> [flags]
```

Flags:

- `--title <text>`
- `--author <text>`
- `--summary <text>`
- `--published-date <iso8601>`
- `--image-url <url>`
- `--location <value>` One of: `new`, `later`, `archive`, `feed`
- `--category <value>` One of: `article`, `email`, `rss`, `highlight`, `note`, `pdf`, `epub`, `tweet`, `video`
- `--saved-using <text>`
- `--tags <csv>` Comma-separated tags
- `--notes <text>`
- `--html <string>`
- `--html-file <path>`
- `--clean-html` Only valid when html is provided

### `document update`

Update an existing document by id.

```
readwise document update <id> [flags]
```

Flags:

- `--title <text>`
- `--author <text>`
- `--summary <text>`
- `--published-date <iso8601>`
- `--image-url <url>`
- `--seen` Mark as seen
- `--unseen` Mark as unseen
- `--location <value>` One of: `new`, `later`, `archive`, `feed`
- `--category <value>` One of: `article`, `email`, `rss`, `highlight`, `note`, `pdf`, `epub`, `tweet`, `video`
- `--tags <csv>` Comma-separated tags

### `document delete`

Delete a document by id. Requires `--force`.

```
readwise document delete <id> --force
```

## Output behavior

- JSON is the default output (`--plain` for line-based text).
- Errors and diagnostics are written to stderr.
- `--quiet` suppresses stdout output.
- `document tags --plain` prints `key<TAB>name` per line.

## Safety

- CLI is non-interactive.
- Destructive operations require `--force`.
- Use `--dry-run` to validate payloads for save/update/delete.

## Examples

```
readwise document list --updated-after 2024-01-01T00:00:00Z
readwise document list --location later --all --plain
readwise document tags --all --plain
readwise document get 01gwfvp9pyaabcdgmx14f6ha0
readwise document save https://example.com --title "A Good Read" --tags reading,essay
readwise document update 01gwfvp9pyaabcdgmx14f6ha0 --summary "Short note"
readwise document delete 01gwfvp9pyaabcdgmx14f6ha0 --force
```
