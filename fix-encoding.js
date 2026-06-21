// fix-encoding.js — double-encodage UTF-8 via Windows-1252
// Toutes les séquences garbled en unicode escapes pour éviter tout problème de fichier
const fs   = require('fs');
const path = require('path');

// Format: [garbled_unicode_string, correct_character]
// Les séquences 3 octets (UTF-8 via Windows-1252 0x80-0x9F) sont les plus délicates
const REPLACEMENTS = [
  // ── 3-byte sequences (byte 0x80 → € Win-1252, 0x89 → ‰, 0x93 → ", 0x94 → ", 0x96 → –, 0x97 → —, 0x9C → œ) ──
  ['Ã‰',           'É'], // Ã‰ → É  (C3 89 : 0x89=‰ Win-1252)
  ['Ã€',           'À'], // Ã€ → À  (C3 80 : 0x80=€)
  ['ÃŠ',           'Ê'], // ÃŠ → Ê  (C3 8A : 0x8A=Š)
  ['ÃŒ',           'Ì'], // ÃŒ → Ì  (C3 8C)
  ['ÃŽ',           'Î'], // ÃŽ → Î  (C3 8E)
  ['Ã•',           'Õ'], // Ã• → Õ  (C3 95 : 0x95=•)
  ['Ã–',           'Ö'], // Ã– → Ö  (C3 96 : 0x96=–)
  ['Ã—',           '×'], // Ã— → ×  (C3 97 : 0x97=—)
  ['Ã˜',           'Ø'], // Ã˜ → Ø  (C3 98 : 0x98=˜)
  ['Ã™',           'Ù'], // Ã™ → Ù  (C3 99 : 0x99=™)
  ['Ãš',           'Ú'], // Ãš → Ú  (C3 9A)
  ['Ã›',           'Û'], // Ã› → Û  (C3 9B)
  ['Ãœ',           'Ü'], // Ãœ → Ü  (C3 9C : 0x9C=œ)
  ['Ãž',           'Þ'], // Ãž → Þ  (C3 9E)
  ['ÃŸ',           'ß'], // ÃŸ → ß  (C3 9F : 0x9F=Ÿ)
  // … (U+2026) : E2 80 A6 → â + € + ¦
  ['â€¦',     '…'], // â€¦ → …
  // — em dash (U+2014) : E2 80 94 → â + € + " (U+201D)
  ['â€”',     '—'], // â€" → —
  // – en dash (U+2013) : E2 80 96 → â + € + – (U+2013) ← mais 0x96 Win-1252 = U+2013
  ['â€–',     '–'], // â€– → –
  // ' left single quote (U+2018) : E2 80 98 → â + € + ˜ (0x98=˜)
  ['â€˜',     '‘'], // â€˜ → '
  // ' right single quote (U+2019) : E2 80 99 → â + € + ™ (0x99=™)
  ['â€™',     '’'], // â€™ → '
  // " left double quote (U+201C) : E2 80 9C → â + € + œ (0x9C=œ)
  ['â€œ',     '“'], // â€œ → "
  // " right double quote (U+201D) : E2 80 9D → â + € + (0x9D undefined, U+009D)
  ['â€',     '”'], // â€ → "
  // • bullet (U+2022) : E2 80 A2 → â + € + ¢ (0xA2=¢)
  ['â€¢',     '•'], // â€¢ → •
  // ✓ check (U+2713) : E2 9C 93 → â + œ + " (0x9C=œ, 0x93=")
  ['âœ“',     '✓'], // âœ" → ✓
  // ● black circle (U+25CF) : E2 97 8F → â + — + (0x97=—, 0x8F undefined U+008F)
  ['â—',     '●'], // â—● → ●

  // ── 2-byte sequences (Latin-1 range, all deterministic) ──
  ['Ã©', 'é'], // Ã© → é
  ['Ã¨', 'è'], // Ã¨ → è
  ['Ã ', 'à'], // Ã  → à
  ['Ã´', 'ô'], // Ã´ → ô
  ['Ã¹', 'ù'], // Ã¹ → ù
  ['Ã¢', 'â'], // Ã¢ → â
  ['Ã®', 'î'], // Ã® → î
  ['Ãª', 'ê'], // Ãª → ê
  ['Ã»', 'û'], // Ã» → û
  ['Ã§', 'ç'], // Ã§ → ç
  ['Ã«', 'ë'], // Ã« → ë
  ['Ã¯', 'ï'], // Ã¯ → ï
  ['Ã¼', 'ü'], // Ã¼ → ü
  ['Ã±', 'ñ'], // Ã± → ñ
  ['Ã¸', 'ø'], // Ã¸ → ø
  ['Ã¥', 'å'], // Ã¥ → å
  ['Ã¤', 'ä'], // Ã¤ → ä
  ['Ã¶', 'ö'], // Ã¶ → ö
  ['Ã²', 'ò'], // Ã² → ò
  ['Ã³', 'ó'], // Ã³ → ó
  ['Â·',  '·'], // Â· → ·
  ['Â°',  '°'], // Â° → °
  ['Â»',  '»'], // Â» → »
  ['Â«',  '«'], // Â« → «
  ['Âµ',  'µ'], // Âµ → µ
  ['Â¦',  '¦'], // Â¦ → ¦
];

const screenDir = path.join(__dirname, 'livrables/ecosysteme-attractor/attractor-assists/app/src/screens');
const dirs = [screenDir];

let totalFiles = 0, totalCount = 0;

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => /\.(jsx?|tsx?)$/.test(f));
  files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    REPLACEMENTS.forEach(([bad, good]) => {
      while (content.includes(bad)) content = content.split(bad).join(good);
    });
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('  Fixed:', file);
      totalFiles++; totalCount++;
    }
  });
});

console.log(`\nTerminé : ${totalFiles} fichier(s) corrigé(s).`);
