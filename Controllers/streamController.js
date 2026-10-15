import Stream from "../Models/Stream.js";

export const saveEndedStream = async (streamData) => {
  try {
    const { streamerId, streamTitle, startTime, chatMessages = [], viewers = 0 } = streamData;
    if (!streamerId || !streamTitle || !startTime) {
      console.error("Missing stream data for saveEndedStream:", streamData);
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
    console.log("✅ Stream saved to database successfully");
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

export const getActiveStreams = async (_req, res) => {
  try {
    const active = await Stream.find({ endTime: null }).select("streamerId streamTitle startTime chatMessages viewers");
    return res.json({
      success: true,
      message: "Fetched active streams",
      data: { streams: active },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving active streams",
      error: err.message,
    });
  }
};

export const getStreamChat = async (req, res) => {
  try {
    const { streamId } = req.params;
    const stream = await Stream.findById(streamId);
    if (!stream) {
      return res.status(404).json({
        success: false,
        message: "Stream not found",
      });
    }
    return res.json({
      success: true,
      data: { chatMessages: stream.chatMessages },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving chat messages",
      error: err.message,
    });
  }
};

export const getPastStreams = async (req, res) => {
  try {
    const { userId } = req.params;
    const past = await Stream.find({ streamerId: userId, endTime: { $ne: null } }).sort({ endTime: -1 });
    return res.json({
      success: true,
      message: "Fetched past streams successfully",
      data: { streams: past },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving past streams",
      error: err.message,
    });
  }
};
