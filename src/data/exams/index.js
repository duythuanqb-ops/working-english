/**
 * Exam Registry (TOEIC & IELTS)
 * Chỉ nạp manifest nhẹ (id, category, type, testNum) lúc khởi động — nội dung từng đề (~400KB/đề)
 * được code-split và nạp theo yêu cầu qua loadExam()/useExam(), tránh parse ~30MB JSON một lúc.
 */
import { useEffect, useReducer } from 'react';
import manifest from 'virtual:exam-manifest';

const examLoaders = import.meta.glob('./*.json', { import: 'default' });

// alias -> exam id
const REAL_EXAM_IDS = {};
const SW_SPEAKING_IDS = {};
const SW_WRITING_IDS = {};
const IELTS_AC_IDS = {};
const IELTS_GT_IDS = {};
const ALL_IELTS_IDS = {};

// exam id -> loader key
const FILE_BY_ID = {};
const examCache = {};
const pending = {};

// Tự động map tất cả các file JSON vào registry tương ứng
for (const { file, id, category, type, testNum } of manifest) {
  if (!id) continue;
  FILE_BY_ID[id] = `./${file}`;

  // 1. IELTS Academic & General
  if (category === 'ielts-ac' || type === 'academic' || id.startsWith('ielts-ac-') || id.startsWith('ielts-parroto-')) {
    IELTS_AC_IDS[id] = id;
    ALL_IELTS_IDS[id] = id;
    ALL_IELTS_IDS[`ac-t${testNum}`] = id;
    if (id.startsWith('ielts-parroto-')) {
      const rawSlug = id.replace(/^ielts-parroto-/, '');
      ALL_IELTS_IDS[rawSlug] = id;
      ALL_IELTS_IDS[`parroto-${rawSlug}`] = id;
    }
  } else if (category === 'ielts-gt' || type === 'general' || id.startsWith('ielts-gt-')) {
    IELTS_GT_IDS[id] = id;
    ALL_IELTS_IDS[id] = id;
    ALL_IELTS_IDS[`gt-t${testNum}`] = id;
  }
  // 2. TOEIC Speaking & Writing
  else if (category === 'toeic-speaking') {
    SW_SPEAKING_IDS[id] = id;
    SW_SPEAKING_IDS[`spk-t${testNum}`] = id;
    SW_SPEAKING_IDS[`test-${testNum}`] = id;
    SW_SPEAKING_IDS[String(testNum)] = id;
  } else if (category === 'toeic-writing') {
    SW_WRITING_IDS[id] = id;
    SW_WRITING_IDS[`wrt-t${testNum}`] = id;
    SW_WRITING_IDS[`test-${testNum}`] = id;
    SW_WRITING_IDS[String(testNum)] = id;
  } else {
    // 3. TOEIC LR
    REAL_EXAM_IDS[id] = id;
    REAL_EXAM_IDS[id.replace(/^toeic-/, '')] = id;

    if (id.startsWith('toeic-parroto-')) {
      const rawSlug = id.replace(/^toeic-parroto-/, '');
      REAL_EXAM_IDS[rawSlug] = id;
      REAL_EXAM_IDS[`parroto-${rawSlug}`] = id;
    }

    if (id.startsWith('toeic-lr-c1-t')) {
      REAL_EXAM_IDS[`test-${testNum}`] = id;
    }
  }
}

/**
 * Nạp nội dung một đề thi theo exam id (có cache, gộp các lần gọi trùng)
 */
export function loadExam(examId) {
  if (!examId || !FILE_BY_ID[examId]) return Promise.resolve(null);
  if (examCache[examId]) return Promise.resolve(examCache[examId]);
  pending[examId] ||= examLoaders[FILE_BY_ID[examId]]().then((exam) => {
    examCache[examId] = exam;
    delete pending[examId];
    return exam;
  });
  return pending[examId];
}

/**
 * Hook: trả về đề thi đã nạp (null khi đang nạp) và tự render lại khi nạp xong
 */
export function useExam(examId) {
  const [, rerender] = useReducer((x) => x + 1, 0);
  const exam = (examId && examCache[examId]) || null;
  useEffect(() => {
    if (examId && !exam) loadExam(examId).then((loaded) => loaded && rerender());
  }, [examId, exam]);
  return exam;
}

/**
 * Exam id của đề TOEIC LR / Speaking / Writing / IELTS theo alias (không cần nạp nội dung)
 */
export const resolveRealExamId = (testId) => REAL_EXAM_IDS[testId] || null;
export const resolveSpeakingExamId = (idOrNum = 1) =>
  SW_SPEAKING_IDS[idOrNum] || SW_SPEAKING_IDS['toeic-sw-speaking-test-1'] || null;
export const resolveWritingExamId = (idOrNum = 1) =>
  SW_WRITING_IDS[idOrNum] || SW_WRITING_IDS['toeic-sw-writing-test-1'] || null;
export const resolveIeltsExamId = (testId) =>
  ALL_IELTS_IDS[testId] || IELTS_AC_IDS[testId] || IELTS_GT_IDS[testId] || null;

/**
 * Kiểm tra xem đề thi TOEIC LR đã có dữ liệu thật (offline) hay chưa
 */
export function hasRealExamData(testId) {
  return Boolean(REAL_EXAM_IDS[testId]);
}

/**
 * Lấy dữ liệu đề thi TOEIC LR thật theo testId (chỉ trả về khi đã nạp qua loadExam/useExam)
 */
export function getRealExamData(testId) {
  return examCache[resolveRealExamId(testId)] || null;
}

/**
 * Lấy dữ liệu đề thi Speaking TOEIC thật theo testNum hoặc testId (đã nạp)
 */
export function getRealSpeakingExam(idOrNum = 1) {
  return examCache[resolveSpeakingExamId(idOrNum)] || null;
}

/**
 * Lấy dữ liệu đề thi Writing TOEIC thật theo testNum hoặc testId (đã nạp)
 */
export function getRealWritingExam(idOrNum = 1) {
  return examCache[resolveWritingExamId(idOrNum)] || null;
}

/**
 * Lấy dữ liệu đề thi IELTS thật theo testId (đã nạp)
 */
export function getIeltsExam(testId) {
  return examCache[resolveIeltsExamId(testId)] || null;
}

/**
 * Kiểm tra đề thi IELTS đã có dữ liệu thật hay chưa
 */
export function hasIeltsExam(testId) {
  return Boolean(ALL_IELTS_IDS[testId]);
}
