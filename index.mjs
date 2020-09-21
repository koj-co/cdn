import http from "http";
import fs from "fs";
import path from "path";

const files = fs.readdirSync("assets").map((file) => `/${file}`);

http
  .createServer((request, response) => {
    const URL = (request.url ?? "").replace("/koj/image/upload", "");
    if (files.includes(URL)) {
      response.setHeader(
        "Cache-Control",
        "public, max-age=31536000, immutable"
      );
      response.setHeader("Server", "KojCDN");
      response.setHeader(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload"
      );
      return fs.createReadStream(path.join(".", "assets", URL)).pipe(response);
    }
    if (URL === "/favicon.ico") {
      response.writeHead(302, {
        Location: "https://koj.co/favicon.ico",
      });
      return response.end();
    }
    if (URL === "/") {
      response.writeHead(200, {
        "Content-Type": "application/json",
      });
      return response.end("{ ok: true }");
    }
    let result = [];
    var options = {
      host: "res.cloudinary.com",
      port: 80,
      path: `/koj/image/upload${URL}`,
    };
    http
      .get(options, (res) => {
        res.on("data", (chunk) => {
          result.push(chunk);
        });
        res.on("end", () => {
          Object.keys(res.headers).forEach((header) => {
            response.setHeader(header, res.headers[header]);
          });
          response.setHeader(
            "Cache-Control",
            "public, max-age=31536000, immutable"
          );
          response.setHeader("Server", "KojCDN");
          response.setHeader(
            "Strict-Transport-Security",
            "max-age=63072000; includeSubDomains; preload"
          );
          response.write(Buffer.concat(result));
          result = [];
          response.end();
        });
      })
      .on("error", () => {});
  })
  .listen(80);
