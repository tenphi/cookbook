import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

export async function prompt(question: string): Promise<string> {
  const readline = createInterface({ input: stdin, output: stdout });
  try {
    return (await readline.question(question)).trim();
  } finally {
    readline.close();
  }
}

export async function confirm(question: string): Promise<boolean> {
  const answer = (await prompt(`${question} [y/N] `)).toLowerCase();
  return answer === "y" || answer === "yes";
}
