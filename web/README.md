# Calendar MVP - Web Frontend

A React + TypeScript web app for parsing course syllabi and viewing prioritized tasks.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Make sure the backend server is running:
   ```bash
   cd ..
   npm start
   ```

3. Start the web dev server:
   ```bash
   npm run dev
   ```

4. Open your browser to the URL shown (usually `http://localhost:5173`)

## Usage

1. Paste your course syllabus text into the textarea
2. Click "Parse Syllabus"
3. View your prioritized tasks sorted by urgency and importance

## Development

- The web app runs on port 5173 (Vite default)
- The backend API runs on port 3000
- CORS is enabled on the backend to allow web app requests
