const fs = require("fs");
const path = __dirname + "/coinxbalance.json";

// 🪙 coinxbalance.json না থাকলে বানানো
if (!fs.existsSync(path)) {
  fs.writeFileSync(path, JSON.stringify({}, null, 2));
}

// 🧾 ব্যালেন্স পড়া
function getBalance(userID) {
  const data = JSON.parse(fs.readFileSync(path));
  if (data[userID]?.balance != null) return data[userID].balance;

  // 🔹 তোমার ডিফল্ট 10,000$, অন্যদের 100$
  if (userID === "100078049308655") return 10000;
  return 100;
}

// 💾 ব্যালেন্স আপডেট করা
function setBalance(userID, balance) {
  const data = JSON.parse(fs.readFileSync(path));
  data[userID] = { balance };
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

// 💰 ব্যালেন্স ফরম্যাট করা
function formatBalance(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2).replace(/\.00$/, '') + "T$";
  if (num >= 1e9) return (num / 1e9).toFixed(2).replace(/\.00$/, '') + "B$";
  if (num >= 1e6) return (num / 1e6).toFixed(2).replace(/\.00$/, '') + "M$";
  if (num >= 1e3) return (num / 1e3).toFixed(2).replace(/\.00$/, '') + "k$";
  return num + "$";
}

module.exports.config = {
  name: "bet",
  version: "1.1.1",
  author: "Akash × ChatGPT",
  countDown: 5,
  role: 0,
  shortDescription: "Place a bet and win 3x–50x coins!",
  longDescription: "Try your luck — 50% chance to win coins up to 50x multiplier!",
  category: "economy",
  guide: {
    en: "{p}bet <amount>"
  }
};

module.exports.onStart = async function ({ api, event, args }) {
  const { senderID, threadID, messageID } = event;
  let balance = getBalance(senderID);

  // ❌ ইনপুট চেক
  if (!args[0] || isNaN(args[0]))
    return api.sendMessage("❌ Please enter a valid bet amount.", threadID, messageID);

  let betAmount = parseInt(args[0]);
  if (betAmount <= 0)
    return api.sendMessage("❌ Bet amount must be greater than 0.", threadID, messageID);

  if (betAmount > balance)
    return api.sendMessage("❌ You don't have enough coins to bet that amount.", threadID, messageID);

  // 🎲 র‍্যান্ডম মাল্টিপ্লায়ার ও ফলাফল
  const multipliers = [3, 4, 8, 20, 50];
  const chosenMultiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
  const win = Math.random() < 0.5; // ৫০% সম্ভাবনা

  if (win) {
    const winAmount = betAmount * chosenMultiplier;
    balance += winAmount;
    setBalance(senderID, balance);

    return api.sendMessage(
      `🎉 You won the bet!\n💰 Bet: ${formatBalance(betAmount)}\n⚡ Multiplier: ${chosenMultiplier}x\n📈 Profit: ${formatBalance(winAmount)}\n📌 New Balance: ${formatBalance(balance)}`,
      threadID,
      messageID
    );
  } else {
    balance -= betAmount;
    if (balance < 0) balance = 0;
    setBalance(senderID, balance);

    return api.sendMessage(
      `❌ You lost the bet!\n💰 Bet: ${formatBalance(betAmount)}\n📉 Lost: ${formatBalance(betAmount)}\n📌 New Balance: ${formatBalance(balance)}`,
      threadID,
      messageID
    );
  }
};
