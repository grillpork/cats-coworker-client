export const GAME_LEVELS = [
  {
    id: 1,
    title: "ถอดรหัสผ่านเซิร์ฟเวอร์",
    description: "เขียนฟังก์ชัน `getPassword(char)` ที่รับตัวอักษรเข้ามา 1 ตัว และทำซ้ำตัวอักษรนั้นเป็นจำนวน 6 ครั้ง เพื่อประกอบเป็นรหัสผ่าน 6 หลัก (ตัวอย่างเช่น: ถ้าตัวอักษรคือ '7' -> จะได้ผลลัพธ์เป็น '777777')",
    starterCode: `// เขียนฟังก์ชันทำซ้ำตัวอักษรจำนวน 6 ครั้ง
function getPassword(char) {
  // เขียนโค้ดของคุณที่นี่
  return "";
}
`,
    functionName: "getPassword",
    testCases: [
      { input: ["7"], expected: "777777" }
    ],
  }
];
