const fs = require('fs');

const filePath = 'c:\\Users\\User\\Documents\\Tugas Amos\\VSC\\langlearn\\web_client\\web_base.css';

const newCss = `
/* Sidebar Language Hover Effects */
.nav-dropdown-toggle {
  position: relative;
  overflow: hidden; /* Clip the image */
  isolation: isolate; /* Create new stacking context */
  border: 1px solid transparent; /* Prevent layout shift */
}

/* Background Image Container */
.nav-dropdown-toggle::before {
  content: '';
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.5s ease;
  z-index: -1;
  filter: blur(2px) brightness(0.7) grayscale(20%);
  transform: scale(1.1);
}

/* Hover State */
.nav-dropdown-toggle:hover::before {
  opacity: 1;
  transform: scale(1);
}

.nav-dropdown-toggle:hover {
  color: white !important;
  text-shadow: 0 2px 4px rgba(0,0,0,0.6);
  background: transparent !important; /* Override default hover */
  border-color: rgba(255,255,255,0.2);
}

/* Specific Images */
#navGermanToggle::before {
  background-image: url('https://images.unsplash.com/photo-1534313314376-a72289b6181e?w=800&q=80');
}

#navJapaneseToggle::before {
  background-image: url('https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80');
}

#navChineseToggle::before {
  background-image: url('https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80');
}
`;

try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // The marker is the end of the workspace block
    const marker = 'WORKSPACE (Apple Style) END';
    const idx = content.lastIndexOf(marker);
    
    if (idx !== -1) {
        // Find the closing of that comment block
        const endOfBlock = content.indexOf('*/', idx);
        if (endOfBlock !== -1) {
            // Keep up to including '*/'
            const cleanContent = content.substring(0, endOfBlock + 2);
            // Append new CSS
            const final = cleanContent + newCss;
            fs.writeFileSync(filePath, final, 'utf8');
            console.log('Fixed file successfully.');
        } else {
            console.log('Could not find end of comment block.');
        }
    } else {
        console.log('Marker not found.');
    }
} catch (e) {
    console.error('Error:', e);
}
