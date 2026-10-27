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
  },

  /**
   * Evaluate user's sentence when practicing with a vocabulary word (Tidians)
   */
  evaluateSentence: async (word, sentence) => {
    const rawWord = String(word || '').trim();
    const rawSentence = String(sentence || '').trim();
    if (!rawWord || !rawSentence) throw new Error('Vui lòng nhập từ vựng và câu của bạn.');

    const settings = storageService.getSettings();
    const provider = settings.aiProvider || 'gemini';
    const hasKey =
      (provider === 'gemini' && settings.geminiApiKey) ||
      (provider === 'openai' && settings.openaiApiKey);

    if (hasKey) {
      try {
        if (provider === 'gemini') {
          return await evaluateSentenceWithGemini(rawWord, rawSentence, settings.geminiApiKey, settings.geminiModel);
        } else {
          return await evaluateSentenceWithOpenAI(rawWord, rawSentence, settings.openaiApiKey, settings.openaiModel);
        }
      } catch (err) {
        console.warn('AI sentence evaluation failed, falling back to heuristic:', err);
      }
    }

    return fallbackEvaluateSentence(rawWord, rawSentence);
  },

  /**
   * Evaluate IELTS Speaking turn or full response (Mock Interview)
   */
  evaluateSpeakingResponse: async (question, transcript, part = 1) => {
    const rawTranscript = String(transcript || '').trim();
    const rawQuestion = String(question || '').trim();
    if (!rawTranscript) throw new Error('Chưa có nội dung nói để chấm điểm.');

    const settings = storageService.getSettings();
    const provider = settings.aiProvider || 'gemini';
    const hasKey =
      (provider === 'gemini' && settings.geminiApiKey) ||
      (provider === 'openai' && settings.openaiApiKey);

    if (hasKey) {
      try {
        if (provider === 'gemini') {
          return await evaluateSpeakingWithGemini(rawQuestion, rawTranscript, part, settings.geminiApiKey, settings.geminiModel);
        } else {
          return await evaluateSpeakingWithOpenAI(rawQuestion, rawTranscript, part, settings.openaiApiKey, settings.openaiModel);
        }
      } catch (err) {
        console.warn('AI Speaking evaluation failed, falling back to heuristic:', err);
      }
    }

    return fallbackEvaluateSpeaking(rawQuestion, rawTranscript, part);
  },

  /**
   * Evaluate IELTS Writing Task 1 or Task 2 essay
   */
  evaluateWritingEssay: async (prompt, essay, taskType = 'Task 2') => {
    const rawEssay = String(essay || '').trim();
    const rawPrompt = String(prompt || '').trim();
    if (!rawEssay) throw new Error('Vui lòng nhập bài viết cần chấm.');

    const settings = storageService.getSettings();
    const provider = settings.aiProvider || 'gemini';
    const hasKey =
      (provider === 'gemini' && settings.geminiApiKey) ||
      (provider === 'openai' && settings.openaiApiKey);

    if (hasKey) {
      try {
        if (provider === 'gemini') {
          return await evaluateWritingWithGemini(rawPrompt, rawEssay, taskType, settings.geminiApiKey, settings.geminiModel);
        } else {
          return await evaluateWritingWithOpenAI(rawPrompt, rawEssay, taskType, settings.openaiApiKey, settings.openaiModel);
        }
      } catch (err) {
        console.warn('AI Writing evaluation failed, falling back to heuristic:', err);
      }
    }

    return fallbackEvaluateWriting(rawPrompt, rawEssay, taskType);
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

/* ==========================================================================
   Sentence / Tidians Evaluation Helpers
   ========================================================================== */

async function evaluateSentenceWithGemini(word, sentence, apiKey, model) {
  const prompt = `
Bạn là chuyên gia tiếng Anh IELTS và giao tiếp công sở.
Học viên được yêu cầu đặt 1 câu tiếng Anh có sử dụng từ vựng: "${word}".
Câu học viên đã viết: "${sentence}".

Hãy phân tích và trả về DUY NHẤT định dạng JSON sau:
{
  "ok": true hoặc false (true nếu câu đúng ngữ pháp và dùng từ chính xác),
  "score": điểm từ 1 đến 10,
  "feedbackVi": "Nhận xét tiếng Việt cụ thể, chỉ ra lỗi ngữ pháp / collocations nếu có, hoặc khen ngợi nếu câu tự nhiên",
  "betterVersion": "Phiên bản sửa lỗi đúng ngữ pháp, diễn đạt tự nhiên chuẩn bản xứ",
  "proVersion": "Phiên bản nâng band 7.5+ / phong cách công sở cao cấp dùng từ vựng phong phú",
  "proExplanationVi": "Giải thích ngắn vì sao phiên bản pro này diễn đạt đắt giá hơn"
}
`;
  return await callGemini(prompt, apiKey, model);
}

async function evaluateSentenceWithOpenAI(word, sentence, apiKey, model) {
  const messages = [
    {
      role: 'system',
      content:
        'Bạn là chuyên gia tiếng Anh IELTS & công sở. Trả về DUY NHẤT định dạng JSON phân tích câu học viên viết.'
    },
    {
      role: 'user',
      content: `Từ vựng mục tiêu: "${word}". Câu học viên: "${sentence}".
Trả về JSON cấu trúc: { "ok": boolean, "score": number (1-10), "feedbackVi": string, "betterVersion": string, "proVersion": string, "proExplanationVi": string }`
    }
  ];
  return await callOpenAI(messages, apiKey, model);
}

function fallbackEvaluateSentence(word, sentence) {
  const lowerSentence = sentence.toLowerCase();
  const lowerWord = word.toLowerCase();
  const containsWord = lowerSentence.includes(lowerWord);
  const wordsCount = sentence.trim().split(/\s+/).length;
  const ok = containsWord && wordsCount >= 5;

  return {
    ok,
    score: ok ? (wordsCount >= 8 ? 8 : 7) : 4,
    feedbackVi: ok
      ? `Câu của bạn đã chứa từ "${word}" và có độ dài tương đối tốt (${wordsCount} từ). Để nhận phân tích ngữ pháp chi tiết và gợi ý nâng band, hãy thêm Gemini API Key trong Cài đặt!`
      : !containsWord
      ? `Câu của bạn chưa chứa từ vựng mục tiêu "${word}". Hãy đặt lại câu có dùng từ này nhé!`
      : 'Câu còn hơi ngắn (dưới 5 từ). Hãy mở rộng thêm chủ ngữ, vị ngữ hoặc trạng từ chỉ thời gian/nơi chốn.',
    betterVersion: sentence,
    proVersion: `In terms of professional context, "${word}" can be effectively applied when describing strategic initiatives.`,
    proExplanationVi: 'Phiên bản mẫu giúp tăng tính trang trọng trong môi trường làm việc.'
  };
}

/* ==========================================================================
   Speaking / Mock Interview Evaluation Helpers
   ========================================================================== */

async function evaluateSpeakingWithGemini(question, transcript, part, apiKey, model) {
  const prompt = `
Bạn là giám khảo chấm thi IELTS Speaking chính thức.
Phần thi: IELTS Speaking Part ${part}.
Câu hỏi giám khảo đưa ra: "${question}".
Nội dung bài nói của thí sinh: "${transcript}".

Hãy chấm điểm và nhận xét chuyên sâu theo 4 tiêu chí IELTS. Trả về DUY NHẤT JSON sau:
{
  "bandScore": điểm IELTS ước lượng (số thập phân làm tròn 0.5, ví dụ 6.0, 6.5, 7.0),
  "fluencyComment": "Nhận xét độ lưu loát, liên kết ý và phát triển ý tưởng",
  "lexicalComment": "Nhận xét độ phong phú từ vựng, idiomatic expressions và collocations",
  "grammarComment": "Nhận xét cấu trúc câu (đơn, ghép, phức) và độ chính xác ngữ pháp",
  "keyErrors": ["Lỗi sai 1...", "Lỗi sai 2..."],
  "sampleBand8": "Câu trả lời mẫu Band 8.0+ tự nhiên, mạch lạc và giàu cảm xúc",
  "adviceVi": "Lời khuyên then chốt để thí sinh bứt phá band điểm ở dạng câu hỏi này"
}
`;
  return await callGemini(prompt, apiKey, model);
}

async function evaluateSpeakingWithOpenAI(question, transcript, part, apiKey, model) {
  const messages = [
    {
      role: 'system',
      content:
        'Bạn là giám khảo IELTS Speaking. Đánh giá câu trả lời của thí sinh theo chuẩn 4 tiêu chí và trả về DUY NHẤT JSON.'
    },
    {
      role: 'user',
      content: `IELTS Speaking Part ${part}. Câu hỏi: "${question}". Thí sinh nói: "${transcript}".
Trả về JSON cấu trúc: { "bandScore": number, "fluencyComment": string, "lexicalComment": string, "grammarComment": string, "keyErrors": string[], "sampleBand8": string, "adviceVi": string }`
    }
  ];
  return await callOpenAI(messages, apiKey, model);
}

function fallbackEvaluateSpeaking(question, transcript, part) {
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const count = words.length;
  let estimatedBand = 5.5;
  if (count >= 40) estimatedBand = 6.5;
  if (count >= 80) estimatedBand = 7.0;
  if (count < 15) estimatedBand = 5.0;

  return {
    bandScore: estimatedBand,
    fluencyComment: `Độ dài câu trả lời: ${count} từ. ${count >= 30 ? 'Bạn đã trả lời có độ dài tương đối tốt.' : 'Câu trả lời còn hơi ngắn, nên mở rộng bằng lý do (Because...) hoặc ví dụ (For instance...).'}`,
    lexicalComment: 'Sử dụng từ vựng ở mức giao tiếp cơ bản. Có thể nâng cấp thêm collocations nâng cao.',
    grammarComment: 'Cấu trúc câu nhìn chung dễ hiểu. Cần chú ý chia thì quá khứ và sự hòa hợp chủ - vị.',
    keyErrors: count < 20 ? ['Câu trả lời quá ngắn so với yêu cầu bài thi'] : [],
    sampleBand8: `Well, to be completely honest, when it comes to this topic, I'd say that it plays a vital role in my daily routine. For example, whenever I'm faced with such situations, I always strive to maintain a balanced perspective.`,
    adviceVi: 'Hãy cài đặt Gemini API Key trong mục Cài đặt để nhận phân tích thời gian thực từ AI Examiner!'
  };
}

/* ==========================================================================
   Writing Evaluation Helpers
   ========================================================================== */

async function evaluateWritingWithGemini(prompt, essay, taskType, apiKey, model) {
  const promptText = `
Bạn là giám khảo chấm thi IELTS Writing chuyên nghiệp (IDP / British Council).
Nhiệm vụ: Chấm bài viết IELTS Writing ${taskType}.
Đề bài: "${prompt}".
Bài làm của học viên: "${essay}".

Hãy chấm điểm chi tiết theo 4 tiêu chí IELTS. Trả về DUY NHẤT JSON sau:
{
  "overallBand": điểm overall ước lượng (ví dụ 6.0, 6.5, 7.0, 7.5),
  "taskResponse": "Nhận xét chi tiết tiêu chí Task Achievement (Task 1) hoặc Task Response (Task 2)",
  "coherence": "Nhận xét Coherence and Cohesion (mạch lạc, liên kết đoạn, từ nối)",
  "lexical": "Nhận xét Lexical Resource (vốn từ học thuật, paraphrasing, chính tả)",
  "grammar": "Nhận xét Grammatical Range and Accuracy (các cấu trúc ngữ pháp phức, lỗi sai)",
  "wordCount": số lượng từ trong bài làm,
  "strengths": ["Điểm sáng 1 trong bài...", "Điểm sáng 2..."],
  "improvements": ["Lỗi sai hoặc điểm cần khắc phục 1...", "Điểm 2..."],
  "revisedExcerpt": "Một đoạn văn mẫu tiêu biểu trong bài được viết lại chuẩn Band 8.0+",
  "summaryVi": "Tổng kết ngắn gọn và chiến lược nâng điểm cho bài viết này"
}
`;
  return await callGemini(promptText, apiKey, model);
}

async function evaluateWritingWithOpenAI(prompt, essay, taskType, apiKey, model) {
  const messages = [
    {
      role: 'system',
      content:
        'Bạn là giám khảo chấm thi IELTS Writing. Đánh giá bài luận theo chuẩn 4 tiêu chí và trả về DUY NHẤT định dạng JSON.'
    },
    {
      role: 'user',
      content: `IELTS Writing ${taskType}. Đề bài: "${prompt}". Bài làm: "${essay}".
Trả về JSON cấu trúc: { "overallBand": number, "taskResponse": string, "coherence": string, "lexical": string, "grammar": string, "wordCount": number, "strengths": string[], "improvements": string[], "revisedExcerpt": string, "summaryVi": string }`
    }
  ];
  return await callOpenAI(messages, apiKey, model);
}

function fallbackEvaluateWriting(prompt, essay, taskType) {
  const words = essay.trim().split(/\s+/).filter(Boolean);
  const count = words.length;
  const isTask2 = String(taskType).includes('2');
  const targetWords = isTask2 ? 250 : 150;

  let band = 5.5;
  if (count >= targetWords) band = 6.0;
  if (count >= targetWords + 40) band = 6.5;
  if (count < targetWords - 50) band = 5.0;

  return {
    overallBand: band,
    taskResponse: `Bài viết đạt ${count}/${targetWords} từ yêu cầu. ${count >= targetWords ? 'Đã đáp ứng đủ dung lượng tối thiểu.' : 'Chưa đạt đủ số từ tối thiểu, sẽ bị trừ điểm tiêu chí Task Response.'}`,
    coherence: 'Bố cục bài viết có phân đoạn. Cần sử dụng linh hoạt các từ nối chuyển ý (Furthermore, Consequently, In contrast).',
    lexical: 'Vốn từ vựng tương đối phù hợp với chủ đề. Cần tránh lặp từ bằng cách paraphrase.',
    grammar: 'Các câu văn cơ bản đúng ngữ pháp. Cần kết hợp thêm câu phức (mệnh đề quan hệ, câu điều kiện, đảo ngữ).',
    wordCount: count,
    strengths: count >= targetWords ? ['Đã hoàn thành độ dài yêu cầu'] : ['Ý tưởng trả lời đúng hướng đề bài'],
    improvements: count < targetWords ? ['Cần viết đủ ít nhất ' + targetWords + ' từ'] : ['Cần đa dạng hóa cấu trúc câu'],
    revisedExcerpt: 'It is widely believed that addressing this issue requires concerted efforts from both governing bodies and individuals.',
    summaryVi: 'Để nhận bảng chấm điểm chi tiết 4 tiêu chí và bài sửa từng câu từ AI, hãy cài đặt Gemini API Key trong mục Cài đặt!'
  };
}

