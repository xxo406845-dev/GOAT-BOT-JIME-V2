const schedule = require('node-schedule');
const chalk = require('chalk');
const moment = require('moment-timezone');
const axios = require('axios');

module.exports = {
  config: {
    name: "autotimev2",
    version: "2.0.0",
    role: 0,
    author: "Mohammad Akash",
    shortDescription: "Auto hourly message sender with live BD weather 🌦️",
    longDescription: "Automatically sends motivational or fun hourly messages with real-time Bangladesh weather updates.",
    category: "auto system",
    guide: { en: "" }
  },

  onLoad({ api }) {
    console.log(chalk.bold.hex("#00c300")("✅ AUTOTIME V2 (BD TIME + WEATHER) LOADED"));

    // 🌤️ Hourly messages
    const messages = [
      '🌙 এত রাত কিসের জন্য জাগছিস? 😴✨',
      '⏰ Mobile বন্ধ করে ঘুমো 😏🛌',
      '😵‍💫 এত সাহস দেখানোর সময় নয়, বিশ্রাম নাও 😴',
      '🛌 সবাই ঘুমাচ্ছে, আর তুই জাগছিস? 😼',
      '🌅 উঠে fresh হও, কিছু light exercise করো 🌸💪',
      '🕌 নামাজ বা একটু stretch করে নাও 🙏✨',
      '☀️ Rise and shine! দিনটা সুন্দর শুরু কর 💪😎',
      '🪥 দাঁত ব্রাশ করো আর breakfast খাও 🥞🍳',
      '🍳 Mobile পরে রাখো আর energy নিয়ে দিন শুরু কর 📵',
      '😎 ক্লাস বা কাজ শুরু করো, সময় নষ্ট করা বন্ধ কর 🕒',
      '📚 একটু focus করার সময়, distractions এড়িয়ে যাও 😏',
      '😇 Playtime শেষ, study mode on 🕹️📖',
      '🌞 Good Afternoon! একটু fresh হও 🙌💖',
      '🍛 Lunch খাও, energy refill কর 😋',
      '😎 Chill time, mobile কম ব্যবহার কর 📵',
      '😴 Nap নিতে পারো, refresh হও 😌',
      '🥵 গরম পড়েছে, পানি খাও 💦',
      '😅 একটু হাসি ছড়িয়ে দিন, mood fresh রাখো 😆',
      '🌆 Hands washed? Relax এবং chill করো 👐💦',
      '📚 পড়াশোনা চলছে তো? Concentrate করো 😏',
      '🔥 মজা করো, তবে বেশি disturb কোরো না 😎',
      '😘 Dinner খেয়েছো? খেয়ে নাও 🍽️❤️',
      '😴 Mobile বন্ধ করে বিশ্রাম নাও 📵',
      '🛌 Relax! আগামি দিনের জন্য energy জমাও 😌'
    ];

    // 💬 Extra motivational lines
    const extraLines = [
      "💡 মনে রেখো: ঘুম শরীর আর মনের জন্য ভীষণ জরুরি।",
      "🔥 আজকের কাজ কালকে ফেলে রেখো না!",
      "🌸 হাসি হলো শ্রেষ্ঠ ওষুধ। একটু হাসো তো! 😁",
      "💪 ছোট ছোট কাজ মিলে বড় সাফল্য হয়।",
      "📱 মোবাইল নয়, নিজের স্বপ্নে Focus করো।",
      "🌎 পৃথিবীটা সুন্দর — একটু চোখ তুলে তাকাও!",
      "✨ তোমার হাসি কারো পুরো দিনকে সুন্দর করতে পারে।",
      "😎 কাজের মাঝে মজা খুঁজে নিতে শিখো।",
      "💖 নিজের প্রতি Positive থাকো।",
      "🎯 আজকের লক্ষ্য পূর্ণ করো, কালকে আবার নতুন শুরু।"
    ];

    // 🌦️ Weather info
    async function getWeather(city = 'Dhaka') {
      try {
        const res = await axios.get(
          'https://api.open-meteo.com/v1/forecast?latitude=23.8103&longitude=90.4125&current_weather=true'
        );
        const temp = res.data.current_weather.temperature;
        const code = res.data.current_weather.weathercode;
        let condition = "🌤️ পরিষ্কার আকাশ";
        if (code >= 1 && code <= 3) condition = "⛅ আংশিক মেঘলা";
        else if (code >= 45 && code <= 48) condition = "🌫️ কুয়াশা";
        else if (code >= 51 && code <= 67) condition = "🌧️ হালকা বৃষ্টি";
        else if (code >= 80 && code <= 82) condition = "🌧️ ভারি বৃষ্টি";
        else if (code >= 95) condition = "⛈️ বজ্রসহ বৃষ্টি";
        return `🌦️ আজকের আবহাওয়া: ${city}, ${temp}°C | ${condition}`;
      } catch {
        return "⚠️ আবহাওয়ার তথ্য আনতে সমস্যা হয়েছে।";
      }
    }

    // 🕒 সময় অনুযায়ী বাংলা পিরিয়ড
    function getBengaliPeriod(hour) {
      if (hour >= 4 && hour < 12) return 'সকাল';
      if (hour >= 12 && hour < 15) return 'দুপুর';
      if (hour >= 15 && hour < 18) return 'বিকেল';
      return 'রাত';
    }

    // 🕐 Auto scheduler
    for (let h = 0; h < 24; h++) {
      const rule = new schedule.RecurrenceRule();
      rule.tz = 'Asia/Dhaka';
      rule.hour = h;
      rule.minute = 0;

      schedule.scheduleJob(rule, async () => {
        const allThreads = global.GoatBot?.threadsData?.keys?.();
        if (!allThreads) return;

        const now = moment().tz('Asia/Dhaka');
        const hour = now.hour();
        const minute = now.format('mm');
        const period = getBengaliPeriod(hour);
        const formattedTime = `${period} ${hour % 12 === 0 ? 12 : hour % 12}:${minute} ${now.format('A')}`;

        const message = messages[h] || '⏰ সময় চলে যাচ্ছে! কিছু productive করো ✨';
        const extra = extraLines[Math.floor(Math.random() * extraLines.length)];
        const weather = await getWeather();

        const finalMessage = 
`━━━━━━━━━━━━━━━━━━━━━
🕒 এখন সময়: ${formattedTime}
${message}

${extra}
${weather}
━━━━━━━━━━━━━━━━━━━━━`;

        for (const threadID of allThreads) {
          api.sendMessage(finalMessage, threadID, (err) => {
            if (err) console.error(`❌ পাঠাতে ব্যর্থ ${threadID}:`, err);
          });
        }

        console.log(chalk.hex("#00FFFF")(`✅ পাঠানো হয়েছে (BDT): ${formattedTime}`));
      });
    }
  },

  run() {} // no manual command needed
};
