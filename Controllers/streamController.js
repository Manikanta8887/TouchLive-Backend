// import Stream from "../Models/Stream.js";

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

// export const getEndedStreams = async () => {
//   try {
//     const past = await Stream.find().sort({ endTime: -1 });
//     return past;
//   } catch (err) {
//     console.error("Error fetching past streams:", err);
//     return [];
//   }
// };

// export const getActiveStreams = async (req, res) => {
//   try {
//     const activeStreams = await Stream.find({ endTime: null }).select("streamerId streamTitle startTime chatMessages");
//     res.json(activeStreams);
//   } catch (error) {
//     res.status(500).json({ message: "Server error retrieving streams" });
//   }
// };

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
    const {
      streamerId,
      streamTitle,
      startTime,
      chatMessages = [],
      viewers = 0,
    } = streamData;
    if (!streamerId || !streamTitle || !startTime) {
      console.error("Missing stream data", streamData);
      return;
    }
    const newStream = new Stream({
      streamerId,
      streamTitle,
      startTime,
      endTime: new Date(),
      chatMessages,
      viewers,
    });
    await newStream.save();
    console.log("✅ Stream saved");
  } catch (err) {
    console.error("Error saving stream:", err);
  }
};

export const getEndedStreams = async () => {
  try {
    return await Stream.find().sort({ endTime: -1 });
  } catch (err) {
    console.error("Error fetching past streams:", err);
    return [];
  }
};

export const getActiveStreams = async (req, res) => {
  try {
    const active = await Stream.find({ endTime: null }).select(
      "streamerId streamTitle startTime chatMessages"
    );
    res.json(active);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving active streams" });
  }
};

export const getStreamChat = async (req, res) => {
  try {
    const { streamId } = req.params;
    const stream = await Stream.findById(streamId);
    if (!stream) return res.status(404).json({ message: "Stream not found" });
    res.json(stream.chatMessages);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving chat messages" });
  }
};

export const getPastStreams = async (req, res) => {
  try {
    const { userId } = req.params;
    const past = await Stream.find({
      streamerId: userId,
      endTime: { $ne: null },
    }).sort({ endTime: -1 });
    res.json(past);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving past streams" });
  }
};
