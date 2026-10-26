// Condensed IELTS Writing band descriptors (public descriptors, summarised in Vietnamese) used for local self-assessment.
// AI grading on the real site (/api/evaluate) is server-side; here the learner rates each criterion against these.

const TA = {
  key: 'ta', label: 'Task Achievement', short: 'TA',
  bands: {
    9: 'Đáp ứng đầy đủ mọi yêu cầu; overview rõ ràng, các đặc điểm chính được trình bày và làm nổi bật xuất sắc.',
    8: 'Đáp ứng đủ yêu cầu; overview rõ; các đặc điểm chính được chọn lọc và minh hoạ tốt, chỉ lỗi rất nhỏ.',
    7: 'Có overview rõ ràng về xu hướng/khác biệt chính; làm nổi bật các đặc điểm chính nhưng có thể chưa phát triển đầy đủ.',
    6: 'Có overview nhưng chọn dữ liệu chưa khéo; các đặc điểm chính được nêu nhưng đôi chỗ thiếu/không liên quan, số liệu có thể sai.',
    5: 'Thiếu overview rõ ràng; sa vào chi tiết máy móc, thiếu số liệu so sánh; một số chi tiết sai.',
    4: 'Chỉ trả lời một phần; nhầm lẫn đặc điểm chính với chi tiết; thông tin sai hoặc lặp lại.',
  },
};
const TR = {
  key: 'tr', label: 'Task Response', short: 'TR',
  bands: {
    9: 'Trả lời đầy đủ mọi phần của đề; quan điểm rõ ràng xuyên suốt; ý được mở rộng và chứng minh sâu sắc.',
    8: 'Trả lời đầy đủ; quan điểm phát triển tốt với ý liên quan, mở rộng và có dẫn chứng thuyết phục.',
    7: 'Trả lời mọi phần của đề; quan điểm rõ xuyên suốt; ý chính được mở rộng nhưng đôi khi khái quát quá mức.',
    6: 'Trả lời mọi phần nhưng có phần phát triển chưa đều; quan điểm có nhưng kết luận có thể chưa rõ/lặp lại.',
    5: 'Chỉ trả lời một phần đề; quan điểm chưa rõ; ý chính hạn chế, phát triển chưa đủ.',
    4: 'Trả lời tối thiểu hoặc lạc đề; quan điểm khó nhận ra; ý thiếu, lặp lại hoặc không liên quan.',
  },
};
const CC = {
  key: 'cc', label: 'Coherence & Cohesion', short: 'CC',
  bands: {
    9: 'Liên kết mạch lạc tự nhiên đến mức không gây chú ý; chia đoạn hoàn hảo.',
    8: 'Sắp xếp thông tin logic; quản lý liên kết tốt; chia đoạn hợp lý và đủ.',
    7: 'Tổ chức logic, tiến trình rõ; dùng đa dạng từ nối dù có lúc dùng thừa/thiếu; mỗi đoạn có ý trung tâm rõ.',
    6: 'Sắp xếp mạch lạc nhìn chung; từ nối hiệu quả nhưng đôi khi máy móc/sai; chia đoạn chưa luôn hợp lý.',
    5: 'Có tổ chức nhưng thiếu tiến trình tổng thể; từ nối hạn chế, lạm dụng hoặc sai; chia đoạn chưa phù hợp.',
    4: 'Thông tin rời rạc; từ nối cơ bản, dùng sai hoặc lặp; có thể không chia đoạn.',
  },
};
const LR = {
  key: 'lr', label: 'Lexical Resource', short: 'LR',
  bands: {
    9: 'Từ vựng rộng, dùng tự nhiên và tinh tế; lỗi cực hiếm chỉ là "slip".',
    8: 'Vốn từ rộng, dùng linh hoạt, chính xác; dùng thành thạo từ ít phổ biến, chỉ thỉnh thoảng sai collocation/chính tả.',
    7: 'Đủ từ để linh hoạt và chính xác; dùng được từ ít phổ biến, có ý thức về văn phong và collocation; vài lỗi nhỏ.',
    6: 'Vốn từ đủ cho đề; cố dùng từ ít phổ biến nhưng còn thiếu chính xác; có lỗi chính tả/cấu tạo từ nhưng không cản trở hiểu.',
    5: 'Vốn từ hạn chế, tối thiểu cho đề; lỗi chính tả/cấu tạo từ đáng kể có thể gây khó hiểu.',
    4: 'Từ vựng cơ bản, lặp lại hoặc không phù hợp; kiểm soát cấu tạo từ và chính tả kém.',
  },
};
const GRA = {
  key: 'gra', label: 'Grammatical Range & Accuracy', short: 'GRA',
  bands: {
    9: 'Đa dạng cấu trúc, dùng linh hoạt và chính xác hoàn toàn; lỗi cực hiếm.',
    8: 'Đa dạng cấu trúc; phần lớn câu không lỗi; chỉ thỉnh thoảng có lỗi nhỏ.',
    7: 'Dùng nhiều câu phức; nhiều câu không lỗi; kiểm soát ngữ pháp và dấu câu tốt dù vẫn còn vài lỗi.',
    6: 'Kết hợp câu đơn và câu phức; có lỗi ngữ pháp/dấu câu nhưng hiếm khi cản trở giao tiếp.',
    5: 'Cấu trúc hạn chế; cố dùng câu phức nhưng kém chính xác hơn câu đơn; lỗi thường xuyên gây khó đọc.',
    4: 'Rất ít cấu trúc; chủ yếu câu đơn, ít mệnh đề phụ; lỗi chiếm ưu thế.',
  },
};

export const criteriaFor = task => [task === 1 ? TA : TR, CC, LR, GRA];

// IELTS rounding of the four-criteria average: .25 -> .5, .75 -> next whole band
export function overallBand(scores) {
  const vals = Object.values(scores).filter(v => typeof v === 'number');
  if (vals.length < 4) return null;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.floor(avg * 2 + 0.5) / 2; // nearest .5, ties upwards
}

const LINKERS = ['however', 'moreover', 'furthermore', 'in addition', 'therefore', 'consequently', 'whereas', 'while', 'although',
  'overall', 'in contrast', 'similarly', 'on the other hand', 'for example', 'for instance', 'as a result', 'in conclusion', 'firstly',
  'secondly', 'finally', 'meanwhile', 'subsequently', 'nevertheless', 'thus', 'hence', 'by contrast', 'in summary', 'to conclude'];

// Quick automatic checks shown next to the self-assessment
export function quickChecks(text, task) {
  const lower = text.toLowerCase();
  const words = (text.match(/[A-Za-z0-9'’-]+/g) || []).length;
  const paras = text.split(/\n\s*\n|\n/).map(p => p.trim()).filter(Boolean).length;
  const sents = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  const linkers = LINKERS.filter(l => new RegExp(`\\b${l}\\b`).test(lower));
  const min = task === 1 ? 150 : 250;
  const checks = [
    { ok: words >= min, label: `Đủ ${min} từ trở lên`, detail: `${words} từ` },
    { ok: paras >= 4, label: 'Có ít nhất 4 đoạn', detail: `${paras} đoạn` },
    task === 1
      ? { ok: /\b(overall|in general|it is clear that|generally)\b/.test(lower), label: 'Có câu Overview (Overall, …)', detail: '' }
      : { ok: /\b(in conclusion|to conclude|to sum up|in summary)\b/.test(lower), label: 'Có đoạn kết luận (In conclusion, …)', detail: '' },
    { ok: linkers.length >= 4, label: 'Dùng đa dạng từ nối (≥ 4)', detail: linkers.slice(0, 6).join(', ') || 'chưa có' },
    { ok: !/\b(i think|i believe)\b/.test(lower) || task === 2, label: 'Không đưa ý kiến cá nhân (Task 1)', detail: '', hide: task === 2 },
    { ok: !/\b(don't|can't|won't|isn't|aren't|doesn't|didn't)\b/.test(lower), label: 'Không viết tắt (don’t, can’t…)', detail: '' },
  ].filter(c => !c.hide);
  return { words, paras, sentences: sents.length, avgLen: sents.length ? Math.round(words / sents.length) : 0, checks };
}
