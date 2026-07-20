export const GAME_LEVELS = [
  {
    id: 1,
    title: "Passcode Decryption",
    description: "Write a function `getPassword(char)` that takes a single character and repeats it 6 times to form a 6-digit password string. (e.g. if char='7' => '777777')",
    starterCode: `// Repeat the character 6 times
function getPassword(char) {
  // Your code here
  return "";
}
`,
    functionName: "getPassword",
    testCases: [
      { input: ["A"], expected: "AAAAAA" },
      { input: ["X"], expected: "XXXXXX" },
      { input: ["7"], expected: "777777" },
      { input: ["K"], expected: "KKKKKK" },
      { input: ["9"], expected: "999999" }
    ],
  }
];
