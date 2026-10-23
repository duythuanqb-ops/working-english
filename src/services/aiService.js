import { storageService } from './storageService';

/**
 * AI Service supporting both Google Gemini and OpenAI with intelligent offline fallback.
 */

export const aiService = {
  /**
   * Enrich a vocabulary word with IPA, meanings, examples, synonyms, collocations
   */
  enrichWord: async (rawWord) => {
    const word = rawWord.trim();
    if (!word) throw new Error('Từ vựng không được để trống.');

    const settings = storageService.getSettings();
    const provider = settings.aiProvider || 'gemini';
    const hasKey =
      (provider === 'gemini' && settings.geminiApiKey) ||
      (provider === 'openai' && settings.openaiApiKey);

    if (hasKey) {
      try {
        if (provider === 'gemini') {
          return await enrichWithGemini(word, settings.geminiApiKey, settings.geminiModel);
        } else {
          return await enrichWithOpenAI(word, settings.openaiApiKey, settings.openaiModel);
        }
      } catch (err) {
        console.warn('AI API Call failed, falling back to dictionary API:', err);
        // Fallback to dictionary API on network or key error
      }
    }

    // Smart Fallback via FreeDictionaryAPI
    return await enrichWithDictionaryApiFallback(word);
  },

  /**
   * Diagnostic and Grammar Doctor: checks sentence, highlights errors, explains in Vietnamese
   */
  checkGrammar: async (sentence) => {
    const text = sentence.trim();
    if (!text) throw new Error('Vui lòng nhập câu hoặc đoạn văn cần kiểm tra.');

    const settings = storageService.getSettings();
    const provider = settings.aiProvider || 'gemini';
    const hasKey =
      (provider === 'gemini' && settings.geminiApiKey) ||
      (provider === 'openai' && settings.openaiApiKey);

    if (hasKey) {
      try {
        if (provider === 'gemini') {
          return await checkGrammarWithGemini(text, settings.geminiApiKey, settings.geminiModel);
        } else {
          return await checkGrammarWithOpenAI(text, settings.openaiApiKey, settings.openaiModel);
        }
      } catch (err) {
        console.warn('AI Grammar Check failed, using heuristic engine:', err);
      }
    }

    return checkGrammarWithHeuristicFallback(text);
  },

  /**
   * Generate nuanced comparison between synonyms
   */
  analyzeSynonyms: async (wordOrGroup) => {
    const query = wordOrGroup.trim();
    const settings = storageService.getSettings();
    const provider = settings.aiProvider || 'gemini';
    const hasKey =
      (provider === 'gemini' && settings.geminiApiKey) ||
      (provider === 'openai' && settings.openaiApiKey);

    if (hasKey) {
      try {
        if (provider === 'gemini') {
          return await analyzeSynonymsWithGemini(query, settings.geminiApiKey, settings.geminiModel);
        } else {
          return await analyzeSynonymsWithOpenAI(query, settings.openaiApiKey, settings.openaiModel);
        }
      } catch (e) {
        console.warn('AI Synonym analysis failed, using fallback:', e);
      }
    }

    return fallbackSynonymAnalysis(query);
  },

  /**
   * Auto generate grammar formulas, usage, workplace examples and common mistakes
   */
  enrichGrammarRule: async (ruleName) => {
    const query = ruleName.trim();
    if (!query) throw new Error('Vui lòng nhập tên quy tắc hoặc cấu trúc.');

    const settings = storageService.getSettings();
    const provider = settings.aiProvider || 'gemini';
    const hasKey =
      (provider === 'gemini' && settings.geminiApiKey) ||
      (provider === 'openai' && settings.openaiApiKey);

    if (hasKey) {
      try {
        if (provider === 'gemini') {
          return await enrichGrammarWithGemini(query, settings.geminiApiKey, settings.geminiModel);
        } else {
          return await enrichGrammarWithOpenAI(query, settings.openaiApiKey, settings.openaiModel);
        }
      } catch (e) {
        console.warn('AI grammar enrichment failed, using local template:', e);
      }
    }

    return fallbackGrammarEnrichment(query);
  }
};

async function enrichGrammarWithGemini(query, apiKey, model) {
  const prompt = `
Bạn là chuyên gia ngữ pháp tiếng Anh công sở.
Hãy biên soạn tài liệu cho quy tắc/cấu trúc: "${query}".
Trả về duy nhất định dạng JSON sau:
{
  "title": "Tên quy tắc ngữ pháp chuẩn",
  "formula": "Công thức ngữ pháp chi tiết (ví dụ: S + had + hardly + V3 when...)",
  "usage": "Cách dùng thực tế và sắc thái trong công việc/giao tiếp",
  "signals": "Dấu hiệu nhận biết nếu có",
  "workplaceExample": "Câu ví dụ thực tế trong môi trường công sở/họp/email",
  "exampleVi": "Dịch nghĩa tiếng Việt của câu ví dụ",
  "commonMistake": "Lỗi cạm bẫy người học hay mắc phải và cách sửa đúng"
}
`;
  return await callGemini(prompt, apiKey, model);
}

async function enrichGrammarWithOpenAI(query, apiKey, model) {
  const messages = [
    { role: 'system', content: 'Bạn là chuyên gia ngữ pháp tiếng Anh. Luôn trả về JSON theo schema.' },
    {
      role: 'user',
      content: `Biên soạn quy tắc: "${query}". Trả về JSON:
      {
        "title": "Tên quy tắc",
        "formula": "Công thức",
        "usage": "Cách dùng",
        "signals": "Dấu hiệu",
        "workplaceExample": "Ví dụ công sở",
        "exampleVi": "Dịch",
        "commonMistake": "Lỗi hay gặp"
      }`
    }
  ];
  return await callOpenAI(messages, apiKey, model);
}

function fallbackGrammarEnrichment(query) {
  return {
    title: query,
    formula: `Cấu trúc liên quan đến: ${query}`,
    usage: `Quy tắc và cách dùng cho chuyên đề "${query}". Bạn có thể tự chỉnh sửa theo ý muốn hoặc thêm Gemini API Key để AI viết đầy đủ.`,
    signals: 'Thường gặp trong bài thi TOEIC/IELTS và email giao tiếp.',
    workplaceExample: `Our team applied this rule in the latest project documentation.`,
    exampleVi: `Nhóm của chúng tôi đã áp dụng quy tắc này trong tài liệu dự án mới nhất.`,
    commonMistake: `Lưu ý hòa hợp chủ vị và dạng thức của động từ khi sử dụng ${query}.`
  };
}

/* ==========================================================================
   Google Gemini Implementations
   ========================================================================== */

async function callGemini(prompt, apiKey, model = 'gemini-2.0-flash') {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawContent) throw new Error('Không nhận được nội dung từ Gemini.');

  return JSON.parse(rawContent);
}

async function enrichWithGemini(word, apiKey, model) {
  const prompt = `
Bạn là một chuyên gia ngôn ngữ tiếng Anh công sở (Business English Expert).
Hãy phân tích từ/cụm từ: "${word}".
Trả về kết quả dưới định dạng JSON duy nhất tuân thủ cấu trúc sau:
{
  "word": "${word}",
  "ipa": "phiên âm IPA quốc tế chính xác, ví dụ: /ˈmɪt.ɪ.ɡeɪt/",
  "partOfSpeech": "loại từ tiếng Anh: noun | verb | adjective | adverb | idiom | phrase",
  "meaningVi": "nghĩa tiếng Việt ngắn gọn, súc tích và chuẩn xác",
  "meaningEn": "định nghĩa tiếng Anh súc tích, dễ hiểu",
  "examples": [
    {
      "en": "câu ví dụ tiếng Anh thực tế trong môi trường công sở/họp/email/dự án",
      "vi": "dịch nghĩa tiếng Việt câu ví dụ",
      "context": "ngữ cảnh (ví dụ: Team Meeting, Email, Project Planning)"
    },
    {
      "en": "câu ví dụ thứ 2",
      "vi": "dịch nghĩa tiếng Việt câu ví dụ 2",
      "context": "ngữ cảnh khác"
    }
  ],
  "synonyms": ["3 đến 5 từ đồng nghĩa phổ biến"],
  "antonyms": ["1 đến 3 từ trái nghĩa nếu có"],
  "collocations": ["3 đến 4 cụm từ kết hợp tự nhiên (collocations) hay dùng với từ này"]
}
`;
  return await callGemini(prompt, apiKey, model);
}

async function checkGrammarWithGemini(sentence, apiKey, model) {
  const prompt = `
Bạn là một chuyên gia hiệu đính tiếng Anh (Grammar Doctor & Editor) cho người đi làm.
Hãy kiểm tra và chẩn đoán kỹ lưỡng câu hoặc đoạn văn sau:
"${sentence}"

Hãy phát hiện TẤT CẢ các lỗi (ngữ pháp, chia động từ, giới từ, mạo từ, dùng từ chưa tự nhiên, chính tả).
Nếu câu hoàn toàn đúng ngữ pháp, đặt "hasErrors": false.
Nếu có lỗi, đặt "hasErrors": true, chỉ ra từng lỗi cụ thể và giải thích cặn kẽ bằng tiếng Việt để người học hiểu bản chất và tự sửa được.

Trả về kết quả dưới định dạng JSON duy nhất sau:
{
  "hasErrors": true/false,
  "originalSentence": "${sentence}",
  "correctedSentence": "câu đã được sửa đúng ngữ pháp",
  "issues": [
    {
      "errorText": "từ hoặc cụm từ bị sai trong câu gốc",
      "correction": "từ hoặc cụm từ sửa lại cho đúng",
      "ruleName": "tên quy tắc ngữ pháp (ví dụ: Subject-Verb Agreement, Uncountable Noun, Preposition)",
      "explanationVi": "giải thích chi tiết tại sao sai và quy tắc đúng bằng tiếng Việt"
    }
  ],
  "professionalVersion": "câu viết lại theo phong cách chuyên nghiệp, tự nhiên của người bản xứ (Polite & Native Business Style)",
  "generalAdviceVi": "lời khuyên ngắn để ghi nhớ và tránh lặp lại lỗi này"
}
`;
  return await callGemini(prompt, apiKey, model);
}

async function analyzeSynonymsWithGemini(query, apiKey, model) {
  const prompt = `
Hãy phân tích nhóm các từ đồng nghĩa xoay quanh: "${query}".
So sánh sắc thái ý nghĩa (nuance) và mức độ trang trọng để người học biết khi nào nên dùng từ nào trong môi trường công sở.
Trả về JSON duy nhất:
{
  "groupName": "tên nhóm từ (ví dụ: Các từ đồng nghĩa của ${query})",
  "coreConceptVi": "khái niệm cốt lõi bằng tiếng Việt",
  "words": [
    {
      "word": "từ 1",
      "ipa": "phiên âm",
      "partOfSpeech": "loại từ",
      "meaningVi": "nghĩa tiếng Việt",
      "nuance": "sắc thái khác biệt (khi nào nên dùng từ này, sắc thái mạnh/nhẹ, trang trọng/thân mật)",
      "exampleEn": "câu ví dụ tiếng Anh",
      "exampleVi": "dịch câu ví dụ"
    }
  ]
}
`;
  return await callGemini(prompt, apiKey, model);
}

/* ==========================================================================
   OpenAI Implementations
   ========================================================================== */

async function callOpenAI(messages, apiKey, model = 'gpt-4o-mini') {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;
  return JSON.parse(rawContent);
}

async function enrichWithOpenAI(word, apiKey, model) {
  const messages = [
    {
      role: 'system',
      content:
        'Bạn là chuyên gia Business English. Phân tích từ vựng và luôn trả về JSON hợp lệ theo schema yêu cầu.'
    },
    {
      role: 'user',
      content: `Phân tích từ: "${word}". Trả về JSON:
      {
        "word": "${word}",
        "ipa": "/.../",
        "partOfSpeech": "noun|verb|adjective|adverb",
        "meaningVi": "nghĩa tiếng Việt",
        "meaningEn": "định nghĩa tiếng Anh",
        "examples": [
          {"en": "câu ví dụ công sở 1", "vi": "dịch", "context": "Họp/Email"},
          {"en": "câu ví dụ 2", "vi": "dịch", "context": "Báo cáo"}
        ],
        "synonyms": ["đồng nghĩa 1", "đồng nghĩa 2", "đồng nghĩa 3"],
        "antonyms": ["trái nghĩa"],
        "collocations": ["cụm từ 1", "cụm từ 2"]
      }`
    }
  ];
  return await callOpenAI(messages, apiKey, model);
}

async function checkGrammarWithOpenAI(sentence, apiKey, model) {
  const messages = [
    {
      role: 'system',
      content:
        'Bạn là chuyên gia Grammar Doctor hiệu đính tiếng Anh. Luôn trả về JSON hợp lệ theo schema phân tích lỗi.'
    },
    {
      role: 'user',
      content: `Kiểm tra ngữ pháp câu: "${sentence}". Trả về JSON:
      {
        "hasErrors": true,
        "originalSentence": "${sentence}",
        "correctedSentence": "câu đã sửa",
        "issues": [
          {
            "errorText": "phần sai",
            "correction": "sửa đúng",
            "ruleName": "tên quy tắc",
            "explanationVi": "giải thích chi tiết bằng tiếng Việt"
          }
        ],
        "professionalVersion": "bản viết lại chuyên nghiệp chuẩn bản xứ",
        "generalAdviceVi": "lời khuyên học tập"
      }`
    }
  ];
  return await callOpenAI(messages, apiKey, model);
}

async function analyzeSynonymsWithOpenAI(query, apiKey, model) {
  const messages = [
    {
      role: 'system',
      content: 'Bạn là chuyên gia từ vựng tiếng Anh. Phân tích sắc thái các từ đồng nghĩa.'
    },
    {
      role: 'user',
      content: `Phân tích nhóm từ đồng nghĩa cho: "${query}". Trả về JSON:
      {
        "groupName": "Nhóm từ ${query}",
        "coreConceptVi": "khái niệm chung",
        "words": [
          {
            "word": "từ",
            "ipa": "phiên âm",
            "partOfSpeech": "loại từ",
            "meaningVi": "nghĩa",
            "nuance": "sắc thái khác biệt khi dùng",
            "exampleEn": "câu ví dụ",
            "exampleVi": "dịch"
          }
        ]
      }`
    }
  ];
  return await callOpenAI(messages, apiKey, model);
}

/* ==========================================================================
   Smart Fallbacks (When no API key is provided)
   ========================================================================== */

async function enrichWithDictionaryApiFallback(word) {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (res.ok) {
      const data = await res.json();
      const entry = data[0];
      const phonetic = entry.phonetic || entry.phonetics?.find((p) => p.text)?.text || `/${word}/`;
      const meaningObj = entry.meanings?.[0];
      const partOfSpeech = meaningObj?.partOfSpeech || 'noun';
      const defObj = meaningObj?.definitions?.[0];
      const meaningEn = defObj?.definition || 'Definition not found.';
      const rawExample = defObj?.example;

      // Extract synonyms
      const extractedSynonyms = [
        ...(meaningObj?.synonyms || []),
        ...(defObj?.synonyms || [])
      ].slice(0, 5);

      return {
        word: entry.word || word,
        ipa: phonetic,
        partOfSpeech,
        meaningVi: `(Tra từ từ điển quốc tế) ${meaningEn.slice(0, 80)}...`,
        meaningEn,
        examples: [
          {
            en: rawExample || `We must thoroughly analyze our ${word} before moving forward.`,
            vi: `Chúng ta phải phân tích kỹ lưỡng ${word} trước khi tiến hành bước tiếp theo.`,
            context: 'Workplace Practice'
          }
        ],
        synonyms: extractedSynonyms.length > 0 ? extractedSynonyms : ['Related terms'],
        antonyms: meaningObj?.antonyms?.slice(0, 3) || [],
        collocations: [`Key ${word}`, `Apply ${word}`, `Review ${word}`]
      };
    }
  } catch (e) {
    console.warn('FreeDictionaryAPI failed, generating local model:', e);
  }

  // Fallback if offline
  return {
    word: word,
    ipa: `/${word.toLowerCase()}/`,
    partOfSpeech: 'word',
    meaningVi: `Từ vựng mới: ${word} (Nhập API Key trong Cài đặt để AI tự động tạo nghĩa tiếng Việt chi tiết)`,
    meaningEn: `Saved term: ${word}. Set up Gemini or OpenAI API key in Settings for AI enhancement.`,
    examples: [
      {
        en: `Please ensure the team understands how to apply ${word} in our daily tasks.`,
        vi: `Vui lòng đảm bảo rằng cả đội hiểu cách áp dụng ${word} trong công việc hàng ngày.`,
        context: 'Daily Workplace'
      }
    ],
    synonyms: [],
    antonyms: [],
    collocations: [`Use ${word}`, `Define ${word}`]
  };
}

function checkGrammarWithHeuristicFallback(sentence) {
  const lower = sentence.toLowerCase();
  const issues = [];
  let corrected = sentence;

  // Rule 1: 'many advices' or 'advices'
  if (/\badvices\b/i.test(sentence)) {
    issues.push({
      errorText: 'advices',
      correction: 'advice (hoặc pieces of advice)',
      ruleName: 'Danh từ không đếm được (Uncountable Nouns)',
      explanationVi:
        "Trong tiếng Anh, 'advice' là danh từ không đếm được, tuyệt đối không thêm số nhiều 's'. Nếu muốn đếm, hãy dùng 'a piece of advice' hoặc 'a lot of advice'."
    });
    corrected = corrected.replace(/\badvices\b/gi, 'advice');
  }

  // Rule 2: 'feedbacks'
  if (/\bfeedbacks\b/i.test(sentence)) {
    issues.push({
      errorText: 'feedbacks',
      correction: 'feedback',
      ruleName: 'Danh từ không đếm được (Uncountable Nouns)',
      explanationVi:
        "'Feedback' là danh từ không đếm được, luôn ở dạng số ít. Dùng 'Thank you for your feedback' thay vì 'feedbacks'."
    });
    corrected = corrected.replace(/\bfeedbacks\b/gi, 'feedback');
  }

  // Rule 3: 'discuss about'
  if (/\bdiscuss about\b/i.test(sentence)) {
    issues.push({
      errorText: 'discuss about',
      correction: 'discuss',
      ruleName: 'Thừa giới từ (Redundant Preposition)',
      explanationVi:
        "Động từ 'discuss' đã mang nghĩa là 'thảo luận về...', do đó đi trực tiếp với tân ngữ mà không cần giới từ 'about'."
    });
    corrected = corrected.replace(/\bdiscuss about\b/gi, 'discuss');
  }

  // Rule 4: 'look forward to hear'
  if (/look forward to hear\b/i.test(sentence)) {
    issues.push({
      errorText: 'look forward to hear',
      correction: 'look forward to hearing',
      ruleName: 'Giới từ theo sau bởi V-ing (Preposition + Gerund)',
      explanationVi:
        "Cụm 'look forward to' thì 'to' là giới từ, bắt buộc động từ đi sau phải ở dạng V-ing: 'look forward to hearing from you'."
    });
    corrected = corrected.replace(/look forward to hear\b/gi, 'look forward to hearing');
  }

  // Rule 5: 'suggest you to'
  if (/suggest (\w+) to/i.test(sentence)) {
    issues.push({
      errorText: 'suggest ... to',
      correction: 'suggest that ... should',
      ruleName: 'Cấu trúc giả định với Suggest (Subjunctive)',
      explanationVi:
        "Không dùng 'suggest someone to do something'. Hãy dùng 'suggest that [person] (should) do something' hoặc 'suggest doing something'."
    });
    corrected = corrected.replace(/suggest (\w+) to (\w+)/gi, 'suggest that $1 $2');
  }

  const hasErrors = issues.length > 0;

  return {
    hasErrors,
    originalSentence: sentence,
    correctedSentence: hasErrors ? corrected : sentence,
    issues,
    professionalVersion: hasErrors ? corrected : sentence,
    generalAdviceVi: hasErrors
      ? 'Đã phát hiện lỗi qua bộ lọc mẫu ngữ pháp phổ biến. Để kiểm tra sâu sắc toàn diện mọi câu phức, bạn hãy thêm Gemini API Key miễn phí trong mục Cài đặt!'
      : 'Không phát hiện lỗi với bộ lọc cục bộ. Bạn có thể thêm Gemini API Key để kiểm tra mức độ sắc thái tự nhiên và nâng cấp phong cách viết!'
  };
}

function fallbackSynonymAnalysis(query) {
  return {
    groupName: `Nhóm từ đồng nghĩa cho "${query}"`,
    coreConceptVi: `Các từ có nét nghĩa tương đồng với ${query}`,
    words: [
      {
        word: query,
        ipa: `/${query}/`,
        partOfSpeech: 'term',
        meaningVi: 'Từ khóa chính',
        nuance: 'Dùng phổ biến, trung tính trong mọi ngữ cảnh.',
        exampleEn: `We need to focus on this ${query} to achieve our goals.`,
        exampleVi: `Chúng ta cần tập trung vào ${query} này để đạt mục tiêu.`
      }
    ]
  };
}
