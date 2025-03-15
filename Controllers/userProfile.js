const userProfile = require("../Models/User")

const getUserProfile = async (req, res) => {
    try {
      const user = await userProfile.findOne({ uid: req.params.uid });
      if (!user) return res.status(404).json({ message: "User not found" });
  
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };


module.exports={getUserProfile}

