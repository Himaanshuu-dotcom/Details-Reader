const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Create upload folder if it doesn't exist
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// Serve simple HTML form
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Upload route

const { exec } = require("child_process");

// Inside app.post("/upload"...
app.post("/upload", upload.single("resume"), (req, res) => {
    if (!req.file) return res.send("No file uploaded.");

    const filePath = `uploads/${req.file.filename}`;

    exec(`python resume_parser.py ${filePath}`, (error, stdout, stderr) => {
        if (error) {
            console.error("Error running Python script:", error);
            return res.status(500).send("Failed to parse resume.");
        }

        try {
            const parsedData = JSON.parse(stdout);
            res.json({
                message: "Resume parsed successfully!",
                data: parsedData
            });
        } catch (err) {
            console.error("Invalid JSON from Python script:", stdout);
            res.status(500).send("Failed to parse JSON output.");
        }
    });
});


// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
