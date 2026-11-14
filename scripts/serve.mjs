import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(fileURLToPath(new URL("../out", import.meta.url)));
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".ico": "image/x-icon",
};
export function startServer(port = Number(process.env.PORT ?? 3000)) {
  return createServer(async (req, res) => {
    try {
      if (req.method !== "GET" && req.method !== "HEAD") {
        res.writeHead(405);
        res.end();
        return;
      }
      const url = new URL(req.url, "http://localhost");
      const path = decodeURIComponent(url.pathname);
      let target = resolve(root, "." + path);
      if (target !== root && !target.startsWith(root + sep)) {
        res.writeHead(403);
        res.end();
        return;
      }
      try {
        if ((await stat(target)).isDirectory())
          target = resolve(target, "index.html");
      } catch {}
      let data;
      let code = 200;
      try {
        data = await readFile(target);
      } catch {
        data = await readFile(resolve(root, "404.html"));
        code = 404;
        target = "404.html";
      }
      res.writeHead(code, {
        "Content-Type": types[extname(target)] ?? "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache",
      });
      res.end(req.method === "HEAD" ? undefined : data);
    } catch {
      res.writeHead(400);
      res.end("Unable to serve request. Run npm run build first.");
    }
  }).listen(port, "127.0.0.1");
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const server = startServer();
  server.on("listening", () =>
    console.log(
      `ASTRA production preview: http://127.0.0.1:${server.address().port}`,
    ),
  );
  server.on("error", (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
