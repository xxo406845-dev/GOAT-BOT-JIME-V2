const fs = require("fs-extra");
const path = __dirname + "/cache/autoseen.json";

if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({ status: false }, null, 2));

module.exports = {
  config: {
    name: "autoseen",
    version: "2.0",
    author: "Mohammad Akash",
    countDown: 5,
    role: 2,
    shortDescription: "Auto seen messages",
    longDescription: "Automatically mark all incoming messages as seen.",
    category: "system",
    guide: "{pn} on/off"
  },

  onStart: async function ({ api, event, args }) {
    const data = JSON.parse(fs.readFileSync(path));

    if (args[0] === "on") {
      data.status = true;
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      return api.sendMessage("✅ Auto-seen system has been turned ON.", event.threadID);
    } 
    else if (args[0] === "off") {
      data.status = false;
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      return api.sendMessage("❌ Auto-seen system has been turned OFF.", event.threadID);
    } 
    else {
      return api.sendMessage("⚙️ Use: {pn} on/off", event.threadID);
    }
  },

  onChat: async function ({ api, event }) {
    try {
      const data = JSON.parse(fs.readFileSync(path));
      if (data.status === true) {
        api.markAsReadAll(() => {});
      }
    } catch (err) {
      console.log("AutoSeen Error:", err);
    }
  }
};
