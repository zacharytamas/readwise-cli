# readwise-cli

Non-interactive CLI for the Readwise Reader API.

## Setup

```bash
bun install
```

Set your Readwise API token:

```bash
export READWISE_API_TOKEN="..."
```

Optional base URL override (for testing):

```bash
export READWISE_API_BASE_URL="https://readwise.io/api/v3/"
```

## Usage

```bash
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
- `--dry-run` Validate and print the request without sending it

This CLI is non-interactive. Destructive operations require `--force`.
`--dry-run` applies to `document save`, `document update`, and `document delete`.

## Commands

### `document list`

List documents from Reader.

```bash
readwise document list [flags]
```

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

```bash
readwise document tags [flags]
```

Flags:

- `--page-cursor <cursor>` Start from a specific page cursor
- `--all` Fetch all pages
- `--limit <n>` Stop after n results

### `document get`

Fetch a single document by id.

```bash
readwise document get <id>
```

### `document save`

Save a document by URL.

```bash
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

```bash
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

Delete a document by id (requires `--force`).

```bash
readwise document delete <id> --force
```

## Output

- JSON is the default output (`--plain` for line-based text).
- Errors and diagnostics are written to stderr.
- `--quiet` suppresses stdout output.
- `document tags --plain` prints `key<TAB>name` per line; `--json` prints the raw API response (`count`, `nextPageCursor`, `results`).

## Examples

```bash
readwise document list --updated-after 2024-01-01T00:00:00Z
readwise document list --location later --all --plain
readwise document tags --all --plain
readwise document get 01gwfvp9pyaabcdgmx14f6ha0
readwise document save https://example.com --title "A Good Read" --tags reading,essay
readwise document update 01gwfvp9pyaabcdgmx14f6ha0 --summary "Short note"
readwise document delete 01gwfvp9pyaabcdgmx14f6ha0 --force
```

## Local runs

```bash
bun run src/index.ts -- document list
```
