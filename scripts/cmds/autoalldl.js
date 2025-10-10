const axios = require("axios");
const fs = require("fs");
const path = require("path");

let isEnabled = true;

module.exports = {
  config: {
    name: "alldl",
    version: "1.4",
    author: "NeoKEX",
    role: 0,
    shortDescription: "Auto download media from supported links (no prefix)",
    longDescription: "Auto detects media links (Instagram, TikTok, etc) and downloads them",
    category: "media",
    guide: "Send or reply with a link. No prefix needed.\nUse {p}alldl on/off to toggle feature."
  },

  onStart: async function ({ message, args, event }) {
    const permission = ["100083039411474"]; 
    if (["on", "off", "status"].includes(args[0])) {
      if (!permission.includes(event.senderID)) return message.reply("⚠️ | Only the bot owner can toggle this feature.");

      if (args[0] === "on") {
        isEnabled = true;
        return message.reply("✅ | Auto media downloader is now ENABLED.");
      }

      if (args[0] === "off") {
        isEnabled = false;
        return message.reply("❌ | Auto media downloader is now DISABLED.");
      }

      if (args[0] === "status") {
        return message.reply(`🔄 | Current status: ${isEnabled ? "ENABLED ✅" : "DISABLED ❌"}`);
      }
    }

    const dir = path.join(__dirname, "cache");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  },

  onChat: async function ({ api, event }) {
    if (!isEnabled) return;

    const text = event.body || (event.messageReply && event.messageReply.body);
    if (!text) return;

    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    if (!urlMatch) return;

    const url = urlMatch[0];
    const apiUrl = `https://neokex-apis.onrender.com/alldl?url=${encodeURIComponent(url)}`;

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const res = await axios.get(apiUrl);
      const result = res.data;

      if (!result.success || !result.download_url) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return; 
      }

      const mediaUrl = result.download_url;
      const title = result.title || "Video"; 
      const fileName = `download.mp4`;
      const filePath = path.join(__dirname, "cache", fileName);

      let file;
      try {
        file = await axios.get(mediaUrl, { responseType: "arraybuffer" });
      } catch (downloadErr) {
        console.error("[alldl] Download Error:", downloadErr.message);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return; 
      }
      
      fs.writeFileSync(filePath, Buffer.from(file.data, "binary"));

      api.sendMessage({
        body: `${title}\nPlatform: ${result.platform}\nDuration: ${result.duration} seconds`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => {
        fs.unlinkSync(filePath);
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      }, event.messageID);

    } catch (err) {
      console.error("[alldl] API Error:", err.message);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return; 
    }
  }
};
