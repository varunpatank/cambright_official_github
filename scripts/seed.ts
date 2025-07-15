// v0.0.01 salah

const { PrismaClient } = require("@prisma/client");
const database = new PrismaClient();
async function main() {
  try {
    await database.board.deleteMany();
    await database.board.createMany({
      data: [
        { name: "IGCSE" },
        { name: "GCSE (UK)" },
        { name: "Edexcel" },
        { name: "A-Level" },
        { name: "AS-Level" },
        { name: "O-Level" },
        { name: "Other" },
      ],
    });
    console.log("success");
  } catch (error) {
    console.log(error);
  } finally {
    await database.$disconnect();
  }
  // }
  // //
  // try {
  //   await database.noteSubject.deleteMany();
  //   await database.noteSubject.createMany({
  //     data: [
  //       { name: "Biology" },
  //       { name: "Chemistry" },
  //       { name: "Physics" },
  //       { name: "Mathematics" },
  //       { name: "Business" },
  //       { name: "Accounting" },
  //       { name: "Agriculture" },
  //       { name: "Art & Design" },
  //       { name: "Computer Science" },
  //       { name: "Co-ordinated Double Science" },
  //       { name: "Combined Science" },
  //       { name: "Design & Tech" },
  //       { name: "Drama" },
  //       { name: "Economics" },
  //       { name: "Enterprise" },
  //       { name: "English - EFL" },
  //       { name: "English Literature" },
  //       { name: "ESL" },
  //       { name: "Environmental Management" },
  //       { name: "Food & Nutrition" },
  //       { name: "French - FFL" },
  //       { name: "Geography" },
  //       { name: "Islmaiyat" },
  //       { name: "History" },
  //       { name: "Music" },
  //       { name: "P.E" },
  //       { name: "ICT" },
  //       { name: "ASL" },
  //       { name: "Arabic" },
  //       { name: "AFL" },
  //       { name: "Bahasa" },
  //       { name: "Chinese CSL" },
  //       { name: "Chinese Mandarin" },
  //       { name: "German - GFL" },
  //       { name: "Global Perspectives" },
  //       { name: "Hindi - HFL" },
  //       { name: "Hindi - HSL" },
  //       { name: "History - USA" },
  //       { name: "IsiZulu - ISL" },
  //       { name: "Italian - IFL" },
  //       { name: "Latin" },
  //       { name: "Malay" },
  //       { name: "Marine Sciences" },
  //       { name: "Add Maths" },
  //       { name: "International Maths" },
  //       { name: "Travel & Tourism" },
  //       { name: "World Literature" },
  //       { name: "Pakistan studies" },
  //       { name: "Portuguese - PFL" },
  //       { name: "Religious Studies" },
  //       { name: "Sanskrit" },
  //       { name: "Setswana" },
  //       { name: "Sociology" },
  //       { name: "Spanish" },
  //       { name: "Spanish Literature" },
  //       { name: "Swahili" },
  //       { name: "Thai" },
  //       { name: "Turkish" },
  //       { name: "Urdu" },
  //       { name: "Vietnamese" },
  //     ],
  //   });
  //   console.log("success");
  // } catch (error) {
  //   console.log(error);
  // } finally {
  //   await database.$disconnect();
  // }
}

main();

// node scripts/seed.ts
