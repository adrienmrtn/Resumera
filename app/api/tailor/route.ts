import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import mammoth from "mammoth";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import { allow } from "@/lib/ratelimit";
import { sampleResult } from "@/lib/sample";
import { TailorSchema, computeScore, type TailorResult } from "@/lib/schema";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_TEXT_CHARS = 40_000;
const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const fail = (status: number, error: string) => Response.json({ error }, { status });

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, "The request could not be read. Please try again.");
  }

  const jobText = String(form.get("jobText") ?? "").trim();
  const pasted = String(form.get("cvText") ?? "").trim();
  const withLetter = form.get("letter") === "1";
  const file = form.get("file");

  if (jobText.length < 80) return fail(400, "Paste the full job posting (at least a few sentences).");
  if (jobText.length > MAX_TEXT_CHARS) return fail(400, "The job posting is too long. Keep it under 40,000 characters.");

  // Résumé: a PDF goes to Claude as a document; Word and pasted text go as plain text.
  let resumeBlock: Anthropic.Beta.Messages.BetaContentBlockParam;
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_BYTES) return fail(400, "The file is larger than 5 MB.");
    const bytes = Buffer.from(await file.arrayBuffer());
    const name = file.name.toLowerCase();
    if (file.type === "application/pdf" || name.endsWith(".pdf")) {
      resumeBlock = {
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: bytes.toString("base64") },
        title: "Candidate résumé",
      };
    } else if (file.type === DOCX || name.endsWith(".docx")) {
      let text = "";
      try {
        text = (await mammoth.extractRawText({ buffer: bytes })).value.trim();
      } catch {
        return fail(400, "This Word file could not be read. Try exporting it as PDF.");
      }
      if (text.length < 100) return fail(400, "No text was found in this Word file.");
      if (text.length > MAX_TEXT_CHARS) return fail(400, "The résumé is too long. Keep it under 40,000 characters.");
      resumeBlock = { type: "text", text: `<resume>\n${text}\n</resume>` };
    } else if (file.type.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".md")) {
      const text = bytes.toString("utf8").trim();
      if (text.length < 100) return fail(400, "This file has too little text to be a résumé.");
      if (text.length > MAX_TEXT_CHARS) return fail(400, "The résumé is too long. Keep it under 40,000 characters.");
      resumeBlock = { type: "text", text: `<resume>\n${text}\n</resume>` };
    } else {
      return fail(400, "Upload a PDF or Word (.docx) file, or paste your résumé as text.");
    }
  } else if (pasted.length >= 100) {
    if (pasted.length > MAX_TEXT_CHARS) return fail(400, "The résumé is too long. Keep it under 40,000 characters.");
    resumeBlock = { type: "text", text: `<resume>\n${pasted}\n</resume>` };
  } else {
    return fail(400, "Add your résumé: upload a file or paste the text.");
  }

  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    // No credentials configured: return the sample so the product can still be explored.
    await new Promise((r) => setTimeout(r, 1200));
    return Response.json(sampleResult(withLetter));
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allow(ip)) return fail(429, "You have reached the hourly limit. Please try again later.");

  const client = new Anthropic();
  try {
    const message = await client.beta.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: zodOutputFormat(TailorSchema) },
      messages: [
        {
          role: "user",
          content: [
            resumeBlock,
            {
              type: "text",
              text: `<job_posting>\n${jobText}\n</job_posting>\n\nTailor the résumé above to this job posting. Cover letter requested: ${withLetter ? "yes" : "no"}.`,
            },
          ],
        },
      ],
    });

    if (message.stop_reason === "refusal") {
      return fail(422, "This request could not be processed. Check that both documents are a résumé and a job posting.");
    }
    if (message.stop_reason === "max_tokens" || !message.parsed_output) {
      return fail(502, "The result came back incomplete. Please try again, or shorten the résumé.");
    }

    const output = message.parsed_output;
    const result: TailorResult = { ...output, score: computeScore(output.keywords) };
    return Response.json(result);
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
      console.error("Anthropic credentials rejected", error.status);
      return fail(500, "The AI service is not configured correctly. Please contact the site owner.");
    }
    if (error instanceof Anthropic.RateLimitError) {
      return fail(429, "Resumera is busy right now. Please try again in a minute.");
    }
    if (error instanceof Anthropic.BadRequestError) {
      console.error("Anthropic bad request", error.message);
      return fail(400, "This file could not be processed. Try a different PDF, or paste the text instead.");
    }
    if (error instanceof Anthropic.APIError) {
      console.error("Anthropic API error", error.status, error.message);
      return fail(502, "The AI service had a problem. Please try again.");
    }
    console.error(error);
    return fail(500, "Something went wrong. Please try again.");
  }
}
