const fs = require("fs");
const path = __dirname + "/coinxbalance.json";

// 📁 ব্যালেন্স ফাইল না থাকলে তৈরি করবে
if (!fs.existsSync(path)) {
  fs.writeFileSync(path, JSON.stringify({}, null, 2));
}

// 💵 ব্যালেন্স পড়া
function getBalance(userID) {
  const data = JSON.parse(fs.readFileSync(path));
  if (data[userID]?.balance != null) return data[userID].balance;

  // 🔹 বিশেষ ইউজার (তুমি) = 10,000$, অন্য সবাই = 100$
  if (userID === "100078049308655") return 10000;
  return 100;
}

// 💰 ব্যালেন্স আপডেট করা
function setBalance(userID, balance) {
  const data = JSON.parse(fs.readFileSync(path));
  data[userID] = { balance };
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

// 💲 সুন্দরভাবে ব্যালেন্স দেখানোর ফরম্যাট
function formatBalance(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(1).replace(/\.0$/, '') + "T$";
  if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + "B$";
  if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + "M$";
  if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + "k$";
  return num + "$";
}

module.exports.config = {
  name: "balance",
  version: "3.0.0",
  author: "Mohammad Akash × ChatGPT",
  countDown: 5,
  role: 0,
  shortDescription: "Check your coin balance or transfer coins 💰",
  longDescription: "Check your current balance or transfer coins to other users!",
  category: "economy",
  guide: {
    en: "{p}balance\n{p}balance transfer @mention <amount>"
  }
};

module.exports.onStart = async function ({ api, event, args, usersData }) {
  const { threadID, senderID, messageID, mentions } = event;

  try {
    // 🔸 ট্রান্সফার ফিচার
    if (args[0] && args[0].toLowerCase() === "transfer") {
      if (!mentions || Object.keys(mentions).length === 0)
        return api.sendMessage("❌ Please mention someone to transfer coins.", threadID, messageID);

      const targetID = Object.keys(mentions)[0];
      const amount = parseInt(args[1]);

      if (isNaN(amount) || amount <= 0)
        return api.sendMessage("❌ Please provide a valid transfer amount.", threadID, messageID);

      let senderBalance = getBalance(senderID);
      if (senderBalance < amount)
        return api.sendMessage("💸 You don't have enough balance.", threadID, messageID);

      let receiverBalance = getBalance(targetID);

      senderBalance -= amount;
      receiverBalance += amount;

      setBalance(senderID, senderBalance);
      setBalance(targetID, receiverBalance);

      const senderName = await usersData.getName(senderID);
      const receiverName = await usersData.getName(targetID);

      return api.sendMessage(
        `✅ Transfer Successful!\n\n💰 ${senderName} sent ${formatBalance(amount)} to ${receiverName}.\n📌 Your New Balance: ${formatBalance(senderBalance)}`,
        threadID,
        messageID
      );
    }

    // 🔸 সাধারণ ব্যালেন্স চেক
    const balance = getBalance(senderID);
    const userName = await usersData.getName(senderID);

    return api.sendMessage(
      `💳 𝗔𝗰𝗰𝗼𝘂𝗻𝘁 𝗜𝗻𝗳𝗼\n━━━━━━━━━━━━━━\n👤 Name: ${userName}\n💰 Balance: ${formatBalance(balance)}\n━━━━━━━━━━━━━━`,
      threadID,
      messageID
    );

  } catch (error) {
    console.error(error);
    return api.sendMessage("❌ Error checking balance or transferring coins!", threadID, messageID);
  }
};
