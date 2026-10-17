import { NextResponse } from 'next/server';
import { readExcelFile } from '@/lib/loadData';

export async function GET() {
  try {
    const patients = readExcelFile('patients.xlsx');
    const appointments = readExcelFile('appointments.xlsx'); // Make sure your file name matches exactly (e.g., appointments.xlsx or appointments.xlsx...)
    const diagnosticLogs = readExcelFile('diagnostic_logs.xlsx');
    const vitalsStream = readExcelFile('vitals_stream.xlsx');
    const chatSessions = readExcelFile('chat_sessions.xlsx');

    return NextResponse.json({
      patients,
      appointments,
      diagnosticLogs,
      vitalsStream,
      chatSessions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}