// german/german-ai.js
const deChatWindow = document.getElementById("deChatWindow");
const deChatInput = document.getElementById("deChatInput");
const deChatSend = document.getElementById("deChatSend");

function appendGermanMessage(sender, text) {
  if (!deChatWindow) return;
  const div = document.createElement("div");
  div.className = "chat-message " + sender;
  div.textContent = text;
  deChatWindow.appendChild(div);
  deChatWindow.scrollTop = deChatWindow.scrollHeight;
}

// greet
if (deChatWindow) {
  appendGermanMessage(
    "bot",
    "Hallo! 👋 Was möchtest du heute üben? (You can write in English/Indo too.)"
  );
}

async function sendGermanChat() {
  const msg = (deChatInput.value || "").trim();
  if (!msg) return;

  appendGermanMessage("me", msg);
  deChatInput.value = "";

  try {
    const res = await fetch(`${config.API_BASE_URL}/chat/german`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });

    if (!res.ok) throw new Error("server " + res.status);

    const data = await res.json();
    appendGermanMessage("bot", (data.reply || "").trim());
  } catch (err) {
    console.error("DE chat error:", err);
    appendGermanMessage(
      "bot",
      "I can't reach the AI server right now 🔴\nTip: nouns in German start with capitals."
    );
  }
}

if (deChatSend) deChatSend.addEventListener("click", sendGermanChat);
if (deChatInput)
  deChatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendGermanChat();
  });
