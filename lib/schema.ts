import { z } from "zod";

export const ResumeSchema = z.object({
  name: z.string(),
  headline: z.string().describe("Professional title under the name, tailored to the job"),
  contact: z.array(z.string()).describe("Contact items exactly as in the original: email, phone, city, links"),
  summary: z.string().describe("2-3 sentence profile; empty string if the original has none and none is warranted"),
  experience: z.array(
    z.object({
      role: z.string(),
      company: z.string(),
      location: z.string(),
      dates: z.string(),
      bullets: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      school: z.string(),
      dates: z.string(),
      details: z.string(),
    }),
  ),
  skills: z.array(z.string()),
  extras: z
    .array(z.object({ title: z.string(), items: z.array(z.string()) }))
    .describe("Other sections from the original: languages, certifications, projects, volunteering"),
});

export const TailorSchema = z.object({
  job: z.object({
    title: z.string(),
    company: z.string().describe("Empty string if the posting does not name the employer"),
  }),
  keywords: z
    .array(
      z.object({
        term: z.string().describe("Skill, tool, qualification or responsibility, as worded in the posting"),
        importance: z.enum(["must", "nice"]),
        in_original: z.boolean().describe("The original résumé already states this term or a direct equivalent"),
        in_tailored: z.boolean().describe("The tailored résumé states this term or a direct equivalent"),
      }),
    )
    .describe("10 to 20 keywords a recruiter or ATS would screen for"),
  resume: ResumeSchema,
  changes: z.array(z.string()).describe("3 to 6 short notes on what was changed and why"),
  cover_letter: z.string().describe("The cover letter, or an empty string when none was requested"),
});

export type Resume = z.infer<typeof ResumeSchema>;
export type TailorOutput = z.infer<typeof TailorSchema>;

export type Score = { before: number; after: number; found: number; total: number };

export type TailorResult = TailorOutput & { score: Score; demo?: boolean };

/** Must-have keywords count double. Returns whole numbers out of 100. */
export function computeScore(keywords: TailorOutput["keywords"]): Score {
  const weight = (k: TailorOutput["keywords"][number]) => (k.importance === "must" ? 2 : 1);
  const total = keywords.reduce((s, k) => s + weight(k), 0);
  if (total === 0) return { before: 0, after: 0, found: 0, total: 0 };
  const share = (pick: (k: TailorOutput["keywords"][number]) => boolean) =>
    Math.round((keywords.reduce((s, k) => s + (pick(k) ? weight(k) : 0), 0) / total) * 100);
  return {
    before: share((k) => k.in_original),
    after: share((k) => k.in_tailored),
    found: keywords.filter((k) => k.in_tailored).length,
    total: keywords.length,
  };
}
