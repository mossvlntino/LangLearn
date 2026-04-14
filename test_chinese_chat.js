import fetch from 'node-fetch';

async function testChineseChat() {
  try {
    const response = await fetch('http://localhost:3000/chat/chinese', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello teacher' })
    });

    const data = await response.json();
    const hasPinyin = data.reply.includes('**RESPONSE PINYIN:**');
    
    console.log(hasPinyin ? 'VERIFICATION_SUCCESS' : 'VERIFICATION_FAILURE');
    if (!hasPinyin) {
        console.log('Full response:', data.reply);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testChineseChat();
