// Controllers/videoController.js
import User from "../Models/user.js";

// POST /api/videos/upload/:uid
export const uploadVideo = async (req, res) => {
  const { uid } = req.params;
  if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

  try {
    const user = await User.findOne({ firebaseUID: uid });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Append new video
    user.videos.push({
      url:          req.file.path,
      public_id:    req.file.filename,
      coverImage:   req.file.path + "#poster", // you can generate a real poster via Cloudinary APIs
      sizeInBytes:  req.file.size,
    });

    await user.save();
    res.json({ video: user.videos.at(-1) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Upload failed", error: err.message });
  }
};

// GET /api/videos/:uid
export const getUserVideos = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUID: req.params.uid });
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ videos: user.videos });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching videos", error: err.message });
  }
};

// GET /api/videos
export const getAllVideos = async (_req, res) => {
  try {
    const users = await User.find({}, "name videos");
    // flatten with uploader name
    const all = users.flatMap((u) =>
      u.videos.map((v) => ({
        ...v.toObject(),
        uploaderName: u.name || "Anonymous",
      }))
    );
    res.json({ videos: all });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching all videos", error: err.message });
  }
};
