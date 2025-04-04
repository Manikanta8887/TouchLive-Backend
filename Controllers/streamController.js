// import Stream from "../Models/Stream.js";

// // Get all active live streams (ongoing streams)
// export const getActiveStreams = async (req, res) => {
//   try {
//     const activeStreams = await Stream.find({ endTime: null }).select("streamerId streamTitle startTime chatMessages");
//     res.json(activeStreams);
//   } catch (error) {
//     res.status(500).json({ message: "Server error retrieving streams" });
//   }
// };

// // Get chat messages for a specific stream by its ID
// export const getStreamChat = async (req, res) => {
//   try {
//     const streamId = req.params.streamId;
//     const stream = await Stream.findById(streamId);
//     if (!stream) return res.status(404).json({ message: "Stream not found" });
//     res.json(stream.chatMessages);
//   } catch (error) {
//     res.status(500).json({ message: "Server error retrieving chat messages" });
//   }
// };

// // Save a finished stream to the database
// export const saveEndedStream = async (streamData) => {
//   try {
//     const { streamerId, streamTitle, startTime, chatMessages = [], viewers = 0 } = streamData;
//     if (!streamerId || !streamTitle || !startTime) {
//       console.error("Error: Missing required stream data!", streamData);
//       return;
//     }
//     const newStream = new Stream({
//       streamerId: streamerId || "Unknown Streamer",
//       streamTitle,
//       startTime,
//       endTime: new Date(),
//       chatMessages,
//       viewers,
//     });
//     await newStream.save();
//     console.log("✅ Stream saved successfully!");
//   } catch (error) {
//     console.error("❌ Error saving stream:", error.message);
//   }
// };

// // Get past streams for a specific user
// export const getPastStreams = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const pastStreams = await Stream.find({
//       streamerId: userId,
//       endTime: { $ne: null }
//     }).sort({ endTime: -1 });
//     res.json(pastStreams);
//   } catch (error) {
//     res.status(500).json({ message: "Server error retrieving past streams" });
//   }
// };


import Stream from "../Models/Stream.js";

export const saveEndedStream = async (streamData) => {
  try {
    const { streamerId, streamTitle, startTime, chatMessages = [], viewers = 0 } = streamData;
    if (!streamerId || !streamTitle || !startTime) {
      console.error("Error: Missing required stream data!", streamData);
      return;
    }
    const newStream = new Stream({
      streamerId: streamerId || "Unknown Streamer",
      streamTitle,
      startTime,
      endTime: new Date(),
      chatMessages,
      viewers,
    });
    await newStream.save();
    console.log("✅ Stream saved successfully!");
  } catch (error) {
    console.error("❌ Error saving stream:", error.message);
  }
};

export const getEndedStreams = async () => {
  try {
    const past = await Stream.find().sort({ endTime: -1 });
    return past;
  } catch (err) {
    console.error("Error fetching past streams:", err);
    return [];
  }
};

// Get all active live streams (ongoing streams)
export const getActiveStreams = async (req, res) => {
  try {
    const activeStreams = await Stream.find({ endTime: null }).select("streamerId streamTitle startTime chatMessages");
    res.json(activeStreams);
  } catch (error) {
    res.status(500).json({ message: "Server error retrieving streams" });
  }
};

// Get chat messages for a specific stream by its ID
export const getStreamChat = async (req, res) => {
  try {
    const streamId = req.params.streamId;
    const stream = await Stream.findById(streamId);
    if (!stream) return res.status(404).json({ message: "Stream not found" });
    res.json(stream.chatMessages);
  } catch (error) {
    res.status(500).json({ message: "Server error retrieving chat messages" });
  }
};

// Get past streams for a specific user
export const getPastStreams = async (req, res) => {
  try {
    const { userId } = req.params;
    const pastStreams = await Stream.find({
      streamerId: userId,
      endTime: { $ne: null }
    }).sort({ endTime: -1 });
    res.json(pastStreams);
  } catch (error) {
    res.status(500).json({ message: "Server error retrieving past streams" });
  }
};
