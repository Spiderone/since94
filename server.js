const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Create a route to list directories
app.get("/list-directories", (req, res) => {
  fs.readdir(__dirname, { withFileTypes: true }, (err, files) => {
    if (err) {
      res.status(500).send("Error reading directory");
      return;
    }
    const directories = files
      .filter((file) => file.isDirectory())
      .map((dir) => dir.name);
    res.json(directories);
  });
});

// Catch-all route to handle single-page applications (if needed)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
