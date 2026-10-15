import axios from "axios";

export const getTurnCredentials = async (req, res) => {
  const ident = process.env.XIRSYS_IDENT;
  const secret = process.env.XIRSYS_SECRET;
  const channel = process.env.XIRSYS_CHANNEL || "MyFirstApp";

  const fallbackIceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:global.xirsys.net:3478" },
  ];

  if (!ident || !secret) {
    return res.json({
      success: true,
      iceServers: fallbackIceServers,
    });
  }

  try {
    const authHeader = "Basic " + Buffer.from(`${ident}:${secret}`).toString("base64");
    const response = await axios.put(
      `https://global.xirsys.net/_turn/${channel}`,
      { format: "urls" },
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data && response.data.v && response.data.v.iceServers) {
      return res.json({
        success: true,
        iceServers: response.data.v.iceServers,
      });
    }

    return res.json({
      success: true,
      iceServers: fallbackIceServers,
    });
  } catch (error) {
    console.error("Xirsys TURN fetch error:", error.message);
    return res.json({
      success: true,
      iceServers: fallbackIceServers,
    });
  }
};
