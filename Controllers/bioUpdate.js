// const userProfile = require("../Models/User")

// const updateUserBio = async (req, res) => {
//     try {
//       const { uid } = req.params;
//       const { bio } = req.body;
  
//       const user = await userProfile.findOneAndUpdate(
//         { uid },
//         { bio },
//         { new: true } 
//       );
  
//       if (!user) return res.status(404).json({ message: "User not found" });
  
//       res.json(user);
//     } catch (error) {
//       res.status(500).json({ message: "Server error" });
//     }
//   };
  

//   module.exports = {updateUserBio}

// In controllers/bioUpdate.js or profileController.js:
const User = require("../Models/User");

const updateUserProfile = async (req, res) => {
  try {
    const { bio, profilePic } = req.body;
    const uid = req.params.uid;
    // Updates both bio and profilePic if provided (profilePic remains unchanged if not sent)
    const updatedUser = await User.findOneAndUpdate(
      { uid },
      { bio, ...(profilePic && { profilePic }) },
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { updateUserProfile };
