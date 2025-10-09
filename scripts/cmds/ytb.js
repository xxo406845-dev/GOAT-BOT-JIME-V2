const axios = require("axios");
const fs = require('fs');
const { URLSearchParams } = require('url');

async function neokex(url, pathName) {
    try {
        const response = (await axios.get(url, {
            responseType: "arraybuffer"
        })).data;
        fs.writeFileSync(pathName, Buffer.from(response));
        return fs.createReadStream(pathName);
    } catch (err) {
        throw err;
    }
}

async function neokexSt(url, pathName) {
    try {
        const response = await axios.get(url, {
            responseType: "stream"
        });
        response.data.path = pathName;
        return response.data;
    } catch (err) {
        throw err;
    }
}

const baseApiUrl = "https://neokex-apis.onrender.com";

module.exports = {
    config: {
        name: "ytb",
        version: "5.0.0",
        aliases: ['youtube'],
        author: "NeoKEX",
        countDown: 10,
        role: 0,
        description: {
            en: "Search and download YouTube videos/audio."
        },
        category: "media",
        guide: {
            en: "  {pn} [video|-v] [<video name>|<video link>]: use to download video from YouTube."
                + "\n   {pn} [audio|-a] [<video name>|<video link>]: use to download audio from YouTube (if supported)."
                + "\n   {pn} [info|-i] [<video name>|<video link>]: use to view video information from YouTube."
                + "\n   Example:"
                + "\n {pn} -v chipi chipi chapa chapa"
                + "\n {pn} -a chipi chipi chapa chapa"
                + "\n {pn} -i chipi chipi chapa chapa"
        }
    },
    onStart: async ({ api, args, event, commandName }) => {
        const action = args[0]?.toLowerCase();

        const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
        let urlYtb = false;
        let videoID = null;
        let videoUrl = null;

        if (args[1] && checkurl.test(args[1])) {
            urlYtb = true;
            const match = args[1].match(checkurl);
            videoID = match ? match[1] : null;
            videoUrl = args[1];
        }

        if (!action || !['video', '-v', 'audio', '-a', 'info', '-i'].includes(action)) {
            return api.sendMessage("❌ Invalid action. Please specify 'video', 'audio', or 'info'.", event.threadID, event.messageID);
        }

        if (urlYtb) {
            if (action === '-v' || action === 'video') {
                try {
                    api.sendMessage(`⏳ Downloading your video from YouTube, please wait...`, event.threadID, event.messageID);
                    const response = await axios.get(`${baseApiUrl}/ytdl?url=${encodeURIComponent(videoUrl)}`);
                    
                    if (!response.data || !response.data.download_url) {
                         throw new Error("No download URL found in the API response.");
                    }
                    const downloadLink = response.data.download_url;
                    const title = response.data.title;
                    const path = `ytb_mp4_${videoID}.mp4`;
                    const videoStream = await neokex(downloadLink, path);
                    
                    await api.sendMessage({
                        body: `✅ Downloaded successfully\n• Title: ${title}`,
                        attachment: videoStream
                    }, event.threadID, () => fs.unlinkSync(path), event.messageID);
                    return;
                } catch (e) {
                    console.error("Error downloading video from direct URL:", e);
                    return api.sendMessage('❌ Failed to download the video. Please try again later. Error: ' + e.message, event.threadID, event.messageID);
                }
            }
            else if (action === '-a' || action === 'audio' || action === '-i' || action === 'info') {
                return api.sendMessage("❌ Audio download and video info from a direct URL are not supported by the current API. Please try searching first.", event.threadID, event.messageID);
            }
            return;
        }

        args.shift();
        const keyWord = args.join(" ");

        if (!keyWord) {
            return api.sendMessage("❌ Please provide a video name or a YouTube link.", event.threadID, event.messageID);
        }

        const maxResults = 6;
        let searchResults;
        try {
            const response = await axios.get(`${baseApiUrl}/yt-search?query=${encodeURIComponent(keyWord)}`);
            if (!response.data || !response.data.results) {
                 throw new Error("Invalid response format from search API.");
            }
            searchResults = response.data.results.slice(0, maxResults);
        } catch (err) {
            console.error("Error during search:", err);
            return api.sendMessage("❌ An error occurred during search: " + err.message, event.threadID, event.messageID);
        }

        if (searchResults.length === 0) {
            return api.sendMessage("⭕ No search results match the keyword.", event.threadID, event.messageID);
        }

        let msg = "";
        const attachments = [];
        for (let i = 0; i < searchResults.length; i++) {
            const info = searchResults[i];
            const thumbPath = `thumbnail_${i}_${event.threadID}.jpg`;
            try {
                const thumbStream = await neokexSt(info.thumbnail, thumbPath);
                attachments.push(thumbStream);
            } catch (e) {
                console.error(`Failed to download thumbnail for ${info.title}: ${e.message}`);
            }
            msg += `${i + 1}. ${info.title}\n\n`;
        }
        
        if (attachments.length === 0) {
             return api.sendMessage("❌ An error occurred while fetching video thumbnails. Please try again later.", event.threadID, event.messageID);
        }

        api.sendMessage({
            body: msg + "Reply to this message with a number to choose",
            attachment: await Promise.all(attachments)
        }, event.threadID, (err, info) => {
            if (err) {
                console.error("Error sending search results:", err);
                return;
            }
            global.GoatBot.onReply.set(info.messageID, {
                commandName,
                messageID: info.messageID,
                author: event.senderID,
                result: searchResults,
                action
            });
            attachments.forEach(stream => {
                if (stream.path) fs.unlinkSync(stream.path);
            });
        }, event.messageID);
    },

    onReply: async ({ event, api, Reply }) => {
        const { result, action } = Reply;
        const choice = parseInt(event.body);

        if (isNaN(choice) || choice <= 0 || choice > result.length) {
            return api.sendMessage('❌ Invalid choice. Please reply with a valid number.', event.threadID, event.messageID);
        }

        const selectedVideo = result[choice - 1];
        const videoUrl = selectedVideo.url;
        const videoID = new URL(videoUrl).searchParams.get('v');

        if (action === '-v' || action === 'video') {
            try {
                api.unsendMessage(Reply.messageID);
                api.sendMessage(`⏳ Downloading your video from YouTube, please wait...`, event.threadID, event.messageID);

                const response = await axios.get(`${baseApiUrl}/ytdl?url=${encodeURIComponent(videoUrl)}`);
                if (!response.data || !response.data.download_url) {
                     throw new Error("No download URL found in the API response.");
                }
                const downloadLink = response.data.download_url;
                const title = response.data.title;
                const path = `ytb_mp4_${videoID}.mp4`;
                const videoStream = await neokex(downloadLink, path);
                
                await api.sendMessage({
                    body: `✅ Downloaded successfully\n• Title: ${title}`,
                    attachment: videoStream
                }, event.threadID, () => fs.unlinkSync(path), event.messageID);
            } catch (e) {
                console.error("Error downloading video from search result:", e);
                return api.sendMessage('❌ Failed to download the video. Please try again later. Error: ' + e.message, event.threadID, event.messageID);
            }
        } else if (action === '-a' || action === 'audio') {
            return api.sendMessage("❌ Audio download is not directly supported by this API. Please try video download.", event.threadID, event.messageID);
        } else if (action === '-i' || action === 'info') {
            api.unsendMessage(Reply.messageID);
            api.sendMessage(
                `✨ | Title: ${selectedVideo.title}\n🔗 | Video Url: ${selectedVideo.url}`,
                event.threadID, event.messageID
            );
        }
    }
};
