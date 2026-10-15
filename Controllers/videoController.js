import User from "../Models/user.js";
import cloudinary from "../utils/Cloudinary.js";
import { verifyOwnership } from "../middleware/auth.js";

export const uploadVideo = async (req, res) => {
  const { uid } = req.params;
  const { title } = req.body;

  if (!verifyOwnership(req, uid)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: You can only upload videos to your own profile",
    });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: "No video file uploaded" });
  }

  try {
    let user = await User.findOne({ uid });
    if (!user) {
      user = new User({
        uid,
        name: req.user?.displayName || req.user?.email?.split("@")[0] || "Streamer",
        email: req.user?.email || `${uid}@guest.touchlive.com`,
        videos: [],
      });
    }

    const { path: url, filename: public_id, size } = req.file;
    const coverImage = url;

    const newVideo = {
      url,
      public_id,
      coverImage,
      sizeInBytes: size,
      title: title || "Untitled Video",
    };

    user.videos.push(newVideo);
    await user.save();

    const createdVideo = user.videos[user.videos.length - 1];

    return res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      data: { video: createdVideo },
    });
  } catch (err) {
    console.error("Upload video error:", err);
    return res.status(500).json({
      success: false,
      message: "Upload failed",
      error: err.message,
    });
  }
};

export const getUserVideos = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid });

    let mongoVideos = user ? (user.videos || []) : [];
    let cloudinaryVideos = [];

    try {
      const cloudinaryResult = await cloudinary.api.resources({
        resource_type: "video",
        max_results: 100,
      });

      if (cloudinaryResult && cloudinaryResult.resources) {
        cloudinaryVideos = cloudinaryResult.resources.map((resItem) => ({
          url: resItem.secure_url || resItem.url,
          public_id: resItem.public_id,
          coverImage: resItem.secure_url || resItem.url,
          sizeInBytes: resItem.bytes || 0,
          title: resItem.public_id.split("/").pop().replace(/_/g, " "),
          createdAt: resItem.created_at,
        }));
      }
    } catch (cErr) {
      console.warn("Cloudinary direct fetch warning:", cErr.message);
    }

    const combinedMap = new Map();
    // Insert Cloudinary videos first
    cloudinaryVideos.forEach((v) => combinedMap.set(v.public_id, v));
    // Overlay/merge MongoDB videos
    mongoVideos.forEach((v) => {
      const vObj = v.toObject ? v.toObject() : v;
      combinedMap.set(vObj.public_id, { ...combinedMap.get(vObj.public_id), ...vObj });
    });

    const finalVideos = Array.from(combinedMap.values());

    return res.json({
      success: true,
      message: "Fetched user videos successfully",
      data: { videos: finalVideos },
    });
  } catch (err) {
    console.error("getUserVideos error:", err);
    return res.status(500).json({
      success: false,
      message: "Error fetching user videos",
      error: err.message,
    });
  }
};

export const getAllVideos = async (_req, res) => {
  try {
    const users = await User.find({}, "name uid videos");
    let mongoVideos = users.flatMap((u) =>
      (u.videos || []).map((v) => ({
        ...(v.toObject ? v.toObject() : v),
        uploaderName: u.name || "Streamer",
      }))
    );

    let cloudinaryVideos = [];
    try {
      const cloudinaryResult = await cloudinary.api.resources({
        resource_type: "video",
        max_results: 100,
      });

      if (cloudinaryResult && cloudinaryResult.resources) {
        cloudinaryVideos = cloudinaryResult.resources.map((resItem) => ({
          url: resItem.secure_url || resItem.url,
          public_id: resItem.public_id,
          coverImage: resItem.secure_url || resItem.url,
          sizeInBytes: resItem.bytes || 0,
          title: resItem.public_id.split("/").pop().replace(/_/g, " "),
          uploaderName: "Touch Live Streamer",
          createdAt: resItem.created_at,
        }));
      }
    } catch (cErr) {
      console.warn("Cloudinary direct fetch warning:", cErr.message);
    }

    const combinedMap = new Map();
    cloudinaryVideos.forEach((v) => combinedMap.set(v.public_id, v));
    mongoVideos.forEach((v) => {
      const vObj = v.toObject ? v.toObject() : v;
      combinedMap.set(vObj.public_id, { ...combinedMap.get(vObj.public_id), ...vObj });
    });

    const finalVideos = Array.from(combinedMap.values());

    return res.json({
      success: true,
      message: "Fetched all videos successfully",
      data: { videos: finalVideos },
    });
  } catch (err) {
    console.error("getAllVideos error:", err);
    return res.status(500).json({
      success: false,
      message: "Error fetching all videos",
      error: err.message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { public_id } = req.params;

  try {
    const ownerUser = await User.findOne({ "videos.public_id": public_id });

    if (ownerUser && !verifyOwnership(req, ownerUser.uid)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You cannot delete another user's video",
      });
    }

    // Destroy on Cloudinary
    try {
      await cloudinary.uploader.destroy(public_id, { resource_type: "video" });
    } catch (cErr) {
      console.warn("Cloudinary destroy error:", cErr.message);
    }

    if (ownerUser) {
      ownerUser.videos = ownerUser.videos.filter((v) => v.public_id !== public_id);
      await ownerUser.save();
    }

    return res.status(200).json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (err) {
    console.error("Delete video error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete video",
      error: err.message,
    });
  }
};