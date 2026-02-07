const express = require('express');
const app = express();

app.use(express.json());

app.post('/', (req, res) => {
    const data = req.body;

    // PING認証対応
    if (!data || !data.type || data.type === 1) {
        return res.json({ type: 1 });
    }

    // /dice コマンド
    if (data.type === 2 && data.data.name === "dice") {
        const dice = data.data.options?.[0]?.value || "";
        const match = dice.match(/(\d*)d(\d+)/);

        if (!match) {
            return res.json({
                type: 4,
                data: { content: "NdM形式で入力してください" }
            });
        }

        const n = parseInt(match[1] || "1");
        const m = parseInt(match[2]);
        const rolls = Array.from({ length: n }, () => Math.floor(Math.random() * m) + 1);
        const sum = rolls.reduce((a, b) => a + b, 0);

        return res.json({
            type: 4,
            data: { content: `🎲 ${n}d${m} → ${rolls.join(", ")} 合計: ${sum}` }
        });
    }

    return res.json({
        type: 4,
        data: { content: "❌ /dice 2d6 の形式で入力してください" }
    });
});

// RenderのPORT環境変数に対応
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
