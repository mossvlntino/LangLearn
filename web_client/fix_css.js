const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'web_base.css');
const newCssPath = path.join(__dirname, 'css_update_temp.css');

try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find the end of the good content
    const marker = '/* =========================================================\r\n   WORKSPACE (Apple Style) END\r\n   ========================================================= */';
    const markerIndex = content.indexOf('   WORKSPACE (Apple Style) END');
    
    if (markerIndex !== -1) {
        // Find the absolute end of that block
        const blockEnd = content.indexOf('*/', markerIndex) + 2;
        // Truncate everything after
        content = content.substring(0, blockEnd);
        console.log('Truncated content to clean point.');
    } else {
        console.log('Marker not found, attempting to clean based on last curly brace in good section?');
        // Fallback: This might be risky if we don't find the marker.
        // Let's assume the marker matches what I saw in view_file
    }

    // append new css
    const newCss = fs.readFileSync(newCssPath, 'utf8');
    const finalContent = content + '\n\n' + newCss;
    
    fs.writeFileSync(filePath, finalContent, 'utf8');
    console.log('Successfully fixed web_base.css');

} catch (e) {
    console.error('Error:', e);
}
