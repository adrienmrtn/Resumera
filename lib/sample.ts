import { computeScore, type TailorOutput, type TailorResult } from "./schema";

/** Shown when no API key is configured, so the interface can be tried end to end. */
const SAMPLE: TailorOutput = {
  job: { title: "Digital Marketing Manager", company: "Nordlys" },
  keywords: [
    { term: "acquisition strategy", importance: "must", in_original: false, in_tailored: true },
    { term: "paid media", importance: "must", in_original: false, in_tailored: true },
    { term: "CRM", importance: "must", in_original: true, in_tailored: true },
    { term: "B2B social media", importance: "must", in_original: true, in_tailored: true },
    { term: "weekly reporting", importance: "must", in_original: false, in_tailored: true },
    { term: "budget management", importance: "must", in_original: true, in_tailored: true },
    { term: "SEO", importance: "nice", in_original: true, in_tailored: true },
    { term: "Google Analytics 4", importance: "nice", in_original: true, in_tailored: true },
    { term: "HubSpot", importance: "nice", in_original: true, in_tailored: true },
    { term: "marketing automation", importance: "must", in_original: false, in_tailored: false },
    { term: "account-based marketing", importance: "nice", in_original: false, in_tailored: false },
    { term: "German C1", importance: "nice", in_original: false, in_tailored: false },
  ],
  resume: {
    name: "Camille Roussel",
    headline: "Digital Marketing Manager",
    contact: ["camille.roussel@example.com", "+33 6 00 00 00 00", "Lyon, France", "linkedin.com/in/camilleroussel"],
    summary:
      "Digital marketer with six years in B2B, from social media to a full acquisition strategy. Comfortable owning a paid media budget and reporting results to leadership every week.",
    experience: [
      {
        role: "Digital Project Manager",
        company: "Studio Lumen",
        location: "Lyon",
        dates: "2022 – 2025",
        bullets: [
          "Ran 4 B2B social media accounts, lifting engagement by 38% in 6 months",
          "Rebuilt the acquisition funnel with the CRM team on HubSpot, raising qualified leads by 22%",
          "Owned a €120k paid media budget (LinkedIn, Google Ads) with weekly reporting to leadership",
        ],
      },
      {
        role: "Marketing Officer",
        company: "Verso Éditions",
        location: "Paris",
        dates: "2019 – 2022",
        bullets: [
          "Planned and wrote the editorial calendar for the blog and newsletter (18k subscribers)",
          "Improved organic traffic by 45% in a year through SEO work on 60 product pages",
        ],
      },
    ],
    education: [{ degree: "MSc Marketing & Digital Strategy", school: "emlyon business school", dates: "2017 – 2019", details: "" }],
    skills: ["Acquisition strategy", "Paid media", "CRM (HubSpot)", "SEO", "Google Analytics 4", "Budget management", "Notion"],
    extras: [{ title: "Languages", items: ["French (native)", "English (fluent)"] }],
  },
  changes: [
    "Your headline now matches the title in the posting, since you already do this job in practice.",
    "\"Managed ad campaigns\" became \"paid media budget\" with the platforms named, which is the wording the posting uses.",
    "Your weekly updates to leadership are now called \"weekly reporting\", a must-have in the ad.",
    "The Studio Lumen role comes first and has more detail; the earlier role is shorter.",
    "Three keywords are still missing because nothing in your résumé supports them: marketing automation, account-based marketing and German C1.",
  ],
  cover_letter:
    "Dear Nordlys hiring team,\n\nYour posting for a Digital Marketing Manager describes the work I have been doing at Studio Lumen for the past three years: building an acquisition strategy for a B2B audience, owning the paid media budget and answering for the results every week.\n\nThere, I ran four B2B social media accounts and raised engagement by 38% in six months. I also rebuilt our acquisition funnel with the CRM team on HubSpot, which lifted qualified leads by 22%, and managed a €120k budget across LinkedIn and Google Ads with weekly reporting to leadership.\n\nBefore that, at Verso Éditions, I learned to earn attention without a budget: an editorial calendar for 18,000 newsletter subscribers and SEO work that grew organic traffic by 45% in a year.\n\nI have not yet run a marketing automation programme end to end, and I would rather say so plainly. I have worked alongside the team that did, and it is the area I most want to take on next.\n\nI would be glad to talk about how this experience could serve Nordlys.\n\nKind regards,\nCamille Roussel",
};

export function sampleResult(withLetter: boolean): TailorResult {
  const out = { ...SAMPLE, cover_letter: withLetter ? SAMPLE.cover_letter : "" };
  return { ...out, score: computeScore(out.keywords), demo: true };
}
