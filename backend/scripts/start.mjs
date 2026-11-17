import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import server from "../../dist/server/server.js";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";
const assetsDirectory = resolve(
  fileURLToPath(new URL("../../dist/client/assets/", import.meta.url)),
);
const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

const httpServer = createServer(async (incoming, outgoing) => {
  try {
    const headers = new Headers();
    for (const [name, value] of Object.entries(incoming.headers)) {
      if (Array.isArray(value)) {
        for (const item of value) headers.append(name, item);
      } else if (value !== undefined) {
        headers.set(name, value);
      }
    }

    const method = incoming.method ?? "GET";
    const pathname = new URL(incoming.url ?? "/", `http://${headers.get("host")}`).pathname;
    if (pathname.startsWith("/assets/")) {
      let assetPath;
      try {
        assetPath = resolve(assetsDirectory, decodeURIComponent(pathname.slice(8)));
      } catch {
        outgoing.writeHead(400);
        outgoing.end();
        return;
      }
      if (!assetPath.startsWith(`${assetsDirectory}${sep}`)) {
        outgoing.writeHead(404);
        outgoing.end();
        return;
      }
      try {
        const info = await stat(assetPath);
        if (!info.isFile()) throw new Error("Asset is not a file.");
        outgoing.writeHead(200, {
          "cache-control": "public, max-age=31536000, immutable",
          "content-length": info.size,
          "content-type": contentTypes.get(extname(assetPath)) ?? "application/octet-stream",
          "x-content-type-options": "nosniff",
        });
        if (method === "HEAD") {
          outgoing.end();
          return;
        }
        createReadStream(assetPath)
          .on("error", (error) => {
            console.error("Asset stream failed", error);
            outgoing.destroy(error);
          })
          .pipe(outgoing);
        return;
      } catch (error) {
        if (error.code !== "ENOENT" && error.code !== "ENOTDIR") throw error;
      }
    }

    const init = { method, headers };
    if (method !== "GET" && method !== "HEAD") {
      init.body = Readable.toWeb(incoming);
      init.duplex = "half";
    }

    const protocol = incoming.socket.encrypted ? "https" : "http";
    const request = new Request(
      new URL(incoming.url ?? "/", `${protocol}://${headers.get("host")}`),
      init,
    );
    const response = await server.fetch(request, {}, {});
    for (const [name, value] of response.headers) outgoing.setHeader(name, value);

    const cookies = response.headers.getSetCookie();
    if (cookies.length) outgoing.setHeader("set-cookie", cookies);

    outgoing.writeHead(response.status);
    if (!response.body || method === "HEAD") {
      outgoing.end();
      return;
    }

    Readable.fromWeb(response.body)
      .on("error", (error) => {
        console.error("Response stream failed", error);
        outgoing.destroy(error);
      })
      .pipe(outgoing);
  } catch (error) {
    console.error("Request failed", error);
    if (outgoing.headersSent) {
      outgoing.destroy(error);
      return;
    }
    outgoing.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    outgoing.end("Internal server error");
  }
});

httpServer.listen(port, host, () => {
  console.log(`Whisper listening on ${host}:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    httpServer.close((error) => {
      if (error) {
        console.error("Server shutdown failed", error);
        process.exitCode = 1;
      }
    });
  });
}
