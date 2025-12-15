
const express = require('express');
const line = require('@line/bot-sdk');

const app = express();

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};
const client = new line.Client(config);

app.get('/', (req, res) => {
  res.status(200).send('OK');
});


// webhook
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then(() => res.end())
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const text = event.message.text;

  // ① 叫出選單
  if (text === '選單') {
    return client.replyMessage(event.replyToken, buttonsMenu());
  }

  // ② 提醒小卡
  if (text === '提醒小卡') {
    return client.replyMessage(event.replyToken, {
      type: 'image',
      originalContentUrl: 'https://github.com/Wan-Ting-HSU/AI-ECG--PH/blob/main/%E6%8F%90%E7%A4%BA%E5%B0%8F%E5%8D%A1.png?raw=true',
      previewImageUrl: 'https://github.com/Wan-Ting-HSU/AI-ECG--PH/blob/main/%E6%8F%90%E7%A4%BA%E5%B0%8F%E5%8D%A1.png?raw=true'	
    });
  }

  // ③ 外科醫師執行動作
  if (text === '外科醫師執行') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text:
`【外科醫師執行】
📌 開立檢查單：若病人需進行術前心電圖，請開立【EKG PRE-OP】
📌 明確告知病人：請在門診明確告知病人【這次手術可能需要做術前心電圖評估】
📌 接收回報與決策 : 若您接到我們的【高風險通報(電話或EMAIL/LINE】，請您根據回報數據(vital sign及病史)，決定是否轉介給心臟內科或胸腔內科門診。
⚠️ AI陽性結果病人會於當天通知
⚠️ 每月會寄一份當月實驗組病人名單給各位醫師(包含陽性及陰性)`
    });
  }

  return Promise.resolve(null);
}

// Buttons Template
function buttonsMenu() {
  return {
    type: 'template',
    altText: '主選單',
    template: {
      type: 'buttons',
      title: 'AI ECG-PH 主選單',
      text: '請選擇想了解的項目',
      actions: [
        {
          type: 'message',
          label: '提醒小卡',
          text: '提醒小卡'
        },
        {
          type: 'message',
          label: '外科醫師執行',
          text: '外科醫師執行'
        }
      ]
    }
  };
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`LINE Bot running on port ${port}`);
});