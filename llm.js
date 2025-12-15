import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function extractSyllabusStructure(syllabusText) {
  const prompt = `
You are a syllabus parser. The user will give you the full text of a university course syllabus.

Output a JSON object with this exact structure:

{
  "course_name": string,
  "assignments": [
    {
      "name": string,
      "type": "homework" | "exam" | "project" | "quiz" | "reading",
      "due_date": "YYYY-MM-DD" | null,
      "weight_percent": number | null
    }
  ]
}

Rules:
- If you don't know the due_date, set it to null, don't guess.
- If you don't know the weight, set weight_percent to null.
- Include only assignments that clearly appear.
- Respond with ONLY JSON, no extra text.

Syllabus text:
"""${syllabusText}"""
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0,
    response_format: { type: "json_object" } // Force JSON response
  });

  const content = response.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (parseError) {
    console.error("Failed to parse LLM response:", content);
    throw new Error(`Failed to parse LLM response as JSON: ${parseError.message}`);
  }
}
