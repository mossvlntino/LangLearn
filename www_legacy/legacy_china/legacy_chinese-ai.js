// chinese/chinese-ai.js
const cnChatWindow = document.getElementById("cnChatWindow");
const cnChatInput = document.getElementById("cnChatInput");
const cnChatSend = document.getElementById("cnChatSend");

function appendCnMessage(sender, text) {
  if (!cnChatWindow) return;
  const div = document.createElement("div");
  div.className = "chat-message " + sender;
  div.textContent = text;
  cnChatWindow.appendChild(div);
  cnChatWindow.scrollTop = cnChatWindow.scrollHeight;
}

// greet
if (cnChatWindow) {
  appendCnMessage(
    "bot",
    "你好 👋 今天想练什么？(You can also ask in English.)"
  );
}

async function sendCnChat() {
  const msg = (cnChatInput.value || "").trim();
  if (!msg) return;

  appendCnMessage("me", msg);
  cnChatInput.value = "";

  try {
    const res = await fetch(`${config.API_BASE_URL}/chat/chinese`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });
    if (!res.ok) throw new Error("server " + res.status);
    const data = await res.json();
    appendCnMessage("bot", (data.reply || "").trim());
  } catch (err) {
    console.error("CN chat error:", err);
    appendCnMessage(
      "bot",
      "现在连不上中文AI 🟠\n小贴士: 你可以先说“我想学点口语”。"
    );
  }
}

if (cnChatSend) cnChatSend.addEventListener("click", sendCnChat);
if (cnChatInput)
  cnChatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendCnChat();
  });
