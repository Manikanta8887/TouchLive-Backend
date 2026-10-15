import User from "../Models/user.js";

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.json({
      success: true,
      message: "User profile retrieved successfully",
      data: { user },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error retrieving profile",
      error: error.message,
    });
  }
};

export default getUserProfile;
