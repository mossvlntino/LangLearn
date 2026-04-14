
import fetch from 'node-fetch';

async function testChat() {
    console.log("Testing Chat Formatting...");
    try {
        const response = await fetch('http://localhost:3000/chat/german', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: "Hello" })
        });
        
        const data = await response.json();
        console.log("Response Status:", response.status);
        if (response.status === 200) {
            console.log("\n--- AI REPLY ---\n");
            console.log(data.reply);
            console.log("\n----------------\n");
            console.log("Provider:", data.provider);
            
            // Validation (Updated to match User's Exact Requirements)
            const sections = ["GER:", "ENG:", "IND:", "Response:", "Response ENG:", "Feedback:", "Pro-Tip:", "Example:"];
            const missing = sections.filter(s => !data.reply.includes(s) && !data.reply.includes('**' + s));
            
            if (missing.length === 0) {
                console.log("✅ ALL format sections present!");
            } else {
                console.log("❌ MISSING sections:", missing);
            }
        } else {
            console.log("Error Body:", data);
        }
    } catch (err) {
        console.error("Test Failed:", err);
    }
}

testChat();
