
import fetch from 'node-fetch';

async function test() {
    try {
        const res = await fetch('http://localhost:3000/chat/german', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Hello, how are you?' })
        });
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Provider:', data.provider);
        console.log('Reply:', data.reply ? data.reply.substring(0, 100) : 'No reply');
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
