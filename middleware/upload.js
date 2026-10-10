// import multer from "multer";
// import fs from "fs";
// import path from "path";

// const rootDir = path.join(process.cwd(), "uploads");

// // ✅ Ensure root folder exists
// if (!fs.existsSync(rootDir)) fs.mkdirSync(rootDir, { recursive: true });

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // ✅ Decide subfolder based on route
//     let subfolder = "others";

//     if (req.originalUrl.includes("/events")) subfolder = "events";
//     else if (req.originalUrl.includes("/users/profile/avatar")) subfolder = "avatars";

//     const uploadDir = path.join(rootDir, subfolder);
//     if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

//     cb(null, uploadDir);
//   },

//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage });
// export default upload;


import multer from "multer";
import path from "path";
import fs from "fs";

// absolute folder path
const uploadDir = path.join(process.cwd(), "uploads", "avatars");

// DEBUG: show exact folder Node is writing to
console.log("🔥 Multer will save files to:", uploadDir);

// ensure folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });

export default upload;
