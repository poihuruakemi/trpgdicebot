const express = require('express');
const nacl = require('tweetnacl');
const app = express();
app.use(express.json());

// Discord 公開鍵
const PUBLIC_KEY = 'DISCORD_PUBLIC_KEY';

app.post('/', (req, res) => {
  const signature = req.header('X-Signature-Ed25519');
  const timestamp = req.header('X-Signature-Timestamp');
  const body = JSON.stringify(req.body);

  // 署名検証
  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, 'hex'),
    Buffer.from(PUBLIC_KEY, 'hex')
  );

  if (!isVerified) return res.status(401).send('Invalid request');

  const data = req.body;

  // Discord PING
  if (data.type === 1) return res.json({ type: 1 });

  // /dice コマンド処理
  if (data.type === 2 && data.data.name === 'dice') {
    const dice = data.data.options?.[0]?.value || '1d6';
    const match = dice.match(/(\d*)d(\d+)/);
    if (!match) return res.json({ type: 4, data: { content: '❌ 2d6 のように入力してください' } });

    const n = parseInt(match[1] || '1');
    const m = parseInt(match[2]);
    const rolls = Array.from({ length: n }, () => Math.floor(Math.random() * m) + 1);
    const sum = rolls.reduce((a, b) => a + b, 0);

    return res.json({
      type: 4,
      data: {
        content: `🎲 ${n}d${m} = ${rolls.join(', ')} = ${sum}`
      }
    });
  }

  // その他はエラー
  res.json({ type: 4, data: { content: '❌ /dice 2d6 を使ってください' } });
});

// Render の環境変数 PORT かデフォルト 3000
app.listen(process.env.PORT || 3000);
