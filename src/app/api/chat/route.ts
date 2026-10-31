
import { NextResponse } from 'next/server';
import { readExcelFile } from '@/lib/loadData';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is missing.' },
        { status: 500 }
      );
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Please send a message.' },
        { status: 400 }
      );
    }

    // Load Clinova's hospital datasets
    const datasets = {
      patients: readExcelFile('patients.xlsx'),
      appointments: readExcelFile('appointments.xlsx'),
      diagnosticLogs: readExcelFile('diagnostic_logs.xlsx'),
      vitalsStream: readExcelFile('vitals_stream.xlsx'),
      chatSessions: readExcelFile('chat_sessions.xlsx'),
    };

    // Send a small sample rather than the entire Excel files
    const hospitalContext = Object.entries(datasets)
      .map(([name, rows]) => {
        return `${name}: ${rows.length} records.
Sample: ${JSON.stringify(rows.slice(0, 5))}`;
      })
      .join('\n\n');

    // Keep recent conversation history
    const contents = messages.slice(-8).map(
      (m: { role: string; text: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(m.text || '') }],
      })
    );

    const systemInstruction = {
      parts: [{
        text: `
You are Clinova AI, a concise healthcare operations and clinical
intelligence assistant.

HOSPITAL DATA:
${hospitalContext}

RULES:
1. Give short, direct answers, usually 50-120 words.
2. Use bullet points when useful.
3. Use the supplied hospital data for questions about Clinova's datasets.
4. Never invent patient records, numbers, or hospital statistics.
5. The samples are not necessarily the complete datasets. Never claim
   that a sample represents every record.
6. If the requested information is not available, say so clearly.
7. Do not give a generic medical textbook explanation when the user
   asks about Clinova's actual data.
8. For clinical questions, provide cautious informational guidance,
   not a definitive diagnosis or treatment decision.
9. Do not claim access to external hospital systems or live EHRs.
        `,
      }],
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: systemInstruction,
          contents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Gemini API request failed.' },
        { status: response.status }
      );
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Sorry, I could not generate a response. Please try again.';

    return NextResponse.json({ reply });

  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Internal Server Error';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
