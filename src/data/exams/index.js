/**
 * Exam Registry (TOEIC & IELTS)
 * Tự động nạp toàn bộ các file đề thi thật (.json) trong thư mục này
 */

const examModules = import.meta.glob('./*.json', { eager: true });

export const LOADED_REAL_EXAMS = {};
export const LOADED_SW_SPEAKING_EXAMS = {};
export const LOADED_SW_WRITING_EXAMS = {};

// IELTS Registries
export const LOADED_IELTS_AC_EXAMS = {};
export const LOADED_IELTS_GT_EXAMS = {};
export const LOADED_ALL_IELTS_EXAMS = {};

// Tự động map tất cả các file JSON vào registry tương ứng
for (const path in examModules) {
  const exam = examModules[path]?.default || examModules[path];
  if (exam && exam.id) {
    // 1. IELTS Academic & General
    if (exam.category === 'ielts-ac' || exam.type === 'academic' || exam.id.startsWith('ielts-ac-') || exam.id.startsWith('ielts-parroto-')) {
      LOADED_IELTS_AC_EXAMS[exam.id] = exam;
      LOADED_ALL_IELTS_EXAMS[exam.id] = exam;
      LOADED_ALL_IELTS_EXAMS[`ac-t${exam.testNum}`] = exam;
      if (exam.id.startsWith('ielts-parroto-')) {
        const rawSlug = exam.id.replace(/^ielts-parroto-/, '');
        LOADED_ALL_IELTS_EXAMS[rawSlug] = exam;
        LOADED_ALL_IELTS_EXAMS[`parroto-${rawSlug}`] = exam;
      }
    } else if (exam.category === 'ielts-gt' || exam.type === 'general' || exam.id.startsWith('ielts-gt-')) {
      LOADED_IELTS_GT_EXAMS[exam.id] = exam;
      LOADED_ALL_IELTS_EXAMS[exam.id] = exam;
      LOADED_ALL_IELTS_EXAMS[`gt-t${exam.testNum}`] = exam;
    }
    // 2. TOEIC Speaking & Writing
    else if (exam.category === 'toeic-speaking') {
      LOADED_SW_SPEAKING_EXAMS[exam.id] = exam;
      LOADED_SW_SPEAKING_EXAMS[`spk-t${exam.testNum}`] = exam;
      LOADED_SW_SPEAKING_EXAMS[`test-${exam.testNum}`] = exam;
      LOADED_SW_SPEAKING_EXAMS[String(exam.testNum)] = exam;
    } else if (exam.category === 'toeic-writing') {
      LOADED_SW_WRITING_EXAMS[exam.id] = exam;
      LOADED_SW_WRITING_EXAMS[`wrt-t${exam.testNum}`] = exam;
      LOADED_SW_WRITING_EXAMS[`test-${exam.testNum}`] = exam;
      LOADED_SW_WRITING_EXAMS[String(exam.testNum)] = exam;
    } else {
      // 3. TOEIC LR
      LOADED_REAL_EXAMS[exam.id] = exam;
      const shortId = exam.id.replace(/^toeic-/, '');
      LOADED_REAL_EXAMS[shortId] = exam;

      if (exam.id.startsWith('toeic-parroto-')) {
        const rawSlug = exam.id.replace(/^toeic-parroto-/, '');
        LOADED_REAL_EXAMS[rawSlug] = exam;
        LOADED_REAL_EXAMS[`parroto-${rawSlug}`] = exam;
      }

      if (exam.id.startsWith('toeic-lr-c1-t')) {
        LOADED_REAL_EXAMS[`test-${exam.testNum}`] = exam;
      }
    }
  }
}

/**
 * Kiểm tra xem đề thi TOEIC LR đã có dữ liệu thật (offline) hay chưa
 */
export function hasRealExamData(testId) {
  return Boolean(LOADED_REAL_EXAMS[testId]);
}

/**
 * Lấy dữ liệu đề thi TOEIC LR thật theo testId
 */
export function getRealExamData(testId) {
  return LOADED_REAL_EXAMS[testId] || null;
}

/**
 * Lấy dữ liệu đề thi Speaking TOEIC thật theo testNum hoặc testId
 */
export function getRealSpeakingExam(idOrNum = 1) {
  return LOADED_SW_SPEAKING_EXAMS[idOrNum] || LOADED_SW_SPEAKING_EXAMS['toeic-sw-speaking-test-1'] || null;
}

/**
 * Lấy dữ liệu đề thi Writing TOEIC thật theo testNum hoặc testId
 */
export function getRealWritingExam(idOrNum = 1) {
  return LOADED_SW_WRITING_EXAMS[idOrNum] || LOADED_SW_WRITING_EXAMS['toeic-sw-writing-test-1'] || null;
}

/**
 * Lấy dữ liệu đề thi IELTS thật theo testId
 */
export function getIeltsExam(testId) {
  return LOADED_ALL_IELTS_EXAMS[testId] || LOADED_IELTS_AC_EXAMS[testId] || LOADED_IELTS_GT_EXAMS[testId] || null;
}

/**
 * Kiểm tra đề thi IELTS đã có dữ liệu thật hay chưa
 */
export function hasIeltsExam(testId) {
  return Boolean(LOADED_ALL_IELTS_EXAMS[testId]);
}

/**
 * Lấy danh sách tất cả các đề thi IELTS theo category ('academic' | 'general' | 'all')
 */
export function getIeltsExamCatalog(type = 'all') {
  if (type === 'academic') {
    return Object.values(LOADED_IELTS_AC_EXAMS);
  }
  if (type === 'general') {
    return Object.values(LOADED_IELTS_GT_EXAMS);
  }
  return [...Object.values(LOADED_IELTS_AC_EXAMS), ...Object.values(LOADED_IELTS_GT_EXAMS)];
}
