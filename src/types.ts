export type JsonObject = Record<string, unknown>;

export type ApiResponse = {
  count?: number;
  nextPageCursor?: string | null;
  results?: unknown[];
};

export type RequestOptions = {
  query?: Record<string, string | boolean | string[] | undefined>;
  body?: JsonObject;
  timeoutMs: number;
};

export type OutputMode = "json" | "plain";

export type GlobalOptions = {
  json?: boolean | string;
  plain?: boolean | string;
  quiet?: boolean | string;
  verbose?: boolean | string;
  timeout?: string | number;
  dryRun?: boolean | string;
  color?: boolean;
};

export type DocumentListOptions = GlobalOptions & {
  id?: string;
  updatedAfter?: string;
  location?: string;
  category?: string;
  tag?: string | string[];
  pageCursor?: string;
  withHtmlContent?: boolean | string;
  withRawSourceUrl?: boolean | string;
  all?: boolean | string;
  limit?: string | number;
};

export type DocumentTagsOptions = GlobalOptions & {
  pageCursor?: string;
  all?: boolean | string;
  limit?: string | number;
};

export type DocumentGetOptions = GlobalOptions;

export type DocumentSaveOptions = GlobalOptions & {
  title?: string;
  author?: string;
  summary?: string;
  publishedDate?: string;
  imageUrl?: string;
  location?: string;
  category?: string;
  savedUsing?: string;
  tags?: string | string[];
  notes?: string;
  html?: string;
  htmlFile?: string;
  cleanHtml?: boolean | string;
};

export type DocumentUpdateOptions = GlobalOptions & {
  title?: string;
  author?: string;
  summary?: string;
  publishedDate?: string;
  imageUrl?: string;
  location?: string;
  category?: string;
  tags?: string | string[];
  seen?: boolean | string;
  unseen?: boolean | string;
};

export type DocumentDeleteOptions = GlobalOptions & {
  force?: boolean | string;
};

export type DocumentCommandOptions = DocumentListOptions &
  DocumentTagsOptions &
  DocumentSaveOptions &
  DocumentUpdateOptions &
  DocumentDeleteOptions;

export type CommandContext = {
  token: string;
  outputMode: OutputMode;
  quiet: boolean;
  verbose: boolean;
  dryRun: boolean;
  timeoutMs: number;
};
