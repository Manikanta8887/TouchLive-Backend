import {User} from "../Models/User"

const updateUserProfile = async (req, res) => {
  try {
    const { bio, profilePic } = req.body;
    const uid = req.params.uid;
    const updatedUser = await User.findOneAndUpdate(
      { uid },
      { bio, ...(profilePic && { profilePic }) },
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export default updateUserProfile ;
