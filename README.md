# Touch-Live Backend Service

Touch-Live Backend is a Node.js, Express, Socket.io, and MongoDB streaming server that manages WebRTC signaling, live chat rooms, user profiles, video uploads via Cloudinary, and TURN credential generation.

## 🚀 Features

- **Firebase Admin Token Verification**: Express middleware (`middleware/auth.js`) validating Firebase ID tokens on protected endpoints.
- **WebRTC Signaling & Live Chat**: Real-time Socket.io events for stream initialization, peer-to-peer WebRTC offer/answer/ICE candidate swapping, and chat rooms.
- **TURN Server Credentials**: Endpoint (`GET /api/turn-credentials`) calling Xirsys API server-side with fallback to public STUN servers.
- **Media Uploads**: Cloudinary integration for streaming video uploads and cover thumbnails.
- **Rate Limiting & Validation**: Standardized error responses, `express-rate-limit` protection, and `express-validator` payload checks.
- **Stream State Abstraction**: `streamStore` interface decoupling in-memory live stream state for seamless future Redis scaling.

---

## 🛠️ Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and provide your credentials:
   ```bash
   cp .env.example .env
   ```

3. **Run Dev Server**:
   ```bash
   npm start
   ```

---

## 📡 API Endpoints

### Auth & Users
- `POST /api/users` — Save or retrieve authenticated user account (*Protected*).
- `GET /api/users` — Fetch public users list.
- `GET /api/profile/:uid` — Get user profile data.
- `PUT /api/profile/:uid` — Update bio/avatar (*Protected, Owner only*).

### Videos
- `POST /api/videos/upload/:uid` — Upload video to Cloudinary (*Protected, Owner only*).
- `GET /api/videos/:uid` — Fetch user uploaded videos.
- `GET /api/videos` — Fetch all public videos.
- `DELETE /api/videos/:public_id` — Delete video (*Protected, Owner only*).

### Streams & WebRTC
- `GET /api/streams/active` — List currently live streams.
- `GET /api/streams/past/:userId` — List past recorded streams for user.
- `GET /api/streams/chat/:streamId` — Retrieve chat history for a stream.
- `GET /api/turn-credentials` — Get dynamic STUN/TURN ICE server configuration (*Protected*).

---

## 🔌 Socket.io Events

- `get-streams` / `stream-list`: Fetch active streams and past stream archives.
- `start-stream` / `stop-stream`: Stream lifecycle signaling.
- `join-stream` / `leave-stream` / `viewer-count`: Stream room participation and live viewer stats.
- `offer` / `answer` / `ice-candidate`: WebRTC P2P signaling routing between streamer and viewer.
- `chat-message`: Real-time chat message broadcast.
