# Calendar MVP

A Node.js + TypeScript API server that parses university course syllabi and returns prioritized task lists based on due dates and assignment weights. The API supports both text input and PDF file uploads.

## Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)
- OpenAI API key

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   ```

   Replace `your_openai_api_key_here` with your actual OpenAI API key.

## Running the Server

The project uses TypeScript with source in `src/` and compiled output in `dist/`.

To build and start the server:

```bash
npm start
```

This will run `tsc` to compile `src/` to `dist/` and then start `dist/server.js`.

The server will start on port 3000. You should see something like:

```text
Server listening on port 3000
Local: http://localhost:3000
Network: http://192.168.1.XXX:3000
```

## Testing

Make sure the server is running, then in a separate terminal:

```bash
npm run test-api
```

This will:
- Build the TypeScript (`npm run build`)
- Test the API with **four built‑in text syllabus variants**
- Test the API with **real PDF syllabi** from the `syllabus/` folder (see below).

### PDF test files

`src/test-api.ts` (compiled to `dist/test-api.js`) expects these files to exist under a `syllabus/` directory in the project root:

- `syllabus/158 Syllabus F25.pdf`
- `syllabus/Fall2025_142A_syllabus.pdf`
- `syllabus/Syllabus_COGS_107b_ Fa25.pdf`

You can either:
- Place your real syllabi at those paths, or
- Edit the `pdfFiles` array in `src/test-api.ts` to point to your own filenames.

## Web Frontend (local webpage)

A React + TypeScript web app lives in the `web/` folder. It lets you either:
- **Paste syllabus text**, or
- **Upload a local PDF**

and then displays the prioritized tasks returned by the backend.

### Running the web app

1. From the project root, make sure dependencies are installed (once):
   ```bash
   npm install
   ```

2. Start the backend API (in one terminal):
   ```bash
   npm start
   ```

3. Start the web app (in another terminal):
   ```bash
   cd web
   npm install      # first time only
   npm run dev
   ```

4. Open the URL shown by Vite (usually `http://localhost:5173`).

### Using the web app

- **Mode toggle** at the top lets you choose:
  - **Paste Text**: paste raw syllabus text into a textarea and click **Parse Syllabus**.
  - **Upload PDF**: select a `.pdf` (max 10MB); the app sends it to `/api/parse-syllabus-pdf`.
- The results section shows:
  - Course name
  - List of tasks sorted by priority
  - Due date, days left, weight, and priority score for each task.

## API Endpoints

### POST /api/parse-syllabus-text

Parses syllabus text and returns prioritized tasks.

**Request:**
```json
{
  "syllabusText": "Course syllabus text..."
}
```

**Response:**
```json
{
  "course": "Course Name",
  "tasks": [
    {
      "course_name": "Course Name",
      "name": "Assignment Name",
      "type": "homework",
      "due_date": "2024-10-15",
      "weight_percent": 10,
      "days_left": 5.5,
      "priority": 3.5
    }
  ],
  "totalTasks": 5
}
```

Tasks are sorted by priority (highest first). Priority is calculated as: (1 / days_left) + (weight_percent / 10)

### POST /api/parse-syllabus-pdf

Parses syllabus from an uploaded PDF file. Accepts multipart/form-data with a `pdf` field (max 10MB). Returns the same format as `/api/parse-syllabus-text`.

### GET /api/health

Health check endpoint. Returns server status.

## Project Structure

```text
calendar_mvp/
├── src/
│   ├── server.ts      # Express server and API routes
│   ├── llm.ts         # OpenAI integration for syllabus parsing
│   ├── priority.ts    # Priority calculation logic
│   ├── types.ts       # Shared TypeScript types
│   └── test-api.ts    # Test script
├── syllabus/          # Sample syllabus PDFs used by tests
├── dist/              # Compiled JavaScript output (auto-generated)
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── .env               # Environment variables (create this)
└── .gitignore         # Ignore dist/, node_modules/, .env, etc.
```

## Troubleshooting

**"Missing credentials" error:**
- Make sure you have a `.env` file with `OPENAI_API_KEY` set
- Restart the server after creating/updating `.env`

**Connection refused when testing:**
- Make sure the server is running (`npm start`)
- Run the test script in a separate terminal

**Port already in use:**
- Change the `PORT` value in your `.env` file

**PDF tests fail with `pdfParse is not a function` or `getDocument - no 'url' parameter provided.`**
- This project is pinned to `pdf-parse@1.1.1` and uses its **function-style API**:
  - Import: `import pdfParse from "pdf-parse";`
  - Usage: `const pdfData = await pdfParse(pdfBuffer);`
- If you upgrade `pdf-parse` to a newer major version, you may need to update the import and usage in `test-api.js` to match the new API.

**PDF tests fail with `ENOENT: no such file or directory, open '...test/data/05-versions-space.pdf'`**
- Some versions of `pdf-parse` enable an internal "debug mode" that tries to open a bundled test PDF.
- In `node_modules/pdf-parse/index.js`, set:
  - `let isDebugMode = false;`
- Then rerun `node test-api.js`.
