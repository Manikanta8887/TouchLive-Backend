// Controllers/videoController.js
import User from "../Models/user.js";

export const uploadVideo = async (req, res) => {
  const { uid } = req.params;
  if (!req.file) {
    return res.status(400).json({ msg: "No file uploaded" });
  }

  try {
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const { path: url, filename: public_id, size } = req.file;
    const coverImage = url; // you can apply a transformation or poster later

    user.videos.push({ url, public_id, coverImage, sizeInBytes: size });
    await user.save();

    // return the newly‑added video object
    return res.json({ video: user.videos[user.videos.length - 1] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Upload failed", error: err.message });
  }
};

export const getUserVideos = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ msg: "User not found" });
    return res.json({ videos: user.videos });
  } catch (err) {
    return res.status(500).json({ msg: "Error fetching videos", error: err.message });
  }
};

export const getAllVideos = async (_req, res) => {
  try {
    const users = await User.find({}, "name videos");
    const videos = users.flatMap((u) =>
      u.videos.map((v) => ({
        ...v.toObject(),
        uploaderName: u.name,
      }))
    );
    return res.json({ videos });
  } catch (err) {
    return res.status(500).json({ msg: "Error fetching all videos", error: err.message });
  }
};
