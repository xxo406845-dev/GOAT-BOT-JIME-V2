const axios = require("axios");
const simsim = "https://simsimi.cyberbot.top";

module.exports = {
  config: {
    name: "baby",
    version: "1.0.3",
    author: "ULLASH (Modified By Akash) ",
    countDown: 0,
    role: 0,
    shortDescription: "Cute AI Baby Chatbot",
    longDescription: "Talk, Teach & Chat with Emotion — Baby AI chatbot powered by SimSimi API",
    category: "fun",
    guide: {
      en: "{p}baby [message]\n{p}baby teach [Question] - [Answer]\n{p}baby edit [Question] - [OldReply] - [NewReply]\n{p}baby remove [Question] - [Reply]\n{p}baby list"
    }
  },

  // ─────────────── MAIN COMMAND ───────────────
  onStart: async function ({ api, event, args, message, usersData }) {
    try {
      const senderID = event.senderID;
      const senderName = await usersData.getName(senderID);
      const query = args.join(" ").toLowerCase();

      if (!query) {
        const ran = ["Bolo baby", "hum"];
        const r = ran[Math.floor(Math.random() * ran.length)];
        return message.reply(r, (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "baby",
              author: senderID
            });
          }
        });
      }

      // remove
      if (["remove", "rm"].includes(args[0])) {
        const parts = query.replace(/^(remove|rm)\s*/, "").split(" - ");
        if (parts.length < 2)
          return message.reply("Use: baby remove [Question] - [Reply]");
        const [ask, ans] = parts;
        const res = await axios.get(`${simsim}/delete?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}`);
        return message.reply(res.data.message);
      }

      // list
      if (args[0] === "list") {
        const res = await axios.get(`${simsim}/list`);
        if (res.data.code === 200)
          return message.reply(`♾ Total Questions: ${res.data.totalQuestions}\n★ Replies: ${res.data.totalReplies}\n☠︎︎ Developer: ${res.data.author}`);
        else
          return message.reply(`Error: ${res.data.message || "Failed to fetch list"}`);
      }

      // edit
      if (args[0] === "edit") {
        const parts = query.replace("edit ", "").split(" - ");
        if (parts.length < 3)
          return message.reply("Use: baby edit [Question] - [OldReply] - [NewReply]");
        const [ask, oldReply, newReply] = parts;
        const res = await axios.get(`${simsim}/edit?ask=${encodeURIComponent(ask)}&old=${encodeURIComponent(oldReply)}&new=${encodeURIComponent(newReply)}`);
        return message.reply(res.data.message);
      }

      // teach
      if (args[0] === "teach") {
        const parts = query.replace("teach ", "").split(" - ");
        if (parts.length < 2)
          return message.reply("Use: baby teach [Question] - [Reply]");
        const [ask, ans] = parts;
        const res = await axios.get(`${simsim}/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&senderID=${senderID}&senderName=${encodeURIComponent(senderName)}`);
        return message.reply(res.data.message || "Reply added successfully!");
      }

      // normal message
      const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
      const responses = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

      for (const reply of responses) {
        await new Promise((resolve) => {
          message.reply(reply, (err, info) => {
            if (!err) {
              global.GoatBot.onReply.set(info.messageID, {
                commandName: "baby",
                author: senderID
              });
            }
            resolve();
          });
        });
      }

    } catch (err) {
      console.error(err);
      message.reply(`Error in baby command: ${err.message}`);
    }
  },

  // ─────────────── HANDLE REPLY ───────────────
  onReply: async function ({ api, event, Reply, message, usersData }) {
    try {
      const senderName = await usersData.getName(event.senderID);
      const replyText = event.body ? event.body.toLowerCase() : "";
      if (!replyText) return;

      const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(replyText)}&senderName=${encodeURIComponent(senderName)}`);
      const responses = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

      for (const reply of responses) {
        await new Promise((resolve) => {
          message.reply(reply, (err, info) => {
            if (!err) {
              global.GoatBot.onReply.set(info.messageID, {
                commandName: "baby",
                author: event.senderID
              });
            }
            resolve();
          });
        });
      }

    } catch (err) {
      console.error(err);
      message.reply(`Error in baby reply: ${err.message}`);
    }
  },

  // ─────────────── AUTO CHAT TRIGGER ───────────────
  onChat: async function ({ api, event, message, usersData }) {
    try {
      const raw = event.body ? event.body.toLowerCase().trim() : "";
      if (!raw) return;

      const senderName = await usersData.getName(event.senderID);
      const senderID = event.senderID;

      // যদি শুধু “baby”, “bot” ইত্যাদি বলে
      if (["baby", "bot", "bby", "jannu", "xan", "বেপি", "বট", "বেবি"].includes(raw)) {
        const greetings = [
          "বেশি bot Bot করলে leave নিবো কিন্তু😒😒",
    "শুনবো না😼 তুমি আমার বস আকাশ কে প্রেম করাই দাও নাই🥺পচা তুমি🥺",
    "আমি আবাল দের সাথে কথা বলি না,ok😒",
    "এতো ডেকো না,প্রেম এ পরে যাবো তো🙈",
    "Bolo Babu, তুমি কি আমার বস আকাশ কে ভালোবাসো? 🙈💋",
    "বার বার ডাকলে মাথা গরম হয়ে যায় কিন্তু😑",
    "হ্যা বলো😒, তোমার জন্য কি করতে পারি😐😑?",
    "এতো ডাকছিস কেন?গালি শুনবি নাকি? 🤬",
    "I love you janu🥰",
    "আরে Bolo আমার জান ,কেমন আছো?😚",
    "আজ বট বলে অসম্মান করছি,😰😿",
    "Hop beda😾,Boss বল boss😼",
    "চুপ থাক ,নাই তো তোর দাত ভেগে দিবো কিন্তু",
    "আমাকে না ডেকে মেয়ে হলে বস আকাশ এর ইনবক্সে চলে যা 🌚😂 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://www.facebook.com/arakashiam",
    "আমাকে বট না বলে , বস আকাশ কে জানু বল জানু 😘",
    "বার বার Disturb করছিস কোনো😾,আমার জানুর সাথে ব্যাস্ত আছি😋",
    "আরে বলদ এতো ডাকিস কেন🤬",
    "আমাকে ডাকলে ,আমি কিন্তু কিস করে দিবো😘",
    "আমারে এতো ডাকিস না আমি মজা করার mood এ নাই এখন😒",
    "হ্যাঁ জানু , এইদিক এ আসো কিস দেই🤭 😘",
    "দূরে যা, তোর কোনো কাজ নাই, শুধু bot bot করিস 😉😋🤣",
    "তোর কথা তোর বাড়ি কেউ শুনে না ,তো আমি কোনো শুনবো ?🤔😂",
    "আমাকে ডেকো না,আমি বস আকাশ এর সাথে ব্যাস্ত আছি",
    "কি হলো , মিস্টেক করচ্ছিস নাকি🤣",
    "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
    "জান মেয়ে হলে বস আকাশ এর ইনবক্সে চলে যাও 😍🫣💕 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://www.facebook.com/arakashiam",
    "কালকে দেখা করিস তো একটু 😈",
    "হা বলো, শুনছি আমি 😏",
    "আর কত বার ডাকবি ,শুনছি তো",
    "হুম বলো কি বলবে😒",
    "বলো কি করতে পারি তোমার জন্য",
    "আমি তো অন্ধ কিছু দেখি না🐸 😎",
    "আরে বোকা বট না জানু বল জানু😌",
    "বলো জানু 🌚",
    "তোর কি চোখে পড়ে না আমি ব্যাস্ত আছি😒",
    "হুম জান তোমার ওই খানে উম্মহ😑😘",
    "আহ শুনা আমার তোমার অলিতে গলিতে উম্মাহ😇😘",
    "jang hanga korba😒😬",
    "হুম জান তোমার অইখানে উম্মমাহ😷😘",
    "আসসালামু আলাইকুম বলেন আপনার জন্য কি করতে পারি..!🥰",
    "ভালোবাসার নামক আবলামি করতে চাইলে বস আকাশ এর ইনবক্সে গুতা দিন ~🙊😘🤣 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://www.facebook.com/arakashiam",
    "আমাকে এতো না ডেকে বস আকাশ এর কে একটা গফ দে 🙄",
    "আমাকে এতো না ডেকছ কেন ভলো টালো বাসো নাকি🤭🙈",
    "🌻🌺💚-আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ-💚🌺🌻",
    "আমি এখন বস আকাশ এর সাথে বিজি আছি আমাকে ডাকবেন না-😕😏 ধন্যবাদ-🤝🌻",
    "আমাকে না ডেকে আমার বস আকাশ কে একটা জি এফ দাও-😽🫶🌺",
    "ঝাং থুমালে আইলাপিউ পেপি-💝😽",
    "উফফ বুঝলাম না এতো ডাকছেন কেনো-😤😡😈",
    "জান তোমার বান্ধবী রে আমার বস আকাশ এর হাতে তুলে দিবা-🙊🙆‍♂",
    "আজকে আমার মন ভালো নেই তাই আমারে ডাকবেন না-😪🤧",
    "ঝাং 🫵থুমালে য়ামি রাইতে পালুপাসি উম্মম্মাহ-🌺🤤💦",
    "চুনা ও চুনা আমার বস আকাশ এর হবু বউ রে কেও দেকছো খুজে পাচ্ছি না😪🤧😭",
    "স্বপ্ন তোমারে নিয়ে দেখতে চাই তুমি যদি আমার হয়ে থেকে যাও-💝🌺🌻",
    "জান হাঙ্গা করবা-🙊😝🌻",
    "জান মেয়ে হলে চিপায় আসো বস আকাশ এর থেকে অনেক ভালোবাসা শিখছি তোমার জন্য-🙊🙈😽",
    "ইসস এতো ডাকো কেনো লজ্জা লাগে তো-🙈🖤🌼",
    "আমার বস আকাশ এর পক্ষ থেকে তোমারে এতো এতো ভালোবাসা-🥰😽🫶 আমার বস আকাশ ইসলামে'র জন্য দোয়া করবেন-💝💚🌺🌻",
    "- ভালোবাসা নামক আব্লামি করতে মন চাইলে আমার বস আকাশ এর ইনবক্স চলে যাও-🙊🥱👅 🌻𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊 𝐈𝐃 𝐋𝐈𝐍𝐊 🌻:- https://www.facebook.com/arakashiam",
    "আমার জান তুমি শুধু আমার আমি তোমারে ৩৬৫ দিন ভালোবাসি-💝🌺😽",
    "কিরে প্রেম করবি তাহলে বস আকাশ এর ইনবক্সে গুতা দে 😘🤌 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://www.facebook.com/arakashiam",
    "জান আমার বস আকাশ কে বিয়ে করবা-🙊😘🥳",
    // ... এভাবে পুরো লিস্টে সব লিঙ্কই এখন https://www.facebook.com/arakashiam
];

        const randomReply = greetings[Math.floor(Math.random() * greetings.length)];
        message.reply({
          body: `@${senderName} ${randomReply}`,
          mentions: [{ tag: `@${senderName}`, id: senderID }]
        }, (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "baby",
              author: senderID
            });
          }
        });
      }

      // যদি baby + query হয়
      const prefixes = ["baby ", "bot ", "bby ", "jannu ", "xan ", "বেপি ", "বট ", "বেবি "];
      const prefixMatch = prefixes.find(p => raw.startsWith(p));
      if (prefixMatch) {
        const query = raw.replace(prefixMatch, "").trim();
        if (!query) return;

        const res = await axios.get(`${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`);
        const responses = Array.isArray(res.data.response) ? res.data.response : [res.data.response];

        for (const reply of responses) {
          await new Promise((resolve) => {
            message.reply(reply, (err, info) => {
              if (!err) {
                global.GoatBot.onReply.set(info.messageID, {
                  commandName: "baby",
                  author: senderID
                });
              }
              resolve();
            });
          });
        }
      }

    } catch (err) {
      console.error(err);
    }
  }
};
