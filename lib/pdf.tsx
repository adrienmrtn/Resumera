import { Document, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import type { Resume } from "./schema";

// One column, standard section headings and built-in Helvetica: the layout applicant tracking systems parse most reliably.
const s = StyleSheet.create({
  page: { paddingVertical: 44, paddingHorizontal: 50, fontFamily: "Helvetica", fontSize: 10, lineHeight: 1.4, color: "#111111" },
  name: { fontFamily: "Helvetica-Bold", fontSize: 21, lineHeight: 1.15 },
  headline: { fontSize: 11.5, marginTop: 3 },
  contact: { fontSize: 9.5, color: "#444444", marginTop: 5 },
  h: { fontFamily: "Helvetica-Bold", fontSize: 10, textTransform: "uppercase", borderBottomWidth: 0.75, borderBottomColor: "#999999", paddingBottom: 3, marginTop: 15, marginBottom: 7 },
  jobHead: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  role: { fontFamily: "Helvetica-Bold", flex: 1 },
  dates: { color: "#444444" },
  job: { marginBottom: 9 },
  bullet: { flexDirection: "row", marginTop: 2.5, paddingRight: 8 },
  dot: { width: 11 },
  bulletText: { flex: 1 },
  small: { color: "#444444" },
  para: { marginBottom: 9 },
});

function ResumeDoc({ r }: { r: Resume }) {
  return (
    <Document title={`${r.name} - Resume`} author={r.name}>
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{r.name}</Text>
        {r.headline ? <Text style={s.headline}>{r.headline}</Text> : null}
        {r.contact.length ? <Text style={s.contact}>{r.contact.join("  |  ")}</Text> : null}

        {r.summary ? (
          <View>
            <Text style={s.h}>Summary</Text>
            <Text>{r.summary}</Text>
          </View>
        ) : null}

        {r.experience.length ? (
          <View>
            <Text style={s.h}>Experience</Text>
            {r.experience.map((e, i) => (
              <View key={i} style={s.job}>
                <View style={s.jobHead} wrap={false}>
                  <Text style={s.role}>{[e.role, e.company].filter(Boolean).join(", ")}</Text>
                  <Text style={s.dates}>{e.dates}</Text>
                </View>
                {e.location ? <Text style={s.small}>{e.location}</Text> : null}
                {e.bullets.map((b, j) => (
                  <View key={j} style={s.bullet} wrap={false}>
                    <Text style={s.dot}>•</Text>
                    <Text style={s.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {r.education.length ? (
          <View>
            <Text style={s.h}>Education</Text>
            {r.education.map((e, i) => (
              <View key={i} style={{ marginBottom: 6 }} wrap={false}>
                <View style={s.jobHead}>
                  <Text style={s.role}>{[e.degree, e.school].filter(Boolean).join(", ")}</Text>
                  <Text style={s.dates}>{e.dates}</Text>
                </View>
                {e.details ? <Text style={s.small}>{e.details}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {r.skills.length ? (
          <View wrap={false}>
            <Text style={s.h}>Skills</Text>
            <Text>{r.skills.join(", ")}</Text>
          </View>
        ) : null}

        {r.extras.map((x, i) =>
          x.items.length ? (
            <View key={i} wrap={false}>
              <Text style={s.h}>{x.title}</Text>
              <Text>{x.items.join(", ")}</Text>
            </View>
          ) : null,
        )}
      </Page>
    </Document>
  );
}

function LetterDoc({ r, text }: { r: Resume; text: string }) {
  return (
    <Document title={`${r.name} - Cover letter`} author={r.name}>
      <Page size="A4" style={{ ...s.page, paddingVertical: 60, paddingHorizontal: 64, fontSize: 11, lineHeight: 1.5 }}>
        <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 14 }}>{r.name}</Text>
        {r.contact.length ? <Text style={{ ...s.contact, marginBottom: 28 }}>{r.contact.join("  |  ")}</Text> : <View style={{ height: 28 }} />}
        {text
          .split(/\n{2,}/)
          .map((p) => p.trim())
          .filter(Boolean)
          .map((p, i) => (
            <Text key={i} style={s.para}>
              {p}
            </Text>
          ))}
      </Page>
    </Document>
  );
}

export const resumePdf = (r: Resume) => pdf(<ResumeDoc r={r} />).toBlob();
export const letterPdf = (r: Resume, text: string) => pdf(<LetterDoc r={r} text={text} />).toBlob();
