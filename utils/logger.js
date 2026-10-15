const isDev = process.env.NODE_ENV !== "production";

export const logger = {
  info: (...args) => {
    if (isDev) {
      console.log("ℹ️ [INFO]", ...args);
    }
  },
  socket: (event, socketId, details = "") => {
    if (isDev) {
      console.log(`🔌 [Socket: ${event}] socketId: ${socketId}`, details);
    }
  },
  error: (...args) => {
    console.error("❌ [ERROR]", ...args);
  },
  warn: (...args) => {
    console.warn("⚠️ [WARN]", ...args);
  },
};

export default logger;
