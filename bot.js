const TelegramBot = require("node-telegram-bot-api");
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });
const MY_CHANNEL = process.env.TELEGRAM_CHANNEL_ID;

const text1 =
  "سلام! \n من بات‌میم هستم 🤖 \n شنیدم میم ساختی! \n همینجا آپلودش کن که بره تو کانال واسه رأی‌گیری \n 👨🏻‍⚖️👩🏻‍⚖";
const text2 =
  "ایول ✔️💥\n ما تو پستا معمولاً آیدی تلگرام کسی که میم رو ساخته می‌نویسیم، اگه به هر دلیلی با این قضیه حال نمی‌کنی بهم بگو:";
const text3 = "اگه بازم میم داری همینجا آپلودش کن 🤖";
const select1 = "نه ردیفه";
const select2 = "نذاری بهتره";
const errorText = "لطفاً عکس آپلود کنید!☝🏻";

module.exports = client => {
  let chats = client.db("academeme").collection("states");

  bot.on("photo", async msg => {
    const chatId = msg.chat.id;
    const chat = await chats.findOne({ chat_id: chatId });
    const { state } = chat;

    if (state == 1) {
      await chats.updateOne({ chat_id: chatId }, { $set: { state: 2 } });
      bot.sendMessage(chatId, text2, {
        reply_markup: {
          keyboard: [[{ text: select1 }, { text: select2 }]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });

      let caption = "";
      if (msg.caption) {
        caption += msg.caption + "\n";
      }
      caption += "@" + msg.from.username;
      bot.sendPhoto(MY_CHANNEL, msg.photo[msg.photo.length - 1].file_id, {
        caption: caption
      });
    }
  });

  bot.on("message", async msg => {
    console.log(msg);
    const chatId = msg.chat.id;

    if (msg.text == "/start") {
      const chat = await chats.findOne({ chat_id: chatId });
      if (!chat) {
        await chats.insertOne({ chat_id: chatId, state: 1 });
      }
      bot.sendMessage(chatId, text1);
    } else {
      const chat = await chats.findOne({ chat_id: chatId });
      const { state } = chat;

      if (state == 1) {
        if (!msg.photo) {
          bot.sendMessage(chatId, errorText);
        }
      }

      if (state == 2) {
        await chats.updateOne({ chat_id: chatId }, { $set: { state: 1 } });
        bot.sendMessage(chatId, text3);
        bot.sendMessage(MY_CHANNEL, msg.text + "\n" + "@" + msg.from.username);
      }
    }
  });
};
