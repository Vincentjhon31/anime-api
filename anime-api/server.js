const express = require("express");
const mysql = require("mysql2/promise");
const app = express();
const PORT = 3000;

app.use(express.json());

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "anime_db",
};

async function query(sql, params) {
  const conn = await mysql.createConnection(dbConfig);
  const [results] = await conn.execute(sql, params);
  await conn.end();
  return results;
}

// Sjhow All Anime
app.get("/anime", async (req, res) => {
  const data = await query("SELECT * FROM anime");
  data.forEach((a) => (a.genres = JSON.parse(a.genres)));
  res.json(data);
});

// Show id
app.get("/anime/:id", async (req, res) => {
  const [row] = await query("SELECT * FROM anime WHERE id = ?", [
    req.params.id,
  ]);
  if (!row) return res.status(404).json({ error: "Not found" });
  row.genres = JSON.parse(row.genres);
  res.json(row);
});

// Create
app.post("/anime", async (req, res) => {
  const { id, title, year, genres, author, studio } = req.body;
  await query(
    "INSERT INTO anime (id, title, year, genres, author, studio) VALUES (?, ?, ?, ?, ?, ?)",
    [id, title, year, JSON.stringify(genres), author, studio]
  );
  res.status(201).json(req.body);
});

// Update (PUT)
app.put("/anime/:id", async (req, res) => {
  const { title, year, genres, author, studio } = req.body;
  await query(
    `UPDATE anime SET title=?, year=?, genres=?, author=?, studio=? WHERE id=?`,
    [title, year, JSON.stringify(genres), author, studio, req.params.id]
  );
  res.json(req.body);
});

// Update Patch (some only)
app.patch("/anime/:id", async (req, res) => {
  const fields = [];
  const values = [];

  
  if (req.body.title) {
    fields.push("title=?");
    values.push(req.body.title);
  }
  if (req.body.year) {
    fields.push("year=?");
    values.push(req.body.year);
  }
  if (req.body.genres) {
    fields.push("genres=?");
    values.push(JSON.stringify(req.body.genres));
  }
  if (req.body.author) {
    fields.push("author=?");
    values.push(req.body.author);
  }
  if (req.body.studio) {
    fields.push("studio=?");
    values.push(req.body.studio);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  
  values.push(req.params.id);

  await query(
    `UPDATE anime SET ${fields.join(", ")} WHERE id=?`,
    values
  );

  res.json({ message: "Anime updated successfully", updated: req.body });
});


// Delete
app.delete("/anime/:id", async (req, res) => {
  await query("DELETE FROM anime WHERE id = ?", [req.params.id]);
  res.json({ message: "Deleted" });
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
