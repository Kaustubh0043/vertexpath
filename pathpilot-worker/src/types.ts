export interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
  GEMINI_API_KEY?: string;
  GROQ_API_KEY?: string;
  RESEND_API_KEY?: string;
  BREVO_API_KEY?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
}

export interface JwtPayload {
  sub: string; // user id
  email: string;
  fullName: string;
  exp: number;
}

