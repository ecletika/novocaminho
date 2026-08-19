// Cloudflare Pages Function — feed iCal AO VIVO dos aniversários.
// Rota: /aniversarios.ics
// Subscrever no telemóvel: webcal://<dominio>/aniversarios.ics
// (lê sempre os dados atuais, por isso atualiza-se sozinho depois de subscrito)

const SUPABASE_URL = "https://vpnotookdrjxvemrklad.supabase.co";
// Chave anónima (pública — a mesma que já vai no bundle do site). Aniversários têm leitura pública.
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbm90b29rZHJqeHZlbXJrbGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjA2MDksImV4cCI6MjA4ODYzNjYwOX0.44rcFHj53lbLINEA1T9Pbr5zOQknRvgR0Dbt-1eqwOM";

function icsDate(s) {
  return s ? String(s).replace(/-/g, "") : null; // "1990-05-10" -> "19900510"
}
function esc(t) {
  return String(t).replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
}

export async function onRequestGet() {
  let rows = [];
  try {
    const url =
      `${SUPABASE_URL}/rest/v1/birthdays` +
      `?select=id,birthday_type,man_name,woman_name,man_birthday,woman_birthday,birthday_date,wedding_date&limit=5000`;
    const res = await fetch(url, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
    });
    if (res.ok) rows = await res.json();
  } catch (e) {
    // Em caso de erro devolve um calendário vazio (nunca falha para quem subscreveu).
  }

  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Novo Caminho//Aniversarios//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Aniversários - Novo Caminho",
    "X-WR-TIMEZONE:Europe/Lisbon",
  ];

  const add = (uid, date, summary) => {
    const d = icsDate(date);
    if (!d || d.length !== 8 || !summary || !summary.trim()) return;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}@novocaminho`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${d}`,
      "RRULE:FREQ=YEARLY",
      `SUMMARY:${esc(summary)}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  };

  for (const b of rows) {
    if (b.birthday_type === "wedding") {
      const couple = [b.man_name, b.woman_name]
        .filter(Boolean)
        .map((s) => s.trim())
        .join(" & ");
      add(`bodas-${b.id}`, b.birthday_date, `💍 Bodas de ${couple}`);
      if (b.man_name) add(`bdm-${b.id}`, b.man_birthday, `🎂 Aniversário de ${b.man_name.trim()}`);
      if (b.woman_name) add(`bdw-${b.id}`, b.woman_birthday, `🎂 Aniversário de ${b.woman_name.trim()}`);
    } else {
      const name = (b.woman_name || b.man_name || "").trim();
      add(`bd-${b.id}`, b.man_birthday || b.woman_birthday || b.birthday_date, `🎂 Aniversário de ${name}`);
      if (b.wedding_date) add(`bodas-${b.id}`, b.wedding_date, `💍 Bodas de ${name}`);
    }
  }

  lines.push("END:VCALENDAR");

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="aniversarios-novocaminho.ics"',
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
