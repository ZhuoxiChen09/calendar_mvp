# Calendar MVP

A Node.js API server that parses university course syllabi and returns prioritized task lists based on due dates and assignment weights. The API supports both text input and PDF file uploads, making it suitable for integration with web or mobile applications.

## Features

- Parses syllabus text using OpenAI GPT-4o-mini
- Extracts course information, assignments, due dates, and weights
- Supports PDF file uploads with automatic text extraction
- Calculates task priorities based on urgency and importance
- Returns sorted list of tasks (highest priority first)
- Handles multiple syllabus formats (numbered lists, tables, narrative text, bullet points)
- Network IP detection for mobile app development

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)
- OpenAI API key
- For mobile development: Expo Go app (optional)

## Installation

1. Navigate to the project directory:
   ```bash
   cd calendar_mvp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Setup

1. Create a `.env` file in the project root directory:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   ```

2. Replace `your_openai_api_key_here` with your actual OpenAI API key.

3. Important: Never commit the `.env` file to version control. Add it to `.gitignore` if you haven't already.

## Running the Server

Start the server:
```bash
npm start
```

Or directly:
```bash
node server.js
```

The server will start on port 3000 (or the port specified in your `.env` file). You should see output like:
```
Server listening on port 3000
Local: http://localhost:3000
Network: http://192.168.1.XXX:3000

For Expo app, use: http://192.168.1.XXX:3000
```

Note: The server runs in the foreground and will block your terminal. To run it in the background or in a separate terminal window:
- Open a new terminal window and run `npm start` there
- Or use your IDE's terminal features to run it in a separate terminal tab

## API Endpoints

### GET /api/health

Health check endpoint to verify the server is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "message": "Calendar MVP API is running"
}
```

### POST /api/parse-syllabus-text

Parses syllabus text and returns prioritized tasks.

**Request Body:**
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

**Task Types:** homework, exam, project, quiz, reading

**Priority Calculation:**
- Urgency: 1 / days_left
- Importance: weight_percent / 10
- Priority: urgency + importance

Tasks are sorted by priority (highest first).

### POST /api/parse-syllabus-pdf

Parses syllabus from an uploaded PDF file and returns prioritized tasks.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Form field: `pdf` (file, max 10MB)

**Response:**
Same format as `/api/parse-syllabus-text`, with additional field:
```json
{
  "course": "Course Name",
  "tasks": [...],
  "totalTasks": 5,
  "source": "pdf"
}
```

## Using with Mobile Apps (Expo/React Native)

### Important: CORS Not Required

CORS (Cross-Origin Resource Sharing) only applies to web browsers. Mobile apps make direct HTTP requests and do not require CORS configuration.

### Finding Your Server IP

When you start the server, it displays your local network IP address. Use this IP address in your mobile app instead of `localhost`.

Example output:
```
Network: http://192.168.1.XXX:3000
For Expo app, use: http://192.168.1.XXX:3000
```

### Network Requirements

- Both your development machine and mobile device must be on the same Wi-Fi network
- Alternatively, use a tunneling service like ngrok for testing across different networks

### Example Expo Integration

```javascript
const API_BASE_URL = 'http://192.168.1.XXX:3000'; // Use your network IP

// Parse text syllabus
const response = await fetch(`${API_BASE_URL}/api/parse-syllabus-text`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ syllabusText: text })
});

// Upload PDF syllabus
const formData = new FormData();
formData.append('pdf', {
  uri: pdfUri,
  type: 'application/pdf',
  name: 'syllabus.pdf',
});

const response = await fetch(`${API_BASE_URL}/api/parse-syllabus-pdf`, {
  method: 'POST',
  body: formData,
});
```

### Using ngrok for Cross-Network Testing

If you need to test from a different network:

1. Install ngrok: `npm install -g ngrok`
2. Start your server: `npm start`
3. In another terminal: `ngrok http 3000`
4. Use the ngrok URL (e.g., `https://abc123.ngrok.io`) in your Expo app

## Testing the API

### Option 1: Use the Test Script

A test script is included (`test-api.js`) that tests multiple syllabus formats:

```bash
node test-api.js
```

Make sure the server is running before executing the test script.

### Option 2: Use curl

**Test health check:**
```bash
curl http://localhost:3000/api/health
```

**Test text parsing:**
```bash
curl -X POST http://localhost:3000/api/parse-syllabus-text \
  -H "Content-Type: application/json" \
  -d "{\"syllabusText\": \"Your syllabus text here...\"}"
```

**Test PDF upload:**
```bash
curl -X POST http://localhost:3000/api/parse-syllabus-pdf \
  -F "pdf=@/path/to/syllabus.pdf"
```

### Option 3: Use Postman or Another API Client

Send POST requests to:
- `http://localhost:3000/api/parse-syllabus-text` (with JSON body)
- `http://localhost:3000/api/parse-syllabus-pdf` (with multipart/form-data)

## Project Structure

```
calendar_mvp/
├── server.js          # Express server and API routes
├── llm.js             # OpenAI integration for syllabus parsing
├── priority.js        # Priority calculation logic
├── test-api.js        # Test script with multiple syllabus variants
├── package.json       # Dependencies and scripts
├── README.md          # This file
└── .env              # Environment variables (create this)
```

## Error Handling

The API returns descriptive error messages for common issues:

- **400 Bad Request**: Missing or invalid input (e.g., no syllabusText, invalid PDF)
- **500 Internal Server Error**: Server-side errors (e.g., OpenAI API issues, parsing failures)

Error response format:
```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": "Additional details (development mode only)"
}
```

## Troubleshooting

### "Missing credentials" error
- Make sure you have a `.env` file in the project root
- Verify that `OPENAI_API_KEY` is set correctly in `.env`
- Restart the server after creating/updating `.env`

### Connection refused when testing
- Make sure the server is running (`npm start`)
- Check that the server is listening on the correct port (default: 3000)
- If running the test script, ensure the server is running in a separate terminal or in the background

### Port already in use
- Change the `PORT` value in your `.env` file
- Or stop any other process using port 3000

### Network request failed (mobile apps)
- Make sure server is running
- Check that phone and computer are on same Wi-Fi network
- Verify you're using the network IP, not `localhost`
- Check firewall settings (Windows may block port 3000)

### PDF upload not working
- Make sure you're using `FormData` correctly
- Check file size (10MB limit)
- Verify PDF file is valid
- Ensure Content-Type is set to `multipart/form-data`

### JSON parsing errors
- The API uses OpenAI's JSON mode for more reliable parsing
- If errors persist, check the syllabus text format
- Verify your OpenAI API key is valid and has sufficient credits

## Dependencies

- **express**: Web server framework
- **openai**: OpenAI API client
- **dayjs**: Date manipulation library
- **dotenv**: Environment variable management
- **body-parser**: Request body parsing middleware
- **multer**: File upload handling
- **pdf-parse**: PDF text extraction

## Future Development

### Recommended Next Steps

1. **Data Persistence**: Add database (SQLite, PostgreSQL, or JSON file) to store courses and tasks
2. **Task Management**: Add endpoints for updating, completing, and deleting tasks
3. **Multiple Courses**: Support managing multiple courses simultaneously
4. **Calendar Export**: Generate iCal files for integration with calendar applications
5. **Improved Priority Algorithm**: Configurable weights, assignment type considerations, workload factoring
6. **User Authentication**: Multi-user support with JWT authentication
7. **Notifications**: Reminder system for upcoming deadlines

### Implementation Priority

For MVP completion:
1. Data persistence (2-4 hours)
2. Task management endpoints (2-3 hours)
3. Multiple courses support (1-2 hours)

This provides a complete MVP with storage and basic CRUD operations.

## License

ISC
