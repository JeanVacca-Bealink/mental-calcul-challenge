export function generateChallengeQuestion(difficulty: "easy" | "medium" | "hard"){
    const max = difficulty === "easy" ? 20 : difficulty === "medium" ? 50 : 100;
    const a = Math.floor(Math.random() * max) + 1;
    const b = Math.floor(Math.random() * max) + 1;
    const ops = ["+", "-"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let q: string;
    let ans: number;
    if (op === "+") {
      q = `${a} + ${b}`;
      ans = a + b;
    } else {
      const maxVal = Math.max(a, b);
      const minVal = Math.min(a, b);
      q = `${maxVal} - ${minVal}`;
      ans = maxVal - minVal;
    }

    return {question: q, answer: ans};
}