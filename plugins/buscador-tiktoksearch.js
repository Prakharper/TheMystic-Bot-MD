import axios from 'axios';
import baileys from '@whiskeysockets/baileys';
const {proto, generateWAMessageFromContent, prepareWAMessageMedia, generateWAMessageContent, getDevice} = baileys.default;

let handler = async (message, { conn, text, usedPrefix, command }) => {
  
  if (!text) return conn.reply(message.chat, "[❗️] *¿Qué búsqueda deseas realizar en TikTok?*", message);
  
  async function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  try {
    let results = [];
    let { data: response } = await axios.get("https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=" + text);
    let searchResults = response.data;
    shuffleArray(searchResults);
    let selectedResults = searchResults.splice(0, 7);

    for (let result of selectedResults) {
      results.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: null }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: wm }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: '' + result.title,
          hasMediaAttachment: true,
          videoMessage: await generateWAMessageContent({ video: { url: result.nowm } }, { upload: conn.waUploadToServer })
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
      });
    }

    const responseMessage = generateWAMessageFromContent(message.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({ text: "🍧 Resultados De: " + text }),
            footer: proto.Message.InteractiveMessage.Footer.create({ text: "🔍 *T I K T O K - S E A R C H*" }),
            header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards: [...results] })
          })
        }
      }
    }, { quoted: message });

    await conn.relayMessage(message.chat, responseMessage.message, { messageId: responseMessage.key.id });
  } catch (error) {
    await conn.reply(message.chat, error.toString(), message);
  }
};

handler.help = ["tiktoksearch <txt>"];
handler.limit = 1;
handler.register = true;
handler.tags = ["search"];
handler.command = ["tiktoksearch", "tts", "tiktoks"];
export default handler;