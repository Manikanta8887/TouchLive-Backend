// // Controllers/streamController.js
// import Stream from "../Models/Stream.js";

// export const saveEndedStream = async (streamData) => {
//   try {
//     const { streamerId, streamTitle, startTime, chatMessages = [], viewers = 0 } = streamData;
//     if (!streamerId || !streamTitle || !startTime) {
//       console.error("Missing stream data", streamData);
//       return;
//     }
//     const newStream = new Stream({
//       streamerId,
//       streamTitle,
//       startTime,
//       endTime: new Date(),
//       chatMessages,
//       viewers,
//     });
//     await newStream.save();
//     console.log("✅ Stream saved");
//   } catch (err) {
//     console.error("Error saving stream:", err);
//   }
// };

// export const getEndedStreams = async () => {
//   try {
//     return await Stream.find().sort({ endTime: -1 });
//   } catch (err) {
//     console.error("Error fetching past streams:", err);
//     return [];
//   }
// };

// export const getActiveStreams = async (req, res) => {
//   try {
//     const active = await Stream.find({ endTime: null }).select("streamerId streamTitle startTime chatMessages");
//     res.json(active);
//   } catch (err) {
//     res.status(500).json({ message: "Error retrieving active streams" });
//   }
// };

// export const getStreamChat = async (req, res) => {
//   try {
//     const { streamId } = req.params;
//     const stream = await Stream.findById(streamId);
//     if (!stream) return res.status(404).json({ message: "Stream not found" });
//     res.json(stream.chatMessages);
//   } catch (err) {
//     res.status(500).json({ message: "Error retrieving chat messages" });
//   }
// };

// export const getPastStreams = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const past = await Stream.find({ streamerId: userId, endTime: { $ne: null } }).sort({ endTime: -1 });
//     res.json(past);
//   } catch (err) {
//     res.status(500).json({ message: "Error retrieving past streams" });
//   }
// };


// Controllers/streamController.js
import Stream from "../Models/Stream.js";

/**
 * Persist an ended stream using the server‑generated UUID (streamData.id).
 * Uses upsert to avoid duplicates if called more than once.
 */
export const saveEndedStream = async (streamData) => {
  try {
    const {
      id,            // UUID from liveStreams[id]
      streamerId,
      streamTitle,
      startTime,
      chatMessages = [],
      viewers = 0,
    } = streamData;

    if (!id || !streamTitle || !startTime) {
      console.error("Missing required stream data", streamData);
      return;
    }

    await Stream.findOneAndUpdate(
      { streamId: id },
      {
        streamId: id,
        streamerId,
        streamTitle,
        startTime,
        endTime: new Date(),
        chatMessages,
        viewers,
      },
      { upsert: true }
    );

    console.log("✅ Stream saved with UUID", id);
  } catch (err) {
    console.error("Error saving stream:", err);
  }
};

/**
 * Fetch all past streams, sorted by most recent endTime first.
 */
export const getEndedStreams = async () => {
  try {
    return await Stream.find().sort({ endTime: -1 });
  } catch (err) {
    console.error("Error fetching past streams:", err);
    return [];
  }
};

/**
 * Fetch all currently active streams (where endTime is still null).
 * Returns streamId so clients can link to /watch/:streamId.
 */
export const getActiveStreams = async (req, res) => {
  try {
    const active = await Stream.find({ endTime: null }).select(
      "streamId streamerId streamTitle startTime chatMessages viewers"
    );
    res.json(active);
  } catch (err) {
    console.error("Error retrieving active streams:", err);
    res.status(500).json({ message: "Error retrieving active streams" });
  }
};

/**
 * Fetch just the chat history for a given stream UUID.
 */
export const getStreamChat = async (req, res) => {
  try {
    const { streamId } = req.params;
    const stream = await Stream.findOne({ streamId }).select("chatMessages");
    if (!stream) {
      return res.status(404).json({ message: "Stream not found" });
    }
    res.json(stream.chatMessages);
  } catch (err) {
    console.error("Error retrieving chat messages:", err);
    res.status(500).json({ message: "Error retrieving chat messages" });
  }
};

/**
 * Fetch all past streams for a given user (by their userId or socket ID).
 */
export const getPastStreams = async (req, res) => {
  try {
    const { userId } = req.params;
    const past = await Stream.find({
      streamerId: userId,
      endTime: { $ne: null },
    })
      .sort({ endTime: -1 })
      .select("streamId streamerId streamTitle startTime endTime viewers");
    res.json(past);
  } catch (err) {
    console.error("Error retrieving past streams:", err);
    res.status(500).json({ message: "Error retrieving past streams" });
  }
};
