import { test, expect } from "bun:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const cliPath = path.join(rootDir, "src", "index.ts");

async function runCli(args: string[], envOverrides: Record<string, string | undefined> = {}) {
  const proc = Bun.spawn([process.execPath, "run", cliPath, "--", ...args], {
    cwd: rootDir,
    env: { ...Bun.env, ...envOverrides },
    stdout: "pipe",
    stderr: "pipe",
  });

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;
  return { stdout, stderr, exitCode };
}

test("document tags returns results", async () => {
  const server = Bun.serve({
    port: 0,
    fetch(req) {
      const url = new URL(req.url);
      if (url.pathname !== "/api/v3/tags/") {
        return new Response("Not Found", { status: 404 });
      }
      if (req.headers.get("Authorization") !== "Token test-token") {
        return new Response("Unauthorized", { status: 401 });
      }
      return Response.json({
        count: 2,
        nextPageCursor: null,
        results: [
          { key: "first-tag", name: "First tag" },
          { key: "second-tag", name: "Second tag" },
        ],
      });
    },
  });

  try {
    const baseUrl = `http://127.0.0.1:${server.port}/api/v3/`;
    const { stdout, stderr, exitCode } = await runCli(["document", "tags", "--json"], {
      READWISE_API_TOKEN: "test-token",
      READWISE_API_BASE_URL: baseUrl,
    });

    expect(exitCode).toBe(0);
    expect(stderr.trim()).toBe("");
    const data = JSON.parse(stdout);
    expect(Array.isArray(data.results)).toBe(true);
    expect(data.results).toHaveLength(2);
    expect(data.results[0].key).toBe("first-tag");
  } finally {
    server.stop();
  }
});

test("document tags --all aggregates pages", async () => {
  const server = Bun.serve({
    port: 0,
    fetch(req) {
      const url = new URL(req.url);
      if (url.pathname !== "/api/v3/tags/") {
        return new Response("Not Found", { status: 404 });
      }
      if (req.headers.get("Authorization") !== "Token test-token") {
        return new Response("Unauthorized", { status: 401 });
      }

      const pageCursor = url.searchParams.get("pageCursor");
      if (!pageCursor) {
        return Response.json({
          count: 2,
          nextPageCursor: "next",
          results: [{ key: "alpha", name: "Alpha" }],
        });
      }

      if (pageCursor === "next") {
        return Response.json({
          count: 2,
          nextPageCursor: null,
          results: [{ key: "beta", name: "Beta" }],
        });
      }

      return Response.json({ count: 2, nextPageCursor: null, results: [] });
    },
  });

  try {
    const baseUrl = `http://127.0.0.1:${server.port}/api/v3/`;
    const { stdout, stderr, exitCode } = await runCli(["document", "tags", "--all", "--json"], {
      READWISE_API_TOKEN: "test-token",
      READWISE_API_BASE_URL: baseUrl,
    });

    expect(exitCode).toBe(0);
    expect(stderr.trim()).toBe("");
    const data = JSON.parse(stdout);
    expect(data.results).toHaveLength(2);
    expect(data.nextPageCursor).toBeNull();
  } finally {
    server.stop();
  }
});

test("document save --dry-run prints the request payload", async () => {
  const { stdout, stderr, exitCode } = await runCli(
    [
      "document",
      "save",
      "https://example.com",
      "--tags",
      "reading,essay",
      "--dry-run",
      "--json",
    ],
    {
      READWISE_API_TOKEN: "test-token",
    }
  );

  expect(exitCode).toBe(0);
  expect(stderr.trim()).toBe("");
  const data = JSON.parse(stdout);
  expect(data.dryRun).toBe(true);
  expect(data.method).toBe("POST");
  expect(data.url).toBe("/save/");
  expect(data.body.url).toBe("https://example.com");
  expect(data.body.tags).toEqual(["reading", "essay"]);
});

test("missing token returns auth error", async () => {
  const { stderr, exitCode } = await runCli(["document", "list", "--json"], {
    READWISE_API_TOKEN: "",
  });

  expect(exitCode).toBe(3);
  expect(stderr).toContain("READWISE_API_TOKEN is required.");
});
