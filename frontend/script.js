const saveBtn = document.getElementById("save-btn");
const entryText = document.getElementById("entry-text");
const categorySelect = document.getElementById("category");
const personaSelect = document.getElementById("persona");
const entriesDiv = document.getElementById("entries");

function addEntry(original, clone, category, persona) {
    const entryDiv = document.createElement("div");
    entryDiv.className = "entry";

    entryDiv.innerHTML = `
    <h3>Оригинал:</h3>
    <p>${original}</p>
    <p><strong>Категория:</strong> ${category}</p>
    <p><strong>Персонаж:</strong> ${persona}</p>
    <h3>Вариант:</h3>
    <p class="clone">${clone}</p>
  `;

    entriesDiv.prepend(entryDiv);
}

saveBtn.addEventListener("click", async () => {
    const text = entryText.value.trim();
    const category = categorySelect.value;
    const persona = personaSelect.value;

    if (text === "") return;

    try {
        const response = await fetch("http://localhost:5000/api/clone", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, category, persona }),
        });

        const data = await response.json();
        if (data.clone) {
            addEntry(data.original, data.clone, category, persona);
            entryText.value = "";
        } else {
            alert("Ошибка генерации варианта");
        }
    } catch (err) {
        console.error(err);
        alert("Не удалось связаться с сервером");
    }
});
