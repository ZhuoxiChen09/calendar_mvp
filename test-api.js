// test-api.js - Simple script to test the syllabus parsing API
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pdfParse from "pdf-parse";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Variant 1: Simple numbered list format
const testSyllabus1 = `
CS 101: Introduction to Computer Science
Fall 2024

Course Information:
- Instructor: Dr. Smith
- Office Hours: Tuesdays 2-4 PM

Assignments:
1. Homework 1: Basic Programming - Due: 2024-10-15, Weight: 10%
2. Midterm Exam - Due: 2024-11-05, Weight: 30%
3. Final Project - Due: 2024-12-10, Weight: 40%
4. Quiz 1 - Due: 2024-10-20, Weight: 5%
5. Homework 2: Data Structures - Due: 2024-11-01, Weight: 15%
`;

// Variant 2: Structured table-like format with sections
const testSyllabus2 = `
MATH 201: Calculus II
Spring 2025
Professor: Dr. Johnson

ASSESSMENT SCHEDULE

Assignment Name          | Type      | Due Date    | Percentage
-------------------------|-----------|-------------|------------
Problem Set 1            | homework  | 2025-02-14  | 5%
Problem Set 2            | homework  | 2025-02-28  | 5%
Problem Set 3            | homework  | 2025-03-14  | 5%
Midterm Exam             | exam      | 2025-03-21  | 25%
Problem Set 4            | homework  | 2025-04-11  | 5%
Problem Set 5            | homework  | 2025-04-25  | 5%
Final Exam               | exam      | 2025-05-15  | 50%
`;

// Variant 3: Narrative/paragraph format
const testSyllabus3 = `
ENGL 102: Composition and Rhetoric
Fall 2024 Semester

This course will assess your progress through several assignments throughout the term. 
Students are expected to complete weekly reading assignments, which will be checked 
through short quizzes. The first major assignment is an Essay 1, due on October 10th, 
2024, which counts for 15% of your final grade. Following that, Essay 2 is scheduled 
for November 7th, 2024 and is worth 20% of your grade. There will be a midterm 
examination on October 25th, 2024 that accounts for 25% of your final grade. 
Additionally, students must complete a research paper project by December 5th, 2024, 
which is worth 30% of the final grade. Weekly quizzes will be given every Friday 
starting from September 20th, 2024, and each quiz is worth 2% of your grade (10% total).
`;

// Variant 4: Bullet points with different date formats
const testSyllabus4 = `
PHYS 150: Physics for Engineers
Winter 2025

GRADED WORK:

• Lab Report #1 - Due: Feb 5, 2025 - Worth 8% of grade
• Lab Report #2 - Due: Feb 19, 2025 - Worth 8% of grade  
• Quiz 1 - February 12, 2025 - 5%
• Quiz 2 - March 5, 2025 - 5%
• Midterm Test - March 19, 2025 - 20%
• Lab Report #3 - Due: March 26, 2025 - Worth 8% of grade
• Lab Report #4 - Due: April 9, 2025 - Worth 8% of grade
• Final Project - April 23, 2025 - 30%
• Final Exam - May 7, 2025 - 8%
`;

const testCases = [
  { name: "Variant 1: Numbered List", syllabus: testSyllabus1 },
  { name: "Variant 2: Table Format", syllabus: testSyllabus2 },
  { name: "Variant 3: Narrative Format", syllabus: testSyllabus3 },
  { name: "Variant 4: Bullet Points", syllabus: testSyllabus4 }
];

// Function to read and parse PDF from local file
async function readPDFFromFile(filePath) {
  try {
    const pdfBuffer = readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    return pdfData.text;
  } catch (error) {
    throw new Error(`Failed to read PDF from ${filePath}: ${error.message}`);
  }
}

async function testAPI(syllabusText, testName) {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${testName}`);
    console.log('='.repeat(60));
    console.log('Sending request to http://localhost:3000/api/parse-syllabus-text...');
    
    const response = await fetch('http://localhost:3000/api/parse-syllabus-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ syllabusText })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP Error ${response.status}:`, errorText);
      return false;
    }

    const data = await response.json();
    console.log('\nSuccess! Response:');
    console.log(`Course: ${data.course}`);
    console.log(`Tasks found: ${data.tasks.length}`);
    console.log('\nTop 3 prioritized tasks:');
    data.tasks.slice(0, 3).forEach((task, idx) => {
      console.log(`  ${idx + 1}. ${task.name} (${task.type}) - Due: ${task.due_date} - Priority: ${task.priority.toFixed(2)}`);
    });
    return true;
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Make sure the server is running on port 3000!');
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
    return false;
  }
}

async function testPDFFromFile(filePath, testName) {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${testName}`);
    console.log(`Reading PDF: ${filePath}`);
    console.log('='.repeat(60));
    
    const syllabusText = await readPDFFromFile(filePath);
    console.log(`Extracted ${syllabusText.length} characters from PDF`);
    console.log('Sending request to http://localhost:3000/api/parse-syllabus-text...');
    
    const response = await fetch('http://localhost:3000/api/parse-syllabus-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ syllabusText })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP Error ${response.status}:`, errorText);
      return false;
    }

    const data = await response.json();
    console.log('\nSuccess! Response:');
    console.log(`Course: ${data.course}`);
    console.log(`Tasks found: ${data.tasks.length}`);
    console.log('\nTop 3 prioritized tasks:');
    data.tasks.slice(0, 3).forEach((task, idx) => {
      console.log(`  ${idx + 1}. ${task.name} (${task.type}) - Due: ${task.due_date} - Priority: ${task.priority.toFixed(2)}`);
    });
    return true;
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Make sure the server is running on port 3000!');
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
    return false;
  }
}

async function runAllTests() {
  console.log('\nRunning all test variants...\n');
  
  const results = [];
  
  // Test with made-up syllabus variants
  for (const testCase of testCases) {
    const success = await testAPI(testCase.syllabus, testCase.name);
    results.push({ name: testCase.name, success });
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Test with real PDFs from syllabus folder
  const syllabusDir = join(__dirname, 'syllabus');
  const pdfFiles = [
    '158 Syllabus F25.pdf',
    'Fall2025_142A_syllabus.pdf',
    'Syllabus_COGS_107b_ Fa25.pdf'
  ];
  
  for (const pdfFile of pdfFiles) {
    const pdfPath = join(syllabusDir, pdfFile);
    try {
      // Check if file exists
      readFileSync(pdfPath);
      const success = await testPDFFromFile(pdfPath, `Real PDF: ${pdfFile}`);
      results.push({ name: `Real PDF: ${pdfFile}`, success });
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.log(`\nSkipping ${pdfFile}: File not found`);
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('Test Summary:');
  console.log('='.repeat(60));
  results.forEach((result, idx) => {
    console.log(`${idx + 1}. ${result.name}: ${result.success ? 'PASSED' : 'FAILED'}`);
  });
  const passed = results.filter(r => r.success).length;
  console.log(`\nTotal: ${passed}/${results.length} tests passed`);
}

runAllTests();

