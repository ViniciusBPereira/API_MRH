import { parse } from "csv-parse";

export async function parseCSV(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];

    parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })
      .on("data", (row) => results.push(row))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}
