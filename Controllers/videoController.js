import User from "../Models/user.js";

export const uploadVideo = async (req, res) => {
  const { uid } = req.params;
  if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

  try {
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ msg: "User not found" });

        user.videos.push({
            url:         req.file.path,          // secure Cloudinary video URL
            public_id:   req.file.filename,      // Cloudinary public_id
            coverImage:  req.file.path,          // using same URL as placeholder
            sizeInBytes: req.file.size,
          });
      
    await user.save();
    res.json({ video: user.videos.at(-1) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Upload failed", error: err.message });
  }
};

export const getUserVideos = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ videos: user.videos });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching videos", error: err.message });
  }
};

export const getAllVideos = async (_req, res) => {
  try {
    const users = await User.find({}, "name videos");
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
