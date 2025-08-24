"use strict";

/**
 * Simple Anime REST API using only Node core modules.
 * Endpoints:
 *   GET    /health                     -> API status
 *   GET    /api/anime                  -> list (optional ?q=search)
 *   GET    /api/anime/:id              -> get one
 *   POST   /api/anime                  -> create { title, year?, genres?[], author?, studio? }
 *   PUT    /api/anime/:id              -> replace { title, year?, genres?[], author?, studio? }
 *   PATCH  /api/anime/:id              -> partial update
 *   DELETE /api/anime/:id              -> delete
 */

const http = require("http");
const url = require("url");
const fs = require("fs").promises;
const path = require("path");
const { randomUUID } = require("crypto");

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data", "anime.json");

// ---------- helpers ----------
async function readData() {
  try {
    const txt = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(txt);
  } catch (err) {
    if (err.code === "ENOENT") {
      await saveData([]);
      return [];
    }
    throw err;
  }
}

async function saveData(data) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

function send(res, status, data, headers = {}) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
    ...headers,
  });
  res.end(body);
}

function notFound(res) {
  send(res, 404, { error: "Not found" });
}

function matchRoute(pathname, pattern) {
  const p = pattern.split("/").filter(Boolean);
  const a = pathname.split("/").filter(Boolean);
  if (p.length !== a.length) return null;
  const params = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(":")) params[p[i].slice(1)] = decodeURIComponent(a[i]);
    else if (p[i] !== a[i]) return null;
  }
  return params;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error("Body too large"));
      }
    });
    req.on("end", () => {
      if (!body) return resolve(null);
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

// ---------- server ----------
const server = http.createServer(async (req, res) => {
  const { pathname, query } = url.parse(req.url, true);

  try {
    // Health check
    if (req.method === "GET" && pathname === "/health") {
      return send(res, 200, { status: "ok" });
    }

    // List all + search
    if (req.method === "GET" && pathname === "/api/anime") {
      const list = await readData();
      const q = (query.q || "").toLowerCase().trim();
      const filtered = q
        ? list.filter((a) => a.title.toLowerCase().includes(q))
        : list;
      return send(res, 200, filtered);
    }

    // Get one
    let params = matchRoute(pathname, "/api/anime/:id");
    if (req.method === "GET" && params) {
      const list = await readData();
      const item = list.find((a) => a.id === params.id);
      return item ? send(res, 200, item) : notFound(res);
    }

    // Create
    if (req.method === "POST" && pathname === "/api/anime") {
      const body = await parseBody(req).catch((err) =>
        send(res, 400, { error: err.message })
      );
      if (!body) return;

      const { title, year, genres, author, studio } = body; // NEW
      if (!title || typeof title !== "string" || !title.trim()) {
        return send(res, 400, { error: "title is required (string)" });
      }

      const list = await readData();
      const item = {
        id: randomUUID(),
        title: title.trim(),
        year: Number(year) || null,
        genres: Array.isArray(genres) ? genres : [],
        author: author ? String(author).trim() : null, // NEW
        studio: studio ? String(studio).trim() : null, // NEW
      };
      list.push(item);
      await saveData(list);
      return send(res, 201, item, { Location: `/api/anime/${item.id}` });
    }

    // Update (PUT/PATCH)
    params = matchRoute(pathname, "/api/anime/:id");
    if ((req.method === "PUT" || req.method === "PATCH") && params) {
      const body = await parseBody(req).catch((err) =>
        send(res, 400, { error: err.message })
      );
      if (!body) return;

      const list = await readData();
      const idx = list.findIndex((a) => a.id === params.id);
      if (idx === -1) return notFound(res);

      if (req.method === "PUT") {
        const { title, year, genres, author, studio } = body; // NEW
        if (!title || typeof title !== "string" || !title.trim()) {
          return send(res, 400, { error: "title is required (string)" });
        }
        list[idx] = {
          id: params.id,
          title: title.trim(),
          year: Number(year) || null,
          genres: Array.isArray(genres) ? genres : [],
          author: author ? String(author).trim() : null, // NEW
          studio: studio ? String(studio).trim() : null, // NEW
        };
      } else {
        // PATCH - partial
        const obj = { ...list[idx] };

        if ("title" in body) {
          if (
            !body.title ||
            typeof body.title !== "string" ||
            !body.title.trim()
          ) {
            return send(res, 400, {
              error: "title (if provided) must be a non-empty string",
            });
          }
          obj.title = body.title.trim();
        }
        if ("year" in body) obj.year = Number(body.year) || null;
        if ("genres" in body) {
          if (!Array.isArray(body.genres))
            return send(res, 400, { error: "genres must be an array" });
          obj.genres = body.genres;
        }
        if ("author" in body) {
          // NEW
          obj.author = body.author ? String(body.author).trim() : null;
        }
        if ("studio" in body) {
          // NEW
          obj.studio = body.studio ? String(body.studio).trim() : null;
        }

        list[idx] = obj;
      }

      await saveData(list);
      return send(res, 200, list[idx]);
    }

    // Delete
    params = matchRoute(pathname, "/api/anime/:id");
    if (req.method === "DELETE" && params) {
      const list = await readData();
      const idx = list.findIndex((a) => a.id === params.id);
      if (idx === -1) return notFound(res);
      const [removed] = list.splice(idx, 1);
      await saveData(list);
      return send(res, 200, removed);
    }

    // Fallback
    return notFound(res);
  } catch (err) {
    console.error(err);
    return send(res, 500, { error: "Internal server error" });
  }
});

server.listen(PORT, () => {
  console.log(`Anime API listening on http://localhost:${PORT}`);
});
