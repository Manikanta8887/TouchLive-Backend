// import mongoose from "mongoose";

// const StreamSchema = new mongoose.Schema(
//   {
//     streamerId: { type: String, required: true },
//     streamTitle: { type: String, required: true },
//     startTime: { type: Date, required: true },
//     endTime: { type: Date },
//     viewers: { type: Number, default: 0 },
//     isFullscreen: { type: Boolean, default: false },
//     chatMessages: [
//       {
//         sender: String,
//         message: String,
//         timestamp: { type: Date, default: Date.now },
//       },
//     ],
//   },
//   { timestamps: true }
// );

// const Stream = mongoose.model("Stream", StreamSchema);
// export default Stream;

// Models/Stream.js
import mongoose from "mongoose";

const StreamSchema = new mongoose.Schema(
  {
    streamerId: { type: String, required: true },
    streamTitle: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    viewers: { type: Number, default: 0 },
    isFullscreen: { type: Boolean, default: false },
    chatMessages: [
      {
        sender: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Stream = mongoose.model("Stream", StreamSchema);
export default Stream;
