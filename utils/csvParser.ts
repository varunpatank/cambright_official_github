import { Question, MCQOption, MarkSchemeEntry, Paper } from "@/types";

export function parseCSV(csvText: string): string[][] {
  const lines = csvText.split("\n");
  const result: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const row: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        row.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    row.push(current.trim());
    result.push(row);
  }

  return result;
}

export function parseQuestions(csvText: string): Question[] {
  const rows = parseCSV(csvText);

  return rows.slice(1).map((row) => ({
    id: row[0]?.replace(/"/g, "") || "",
    paperId: row[1]?.replace(/"/g, "") || "",
    questionNumber: row[2]?.replace(/"/g, "") || "",
    questionText: row[3]?.replace(/"/g, "") || "",
    questionType: (row[4]?.replace(/"/g, "") || "MCQ") as
      | "MCQ"
      | "FRQ"
      | "STRUCTURED_PART",
    marks: row[5]?.replace(/"/g, "") || "",
    rawLlMExtractedQuestion: row[6]?.replace(/"/g, "") || "",
  }));
}

export function parseMCQOptions(csvText: string): MCQOption[] {
  const rows = parseCSV(csvText);

  return rows.slice(1).map((row) => ({
    id: row[0]?.replace(/"/g, "") || "",
    questionId: row[1]?.replace(/"/g, "") || "",
    optionLetter: row[2]?.replace(/"/g, "") || "",
    optionText: row[3]?.replace(/"/g, "") || "",
    isCorrect: row[4]?.replace(/"/g, "") || "0",
  }));
}

export function parseMarkScheme(csvText: string): MarkSchemeEntry[] {
  const rows = parseCSV(csvText);

  return rows.slice(1).map((row) => ({
    id: row[0]?.replace(/"/g, "") || "",
    paperId: row[1]?.replace(/"/g, "") || "",
    questionId: row[2]?.replace(/"/g, "") || "",
    entryNumber: row[3]?.replace(/"/g, "") || "",
    answerText: row[4]?.replace(/"/g, "") || "",
    marksAwarded: row[5]?.replace(/"/g, "") || "",
    guidanceNotes: row[6]?.replace(/"/g, "") || "",
    rawLlMExtractedMarkScheme: row[7]?.replace(/"/g, "") || "",
  }));
}

export function parsePapers(csvText: string): Paper[] {
  const rows = parseCSV(csvText);

  return rows.slice(1).map((row) => ({
    id: row[0]?.replace(/"/g, "") || "",
    year: row[1]?.replace(/"/g, "") || "",
    session: row[2]?.replace(/"/g, "") || "",
    variant: row[3]?.replace(/"/g, "") || "",
    subject: row[4]?.replace(/"/g, "") || "",
    paperType: row[5]?.replace(/"/g, "") || "",
  }));
}
