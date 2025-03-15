const {User}= require('../Models/User')


const getUserProfile = async (req, res) => {
    try {
      const user = await User.findOne({ uid: req.params.uid });
      if (!user) return res.status(404).json({ message: "User not found" });
  
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };


export default getUserProfile;

