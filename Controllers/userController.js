import User from "../Models/user.js";

export const saveUser = async (req, res) => {
  try {
    const { uid, name, email, profilePic } = req.body;
    
    // Auth validation check if req.user is populated
    if (req.user && req.user.uid !== uid) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Cannot register or update another user's UID",
      });
    }

    let user = await User.findOne({ uid });
    if (!user) {
      user = new User({ uid, name, email, profilePic });
      await user.save();
      return res.status(201).json({
        success: true,
        message: "User stored successfully",
        data: { user },
      });
    }

    return res.status(200).json({
      success: true,
      message: "User already exists",
      data: { user },
    });
  } catch (error) {
    console.error("Error Saving User:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error: Unable to save user",
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "uid name profilePic email bio");
    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: { users },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching users",
      error: error.message,
    });
  }
};
