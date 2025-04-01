import mongoose from "mongoose";

const StreamSchema = new mongoose.Schema({
  streamerId: { type: String, required: true }, // UID of the streamer
  streamTitle: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  viewers: { type: Number, default: 0 },
  chatMessages: [
    {
      sender: String,
      message: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

const Stream = mongoose.model("Stream", StreamSchema);
export default Stream;
