const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Раздаём фронтенд из ../frontend
app.use(express.static(path.join(__dirname, "../frontend")));

app.post("/api/clone", async (req, res) => {
    const { text, category, persona } = req.body;

    try {
        const apiKey = process.env.OPENROUTER_API_KEY;

        const personaPrompts = {
            optimist:
                "Опиши альтернативу в позитивном ключе, с надеждой и радостью.",
            pessimist:
                "Опиши альтернативу в мрачном ключе, акцент на проблемах и неудачах.",
            joker: "Опиши альтернативу с юмором и иронией, но без грубости.",
            realist:
                "Опиши альтернативу максимально правдоподобно и рационально.",
        };

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `
                                    Вы — интеллектуальный помощник, создающий альтернативные версии личных заметок.

                                    Дано:
                                    – исходный текст пользователя: "${text}";
                                    – категория: ${category};
                                    – тональность: ${persona}.

                                    Задача:
                                    Сформулировать один абзац (3–6 предложений) правдоподобного альтернативного развития событий от первого лица.

                                    Требования:
                                    – использовать стиль в соответствии с выбранной тональностью;
                                    – избегать фантастики, мистики, заговоров и упоминания клонов;
                                    – сохранять естественный, человеческий стиль повествования;
                                    – не искажать исходный смысл заметки, а предлагать реалистичную альтернативу.
                                    `,
                    },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const cloneText = response.data.choices[0].message.content;
        res.json({ original: text, clone: cloneText });
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: "Ошибка генерации" });
    }
});

// Отдаём index.html при заходе на /
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
});
