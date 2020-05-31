// npm run xlsx

import { decrypt } from "./decrypt";
import { readFile, writeFile, utils } from 'xlsx';

const INPUT_FILE = "/Users/ross/Downloads/Nursing Home Violation Reporting Form - ENC(2020-05-31).xlsx";
const SHEET_NAME = "Submissions";
const SKIP: number = 10;
const PLAIN_COLS: number[] = [16];

async function decryptXLSX(): Promise<void> {
  const workbook = readFile(INPUT_FILE, {
    type: "file",
    sheets: [SHEET_NAME],
  });
  const worksheet = workbook.Sheets[SHEET_NAME];
  const range = utils.decode_range(worksheet["!ref"]);

  // loop over all columns in all rows (skip first test rows)
  for (let r: number = 1 /* skip header row */; r <= range.e.r - SKIP; ++r) {
    for (let c: number = 1 /* skip date column */; c <= range.e.c; ++c) {
      const cell_address = { c, r };
      const cell_ref = utils.encode_cell(cell_address);
      const cell = worksheet[cell_ref];
      const value: string = cell && cell.v;

      // skip plain-text URL lists
      if (PLAIN_COLS.includes(c)) {
        if (value) {
          // but make them easier to read
          cell.v = value.split(" | ").join("\n");
        }

        continue;
      }

      if (value) {
        try {
          cell.v = await decrypt(value);
        } catch (e) {
          console.log(`Error with ${cell_ref} ("${value}"): `, e);
        }
      }
    }
  }

  writeFile(workbook, `${INPUT_FILE}-DECRYPTED.xlsx`);
}

decryptXLSX();
