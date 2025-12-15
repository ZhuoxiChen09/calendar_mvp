# Calendar MVP

A Node.js API server that parses university course syllabi and returns prioritized task lists based on due dates and assignment weights. The API supports both text input and PDF file uploads.

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
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   ```

   Replace `your_openai_api_key_here` with your actual OpenAI API key.

## Running the Server

```bash
npm start
```

The server will start on port 3000. You should see:
```
Server listening on port 3000
Local: http://localhost:3000
Network: http://192.168.1.XXX:3000
```

## Testing

Make sure the server is running, then in a separate terminal:

```bash
node test-api.js
```

This will test the API with multiple syllabus formats and display the results.

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

```
calendar_mvp/
├── server.js          # Express server and API routes
├── llm.js             # OpenAI integration for syllabus parsing
├── priority.js        # Priority calculation logic
├── test-api.js        # Test script
├── package.json       # Dependencies and scripts
└── .env              # Environment variables (create this)
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
