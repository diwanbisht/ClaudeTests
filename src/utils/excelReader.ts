import path from 'path';
import * as XLSX from 'xlsx';
import { config } from './config';

export interface LoginExcelRow {
  name: string;
  email: string;
  message: string;
}

export function readLoginTestData(
  filePath: string = path.resolve(process.cwd(), config.loginTestDataPath),
): LoginExcelRow[] {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false });

  return rows.slice(1).map((row, i) => {
    const [name, email, message] = row;
    if (!name || !email) {
      throw new Error(`${filePath}: row ${i + 2} is missing a name or email value`);
    }
    return {
      name: String(name).trim(),
      email: String(email).trim(),
      message:
        message !== undefined && message !== null && String(message).trim() !== ''
          ? String(message).trim()
          : 'Testing',
    };
  });
}
