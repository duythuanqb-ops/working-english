#!/usr/bin/env node
// Builds src/data/tid/grammar/** for the TID grammar area. OFFLINE ONLY — reads local files, no network.
//   scripts/live/api/grammar.json        <- GET /api/grammar?band=GRM  (the 25 "Ngữ pháp toàn tập" lessons)
//   src/data/ieltsGrammarWordForms.json  <- GET /api/grammar?lessonId=grm-word-forms (only lesson body captured)
//   the 6 "Advanced grammar" cards are hard-coded in the site's hub chunk (html/*_files/3uo0__bw-g6gq.js).
// /api/grammar/exercises is the premium AI generator (403 PREMIUM_ONLY) — the real exercises live inside lessons.
//
// Usage: node scripts/tid/build_grammar.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(ROOT, 'src/data/tid/grammar');

const ADVANCED = [
  { lessonId: 'b2-tenses-v2', title: 'Tenses — Advanced', desc: 'Luyện tập chuyên sâu 12 thì tiếng Anh qua bài tập đa dạng và tình huống thực tế IELTS.', band: 'B2', icon: 'Clock', iconBg: '#efe7ff', iconColor: '#6d28d9' },
  { lessonId: 'b7-gerund-infinitive', title: 'Gerunds & Infinitives', desc: 'Phân biệt và sử dụng đúng động danh từ (V-ing) và động từ nguyên mẫu (to + V) trong văn phong học thuật.', band: 'B7', icon: 'Zap', iconBg: '#dcf5e6', iconColor: '#18542a' },
  { lessonId: 'b8-inversion', title: 'Inversion', desc: 'Nắm vững cấu trúc đảo ngữ để tạo câu nhấn mạnh, chuyên nghiệp và đặc trưng của IELTS Band 7–8.', band: 'B8', icon: 'RotateCcw', iconBg: '#dbeafe', iconColor: '#2f5fa8' },
  { lessonId: 'b9-quantifiers', title: 'Quantifiers', desc: 'Sử dụng chính xác các từ chỉ số lượng (some, any, much, many, few, little...) trong ngữ cảnh học thuật.', band: 'B9', icon: 'Hash', iconBg: '#ffe9d1', iconColor: '#c2490d' },
  { lessonId: 'b10-nominalization', title: 'Nominalization', desc: 'Chuyển động từ và tính từ thành danh từ để viết văn học thuật chặt chẽ, súc tích theo chuẩn IELTS.', band: 'B10', icon: 'FileText', iconBg: '#ffdfe9', iconColor: '#a3335a' },
  { lessonId: 'b11-prepositions', title: 'Prepositions', desc: 'Làm chủ các giới từ thông dụng và cụm giới từ hay gặp trong IELTS Writing & Reading.', band: 'B11', icon: 'MapPin', iconBg: '#fff0c2', iconColor: '#8a6100' },
];
const LESSON_FILES = ['src/data/ieltsGrammarWordForms.json'];

function writeJson(rel, data) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data));
  return fs.statSync(file).size;
}

function build() {
  fs.rmSync(OUT, { recursive: true, force: true });
  const report = [];
  const { lessons } = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/live/api/grammar.json'), 'utf8'));
  const available = [];
  for (const rel of LESSON_FILES) {
    const l = JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
    const out = { id: l.id, lesson_id: l.lesson_id, title: l.title, band: l.band, order_index: l.order_index, sections: l.sections };
    const q = l.sections.filter(s => s.type === 'exercise').reduce((a, s) => a + (s.questions || []).length, 0);
    const size = writeJson(`lessons/${l.lesson_id}.json`, out);
    report.push(`lessons/${l.lesson_id}.json  ${l.sections.length} sections, ${q} questions  ${(size / 1024).toFixed(1)} KB`);
    available.push(l.lesson_id);
  }
  const index = {
    grm: lessons.map(l => ({ id: l.id, lesson_id: l.lesson_id, title: l.title, band: l.band, order_index: l.order_index })).sort((a, b) => a.order_index - b.order_index),
    advanced: ADVANCED,
    available,
  };
  const size = writeJson('index.json', index);
  report.push(`index.json  ${index.grm.length} GRM lessons + ${ADVANCED.length} advanced, ${available.length} with content  ${(size / 1024).toFixed(1)} KB`);
  console.log(report.join('\n'));
}

build();
