import { NextResponse } from 'next/server';
import { readExcelFile } from '@/lib/loadData';

export async function GET() {
  try {
    const patients = readExcelFile('patients.xlsx');
    return NextResponse.json(patients);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}