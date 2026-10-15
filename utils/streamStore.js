/**
 * Standalone active-stream state store interface.
 * Abstracts in-memory stream management so it can easily be swapped with Redis or MongoDB
 * for multi-instance scaling and cluster deployments.
 */

class StreamStore {
  constructor() {
    this.liveStreams = new Map();
    this.streamerSocketMap = new Map();
  }

  setStream(streamId, streamData) {
    this.liveStreams.set(streamId, streamData);
  }

  getStream(streamId) {
    return this.liveStreams.get(streamId) || null;
  }

  removeStream(streamId) {
    this.liveStreams.delete(streamId);
    this.streamerSocketMap.delete(streamId);
  }

  getAllStreams() {
    return Array.from(this.liveStreams.values());
  }

  setStreamerSocket(streamId, socketId) {
    this.streamerSocketMap.set(streamId, socketId);
  }

  getStreamerSocket(streamId) {
    return this.streamerSocketMap.get(streamId) || null;
  }

  removeStreamerSocket(streamId) {
    this.streamerSocketMap.delete(streamId);
  }

  updateViewerCount(streamId, delta) {
    const stream = this.getStream(streamId);
    if (stream) {
      const current = stream.viewers || 0;
      stream.viewers = Math.max(0, current + delta);
      this.setStream(streamId, stream);
      return stream.viewers;
    }
    return 0;
  }

  addChatMessage(streamId, messageObj) {
    const stream = this.getStream(streamId);
    if (stream) {
      if (!stream.chatMessages) stream.chatMessages = [];
      stream.chatMessages.push(messageObj);
      this.setStream(streamId, stream);
    }
  }

  setFullscreenState(streamId, isFullscreen) {
    const stream = this.getStream(streamId);
    if (stream) {
      stream.isFullscreen = isFullscreen;
      this.setStream(streamId, stream);
    }
  }
}

export const streamStore = new StreamStore();
export default streamStore;
