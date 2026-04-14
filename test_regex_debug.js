
const testCases = [
    "Response: Konnichiwa\nResponse ENG: Hello", // Ideal
    "Response: Konnichiwa\nResponse: ENG: Hello", // Problematic Colon
    "Response: Konnichiwa\nResponse English: Hello", // Variation
    "Response: Konnichiwa\nResponse: English: Hello", // Variation with colon
];

const headers = [
    { p: "GER", l: "GER" },
    { p: "JPN", l: "JPN" },
    { p: "CHN", l: "CHN" },
    { p: "ROMAJI", l: "ROMAJI" },
    { p: "ENG", l: "ENG" },
    { p: "IND", l: "IND" },
    // Fix: Allow optional colon and flexible spacing
    { p: "Response:?\\s*ENG", l: "Response ENG" }, 
    { p: "Response:?\\s*English", l: "Response ENG" }, 
    // Fix: Validated negative lookahead including optional colon
    { p: "Response(?!:?\\s*ENG|:?\\s*English)", l: "Response" }, 
    { p: "Feedback", l: "Feedback" },
    { p: "Pro-Tip", l: "Pro-Tip" },
    { p: "Example", l: "Example" }
];

testCases.forEach((input, index) => {
    let text = input;
    console.log(`\n--- Test Case ${index + 1} ---`);
    console.log("Original:", JSON.stringify(text));
    
    headers.forEach(h => {
        const regex = new RegExp(`(?:^|\\n|(?<!\\n))\\s*(?:#+\\s*|\\*+\\s*)?${h.p}\\s*:?`, 'gi'); 
        text = text.replace(regex, `\n\n${h.l}: `); 
    });
    
    console.log("Processed:", JSON.stringify(text));
});
