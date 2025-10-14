const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "text_voice",
    version: "1.0",
    role: 0,
    author: "𝙼𝚘𝚑𝚊𝚖𝚖𝚊𝚍 𝙰𝚔𝚊𝚜𝚑",
    shortDescription: "নির্দিষ্ট টেক্সট দিলে কিউট মেয়ের ভয়েস প্লে করবে 😍",
    longDescription: "নির্দিষ্ট কিছু টেক্সট লিখলে স্বয়ংক্রিয়ভাবে অডিও ভয়েস পাঠাবে (ইমোজি ছাড়া)।",
    category: "noprefix",
  },

  // ✅ টেক্সট অনুযায়ী অডিও URL লিস্ট
  handleEvent: async function ({ api, event }) {
    const { threadID, messageID, body } = event;
    if (!body) return;

    const textAudioMap = {
      "i love you": "https://files.catbox.moe/npy7kl.mp3",
      "mata beta": "https://files.catbox.moe/5rdtc6.mp3",
      "hi": "https://files.catbox.moe/etjgf5.mp3",
      "hello": "https://files.catbox.moe/bz1u2y.mp3"
      // চাইলে এখানে আরো ভয়েস যুক্ত করতে পারো
    };

    const key = body.trim().toLowerCase();
    const audioUrl = textAudioMap[key];
    if (!audioUrl) return; // টেক্সট না মেললে কিছু করবে না

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const filePath = path.join(cacheDir, `${encodeURIComponent(key)}.mp3`);

    try {
      const response = await axios({
        method: "GET",
        url: audioUrl,
        responseType: "stream"
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage(
          {
            attachment: fs.createReadStream(filePath)
          },
          threadID,
          () => {
            fs.unlink(filePath, err => {
              if (err) console.error("Error deleting file:", err);
            });
          },
          messageID
        );
      });

      writer.on("error", err => {
        console.error("Error writing file:", err);
        api.sendMessage("❌ ভয়েস প্লে হয়নি 😅", threadID, messageID);
      });
    } catch (error) {
      console.error("Error downloading audio:", error);
      api.sendMessage("⚠️ ভয়েস আনতে সমস্যা হয়েছে!", threadID, messageID);
    }
  },

  onStart: () => {} // কমান্ড মোডে কিছু লাগে না
};
