
const clean = (str) => typeof str === 'string' ? str.replace(/^\*+|\*+$/g, '').trim() : str;

const getSection = (content, name) => {
    // Exact Updated Regex from main.js
    const knownHeaders = "GER|ENG|IND|Response ENG|Response English|Response|Feedback|Pro-Tip|Example";
    
    // The Regex being tested
    const regex = new RegExp(`(?:^|\\n)\\s*(?:\\*\\*|\\*|_)?${name}(?:\\*\\*|\\*|_)?(?!\\w)\\s*:?\\s*(.*?)(?=(?:\\n\\s*(?:\\*\\*|\\*|_)?(?:${knownHeaders})(?:\\*\\*|\\*|_)?)|$)`, 'is'); 
    
    const match = content.match(regex);
    return match ? clean(match[1]) : null;
};

const runTest = (content, label) => {
    console.log(`\n--- TEST: ${label} ---`);
    const resp = getSection(content, 'Response') || getSection(content, 'RESPONSE');
    const respEng = getSection(content, 'Response ENG') || getSection(content, 'Response English');
    
    console.log(`[Response]: "${resp}"`);
    console.log(`[Response ENG]: "${respEng}"`);
    
    // Check if Response 'ate' Response ENG
    if (resp && resp.includes("Response ENG")) {
        console.log("❌ FAILED: Response swallowed Response ENG header!");
    } else if (resp && resp.includes("This is English")) {
        console.log("❌ FAILED: Response swallowed Response ENG content!");
    } else if (resp === "This is German" && respEng === "This is English") {
        console.log("✅ PASSED: Clean Separation");
    } else {
        console.log("❌ FAILED: Parsing error (Check logs)");
    }
};

const case1 = `
Response:
This is German
Response ENG:
This is English
Feedback: Good
`;

// "Messy" Case (Missing colons, bolding variations)
const case2 = `
**Response**
This is German
Response ENG
This is English
Feedback
Good
`;

runTest(case1, "Standard");
runTest(case2, "Messy / No Colons");
