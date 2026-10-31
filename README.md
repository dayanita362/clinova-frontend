# Clinova — AI-Powered Healthcare Intelligence Dashboard

<p align="center">

**Transforming hospital data into actionable insights with AI.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Clinova-16A34A?style=for-the-badge)](https://clinova-frontend-j4t5.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

</p>

## Overview

**Clinova** is an AI-powered healthcare operations and clinical intelligence dashboard designed to simplify hospital data management and support data-driven decision-making.

It brings multiple hospital datasets into one unified interface and integrates a Gemini-powered AI assistant to help users explore healthcare information through natural-language queries.

The platform focuses on making healthcare data more accessible, understandable and actionable.

## Live Demo

🌐 **[Explore Clinova](https://clinova-frontend-j4t5.vercel.app)**

## Key Features

### 1. Healthcare Dashboard
- Centralized view of hospital information.
- Patient and appointment data.
- Diagnostic activity monitoring.
- Vitals data visualization.

### 2. AI-Powered Assistant — Ask Clinova
- Natural-language interaction with hospital information.
- Context-aware responses using hospital dataset samples.
- Concise answers to healthcare operations questions.
- Gemini API integration.

### 3. Multi-Dataset Integration

Clinova currently works with five Excel datasets:

| Dataset | Description |
|---|---|
| Patients | Patient records |
| Appointments | Appointment information |
| Diagnostic Logs | Diagnostic activity |
| Vitals Stream | Patient vital readings |
| Chat Sessions | Chat interaction records |

### 4. Data APIs
- Dedicated API endpoints for patient and hospital data.
- Excel file processing using SheetJS.
- JSON responses for frontend integration.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes |
| AI Integration | Google Gemini API |
| Data Processing | SheetJS (xlsx) |
| Data Storage | Excel datasets |
| Version Control | Git, GitHub |
| Deployment | Vercel |

## System Architecture

```text
             USER
               |
               v
       CLINOVA DASHBOARD
          Next.js / React
               |
       +-------+-------+
       |               |
       v               v
  Hospital Data     Ask Clinova AI
       API               |
       |                 v
       v              Gemini API
  Excel Datasets          |
       |                 v
       +----------> AI Response
                         |
                         v
                   User Interface
```

## Project Structure

```text
frontend/
├── data/
│   ├── patients.xlsx
│   ├── appointments.xlsx
│   ├── diagnostic_logs.xlsx
│   ├── vitals_stream.xlsx
│   └── chat_sessions.xlsx
│
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   ├── hospital-data/
│   │   │   └── patients/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   └── lib/
│       └── loadData.ts
│
├── .env.local
├── package.json
└── next.config.ts
```

## Getting Started

### Prerequisites

- Node.js
- npm
- Google Gemini API key

### Installation

Clone the repository:

```bash
git clone https://github.com/dayanita362/clinova-frontend.git
```

Navigate to the project:

```bash
cd clinova-frontend
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Never commit your API key to GitHub.

### Run Locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Production Build

```bash
npm run build
```

## Future Enhancements

- Advanced analytics across complete hospital datasets.
- Real-time data monitoring and visualization.
- Streaming AI responses.
- Advanced patient and appointment analytics.
- Improved conversational context and chat history.
- Enhanced responsive dashboard experience.

## Project Links

- **Live Application:** https://clinova-frontend-j4t5.vercel.app
- **GitHub Repository:** https://github.com/dayanita362/clinova-frontend

## Disclaimer

Clinova is an educational and portfolio project demonstrating healthcare data visualization, API development and AI integration. It is not intended to replace professional medical judgment or clinical decision-making.

---

<p align="center">

**Built with curiosity, technology and a vision for smarter healthcare.**

</p>
