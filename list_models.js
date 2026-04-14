
import fetch from 'node-fetch';

const KEY = "AIzaSyB0PUOXKJnFy31aY7U_nmMv9UAcIvllr2s";
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${KEY}`;

async function listModels() {
    try {
        const res = await fetch(URL);
        const data = await res.json();
        
        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.name.includes('gemini')) {
                    console.log(m.name); // e.g. models/gemini-pro
                }
            });
        } else {
            console.log("Error/No models:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

listModels();
