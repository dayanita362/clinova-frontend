import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is missing. Please set GEMINI_API_KEY in your environment variables.' },
        { status: 500 }
      );
    }

    // Format chat history for Gemini API
    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    // System instruction to maintain the Clinova Persona
    const systemInstruction = {
      parts: [
        {
          text: 'You are Clinova AI, an advanced medical workflow and clinical intelligence assistant. Provide helpful, accurate, and concise guidance regarding patient management, vitals monitoring, diagnostic analytics, and healthcare workflows. Always adhere strictly to evidence-based medical consensus.',
        },
      ],
    };



    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: systemInstruction,
          contents,
        }),
      }
    );
    

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || 'Failed to fetch response from Gemini API' }, { status: response.status });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

    return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}