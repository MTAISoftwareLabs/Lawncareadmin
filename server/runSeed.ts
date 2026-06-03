import { seedDatabaseIfEmpty } from "./seed";

async function main() {
  try {
    await seedDatabaseIfEmpty();
    console.log("Seed process completed.");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

main();
