/**
 * IELTS Academic & General Training Comprehensive Dataset & Catalog
 * Authentic Cambridge / IDP / British Council format.
 */

// Bảng quy đổi điểm IELTS Listening & Reading (40 câu) -> Band 1.0 - 9.0 chuẩn quốc tế
export const IELTS_BAND_SCORE_TABLE = [
  { minRaw: 39, maxRaw: 40, bandListening: 9.0, bandReadingAc: 9.0, bandReadingGt: 9.0 },
  { minRaw: 37, maxRaw: 38, bandListening: 8.5, bandReadingAc: 8.5, bandReadingGt: 8.5 },
  { minRaw: 35, maxRaw: 36, bandListening: 8.0, bandReadingAc: 8.0, bandReadingGt: 8.0 },
  { minRaw: 32, maxRaw: 34, bandListening: 7.5, bandReadingAc: 7.5, bandReadingGt: 7.5 },
  { minRaw: 30, maxRaw: 31, bandListening: 7.0, bandReadingAc: 7.0, bandReadingGt: 7.0 },
  { minRaw: 26, maxRaw: 29, bandListening: 6.5, bandReadingAc: 6.5, bandReadingGt: 6.5 },
  { minRaw: 23, maxRaw: 25, bandListening: 6.0, bandReadingAc: 6.0, bandReadingGt: 6.0 },
  { minRaw: 18, maxRaw: 22, bandListening: 5.5, bandReadingAc: 5.5, bandReadingGt: 5.5 },
  { minRaw: 16, maxRaw: 17, bandListening: 5.0, bandReadingAc: 5.0, bandReadingGt: 5.0 },
  { minRaw: 13, maxRaw: 15, bandListening: 4.5, bandReadingAc: 4.5, bandReadingGt: 4.5 },
  { minRaw: 10, maxRaw: 12, bandListening: 4.0, bandReadingAc: 4.0, bandReadingGt: 4.0 },
  { minRaw: 0,  maxRaw: 9,  bandListening: 3.5, bandReadingAc: 3.5, bandReadingGt: 3.5 }
];

export function calculateIeltsBand(rawScore = 0, skill = 'listening', type = 'academic') {
  const score = Math.max(0, Math.min(40, Math.round(rawScore)));
  for (const row of IELTS_BAND_SCORE_TABLE) {
    if (score >= row.minRaw && score <= row.maxRaw) {
      if (skill === 'listening') return row.bandListening;
      if (skill === 'reading') return type === 'general' ? row.bandReadingGt : row.bandReadingAc;
      return row.bandListening;
    }
  }
  return 3.0;
}

// Danh mục các bộ đề thi IELTS Catalog (Academic & General Training)
export const IELTS_CATALOG_TESTS = [
  // ==================== IELTS ACADEMIC COLLECTION 1 ====================
  ...Array.from({ length: 10 }, (_, i) => {
    const tNum = i + 1;
    return {
      id: `ielts-ac-c1-t${tNum}`,
      testNum: tNum,
      collection: 'Collection 1',
      category: 'academic',
      title: `IELTS Academic Collection 1 Test ${tNum}`,
      subtitle: `4 Kỹ Năng Toàn Diện: Listening, Reading, Writing & Speaking • Chuẩn Đề Thi Thật STUDY4`,
      durationMinutes: 165,
      questionsCount: 80,
      partsCount: 4,
      participantsCount: 45000 + tNum * 1230,
      commentsCount: 150 + tNum * 18,
      tags: ['IELTS Academic', 'Collection 1', 'Listening', 'Reading', 'Writing', 'Speaking'],
      targetBand: '6.5 - 8.5+'
    };
  }),

  // ==================== IELTS ACADEMIC COLLECTION 2 ====================
  ...Array.from({ length: 10 }, (_, i) => {
    const tNum = i + 1;
    return {
      id: `ielts-ac-c2-t${tNum}`,
      testNum: tNum,
      collection: 'Collection 2',
      category: 'academic',
      title: `IELTS Academic Collection 2 Test ${tNum}`,
      subtitle: `Bộ Đề Nâng Cao Mới Nhất • Bài Đọc Chuyên Ngành & Audio Phòng Thu Chất Lượng Cao`,
      durationMinutes: 165,
      questionsCount: 80,
      partsCount: 4,
      participantsCount: 38000 + tNum * 950,
      commentsCount: 120 + tNum * 14,
      tags: ['IELTS Academic', 'Collection 2', 'Listening', 'Reading', 'Writing', 'Speaking'],
      targetBand: '7.0 - 9.0'
    };
  }),

  // ==================== IELTS GENERAL TRAINING COLLECTION 1 ====================
  ...Array.from({ length: 10 }, (_, i) => {
    const tNum = i + 1;
    return {
      id: `ielts-gt-c1-t${tNum}`,
      testNum: tNum,
      collection: 'GT Collection 1',
      category: 'general',
      title: `IELTS General Training Collection 1 Test ${tNum}`,
      subtitle: `Bài Đọc Đời Sống & Công Sở • Viết Thư & Nghị Luận Xã Hội Chuẩn Định Cư & Làm Việc`,
      durationMinutes: 165,
      questionsCount: 80,
      partsCount: 4,
      participantsCount: 22000 + tNum * 820,
      commentsCount: 85 + tNum * 11,
      tags: ['IELTS General', 'GT Collection 1', 'Định cư & Công việc', 'Reading', 'Listening'],
      targetBand: '6.0 - 8.0+'
    };
  }),

  // ==================== IELTS GENERAL TRAINING COLLECTION 2 ====================
  ...Array.from({ length: 10 }, (_, i) => {
    const tNum = i + 1;
    return {
      id: `ielts-gt-c2-t${tNum}`,
      testNum: tNum,
      collection: 'GT Collection 2',
      category: 'general',
      title: `IELTS General Training Collection 2 Test ${tNum}`,
      subtitle: `Kho Đề Thực Tế Bám Sát Đời Sống Nước Ngoài • Giải Thích Chi Tiết Từng Câu`,
      durationMinutes: 165,
      questionsCount: 80,
      partsCount: 4,
      participantsCount: 19000 + tNum * 640,
      commentsCount: 70 + tNum * 9,
      tags: ['IELTS General', 'GT Collection 2', 'Thư & Công sở', 'Reading', 'Listening'],
      targetBand: '6.5 - 8.5+'
    };
  }),

  // ==================== PARROTO IELTS 2026 (LISTENING & READING) ====================
  ...Array.from({ length: 10 }, (_, i) => {
    const tNum = i + 1;
    return {
      id: `parroto-ielts-2026-listening-test-${tNum}`,
      testNum: tNum,
      collection: 'Parroto IELTS 2026',
      category: 'academic',
      skill: 'listening',
      title: `Parroto IELTS 2026 - Listening Test ${tNum}`,
      subtitle: `4 Parts Listening Chuẩn Quốc Tế • Giọng đọc đa vùng miền kèm Transcript chi tiết`,
      durationMinutes: 40,
      questionsCount: 40,
      partsCount: 4,
      participantsCount: 38000 + tNum * 950,
      commentsCount: 190 + tNum * 12,
      tags: ['IELTS 2026', 'Parroto', 'Listening', 'Audio Gốc'],
      targetBand: '6.5 - 9.0'
    };
  }),
  ...Array.from({ length: 10 }, (_, i) => {
    const tNum = i + 1;
    return {
      id: `parroto-ielts-2026-reading-test-${tNum}`,
      testNum: tNum,
      collection: 'Parroto IELTS 2026',
      category: 'academic',
      skill: 'reading',
      title: `Parroto IELTS 2026 - Reading Test ${tNum}`,
      subtitle: `3 Passages Học Thuật Chuyên Sâu • Đầy đủ dạng bài Gap-filling, True/False/Not Given`,
      durationMinutes: 60,
      questionsCount: 40,
      partsCount: 3,
      participantsCount: 35000 + tNum * 820,
      commentsCount: 160 + tNum * 10,
      tags: ['IELTS 2026', 'Parroto', 'Reading', 'Academic'],
      targetBand: '6.5 - 9.0'
    };
  }),

  // ==================== PARROTO IELTS 2025 (LISTENING & READING) ====================
  ...Array.from({ length: 10 }, (_, i) => {
    const tNum = i + 1;
    return {
      id: `parroto-ielts-2025-listening-test-${tNum}`,
      testNum: tNum,
      collection: 'Parroto IELTS 2025',
      category: 'academic',
      skill: 'listening',
      title: `Parroto IELTS 2025 - Listening Test ${tNum}`,
      subtitle: `Luyện Nghe Bứt Phá Band Điểm • Giải thích chi tiết & Đáp án chuẩn Cambridge`,
      durationMinutes: 40,
      questionsCount: 40,
      partsCount: 4,
      participantsCount: 42000 + tNum * 1100,
      commentsCount: 220 + tNum * 15,
      tags: ['IELTS 2025', 'Parroto', 'Listening', 'Audio Gốc'],
      targetBand: '6.0 - 8.5'
    };
  }),
  ...Array.from({ length: 10 }, (_, i) => {
    const tNum = i + 1;
    return {
      id: `parroto-ielts-2025-reading-test-${tNum}`,
      testNum: tNum,
      collection: 'Parroto IELTS 2025',
      category: 'academic',
      skill: 'reading',
      title: `Parroto IELTS 2025 - Reading Test ${tNum}`,
      subtitle: `Kho Bài Đọc Đa Dạng Chủ Đề Khoa Học Xã Hội • Đối chiếu đáp án trực tiếp`,
      durationMinutes: 60,
      questionsCount: 40,
      partsCount: 3,
      participantsCount: 39000 + tNum * 910,
      commentsCount: 180 + tNum * 11,
      tags: ['IELTS 2025', 'Parroto', 'Reading', 'Academic'],
      targetBand: '6.0 - 8.5'
    };
  })
];

// Thông tin tiêu chí chấm điểm IELTS 4 Kỹ Năng
export const IELTS_CRITERIA_INFO = {
  listening: {
    title: 'IELTS Listening (40 câu - 4 phần)',
    time: '40 phút (30 phút nghe + 10 phút chuyển đáp án)',
    desc: 'Bao gồm 4 Sections/Parts với giọng đọc bản xứ đa dạng (Anh, Úc, Mỹ, Canada):',
    sections: [
      'Part 1: Cuộc trò chuyện thường nhật giữa 2 người (đặt phòng khách sạn, đăng ký dịch vụ, hỏi đường).',
      'Part 2: Độc thoại về chủ đề xã hội thường nhật (hướng dẫn du lịch, giới thiệu bảo tàng, tiện ích công cộng).',
      'Part 3: Thảo luận học thuật giữa 2 - 4 người (sinh viên thảo luận đồ án, gặp giáo sư hướng dẫn).',
      'Part 4: Độc thoại bài giảng học thuật của giáo sư về chuyên đề khoa học, sinh vật học, lịch sử.'
    ]
  },
  reading: {
    title: 'IELTS Reading (40 câu - 3 bài đọc)',
    time: '60 phút',
    desc: 'Phân loại rõ giữa Academic và General Training:',
    sections: [
      'IELTS Academic: 3 bài báo khoa học, xã hội, nghiên cứu chuyên sâu dài từ 2,000 - 2,750 từ.',
      'IELTS General: Section 1 (thông báo đời sống thường nhật), Section 2 (đào tạo, hợp đồng công sở), Section 3 (bài đọc tổng quát chuyên sâu).'
    ]
  },
  writing: {
    title: 'IELTS Writing (2 bài viết)',
    time: '60 phút',
    desc: '4 tiêu chí chấm điểm quan trọng: Task Achievement/Response (25%), Coherence & Cohesion (25%), Lexical Resource (25%), Grammatical Range & Accuracy (25%).',
    sections: [
      'Task 1 (20 phút - tối thiểu 150 từ): Academic miêu tả biểu đồ/sơ đồ/bản đồ; General viết thư (trang trọng/thân mật).',
      'Task 2 (40 phút - tối thiểu 250 từ): Viết bài luận học thuật thể hiện quan điểm về vấn đề xã hội, công nghệ, giáo dục.'
    ]
  },
  speaking: {
    title: 'IELTS Speaking (Phỏng vấn 1-1 trực tiếp)',
    time: '11 - 14 phút',
    desc: '4 tiêu chí chấm điểm: Fluency & Coherence (25%), Lexical Resource (25%), Grammatical Range & Accuracy (25%), Pronunciation (25%).',
    sections: [
      'Part 1 (4 - 5 phút): Hỏi đáp các chủ đề quen thuộc (Công việc, Quê hương, Sở thích, Công nghệ).',
      'Part 2 (3 - 4 phút): Thuyết trình cá nhân theo Cue Card (1 phút chuẩn bị, 2 phút nói liên tục).',
      'Part 3 (4 - 5 phút): Thảo luận hai chiều chuyên sâu mang tính trừu tượng và khái quát liên hệ từ Part 2.'
    ]
  }
};
