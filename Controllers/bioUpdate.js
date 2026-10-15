import User from "../Models/user.js";
import { verifyOwnership } from "../middleware/auth.js";

const updateUserProfile = async (req, res) => {
  try {
    const { bio, profilePic, name } = req.body;
    const uid = req.params.uid;

    if (!verifyOwnership(req, uid)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only update your own profile",
      });
    }

    const updateFields = {};
    if (bio !== undefined) updateFields.bio = bio;
    if (profilePic) updateFields.profilePic = profilePic;
    if (name) updateFields.name = name;

    const updatedUser = await User.findOneAndUpdate(
      { uid },
      updateFields,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error updating profile",
      error: error.message,
    });
  }
};

export default updateUserProfile;
