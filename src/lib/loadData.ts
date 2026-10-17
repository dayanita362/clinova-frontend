import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

export function readExcelFile(fileName: string) {
  const filePath = path.join(process.cwd(), 'data', fileName);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return [];
  }

  const fileBuffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  return XLSX.utils.sheet_to_json(worksheet);
}