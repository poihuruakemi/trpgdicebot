import express from "express";
import bodyParser from "body-parser";
import { verifyKeyMiddleware } from "discord-interactions";

const app = express();

// 🔑 DiscordのPublic Key
const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;

app.post(
  "/interactions",
  bodyParser.raw({ type: "application/json" }),
  verifyKeyMiddleware(PUBLIC_KEY),
  (req, res) => {

    const interaction = JSON.parse(req.body);

    // PING
    if (interaction.type === 1) {
      return res.json({ type: 1 });
    }

    // /dice
    if (interaction.type === 2 && interaction.data.name === "dice") {
      const dice = interaction.data.options?.[0]?.value || "";
      const match = dice.match(/(\d*)d(\d+)/);

      if (!match) {
        return res.json({
          type: 4,
          data: { content: "❌ `2d6` の形式で入力してね" }
        });
      }

      const n = parseInt(match[1] || "1");
      const m = parseInt(match[2]);
      let rolls = [];

      for (let i = 0; i < n; i++) {
        rolls.push(Math.floor(Math.random() * m) + 1);
      }

      const sum = rolls.reduce((a,b)=>a+b,0);

      return res.json({
        type: 4,
        data: { content: `🎲 ${n}d${m} → ${rolls.join(", ")} = ${sum}` }
      });
    }

    res.sendStatus(400);
  }
);

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
