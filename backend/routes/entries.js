const express = require("express");
const Entry = require("../models/Entry");
const auth = require("../middleware/auth");
const router = express.Router();

// Create (also call AI)
router.post("/", auth, async (req, res) => {
    const { original, category, persona } = req.body;
    // 1) вызов OpenRouter, генерация clone (как у тебя)
    // 2) сохранить запись
    const clone = await generateClone(original, category, persona); // вынеси функцию
    const entry = new Entry({
        userId: req.userId,
        original,
        clone,
        category,
        persona,
    });
    await entry.save();
    res.json(entry);
});

// Read list (pagination & search & filter)
router.get("/", auth, async (req, res) => {
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "10");
    const q = req.query.q || "";
    const filter = { userId: req.userId };
    if (q)
        filter.$or = [
            { original: { $regex: q, $options: "i" } },
            { clone: { $regex: q, $options: "i" } },
        ];
    if (req.query.category) filter.category = req.query.category;
    const total = await Entry.countDocuments(filter);
    const items = await Entry.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

// Update
router.put("/:id", auth, async (req, res) => {
    const upd = { ...req.body, updatedAt: new Date() };
    const entry = await Entry.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        upd,
        { new: true }
    );
    res.json(entry);
});

// Delete
router.delete("/:id", auth, async (req, res) => {
    await Entry.deleteOne({ _id: req.params.id, userId: req.userId });
    res.json({ ok: true });
});

module.exports = router;
