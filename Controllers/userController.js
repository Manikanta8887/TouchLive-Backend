import User from "../Models/user.js";


export const saveUser = async (req, res) => {
  try {
    console.log("Received user data:", req.body);
    const { uid, name, email, profilePic } = req.body;

    let user = await User.findOne({ uid });

    if (!user) {
      user = new User({ uid, name, email, profilePic });
      await user.save();
      return res.status(201).json({ message: "User stored successfully!", user });
    }

    res.status(200).json({ message: "User already exists!", user });
  } catch (error) {
    console.error("Error Saving User:", error);
    res.status(500).json({ error: "Server Error: Unable to save user", details: error.message });
  }
};


// export const getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find({}, "uid name profilePic"); 
//     res.status(200).json(users);
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     res.status(500).json({ message: "Server error while fetching users" });
//   }
// };

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "uid name profilePic email"); // Include email
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error while fetching users" });
  }
};

