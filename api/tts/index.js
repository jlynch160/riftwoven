/* RIFTWOVEN — neural TTS relay.
   Browsers can't reach the Edge Read-Aloud neural service directly (origin
   checks), so this Azure Function speaks the protocol server-side and streams
   the MP3 back. Same neural catalog as Azure Speech, zero keys. */
const WebSocket = require('ws');
const crypto = require('crypto');
const TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';

module.exports = async function (context, req) {
  try {
    const ssml = req.body && req.body.ssml;
    if (!ssml || typeof ssml !== 'string' || ssml.length > 4000 || !/^<speak[\s>]/.test(ssml.trim())) {
      context.res = { status: 400, body: 'bad ssml' };
      return;
    }
    let ticks = (BigInt(Math.floor(Date.now() / 1000)) + 11644473600n) * 10000000n;
    ticks -= ticks % 3000000000n;
    const gec = crypto.createHash('sha256').update(ticks.toString() + TOKEN).digest('hex').toUpperCase();
    const reqId = crypto.randomUUID().replace(/-/g, '');
    const url = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TOKEN}&Sec-MS-GEC=${gec}&Sec-MS-GEC-Version=1-132.0.2917.0&ConnectionId=${reqId}`;

    const audio = await new Promise((resolve, reject) => {
      const ws = new WebSocket(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0',
          'Origin': 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold'
        }
      });
      const chunks = [];
      const to = setTimeout(() => { try { ws.close(); } catch (e) {} reject(new Error('timeout')); }, 15000);
      ws.on('open', () => {
        const ts = new Date().toISOString();
        ws.send(`X-Timestamp:${ts}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n` +
          JSON.stringify({ context: { synthesis: { audio: { metadataoptions: { sentenceBoundaryEnabled: 'false', wordBoundaryEnabled: 'false' }, outputFormat: 'audio-24khz-96kbitrate-mono-mp3' } } } }));
        ws.send(`X-RequestId:${reqId}\r\nX-Timestamp:${ts}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n` + ssml);
      });
      ws.on('message', (data, isBinary) => {
        if (!isBinary) {
          if (data.toString().includes('Path:turn.end')) { clearTimeout(to); try { ws.close(); } catch (e) {} resolve(Buffer.concat(chunks)); }
          return;
        }
        const hlen = (data[0] << 8) | data[1];
        if (data.slice(2, 2 + hlen).toString().includes('Path:audio')) chunks.push(data.slice(2 + hlen));
      });
      ws.on('error', e => { clearTimeout(to); reject(e); });
    });

    if (!audio.length) throw new Error('no audio');
    context.res = {
      status: 200, isRaw: true,
      headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
      body: audio
    };
  } catch (e) {
    context.res = { status: 502, body: 'tts failed: ' + e.message };
  }
};
