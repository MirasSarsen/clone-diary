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

    // Валидация входных данных
    if (!text || !category || !persona) {
        return res.status(400).json({
            error: "Отсутствуют обязательные поля: text, category, persona",
        });
    }

    try {
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            console.error("❌ OPENROUTER_API_KEY не найден в .env");
            return res.status(500).json({
                error: "API ключ не настроен на сервере",
            });
        }

        const personaPrompts = {
            optimist:
                "Опиши альтернативу в позитивном ключе, с надеждой и радостью.",
            pessimist:
                "Опиши альтернативу в мрачном ключе, акцент на проблемах и неудачах.",
            joker: "Опиши альтернативу с юмором и иронией, но без грубости.",
            realist:
                "Опиши альтернативу максимально правдоподобно и рационально.",
        };

        console.log("📤 Отправка запроса к OpenRouter...");
        console.log("🔑 API Key присутствует:", apiKey ? "Да" : "Нет");
        console.log("📝 Текст:", text.substring(0, 50) + "...");

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Вы — интеллектуальный помощник, создающий альтернативные версии личных заметок.

Задача:
Сформулировать один абзац (3–6 предложений) правдоподобного альтернативного развития событий от первого лица.

Требования:
– использовать стиль: ${personaPrompts[persona] || personaPrompts.realist}
– категория заметки: ${category}
– избегать фантастики, мистики, заговоров и упоминания клонов
– сохранять естественный, человеческий стиль повествования
– не искажать исходный смысл заметки, а предлагать реалистичную альтернативу`,
                    },
                    {
                        role: "user",
                        content: `Исходный текст заметки: "${text}"\n\nСоздай альтернативный вариант развития событий.`,
                    },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://clone-diary.app",
                    "X-Title": "CloneDiaryApp",
                },
            }
        );

        console.log("✅ Ответ получен от OpenRouter");

        const cloneText = response.data.choices[0].message.content;
        res.json({ original: text, clone: cloneText });
    } catch (error) {
        console.error("❌ Ошибка API:", error.response?.data || error.message);

        // Детальная информация об ошибке
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Headers:", error.response.headers);
        }

        res.status(500).json({
            error: "Ошибка генерации",
            details: error.response?.data?.error?.message || error.message,
            code: error.response?.data?.error?.code || error.response?.status,
        });
    }
});

// Отдаём index.html при заходе на /
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Проверка здоровья сервера
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        hasApiKey: !!process.env.OPENROUTER_API_KEY,
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
    console.log(
        `🔑 API ключ загружен:`,
        process.env.OPENROUTER_API_KEY ? "Да" : "❌ НЕТ"
    );
});
