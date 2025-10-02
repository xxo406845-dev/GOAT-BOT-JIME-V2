const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "gist",
    aliases: ["gistup"],
    version: "1.0",
    author: "NeoKEX", 
    countDown: 5,
    role: 2,
    shortDescription: "Gist a command's code.",
    longDescription: "Uploads the raw source code of any command to a Gist service and returns the raw link.",
    category: "utility",
    guide: "{pn} <commandName>"
  },

  onStart: async function ({ api, event, args, message }) {
    const cmdName = args[0];
    if (!cmdName) {
      return message.reply("❌ | Please provide the command name to Gist.");
    }

    const cmdPath = path.join(__dirname, `${cmdName}.js`);

    if (!fs.existsSync(cmdPath)) {
      return message.reply(`❌ | Command "${cmdName}" not found in this folder.`);
    }

    try {
      const code = fs.readFileSync(cmdPath, "utf8");
      
      const apiUrl = 'https://neokex-apis.onrender.com/gist';

      const response = await axios.post(apiUrl, {
        code: code
      });

      const { status, raw_url } = response.data;
      if (status === "success" && raw_url) {
        return message.reply(`🔗 Raw URL: ${raw_url}`);
      } else {
        return message.reply(`❌ | Failed to upload code to Gist.`);
      }
    } catch (error) {
      console.error(error);
      return message.reply("❌ | An error occurred while reading or Gisting the command file.");
    }
  }
};
