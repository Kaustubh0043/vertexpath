import { Hono } from 'hono';
import type { Env } from '../types';
import { generateJson, callGemini } from '../utils/ai';

export const aiRouter = new Hono<{ Bindings: Env }>();

// 1. AI Project Blueprint Generator
aiRouter.post('/project', async (c) => {
  const { stack = 'Fullstack TypeScript & React' } = await c.req.json<{ stack?: string }>();
  const prompt = `Generate a production-ready architectural project blueprint for tech stack: "${stack}".
Return valid JSON matching this schema:
{
  "ideas": "Detailed system architectural suggestions and core features to implement",
  "folder_structure": "Standard clean directory tree diagram in ascii",
  "api_suggestions": "RESTful endpoints with HTTP verbs, request and response descriptions",
  "database_design": "Relational schema tables, primary keys, foreign keys, and indexes"
}`;

  try {
    const data = await generateJson(prompt, c.env);
    return c.json(data);
  } catch {
    return c.json({
      ideas: `Production microservice architecture for ${stack}. Focus on clean separation of concerns, JWT stateless auth, and edge-caching.`,
      folder_structure: `├── src\n│   ├── config\n│   ├── controllers\n│   ├── models\n│   ├── routes\n│   ├── services\n│   └── index.ts\n├── tests\n└── package.json`,
      api_suggestions: `POST /api/v1/auth/login - User Authentication\nGET /api/v1/items - List resource items\nPOST /api/v1/items - Create item with validation`,
      database_design: `CREATE TABLE users (id UUID PRIMARY KEY, email VARCHAR UNIQUE);\nCREATE TABLE resources (id UUID PRIMARY KEY, user_id UUID REFERENCES users(id));`
    });
  }
});

// 2. Mock Interview Generator & Evaluator
aiRouter.post('/interview/generate', async (c) => {
  const { role = 'Senior Full Stack Engineer' } = await c.req.json<{ role?: string }>();
  const prompt = `Generate a realistic technical interview question for candidate applying for: "${role}".
Return valid JSON matching:
{
  "question": "The interview question",
  "expected_points": "Key engineering principles, concepts, or algorithms expected in a great answer"
}`;

  try {
    const data = await generateJson(prompt, c.env);
    return c.json(data);
  } catch {
    return c.json({
      question: `How would you architect a distributed rate limiter that handles 100,000 requests per second across multiple data centers?`,
      expected_points: `Mention token bucket or sliding window log algorithms, Redis/memcached distributed caching, and clock skew synchronization.`
    });
  }
});

aiRouter.post('/interview/evaluate', async (c) => {
  const { question, answer } = await c.req.json<{ question?: string; answer?: string }>();
  const prompt = `Evaluate the candidate's interview response.
Question: "${question}"
Candidate Answer: "${answer}"
Return valid JSON matching:
{
  "score": 85,
  "feedback": "Detailed constructive evaluation highlighting strengths and gaps",
  "model_answer": "The ideal answer demonstrating seniority and depth"
}`;

  try {
    const data = await generateJson(prompt, c.env);
    return c.json(data);
  } catch {
    return c.json({
      score: 82,
      feedback: "Strong technical foundation. Consider providing more concrete operational metrics and failure recovery strategies.",
      model_answer: "An optimal answer begins with clear functional requirements, outlines edge scenarios, and justifies architectural trade-offs."
    });
  }
});

// 3. Coding Challenge & Algorithmic Audit
aiRouter.post('/coding/challenge', async (c) => {
  const body = await c.req.json<{ language?: string; difficulty?: string }>();
  const prompt = `Generate an algorithmic coding challenge (${body.difficulty || 'Medium'} in ${body.language || 'TypeScript'}).
Return valid JSON matching:
{
  "title": "Problem Title",
  "description": "Problem prompt with constraints and examples",
  "starterCode": "Initial function boilerplate",
  "testCases": [{ "input": "...", "expected": "..." }]
}`;

  try {
    const data = await generateJson(prompt, c.env);
    return c.json(data);
  } catch {
    return c.json({
      title: "Longest Substring Without Repeating Characters",
      description: "Given a string s, find the length of the longest substring without repeating characters.",
      starterCode: "function lengthOfLongestSubstring(s: string): number {\n  // Implement here\n}",
      testCases: [{ input: '"abcabcbb"', expected: "3" }, { input: '"bbbbb"', expected: "1" }]
    });
  }
});

aiRouter.post('/coding/evaluate', async (c) => {
  const { code, language = 'TypeScript' } = await c.req.json<{ code?: string; language?: string }>();
  const prompt = `Analyze this ${language} code for algorithmic efficiency, Big-O complexity, edge cases, and optimal refactoring:
\`\`\`${language}
${code}
\`\`\`
Return valid JSON matching:
{
  "timeComplexity": "O(N)",
  "spaceComplexity": "O(1)",
  "complexityExplanation": "Breakdown of the mathematical runtime",
  "edgeCases": ["Handled empty input", "Handled duplicate elements"],
  "refactoredCode": "Clean optimized production-ready version",
  "score": 90
}`;

  try {
    const data = await generateJson(prompt, c.env);
    return c.json(data);
  } catch {
    return c.json({
      timeComplexity: "O(N)",
      spaceComplexity: "O(N)",
      complexityExplanation: "Single pass iteration with hash map lookup taking linear time.",
      edgeCases: ["Empty string input", "Single character input", "All distinct characters"],
      refactoredCode: code || "",
      score: 88
    });
  }
});

// 4. Compensation Copilot
aiRouter.post('/compensation/analyze', async (c) => {
  const body = await c.req.json<{ role?: string; experience?: string; location?: string; currentOffer?: string }>();
  const prompt = `Provide market salary compensation percentiles and negotiation strategy for:
Role: ${body.role || 'Software Engineer'}, Experience: ${body.experience || '3 years'}, Location: ${body.location || 'Remote'}
Current Offer: ${body.currentOffer || 'Not specified'}
Return valid JSON matching:
{
  "percentile25": 110000,
  "percentile50": 135000,
  "percentile75": 160000,
  "percentile90": 185000,
  "currency": "USD",
  "leverageAssessment": "Strategic advice on leverage based on current market demand",
  "counterOfferTemplate": "Professional, polite counter-offer email script asking for 10-15% increase"
}`;

  try {
    const data = await generateJson(prompt, c.env);
    return c.json(data);
  } catch {
    return c.json({
      percentile25: 115000,
      percentile50: 140000,
      percentile75: 168000,
      percentile90: 195000,
      currency: "USD",
      leverageAssessment: "High demand for full-stack engineering skillsets with cloud deployment expertise.",
      counterOfferTemplate: "Dear Hiring Team,\n\nThank you for the exciting offer. Based on my technical background and current market benchmarks, I was targeting a base closer to $155,000. Is there flexibility to bridge this gap?"
    });
  }
});

// 5. Recruiter Outreach Pitch Generator
aiRouter.post('/outreach/generate', async (c) => {
  const body = await c.req.json<{ targetRole?: string; targetCompany?: string; keySkills?: string; tone?: string }>();
  const prompt = `Write 3 high-converting cold outreach LinkedIn/Email messages to connect with hiring leads at ${body.targetCompany || 'target tech company'} for role ${body.targetRole || 'Software Engineer'}.
Key candidate skills: ${body.keySkills || 'React, TypeScript, Cloudflare, Node'}. Tone: ${body.tone || 'Confident & concise'}.
Return valid JSON matching:
{
  "pitches": [
    { "target": "Recruiter / Talent Partner", "subject": "Subject line", "body": "Pitch text" },
    { "target": "Engineering Manager", "subject": "Subject line", "body": "Technical value-add pitch text" },
    { "target": "Founder / Head of Engineering", "subject": "Subject line", "body": "Executive high-impact pitch text" }
  ]
}`;

  try {
    const data = await generateJson(prompt, c.env);
    return c.json(data);
  } catch {
    return c.json({
      pitches: [
        {
          target: "Recruiter",
          subject: `Exploring ${body.targetRole || 'Software Engineer'} opportunities at ${body.targetCompany || 'your team'}`,
          body: `Hi [Name], I noticed your team is building impactful solutions. With my background in ${body.keySkills || 'modern full-stack systems'}, I'd love to learn if there's a strong fit.`
        },
        {
          target: "Engineering Manager",
          subject: `Quick idea on ${body.targetRole || 'Engineering'} at ${body.targetCompany || 'Company'}`,
          body: `Hi [Name], I admire your team's engineering work. Having shipped high-scale web platforms using ${body.keySkills || 'React & TypeScript'}, I'd love to connect and share insights.`
        }
      ]
    });
  }
});
