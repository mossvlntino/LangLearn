// japan/japanese-ai.js
const jpChatWindow = document.getElementById("jpChatWindow");
const jpChatInput = document.getElementById("jpChatInput");
const jpChatSend = document.getElementById("jpChatSend");

function appendJpMessage(sender, text) {
  if (!jpChatWindow) return;
  const div = document.createElement("div");
  div.className = "chat-message " + sender;
  div.textContent = text;
  jpChatWindow.appendChild(div);
  jpChatWindow.scrollTop = jpChatWindow.scrollHeight;
}

// greet
if (jpChatWindow) {
  appendJpMessage(
    "bot",
    "こんにちは 🌸 今日は何を練習したい？ (You can also ask in English.)"
  );
}

async function sendJpChat() {
  const msg = (jpChatInput.value || "").trim();
  if (!msg) return;

  appendJpMessage("me", msg);
  jpChatInput.value = "";

  try {
    const res = await fetch(`${config.API_BASE_URL}/chat/japanese`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });
    if (!res.ok) throw new Error("server " + res.status);
    const data = await res.json();
    appendJpMessage("bot", (data.reply || "").trim());
  } catch (err) {
    console.error("JP chat error:", err);
    appendJpMessage(
      "bot",
      "今はオンラインAIに接続できません 💡\nでも「です／ます」を付けると丁寧になりますよ。"
    );
  }
}

if (jpChatSend) jpChatSend.addEventListener("click", sendJpChat);
if (jpChatInput)
  jpChatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendJpChat();
  });
