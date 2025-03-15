const {User}= require('../Models/User')

const saveUser = async (req, res) => {
  try {
    console.log("Received user data:", req.body);
    const { uid, name, email, profilePic } = req.body;

    let user = await User.findOne({ uid });
    if (!user) {
      user = new User({ uid, name, email, profilePic });
      await user.save();
      return res.status(201).json({ message: "User stored successfully!" });
    }
    res.status(200).json({ message: "User already exists!" });
  } catch (error) {
    console.error("Error Saving User:", error);
    res.status(500).json({ error: "Server Error: Unable to save user", details: error.message });
  }
};

export default saveUser

