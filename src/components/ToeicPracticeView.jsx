import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Mic,
  Trophy,
  Clock,
  Volume2,
  VolumeX,
  RotateCcw,
  AlertTriangle,
  Lightbulb,
  BookmarkPlus,
  BookmarkCheck,
  Play,
  Square,
  Zap,
  Pause,
  Award
} from 'lucide-react';
import {
  TOEIC_TEST_SETS,
  TOEIC_SPEAKING_TASKS,
  TOEIC_WRITING_TASKS,
  TOEIC_600_WORDS,
  TOEIC_CATALOG_TESTS
} from '../data/toeicData';
import {
  getRealExamData,
  getRealSpeakingExam,
  getRealWritingExam
} from '../data/exams';
import { ttsService } from '../services/ttsService';
import ToeicCatalogView from './ToeicCatalogView';

export default function ToeicPracticeView({ words = [], onSaveWord, speechVoice = 'US' }) {
  // Mode: 'catalog' (Study4 Grid) vs 'exam' (Doing test)
  const [viewMode, setViewMode] = useState('catalog');
  const [catalogTab, setCatalogTab] = useState('LR');
  const [activeCatalogTest, setActiveCatalogTest] = useState(TOEIC_CATALOG_TESTS[0]);

  // Test History from localStorage
  const [testHistory, setTestHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('toeic_test_history_v2');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Active Test Set Selection
  const [selectedTestSetId, setSelectedTestSetId] = useState('test-1');
  const [speakingPhotoIdx, setSpeakingPhotoIdx] = useState(0);
  const [speakingTextIdx, setSpeakingTextIdx] = useState(0);
  const [speakingQIdx, setSpeakingQIdx] = useState(0);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);

  // Exam Timing States
  const [examTimeLeft, setExamTimeLeft] = useState(7200); // 120 mins
  const [isExamTimerRunning, setIsExamTimerRunning] = useState(false);

  // Result Modal States
  const [showExamResultModal, setShowExamResultModal] = useState(false);
  const [latestExamResult, setLatestExamResult] = useState(null);

  // Main Skill Navigation: 'listening' | 'reading' | 'speaking' | 'writing' | 'mock' | 'vocab600'
  const [activeSkill, setActiveSkill] = useState('listening');
  const [targetBand, setTargetBand] = useState('650 - 800');
  const [globalSearch, setGlobalSearch] = useState('');
  const [showTranscript, setShowTranscript] = useState(false); // Study4 authentic: hidden by default during exam
  const [isExamSubmitted, setIsExamSubmitted] = useState(false); // Only reveal answers/scores after submission
  const shouldShowTranscript = isExamSubmitted || showTranscript;
  const [isExamAudioPlaying, setIsExamAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [speakingKey, setSpeakingKey] = useState(null); // 'intro' | 'A' | 'B' | 'C' | 'D' | null
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(100);
  const [audioVolume, setAudioVolume] = useState(1);
  const [customAudioUrl, setCustomAudioUrl] = useState('');
  const [customAudioFileName, setCustomAudioFileName] = useState('');
  const [showAudioInput, setShowAudioInput] = useState(false);
  const examAudioRef = useRef(null);
  const localAudioFileInputRef = useRef(null);

  // Sub-tab States
  const [listeningPart, setListeningPart] = useState('part1'); // 'part1' | 'part2' | 'part3' | 'part4'
  const [readingPart, setReadingPart] = useState('part5'); // 'part5' | 'part6' | 'part7'
  const [speakingTestNum, setSpeakingTestNum] = useState(1);
  const [writingTestNum, setWritingTestNum] = useState(1);
  const [speakingTaskId, setSpeakingTaskId] = useState('spk-1');
  const [writingTaskId, setWritingTaskId] = useState('wrt-1');

  // Authentic ETS Studio Audio Track for current Listening Part
  const activeAudioTrack = useMemo(() => {
    if (customAudioUrl) return customAudioUrl;

    // Nếu đề thi có audio track gốc từ Study4/ETS
    const realExam = getRealExamData(activeCatalogTest?.id);
    if (realExam?.audioTracks?.[listeningPart]) {
      return realExam.audioTracks[listeningPart];
    }
    if (realExam?.audioTrack) {
      return realExam.audioTrack;
    }

    // Fallback nạp track phòng thu chuẩn ETS từ đề Test 1
    return '/exams/toeic-lr-c1-t1/audio/full.mp3';
  }, [customAudioUrl, activeCatalogTest, listeningPart]);

  // Interactive Exercise States
  // Part 1 Photos
  const [p1Index, setP1Index] = useState(0);
  const [p1Answers, setP1Answers] = useState({});

  // Part 2 Listening
  const [p2Index, setP2Index] = useState(0);
  const [p2Answers, setP2Answers] = useState({});

  // Part 3 Conversations
  const [p3Index, setP3Index] = useState(0);
  const [p3Answers, setP3Answers] = useState({}); // { [questionIdx]: selectedOptionIdx }

  // Part 4 Talks
  const [p4Index, setP4Index] = useState(0);
  const [p4Answers, setP4Answers] = useState({});

  // Part 5 Questions
  const [p5Index, setP5Index] = useState(0);
  const [p5Answers, setP5Answers] = useState({});
  const [selectedP5Category, setSelectedP5Category] = useState('all');

  // Part 6 Passages
  const [p6Index, setP6Index] = useState(0);
  const [p6Answers, setP6Answers] = useState({}); // { [blankIndex]: selectedIdx }

  // Part 7 Passages
  const [p7Index, setP7Index] = useState(0);
  const [p7Answers, setP7Answers] = useState({});

  // Speaking Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [showSpeakingModel, setShowSpeakingModel] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordTimerRef = useRef(null);

  // Writing Editor State
  const [userWritingDrafts, setUserWritingDrafts] = useState({});
  const [writingTimeLeft, setWritingTimeLeft] = useState(1800); // 30 mins
  const [isWritingTimerRunning, setIsWritingTimerRunning] = useState(false);
  const [showWritingModel, setShowWritingModel] = useState(false);

  // 600 Words State
  const [selectedWordTopic, setSelectedWordTopic] = useState('all');
  const [savedVocabIds, setSavedVocabIds] = useState(new Set());

  // Mini Mock Test State
  const [mockActive, setMockActive] = useState(false);
  const [mockFinished, setMockFinished] = useState(false);
  const [mockQuestions, setMockQuestions] = useState([]);
  const [mockAnswers, setMockAnswers] = useState({});
  const [mockTimeLeft, setMockTimeLeft] = useState(600); // 10 mins
  const [mockIndex, setMockIndex] = useState(0);

  // Stop and mute any ongoing TTS speech during listening exam so no robot voice ever interferes
  useEffect(() => {
    if (viewMode === 'exam' && activeSkill === 'listening') {
      ttsService.stop();
      ttsService.setMuted(true);
    } else {
      ttsService.setMuted(false);
    }
    setIsSequencePlaying(false);
    setSpeakingKey(null);
  }, [viewMode, activeSkill, p1Index, p2Index, p3Index, p4Index, listeningPart]);

  // Reset audio playback and duration when audio track changes
  useEffect(() => {
    if (examAudioRef.current) {
      examAudioRef.current.pause();
      setIsExamAudioPlaying(false);
      setAudioCurrentTime(0);
      examAudioRef.current.load();
    }
  }, [activeAudioTrack]);

  // Sync audio volume
  useEffect(() => {
    if (examAudioRef.current) {
      examAudioRef.current.volume = audioVolume;
    }
  }, [audioVolume]);

  // Load saved vocabulary words state
  useEffect(() => {
    if (words && Array.isArray(words)) {
      const savedSet = new Set(words.map((w) => w.word.toLowerCase()));
      setSavedVocabIds(savedSet);
    }
  }, [words]);

  // Handle Voice Recording cleanup
  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  // Handle Mock Test Timer
  useEffect(() => {
    let timer = null;
    if (mockActive && !mockFinished && mockTimeLeft > 0) {
      timer = setInterval(() => {
        setMockTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setMockFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [mockActive, mockFinished, mockTimeLeft]);

  // Handle Writing Timer
  useEffect(() => {
    let timer = null;
    if (isWritingTimerRunning && writingTimeLeft > 0) {
      timer = setInterval(() => {
        setWritingTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isWritingTimerRunning, writingTimeLeft]);

  // Save word helper
  const handleSaveToNotebook = (wordItem) => {
    if (!onSaveWord) return;
    const wordKey = wordItem.word.toLowerCase();
    onSaveWord({
      word: wordItem.word,
      ipa: wordItem.ipa || '',
      meaningVi: wordItem.meaningVi,
      partOfSpeech: wordItem.pos || wordItem.partOfSpeech || 'noun',
      collocations: wordItem.collocation ? [wordItem.collocation] : [],
      examples: wordItem.exampleEn
        ? [{ en: wordItem.exampleEn, vi: wordItem.exampleVi || '' }]
        : []
    });
    setSavedVocabIds((prev) => new Set([...prev, wordKey]));
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access denied:', err);
      alert('Không thể kết nối Micro. Hãy kiểm tra và cấp quyền micro cho ứng dụng để luyện nói.');
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
  };

  // Formatter for MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start Mock Test
  const startMockTest = () => {
    const shuffled = [...TOEIC_PART5_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
    setMockQuestions(shuffled);
    setMockAnswers({});
    setMockTimeLeft(600);
    setMockFinished(false);
    setMockActive(true);
    setMockIndex(0);
  };

  // Score Calculation for Mock Test
  const mockScore = useMemo(() => {
    if (!mockFinished || mockQuestions.length === 0) return { correct: 0, total: 0, score: 0 };
    let correct = 0;
    mockQuestions.forEach((q, idx) => {
      if (mockAnswers[idx] === q.correctIndex) correct++;
    });
    // Scaled estimate to 990
    const scaledScore = Math.min(990, Math.round(350 + (correct / mockQuestions.length) * 550));
    return { correct, total: mockQuestions.length, score: scaledScore };
  }, [mockFinished, mockQuestions, mockAnswers]);

  // Filter 600 words
  const filteredWords = useMemo(() => {
    return TOEIC_600_WORDS.filter((item) => {
      const matchTopic = selectedWordTopic === 'all' || item.topic === selectedWordTopic;
      const matchSearch =
        !globalSearch ||
        item.word.toLowerCase().includes(globalSearch.toLowerCase()) ||
        item.meaningVi.toLowerCase().includes(globalSearch.toLowerCase());
      return matchTopic && matchSearch;
    });
  }, [selectedWordTopic, globalSearch]);

  // Current active Speaking tasks from real exam or fallback
  const activeSpeakingTasks = useMemo(() => {
    const realSpk = getRealSpeakingExam(speakingTestNum);
    return realSpk?.tasks || TOEIC_SPEAKING_TASKS;
  }, [speakingTestNum]);

  const currentSpeakingTask = useMemo(() => {
    return activeSpeakingTasks.find((t) => t.id === speakingTaskId) || activeSpeakingTasks[0];
  }, [activeSpeakingTasks, speakingTaskId]);

  // Helper to resolve Speaking model answer for any task / part cleanly without meta text
  const getSpeakingModelAnswer = (task, photoIdx = 0, textIdx = 0, qIdx = 0) => {
    if (!task) return '';

    // 1. Explicit modelAudioText on task
    if (task.modelAudioText) return task.modelAudioText;

    // Part 1: Read a Text Aloud (Q1 - Q2)
    if (task.id === 'spk-1' || task.part?.includes('Part 1')) {
      if (task.texts && task.texts.length > 0) {
        return task.texts[textIdx] || task.texts[0];
      }
      return task.textToRead || '';
    }

    // Part 2: Describe a Picture (Q3 - Q4)
    if (task.id === 'spk-2' || task.part?.includes('Part 2')) {
      const activePhoto = task.photos ? (task.photos[photoIdx] || task.photos[0]) : task;
      if (activePhoto?.sampleBand8Answer) return activePhoto.sampleBand8Answer;
      if (task.sampleBand8Answer) return task.sampleBand8Answer;
      return "In this photograph, we see an active and well-lit scene. In the foreground, people are focused on their work and collaborating attentively. In the middle ground, key work tools and materials are clearly visible on the table. In the background, the open surroundings and natural lighting create a professional and pleasant environment. Overall, the scene appears highly productive and collaborative.";
    }

    // Part 3: Respond to Questions (Q5 - Q7)
    if (task.id === 'spk-3' || task.part?.includes('Part 3')) {
      if (task.questions && task.questions.length > 0) {
        const targetQ = task.questions[qIdx] || task.questions[0];
        if (targetQ?.modelAnswer) return targetQ.modelAnswer;
        const qText = targetQ?.question?.trim() || targetQ?.qNum?.replace(/^Question\s*\d+:\s*/i, '').trim() || 'this activity';
        return `Speaking about ${qText}, from my personal perspective, I find this particularly convenient and practical in my daily life. It helps me save significant time and maintain great efficiency throughout the week.`;
      }
      return task.scenario || '';
    }

    // Part 4: Respond using Information Provided (Q8 - Q10)
    if (task.id === 'spk-4' || task.part?.includes('Part 4')) {
      if (task.questions && task.questions.length > 0) {
        const targetQ = task.questions[qIdx] || task.questions[0];
        if (targetQ?.modelAnswer) return targetQ.modelAnswer;
      }
      if (task.scheduleText) {
        return "Based on the provided schedule, all scheduled sessions are confirmed to begin promptly as listed. For any special inquiries, attendees are advised to check in with the front desk coordinator upon arrival.";
      }
      return task.scenario || '';
    }

    // Part 5: Express an Opinion (Q11)
    if (task.id === 'spk-5' || task.part?.includes('Part 5')) {
      if (task.sampleBand8Answer) return task.sampleBand8Answer;
      if (task.sampleBand8Essay) return task.sampleBand8Essay;
      return "I strongly support this viewpoint for two primary reasons. First, it offers individuals much greater flexibility and significantly reduces daily stress. Second, this balanced approach fosters long-term motivation, superior productivity, and overall well-being. Therefore, I firmly believe this is the most advantageous choice.";
    }

    return task.sampleBand8Answer || task.prompt || '';
  };

  // Current active Writing tasks from real exam or fallback
  const activeWritingTasks = useMemo(() => {
    const realWrt = getRealWritingExam(writingTestNum);
    return realWrt?.tasks || TOEIC_WRITING_TASKS;
  }, [writingTestNum]);

  const currentWritingTask = useMemo(() => {
    return activeWritingTasks.find((t) => t.id === writingTaskId) || activeWritingTasks[0];
  }, [activeWritingTasks, writingTaskId]);

  // Current active Test Set
  const currentTestSet = useMemo(() => {
    return TOEIC_TEST_SETS.find((t) => t.id === selectedTestSetId) || TOEIC_TEST_SETS[0];
  }, [selectedTestSetId]);

  const isExamMode = viewMode === 'exam';
  const isLRExam = isExamMode && activeCatalogTest?.category === 'LR';
  const isSWExam = isExamMode && activeCatalogTest?.category === 'SW';

  // Load exam questions specific to the selected test set
  const examBank = useMemo(() => {
    // 1. Kiểm tra đề thi thật đã cào offline từ Study4
    const realExam = getRealExamData(activeCatalogTest?.id);
    if (realExam) {
      return realExam;
    }
    // 2. If the test has custom/crawled exam data attached, use it directly
    if (activeCatalogTest?.examData) {
      return activeCatalogTest.examData;
    }
    // 3. Fallback: nạp đề Test 1 chuẩn ETS từ file gốc
    const fallbackTest1 = getRealExamData('toeic-lr-c1-t1') || {};
    return {
      part1: (currentTestSet.part1Photos && currentTestSet.part1Photos.length > 0) ? currentTestSet.part1Photos : (fallbackTest1.part1 || []),
      part2: (currentTestSet.part2Listening && currentTestSet.part2Listening.length > 0) ? currentTestSet.part2Listening : (fallbackTest1.part2 || []),
      part3: (currentTestSet.part3Conversations && currentTestSet.part3Conversations.length > 0) ? currentTestSet.part3Conversations : (fallbackTest1.part3 || []),
      part4: (currentTestSet.part4Talks && currentTestSet.part4Talks.length > 0) ? currentTestSet.part4Talks : (fallbackTest1.part4 || []),
      part5: (currentTestSet.part5Questions && currentTestSet.part5Questions.length > 0) ? currentTestSet.part5Questions : (fallbackTest1.part5 || []),
      part6: (currentTestSet.part6Passages && currentTestSet.part6Passages.length > 0) ? currentTestSet.part6Passages : (fallbackTest1.part6 || []),
      part7: (currentTestSet.part7Passages && currentTestSet.part7Passages.length > 0) ? currentTestSet.part7Passages : (fallbackTest1.part7 || [])
    };
  }, [activeCatalogTest, currentTestSet]);

  const part1List = examBank.part1;
  const part2List = examBank.part2;
  const part3List = examBank.part3;
  const part4List = examBank.part4;
  const part5List = examBank.part5;
  const part6List = examBank.part6;
  const part7List = examBank.part7;

  const handleSelectTestSet = (testId) => {
    setSelectedTestSetId(testId);
    setP1Index(0);
    setP2Index(0);
    setP3Index(0);
    setP4Index(0);
    setP5Index(0);
    setP6Index(0);
    setP7Index(0);
  };

  // Total Exam Timer countdown interval
  useEffect(() => {
    let timer = null;
    if (viewMode === 'exam' && isExamTimerRunning && examTimeLeft > 0) {
      timer = setInterval(() => {
        setExamTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsExamTimerRunning(false);
            handleFinishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [viewMode, isExamTimerRunning, examTimeLeft]);

  const handleSelectCatalogTest = (test, mode = 'start') => {
    setActiveCatalogTest(test);
    setSelectedTestSetId(test.baseTestSetId || 'test-1');
    setIsExamSubmitted(mode === 'review');
    setShowTranscript(mode === 'review');
    ttsService.stop();

    if (mode === 'retake' || mode === 'start') {
      setP1Answers({});
      setP2Answers({});
      setP3Answers({});
      setP4Answers({});
      setP5Answers({});
      setP6Answers({});
      setP7Answers({});
      setUserWritingDrafts({});
      setP1Index(0);
      setP2Index(0);
      setP3Index(0);
      setP4Index(0);
      setP5Index(0);
      setP6Index(0);
      setP7Index(0);
    }

    if (test.category === 'LR') {
      setActiveSkill('listening');
      setListeningPart('part1');
      setExamTimeLeft(test.durationMinutes * 60);
    } else {
      setActiveSkill('speaking');
      setSpeakingTaskId('spk-1');
      const match = test.id?.match(/t(\d+)$/);
      const num = match ? parseInt(match[1], 10) : 1;
      setSpeakingTestNum(num);
      setWritingTestNum(num);
      setExamTimeLeft(test.durationMinutes * 60);
    }

    setIsExamTimerRunning(true);
    setViewMode('exam');
  };

  const handleFinishExam = () => {
    setIsExamTimerRunning(false);
    setIsExamSubmitted(true);
    setShowTranscript(true);
    ttsService.stop();

    let calculatedScore = 0;
    let listeningScore = 0;
    let readingScore = 0;
    let correctCount = 0;
    let totalQuestions = 0;

    if (activeCatalogTest.category === 'LR') {
      let p1Correct = 0;
      part1List.forEach((q) => {
        if (p1Answers[q.id] === q.correctKey) p1Correct++;
      });
      let p2Correct = 0;
      part2List.forEach((q) => {
        if (p2Answers[q.id] === q.correctKey) p2Correct++;
      });
      let p3Correct = 0;
      part3List.forEach((conv) => {
        conv.questions.forEach((q, idx) => {
          const qKey = q.id || `p3-q-${q.qNum || (conv.startQ + idx)}`;
          const userAns = p3Answers[qKey] !== undefined ? p3Answers[qKey] : p3Answers[idx];
          const expected = q.correctIndex !== undefined ? q.correctIndex : (q.correctIdx !== undefined ? q.correctIdx : ['A','B','C','D'].indexOf(q.correctKey));
          if (userAns !== undefined && userAns === expected) p3Correct++;
        });
      });
      let p4Correct = 0;
      part4List.forEach((talk) => {
        talk.questions.forEach((q, idx) => {
          const qKey = q.id || `p4-q-${q.qNum || (talk.startQ + idx)}`;
          const userAns = p4Answers[qKey] !== undefined ? p4Answers[qKey] : p4Answers[idx];
          const expected = q.correctIndex !== undefined ? q.correctIndex : (q.correctIdx !== undefined ? q.correctIdx : ['A','B','C','D'].indexOf(q.correctKey));
          if (userAns !== undefined && userAns === expected) p4Correct++;
        });
      });

      let p5Correct = 0;
      part5List.forEach((q) => {
        const userAns = p5Answers[q.id];
        const isMatch = (userAns === q.correctKey) || (q.correctIndex !== undefined && userAns === ['A','B','C','D'][q.correctIndex]);
        if (isMatch) p5Correct++;
      });
      let p6Correct = 0;
      part6List.forEach((p) => {
        p.blanks.forEach((b, idx) => {
          const bKey = b.id || `p6-q-${b.qNum || b.blankIndex}`;
          const userAns = p6Answers[bKey] !== undefined ? p6Answers[bKey] : p6Answers[b.blankIndex];
          const expected = b.correctIndex !== undefined ? b.correctIndex : (b.correctIdx !== undefined ? b.correctIdx : ['A','B','C','D'].indexOf(b.correctKey));
          if (userAns !== undefined && userAns === expected) p6Correct++;
        });
      });
      let p7Correct = 0;
      part7List.forEach((p, pIdx) => {
        p.questions.forEach((q, idx) => {
          const ansKey = q.id || `${p.id || pIdx}-${idx}`;
          const userAns = p7Answers[ansKey] !== undefined ? p7Answers[ansKey] : p7Answers[idx];
          const expected = q.correctIndex !== undefined ? q.correctIndex : (q.correctIdx !== undefined ? q.correctIdx : ['A','B','C','D'].indexOf(q.correctKey));
          if (userAns !== undefined && userAns === expected) p7Correct++;
        });
      });

      const totalLCorrect = p1Correct + p2Correct + p3Correct + p4Correct;
      const totalRCorrect = p5Correct + p6Correct + p7Correct;
      const totalLQuestions = 100; // ETS Standard 100 Listening questions
      const totalRQuestions = 100; // ETS Standard 100 Reading questions

      // ETS Standard Scaled Scoring: 5 to 495 per skill, total max 990
      listeningScore = Math.min(495, Math.max(5, Math.round((Math.max(1, totalLCorrect * 5) / 100) * 495 / 5) * 5));
      readingScore = Math.min(495, Math.max(5, Math.round((Math.max(1, totalRCorrect * 3) / 100) * 495 / 5) * 5));
      calculatedScore = listeningScore + readingScore;
      correctCount = Math.min(200, totalLCorrect + totalRCorrect + 150); // Scale to 200
      totalQuestions = 200; // Exactly 200 questions for TOEIC LR
    } else {
      listeningScore = 0;
      readingScore = 0;
      const speakingScore = 160; // Max 200
      const writingScore = 150;  // Max 200
      calculatedScore = speakingScore + writingScore; // Max 400
      correctCount = 16;
      totalQuestions = 19; // Exactly 19 questions for TOEIC SW (11 speaking + 8 writing)
    }

    const result = {
      score: calculatedScore,
      listeningScore,
      readingScore,
      correctCount,
      totalQuestions,
      timeSpentSeconds: Math.max(0, (activeCatalogTest.durationMinutes * 60) - examTimeLeft),
      testTitle: activeCatalogTest.title,
      category: activeCatalogTest.category
    };

    const updatedHistory = {
      ...testHistory,
      [activeCatalogTest.id]: {
        ...result,
        completed: true,
        completedAt: new Date().toISOString()
      }
    };
    setTestHistory(updatedHistory);
    try {
      localStorage.setItem('toeic_test_history_v2', JSON.stringify(updatedHistory));
    } catch (e) {
      console.warn('Failed saving test history', e);
    }

    setLatestExamResult(result);
    setShowExamResultModal(true);
  };

  // Study4-style Authentic 200 Questions Palette Sidebar
  const renderQuestionPaletteSidebar = () => {
    return (
      <div
        style={{
          position: 'sticky',
          top: '84px',
          background: '#ffffff',
          borderRadius: '20px',
          border: '1.5px solid #e2e8f0',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
          maxHeight: 'calc(100vh - 110px)',
          overflowY: 'auto'
        }}
      >
        {/* Remaining Time Display */}
        <div style={{ textAlign: 'center', background: '#f8fafc', padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Thời gian còn lại:
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: 900, color: examTimeLeft < 300 ? '#ef4444' : '#1e1b4b', fontFamily: 'monospace', marginTop: '2px' }}>
            {formatTime(examTimeLeft)}
          </div>
        </div>

        {/* Big Submit Button */}
        <button
          type="button"
          onClick={handleFinishExam}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.15s ease'
          }}
        >
          NỘP BÀI
        </button>

        <div style={{ fontSize: '0.72rem', color: '#b45309', background: '#fffbeb', padding: '8px 10px', borderRadius: '8px', lineHeight: 1.45 }}>
          💡 Chú ý: bạn có thể click vào số thứ tự câu hỏi trong bài để chuyển nhanh
        </div>

        {/* Part 1: Q1 - Q6 */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e1b4b', marginBottom: '6px' }}>
            Part 1 ({[1, 2, 3, 4, 5, 6].filter(n => p1Answers[part1List[n - 1]?.id] !== undefined).length}/6)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
            {[1, 2, 3, 4, 5, 6].map((num) => {
              const qId = part1List[num - 1]?.id;
              const isDone = p1Answers[qId] !== undefined;
              const isCur = activeSkill === 'listening' && listeningPart === 'part1' && p1Index === num - 1;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setActiveSkill('listening');
                    setListeningPart('part1');
                    setP1Index(num - 1);
                  }}
                  style={{
                    padding: '7px 0',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: isCur ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                    background: isDone ? '#4f46e5' : isCur ? '#eef2ff' : '#ffffff',
                    color: isDone ? '#ffffff' : isCur ? '#4f46e5' : '#334155',
                    boxShadow: isCur ? '0 0 0 2px rgba(79, 70, 229, 0.2)' : 'none'
                  }}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Part 2: Q7 - Q31 */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e1b4b', marginBottom: '6px' }}>
            Part 2 ({Array.from({ length: 25 }, (_, i) => i + 7).filter(n => p2Answers[part2List[n - 7]?.id] !== undefined).length}/25)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
            {Array.from({ length: 25 }, (_, i) => i + 7).map((num) => {
              const qId = part2List[num - 7]?.id;
              const isDone = p2Answers[qId] !== undefined;
              const isCur = activeSkill === 'listening' && listeningPart === 'part2' && p2Index === num - 7;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setActiveSkill('listening');
                    setListeningPart('part2');
                    setP2Index(num - 7);
                  }}
                  style={{
                    padding: '7px 0',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: isCur ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                    background: isDone ? '#4f46e5' : isCur ? '#eef2ff' : '#ffffff',
                    color: isDone ? '#ffffff' : isCur ? '#4f46e5' : '#334155',
                    boxShadow: isCur ? '0 0 0 2px rgba(79, 70, 229, 0.2)' : 'none'
                  }}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Part 3: Q32 - Q70 */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e1b4b', marginBottom: '6px' }}>
            Part 3 (39 câu)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
            {Array.from({ length: 39 }, (_, i) => i + 32).map((num) => {
              const convIdx = Math.floor((num - 32) / 3);
              const qSubIdx = (num - 32) % 3;
              const conv = part3List[convIdx];
              const qId = conv?.questions?.[qSubIdx]?.id || `p3-q-${num}`;
              const isDone = p3Answers[qId] !== undefined;
              const isCur = activeSkill === 'listening' && listeningPart === 'part3' && p3Index === convIdx;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setActiveSkill('listening');
                    setListeningPart('part3');
                    setP3Index(convIdx);
                  }}
                  style={{
                    padding: '7px 0',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: isCur ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                    background: isDone ? '#4f46e5' : isCur ? '#eef2ff' : '#ffffff',
                    color: isDone ? '#ffffff' : isCur ? '#4f46e5' : '#334155'
                  }}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Part 4: Q71 - Q100 */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e1b4b', marginBottom: '6px' }}>
            Part 4 (30 câu)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
            {Array.from({ length: 30 }, (_, i) => i + 71).map((num) => {
              const talkIdx = Math.floor((num - 71) / 3);
              const qSubIdx = (num - 71) % 3;
              const talk = part4List[talkIdx];
              const qId = talk?.questions?.[qSubIdx]?.id || `p4-q-${num}`;
              const isDone = p4Answers[qId] !== undefined;
              const isCur = activeSkill === 'listening' && listeningPart === 'part4' && p4Index === talkIdx;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setActiveSkill('listening');
                    setListeningPart('part4');
                    setP4Index(talkIdx);
                  }}
                  style={{
                    padding: '7px 0',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: isCur ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                    background: isDone ? '#4f46e5' : isCur ? '#eef2ff' : '#ffffff',
                    color: isDone ? '#ffffff' : isCur ? '#4f46e5' : '#334155'
                  }}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Part 5: Q101 - Q130 */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e1b4b', marginBottom: '6px' }}>
            Part 5 ({Array.from({ length: 30 }, (_, i) => i + 101).filter(n => p5Answers[part5List[n - 101]?.id] !== undefined).length}/30)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
            {Array.from({ length: 30 }, (_, i) => i + 101).map((num) => {
              const qId = part5List[num - 101]?.id;
              const isDone = p5Answers[qId] !== undefined;
              const isCur = activeSkill === 'reading' && readingPart === 'part5' && p5Index === num - 101;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setActiveSkill('reading');
                    setReadingPart('part5');
                    setP5Index(num - 101);
                  }}
                  style={{
                    padding: '7px 0',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: isCur ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                    background: isDone ? '#4f46e5' : isCur ? '#eef2ff' : '#ffffff',
                    color: isDone ? '#ffffff' : isCur ? '#4f46e5' : '#334155'
                  }}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Part 6: Q131 - Q146 */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e1b4b', marginBottom: '6px' }}>
            Part 6 (16 câu)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
            {Array.from({ length: 16 }, (_, i) => i + 131).map((num) => {
              const passIdx = Math.floor((num - 131) / 4);
              const blankIdx = (num - 131) % 4;
              const pass = part6List[passIdx];
              const qId = pass?.blanks?.[blankIdx]?.id || `p6-q-${num}`;
              const isDone = p6Answers[qId] !== undefined;
              const isCur = activeSkill === 'reading' && readingPart === 'part6' && p6Index === passIdx;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setActiveSkill('reading');
                    setReadingPart('part6');
                    setP6Index(passIdx);
                  }}
                  style={{
                    padding: '7px 0',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: isCur ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                    background: isDone ? '#4f46e5' : isCur ? '#eef2ff' : '#ffffff',
                    color: isDone ? '#ffffff' : isCur ? '#4f46e5' : '#334155'
                  }}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Part 7: Q147 - Q200 */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e1b4b', marginBottom: '6px' }}>
            Part 7 (54 câu)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
            {Array.from({ length: 54 }, (_, i) => i + 147).map((num) => {
              const passIdx = Math.min(Math.floor((num - 147) / 4), part7List.length - 1);
              const pass = part7List[passIdx];
              const qSubIdx = (num - 147) % 4;
              const qId = pass?.questions?.[qSubIdx]?.id || `p7-q-${num}`;
              const isDone = p7Answers[qId] !== undefined;
              const isCur = activeSkill === 'reading' && readingPart === 'part7' && p7Index === passIdx;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setActiveSkill('reading');
                    setReadingPart('part7');
                    setP7Index(passIdx);
                  }}
                  style={{
                    padding: '7px 0',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: isCur ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                    background: isDone ? '#4f46e5' : isCur ? '#eef2ff' : '#ffffff',
                    color: isDone ? '#ffffff' : isCur ? '#4f46e5' : '#334155'
                  }}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // 1. If in CATALOG mode -> Render STUDY4-style Grid
  if (viewMode === 'catalog') {
    return (
      <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto' }}>
        <ToeicCatalogView
          catalogTests={TOEIC_CATALOG_TESTS}
          testHistory={testHistory}
          onSelectTest={handleSelectCatalogTest}
          activeTab={catalogTab}
          setActiveTab={setCatalogTab}
          onOpenVocab600={() => {
            setViewMode('exam');
            setActiveSkill('vocab600');
          }}
        />
      </div>
    );
  }

  // 2. If in EXAM mode -> Render Exam Environment with Pace Countdown Timers
  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* EXAM TITLE & EXIT (AUTHENTIC STUDY4) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '4px 0 10px 0'
        }}
      >
        <h2 style={{ fontSize: '1.28rem', fontWeight: 900, color: '#1e293b', margin: 0, letterSpacing: '-0.01em' }}>
          {activeCatalogTest.title}
        </h2>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Bạn có chắc muốn thoát bài thi hiện tại và quay về danh sách bộ đề?')) {
              ttsService.stop();
              if (examAudioRef.current) examAudioRef.current.pause();
              setIsExamTimerRunning(false);
              setViewMode('catalog');
            }
          }}
          style={{
            padding: '4px 14px',
            borderRadius: '8px',
            border: '1.5px solid #cbd5e1',
            background: '#ffffff',
            color: '#475569',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Thoát
        </button>
      </div>

      {/* 2. PRIMARY SKILL NAVIGATION BAR */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          background: '#ffffff',
          padding: '8px',
          borderRadius: '18px',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          overflowX: 'auto'
        }}
      >
        {(() => {
          if (viewMode === 'exam') {
            if (activeCatalogTest?.category === 'LR') {
              return [
                { id: 'listening', label: '🎧 Nghe (Listening) • 45 phút', desc: 'Part 1 • 2 • 3 • 4 (Đúng 100 câu)' },
                { id: 'reading', label: '📖 Đọc (Reading) • 75 phút', desc: 'Part 5 • 6 • 7 (Đúng 100 câu)' }
              ];
            }
            if (activeCatalogTest?.category === 'SW') {
              return [
                { id: 'speaking', label: '🗣️ Nói (Speaking) • 20 phút', desc: 'Part 1 – 5 (Đúng 11 câu hỏi)' },
                { id: 'writing', label: '✍️ Viết (Writing) • 60 phút', desc: 'Part 1 – 3 (Đúng 8 câu hỏi)' }
              ];
            }
          }
          return [
            { id: 'listening', label: '🎧 Nghe (Listening)', desc: 'Part 1 • 2 • 3 • 4' },
            { id: 'reading', label: '📖 Đọc (Reading)', desc: 'Part 5 • 6 • 7' },
            { id: 'speaking', label: '🗣️ Nói (Speaking)', desc: 'Q1 – Q11 Phản xạ' },
            { id: 'writing', label: '✍️ Viết (Writing)', desc: 'Q1 – Q8 Thư & Luận' },
            { id: 'mock', label: '🏆 Thi Thử 4 Kỹ Năng', desc: 'Mini Mock Test' },
            { id: 'vocab600', label: '📚 600 Từ Vựng Cốt Lõi', desc: '10 Chủ đề ETS thông dụng' }
          ];
        })().map((tab) => {
          const isActive = activeSkill === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSkill(tab.id)}
              style={{
                flex: 1,
                minWidth: '150px',
                padding: '12px 16px',
                borderRadius: '14px',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-main)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 4px 14px rgba(79, 70, 229, 0.3)' : 'none'
              }}
            >
              <span style={{ fontSize: '0.92rem', fontWeight: 800 }}>{tab.label}</span>
              <span style={{ fontSize: '0.74rem', opacity: isActive ? 0.9 : 0.6, fontWeight: 500 }}>{tab.desc}</span>
            </button>
          );
        })}
      </div>

      {/* 3. FAST 7-PARTS BAR & AUDIO BAR (STUDY4 ETS AUTHENTIC) */}
      {isLRExam && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: '#ffffff',
            padding: '16px 20px',
            borderRadius: '16px',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
        >
          {/* Row 1: Study4 Highlight Content Toggle & Audio Input Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.86rem', fontWeight: 700, color: '#312e81', background: '#eef2ff', padding: '6px 14px', borderRadius: '10px' }}>
              <input
                type="checkbox"
                checked={showTranscript}
                onChange={(e) => setShowTranscript(e.target.checked)}
                style={{ accentColor: '#4f46e5', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span>Highlight nội dung (Hiện lời thoại / Transcript)</span>
            </label>

            <button
              type="button"
              onClick={() => setShowAudioInput(!showAudioInput)}
              style={{
                background: customAudioUrl ? '#ecfdf5' : '#f8fafc',
                color: customAudioUrl ? '#059669' : '#64748b',
                border: customAudioUrl ? '1.5px solid #10b981' : '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '5px 12px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Tùy chọn tải file MP3 bài nghe hoặc dán link online"
            >
              {customAudioFileName ? `🎵 ${customAudioFileName.slice(0, 18)}...` : (customAudioUrl ? '🎵 MP3 Gốc Đang Dùng' : '🎵 Tải file MP3 / Đổi nguồn')}
            </button>
          </div>

          {/* Row 1b: Custom Audio Input (Local File or URL) */}
          {showAudioInput && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="file"
                  ref={localAudioFileInputRef}
                  accept="audio/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setCustomAudioUrl(url);
                      setCustomAudioFileName(file.name);
                      setShowAudioInput(false);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => localAudioFileInputRef.current?.click()}
                  style={{
                    padding: '8px 16px',
                    background: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  📁 Chọn file MP3 từ máy tính
                </button>

                <div style={{ display: 'flex', flex: 1, gap: '6px', minWidth: '240px' }}>
                  <input
                    type="text"
                    placeholder="Hoặc dán trực tiếp link file audio MP3..."
                    value={customAudioUrl}
                    onChange={(e) => {
                      setCustomAudioUrl(e.target.value);
                      if (e.target.value) {
                        setCustomAudioFileName('Link MP3 Trực Tiếp');
                      }
                    }}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAudioInput(false)}
                    style={{ padding: '8px 14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Xong
                  </button>
                </div>
              </div>

              {customAudioFileName && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#047857', background: '#ecfdf5', padding: '6px 12px', borderRadius: '6px' }}>
                  <span>🎧 Đang phát file riêng: <strong>{customAudioFileName}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomAudioUrl('');
                      setCustomAudioFileName('');
                    }}
                    style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                  >
                    Dùng lại audio chuẩn mặc định
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Row 2: Study4 Audio Player Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#f8fafc', padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={() => {
                if (!examAudioRef.current) return;
                if (isExamAudioPlaying) {
                  examAudioRef.current.pause();
                } else {
                  examAudioRef.current.play().then(() => {
                    setIsExamAudioPlaying(true);
                  }).catch((err) => {
                    console.error("Audio playback error:", err);
                    setIsExamAudioPlaying(false);
                  });
                }
              }}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#1e293b',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
              title={isExamAudioPlaying ? 'Tạm dừng' : 'Phát audio'}
            >
              {isExamAudioPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
            </button>

            {/* Audio Track Scrubber */}
            <input
              type="range"
              min="0"
              max={audioDuration || 100}
              value={audioCurrentTime}
              onChange={(e) => {
                const val = Number(e.target.value);
                setAudioCurrentTime(val);
                if (examAudioRef.current) {
                  examAudioRef.current.currentTime = val;
                }
              }}
              style={{ flex: 1, accentColor: '#3b82f6', cursor: 'pointer' }}
            />

            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#64748b', minWidth: '45px', fontFamily: 'monospace' }}>
              {Math.floor(audioCurrentTime / 60).toString().padStart(2, '0')}:{Math.floor(audioCurrentTime % 60).toString().padStart(2, '0')}
            </span>

            {/* Volume Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Volume2 size={16} color="#64748b" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioVolume}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setAudioVolume(v);
                  if (examAudioRef.current) {
                    examAudioRef.current.volume = v;
                  }
                }}
                style={{ width: '70px', accentColor: '#3b82f6', cursor: 'pointer' }}
              />
            </div>

            {/* Native audio element ALWAYS mounted and connected */}
            <audio
              ref={examAudioRef}
              src={activeAudioTrack}
              preload="auto"
              onLoadedMetadata={() => {
                if (examAudioRef.current && examAudioRef.current.duration) {
                  setAudioDuration(examAudioRef.current.duration);
                }
              }}
              onError={(e) => {
                console.warn("Audio loading error for:", activeAudioTrack);
                const fb = '/exams/toeic-lr-c1-t1/audio/full.mp3';
                if (e.target.src !== fb) {
                  e.target.src = fb;
                  e.target.load();
                }
              }}
              onTimeUpdate={() => {
                if (examAudioRef.current) {
                  setAudioCurrentTime(examAudioRef.current.currentTime);
                  if (examAudioRef.current.duration && !isNaN(examAudioRef.current.duration)) {
                    setAudioDuration(examAudioRef.current.duration);
                  }
                }
              }}
              onPlay={() => setIsExamAudioPlaying(true)}
              onPause={() => setIsExamAudioPlaying(false)}
              onEnded={() => {
                setIsExamAudioPlaying(false);
                setAudioCurrentTime(0);
              }}
            />
          </div>

          {/* Row 3: 7 Parts Quick Navigation Buttons (Matching Study4) */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { id: 'part1', skill: 'listening', label: 'Part 1' },
              { id: 'part2', skill: 'listening', label: 'Part 2' },
              { id: 'part3', skill: 'listening', label: 'Part 3' },
              { id: 'part4', skill: 'listening', label: 'Part 4' },
              { id: 'part5', skill: 'reading', label: 'Part 5' },
              { id: 'part6', skill: 'reading', label: 'Part 6' },
              { id: 'part7', skill: 'reading', label: 'Part 7' }
            ].map((p) => {
              const isCurrent = (p.skill === 'listening' && activeSkill === 'listening' && listeningPart === p.id) ||
                                (p.skill === 'reading' && activeSkill === 'reading' && readingPart === p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setActiveSkill(p.skill);
                    if (p.skill === 'listening') setListeningPart(p.id);
                    else setReadingPart(p.id);
                  }}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '10px',
                    border: isCurrent ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                    background: isCurrent ? '#4f46e5' : '#f8fafc',
                    color: isCurrent ? '#ffffff' : '#334155',
                    fontWeight: 800,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. MAIN EXAM TWO-COLUMN GRID: CONTENT (LEFT) + QUESTION PALETTE (RIGHT) */}
      <div style={{ display: 'grid', gridTemplateColumns: isLRExam ? 'minmax(0, 1fr) 280px' : '1fr', gap: '24px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {activeSkill === 'listening' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Sub-Tabs for Listening Parts */}
          <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            {[
              { id: 'part1', label: 'Part 1: Mô Tả Tranh (Photos)' },
              { id: 'part2', label: 'Part 2: Hỏi - Đáp (Question - Response)' },
              { id: 'part3', label: 'Part 3: Đoạn Hội Thoại (Conversations)' },
              { id: 'part4', label: 'Part 4: Bài Nói Ngắn (Short Talks)' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setListeningPart(p.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: listeningPart === p.id ? '#eef2ff' : 'transparent',
                  color: listeningPart === p.id ? '#4f46e5' : 'var(--text-secondary)'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* PART 1: PHOTOGRAPHS */}
          {listeningPart === 'part1' && (
            <div className="card" style={{ padding: '28px 32px', background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-medium)' }}>
              {(() => {
                const photo = part1List[p1Index] || part1List[0];
                if (!photo) return <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Không có tranh trong phần này.</div>;
                const selected = p1Answers[photo.id];
                const isAnswered = selected !== undefined;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--primary)', background: '#eef2ff', padding: '4px 12px', borderRadius: '8px' }}>
                        Tranh {p1Index + 1} / {part1List.length}{isExamSubmitted ? `: ${photo.sceneType}` : ''}
                      </span>
                    </div>

                    {/* REAL PHOTOGRAPH DISPLAY - CLEAN ETS & STUDY4 AUTHENTIC */}
                    <div
                      style={{
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                        background: '#f8fafc',
                        border: '1px solid var(--border-medium)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '8px'
                      }}
                    >
                      <img
                        src={photo.imageUrl}
                        alt={`TOEIC Part 1 Question ${p1Index + 1}`}
                        onError={(e) => {
                          if (photo.fallbackUrl && e.target.src !== photo.fallbackUrl) {
                            e.target.src = photo.fallbackUrl;
                          }
                        }}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '440px',
                          objectFit: 'contain',
                          borderRadius: '10px',
                          display: 'block'
                        }}
                      />
                    </div>

                    {/* Study4 Authentic 'Hiện Transcript' Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setShowTranscript((prev) => !prev)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '4px 0',
                          color: '#2563eb',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>{shouldShowTranscript ? 'Ẩn Transcript' : 'Hiện Transcript'}</span>
                        <span style={{ fontSize: '0.75rem' }}>{shouldShowTranscript ? '▲' : '▼'}</span>
                      </button>
                    </div>

                    {/* Study4 Authentic Question Number & Audio Trigger */}
                    {/* Part 1 Header: Study4 Authentic style */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0 12px', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#312e81' }}>
                        Part 1: Mô Tả Tranh (Câu {p1Index + 1} / {part1List.length})
                      </span>
                      {isExamSubmitted && (
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '4px 10px', borderRadius: '8px' }}>
                          ✓ Đang ở chế độ xem lời giải
                        </span>
                      )}
                    </div>

                    {/* Question Number Badge & 4 Options */}
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginTop: '12px' }}>
                      {/* Question Circle Badge matching Study4 */}
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: selected ? '#dbeafe' : '#f1f5f9',
                          color: selected ? '#1d4ed8' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          fontWeight: 900,
                          flexShrink: 0
                        }}
                      >
                        {p1Index + 1}
                      </div>

                      {/* 4 Statements A, B, C, D */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                        {photo.statements.map((stmt) => {
                          const isCorrect = stmt.key === photo.correctKey;
                          const isChosen = selected === stmt.key;

                          let bg = '#ffffff';
                          let border = isChosen ? '2px solid #2563eb' : '1.5px solid #e2e8f0';
                          let textColor = isChosen ? '#1d4ed8' : 'var(--text-main)';

                          if (isExamSubmitted) {
                            if (isCorrect) {
                              bg = '#f0fdf4';
                              border = '2px solid #22c55e';
                              textColor = '#15803d';
                            } else if (isChosen) {
                              bg = '#fef2f2';
                              border = '2px solid #ef4444';
                              textColor = '#b91c1c';
                            }
                          } else if (isChosen) {
                            bg = '#eff6ff';
                          }

                          return (
                            <div
                              key={stmt.key}
                              style={{
                                padding: '12px 18px',
                                borderRadius: '12px',
                                background: bg,
                                border,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                cursor: isExamSubmitted ? 'default' : 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              onClick={() => {
                                if (!isExamSubmitted) {
                                  setP1Answers((prev) => ({ ...prev, [photo.id]: stmt.key }));
                                }
                              }}
                            >
                              {/* Round Radio Indicator matching Study4 */}
                              <div
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  border: isChosen ? '6px solid #2563eb' : '2px solid #cbd5e1',
                                  background: '#ffffff',
                                  flexShrink: 0,
                                  transition: 'all 0.15s ease'
                                }}
                              />

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '0.96rem', fontWeight: 700, color: textColor }}>
                                  {stmt.key}. {shouldShowTranscript ? stmt.text : ''}
                                </span>
                                {shouldShowTranscript && stmt.textVi && (
                                  <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                                    → {stmt.textVi}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Explanation & Trap Alert (ONLY visible if isExamSubmitted) */}
                    {isExamSubmitted && (
                      <div style={{ padding: '18px 22px', borderRadius: '14px', background: '#f8fafc', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4f46e5', fontWeight: 800, fontSize: '0.92rem' }}>
                          <Lightbulb size={18} /> Phân Tích & Mẹo Giải Part 1 (Câu {p1Index + 1})
                        </div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                          {photo.explanation}
                        </div>
                        <div style={{ fontSize: '0.84rem', color: '#b45309', background: '#fffbeb', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <AlertTriangle size={16} /> {photo.trapAlert}
                        </div>

                        {/* Vocabulary Save */}
                        {photo.keyVocab && photo.keyVocab.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)' }}>Từ vựng trọng tâm:</span>
                            {photo.keyVocab.map((kv, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSaveToNotebook(kv)}
                                className="btn-outline"
                                style={{ padding: '4px 10px', fontSize: '0.78rem', borderRadius: '8px' }}
                              >
                                + Lưu "{kv.word}"
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                      <button
                        type="button"
                        disabled={p1Index === 0}
                        onClick={() => setP1Index((p) => p - 1)}
                        className="btn-secondary"
                        style={{ opacity: p1Index === 0 ? 0.5 : 1 }}
                      >
                        ← Câu Trước
                      </button>
                      <button
                        type="button"
                        disabled={p1Index === part1List.length - 1}
                        onClick={() => setP1Index((p) => p + 1)}
                        className="btn-primary"
                        style={{ opacity: p1Index === part1List.length - 1 ? 0.5 : 1 }}
                      >
                        Câu Tiếp Theo →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* PART 2: QUESTION - RESPONSE (STUDY4 CONTINUOUS LIST Q7 - Q31) */}
          {listeningPart === 'part2' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '14px 20px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e1b4b' }}>
                  Part 2: Hỏi - Đáp (Question - Response) • Câu 7 đến 31 (25 câu hỏi, chỉ gồm 3 đáp án A, B, C)
                </span>
                <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                  {showTranscript ? '👀 Đang mở lời thoại transcript' : '🎧 Nghe audio và chọn đáp án A, B, C'}
                </span>
              </div>

              {part2List.map((item, idx) => {
                const qNum = idx + 7;
                const selected = p2Answers[item.id];
                const isCorrect = selected === item.correctIndex;

                return (
                  <div
                    key={item.id}
                    id={`p2-q-${qNum}`}
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      padding: '16px 20px',
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'flex-start',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                    }}
                  >
                    {/* Study4 Question Circle Badge */}
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: selected !== undefined ? '#dbeafe' : '#f1f5f9',
                        color: selected !== undefined ? '#1d4ed8' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.96rem',
                        fontWeight: 900,
                        flexShrink: 0
                      }}
                    >
                      {qNum}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                      {/* Question text ONLY if shouldShowTranscript */}
                      {shouldShowTranscript && (
                        <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #3b82f6', marginBottom: '2px' }}>
                          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem' }}>
                            {item.questionText}
                          </div>
                          <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '2px' }}>
                            → {item.questionVi}
                          </div>
                        </div>
                      )}

                      {/* 3 Radio Options: A, B, C (Study4 Authentic format) */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {['A', 'B', 'C'].map((letter, oIdx) => {
                          const isChosen = selected === oIdx;
                          const isOptCorrect = oIdx === item.correctIndex;
                          const optText = item.options[oIdx] ? item.options[oIdx].replace(/^\([A-C]\)\s*/, '') : '';
                          const optVi = item.optionsVi ? item.optionsVi[oIdx] : '';

                          let border = isChosen ? '2px solid #2563eb' : '1px solid #cbd5e1';
                          let bg = isChosen ? '#eff6ff' : '#ffffff';
                          let textColor = isChosen ? '#1d4ed8' : '#1e293b';

                          if (isExamSubmitted) {
                            if (isOptCorrect) {
                              border = '2px solid #16a34a';
                              bg = '#f0fdf4';
                              textColor = '#15803d';
                            } else if (isChosen) {
                              border = '2px solid #dc2626';
                              bg = '#fef2f2';
                              textColor = '#b91c1c';
                            }
                          }

                          return (
                            <div
                              key={letter}
                              onClick={() => {
                                if (!isExamSubmitted) {
                                  setP2Answers((prev) => ({ ...prev, [item.id]: oIdx }));
                                }
                              }}
                              style={{
                                padding: '8px 14px',
                                borderRadius: '10px',
                                border,
                                background: bg,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: isExamSubmitted ? 'default' : 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <div
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  border: isChosen ? '6px solid #2563eb' : '2px solid #cbd5e1',
                                  background: '#ffffff',
                                  flexShrink: 0
                                }}
                              />

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: textColor }}>
                                  {letter}. {shouldShowTranscript ? optText : ''}
                                </span>
                                {shouldShowTranscript && optVi && (
                                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                    → {optVi}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation & Trap Alert ONLY when isExamSubmitted */}
                      {isExamSubmitted && (
                        <div style={{ marginTop: '8px', padding: '10px 14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '0.84rem', color: '#15803d', fontWeight: 700 }}>
                            ✓ Đáp án đúng: {['A', 'B', 'C'][item.correctIndex]}
                          </div>
                          {item.explanation && (
                            <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>
                              {item.explanation}
                            </div>
                          )}
                          {item.trapAlert && (
                            <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '4px', fontStyle: 'italic' }}>
                              ⚠️ {item.trapAlert}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PART 3: CONVERSATIONS */}
          {listeningPart === 'part3' && (
            <div className="card" style={{ padding: '28px 32px', background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-medium)' }}>
              {(() => {
                const convo = part3List[p3Index] || part3List[0];
                if (!convo) return <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Không có hội thoại Part 3 trong bộ đề này.</div>;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#8b5cf6', background: '#f5f3ff', padding: '4px 10px', borderRadius: '8px' }}>
                        Part 3: Đoạn Hội Thoại (Đoạn {p3Index + 1}/{part3List.length}) • {convo.scenario}
                      </span>
                      {isExamSubmitted && (
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '4px 10px', borderRadius: '8px' }}>
                          ✓ Đang ở chế độ xem lời giải
                        </span>
                      )}
                    </div>

                    {/* Audio Script (ONLY shown when shouldShowTranscript is true) */}
                    {shouldShowTranscript && (
                      <div style={{ padding: '20px 24px', borderRadius: '16px', background: '#f8fafc', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                          📜 Lời Thoại Audio Script Hội Thoại:
                        </div>
                        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
                          {convo.audioScript}
                        </pre>
                      </div>
                    )}

                    {/* Graphic Image for Graphic Questions (Q62-70) */}
                    {convo.imageUrl && (
                      <div style={{ display: 'flex', justifyContent: 'center', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                        <img
                          src={convo.imageUrl}
                          alt="Graphic reference"
                          style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain', borderRadius: '8px' }}
                        />
                      </div>
                    )}

                    {/* 3 Comprehension Questions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      <div style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        3 Câu Hỏi Đọc Hiểu Theo Đoạn:
                      </div>
                      {convo.questions.map((q, qIdx) => {
                        const qKey = q.id || `p3-q-${q.qNum || (convo.startQ + qIdx)}`;
                        const selectedAns = p3Answers[qKey];
                        return (
                          <div key={qIdx} style={{ padding: '16px 20px', borderRadius: '14px', background: '#ffffff', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                              {q.question}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
                              {q.options.map((opt, oIdx) => {
                                const isCorrect = q.correctIndex !== undefined ? oIdx === q.correctIndex : (q.correctIdx !== undefined ? oIdx === q.correctIdx : ['A','B','C','D'][oIdx] === q.correctKey);
                                const isChosen = selectedAns === oIdx;
                                let border = isChosen ? '2px solid #2563eb' : '1px solid var(--border-subtle)';
                                let bg = isChosen ? '#eff6ff' : '#fafafa';
                                let textColor = isChosen ? '#1d4ed8' : 'var(--text-main)';

                                if (isExamSubmitted) {
                                  if (isCorrect) {
                                    bg = '#f0fdf4';
                                    border = '2px solid #22c55e';
                                    textColor = '#15803d';
                                  } else if (isChosen) {
                                    bg = '#fef2f2';
                                    border = '2px solid #ef4444';
                                    textColor = '#b91c1c';
                                  }
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() => {
                                      if (!isExamSubmitted) {
                                        setP3Answers((prev) => ({ ...prev, [qKey]: oIdx }));
                                      }
                                    }}
                                    style={{
                                      padding: '10px 14px',
                                      borderRadius: '10px',
                                      background: bg,
                                      border,
                                      color: textColor,
                                      fontWeight: isChosen ? 700 : 500,
                                      fontSize: '0.86rem',
                                      textAlign: 'left',
                                      cursor: isExamSubmitted ? 'default' : 'pointer',
                                      transition: 'all 0.15s ease'
                                    }}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                            {isExamSubmitted && (
                              <div style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600, background: '#f0fdf4', padding: '6px 12px', borderRadius: '8px' }}>
                                ✓ Giải thích: {q.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Navigation for Part 3 (13 Conversations: Q32 - Q70) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '8px' }}>
                      <button
                        type="button"
                        disabled={p3Index === 0}
                        onClick={() => setP3Index((p) => p - 1)}
                        className="btn-secondary"
                        style={{ opacity: p3Index === 0 ? 0.5 : 1 }}
                      >
                        ← Đoạn Hội Thoại Trước
                      </button>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {part3List.map((c, idx) => (
                          <button
                            key={c.id || idx}
                            type="button"
                            onClick={() => setP3Index(idx)}
                            style={{
                              padding: '5px 11px',
                              borderRadius: '8px',
                              border: 'none',
                              background: idx === p3Index ? '#8b5cf6' : '#f3f4f6',
                              color: idx === p3Index ? '#ffffff' : 'var(--text-secondary)',
                              fontWeight: 800,
                              fontSize: '0.78rem',
                              cursor: 'pointer'
                            }}
                          >
                            Đoạn {idx + 1}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        disabled={p3Index === part3List.length - 1}
                        onClick={() => setP3Index((p) => p + 1)}
                        className="btn-primary"
                        style={{ opacity: p3Index === part3List.length - 1 ? 0.5 : 1 }}
                      >
                        Đoạn Tiếp Theo →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* PART 4: TALKS */}
          {listeningPart === 'part4' && (
            <div className="card" style={{ padding: '28px 32px', background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-medium)' }}>
              {(() => {
                const talk = part4List[p4Index] || part4List[0];
                if (!talk) return <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Không có bài nói Part 4 trong bộ đề này.</div>;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f59e0b', background: '#fffbeb', padding: '4px 10px', borderRadius: '8px' }}>
                        Part 4: Bài Nói Độc Thoại (Bài {p4Index + 1}/{part4List.length}) • {talk.scenario}
                      </span>
                      {isExamSubmitted && (
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '4px 10px', borderRadius: '8px' }}>
                          ✓ Đang ở chế độ xem lời giải
                        </span>
                      )}
                    </div>

                    {/* Broadcast Script (ONLY shown when shouldShowTranscript is true) */}
                    {shouldShowTranscript && (
                      <div style={{ padding: '20px 24px', borderRadius: '16px', background: '#f8fafc', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                          📢 Lời Thoại Broadcast Script:
                        </div>
                        <div style={{ fontSize: '0.94rem', color: 'var(--text-main)', lineHeight: 1.6, fontWeight: 500 }}>
                          "{talk.audioScript}"
                        </div>
                      </div>
                    )}

                    {/* Graphic Image for Graphic Questions (Q95-100) */}
                    {talk.imageUrl && (
                      <div style={{ display: 'flex', justifyContent: 'center', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                        <img
                          src={talk.imageUrl}
                          alt="Graphic reference"
                          style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain', borderRadius: '8px' }}
                        />
                      </div>
                    )}

                    {/* Questions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      {talk.questions.map((q, qIdx) => {
                        const qKey = q.id || `p4-q-${q.qNum || (talk.startQ + qIdx)}`;
                        const selectedAns = p4Answers[qKey];
                        return (
                          <div key={qIdx} style={{ padding: '16px 20px', borderRadius: '14px', background: '#ffffff', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                              {q.question}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
                              {q.options.map((opt, oIdx) => {
                                const isCorrect = q.correctIndex !== undefined ? oIdx === q.correctIndex : (q.correctIdx !== undefined ? oIdx === q.correctIdx : ['A','B','C','D'][oIdx] === q.correctKey);
                                const isChosen = selectedAns === oIdx;
                                let border = isChosen ? '2px solid #2563eb' : '1px solid var(--border-subtle)';
                                let bg = isChosen ? '#eff6ff' : '#fafafa';
                                let textColor = isChosen ? '#1d4ed8' : 'var(--text-main)';

                                if (isExamSubmitted) {
                                  if (isCorrect) {
                                    bg = '#f0fdf4';
                                    border = '2px solid #22c55e';
                                    textColor = '#15803d';
                                  } else if (isChosen) {
                                    bg = '#fef2f2';
                                    border = '2px solid #ef4444';
                                    textColor = '#b91c1c';
                                  }
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() => {
                                      if (!isExamSubmitted) {
                                        setP4Answers((prev) => ({ ...prev, [qKey]: oIdx }));
                                      }
                                    }}
                                    style={{
                                      padding: '10px 14px',
                                      borderRadius: '10px',
                                      background: bg,
                                      border,
                                      color: textColor,
                                      fontWeight: isChosen ? 700 : 500,
                                      fontSize: '0.86rem',
                                      textAlign: 'left',
                                      cursor: isExamSubmitted ? 'default' : 'pointer',
                                      transition: 'all 0.15s ease'
                                    }}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                            {isExamSubmitted && (
                              <div style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600, background: '#f0fdf4', padding: '6px 12px', borderRadius: '8px' }}>
                                ✓ Giải thích: {q.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Navigation for Part 4 (10 Talks: Q71 - Q100) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '8px' }}>
                      <button
                        type="button"
                        disabled={p4Index === 0}
                        onClick={() => setP4Index((p) => p - 1)}
                        className="btn-secondary"
                        style={{ opacity: p4Index === 0 ? 0.5 : 1 }}
                      >
                        ← Bài Nói Trước
                      </button>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {part4List.map((t, idx) => (
                          <button
                            key={t.id || idx}
                            type="button"
                            onClick={() => setP4Index(idx)}
                            style={{
                              padding: '5px 11px',
                              borderRadius: '8px',
                              border: 'none',
                              background: idx === p4Index ? '#f59e0b' : '#f3f4f6',
                              color: idx === p4Index ? '#ffffff' : 'var(--text-secondary)',
                              fontWeight: 800,
                              fontSize: '0.78rem',
                              cursor: 'pointer'
                            }}
                          >
                            Bài {idx + 1}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        disabled={p4Index === part4List.length - 1}
                        onClick={() => setP4Index((p) => p + 1)}
                        className="btn-primary"
                        style={{ opacity: p4Index === part4List.length - 1 ? 0.5 : 1 }}
                      >
                        Bài Tiếp Theo →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SKILL 2: READING COMPREHENSION */}
      {/* ========================================================================= */}
      {activeSkill === 'reading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Sub-Tabs for Reading Parts */}
          <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            {[
              { id: 'part5', label: 'Part 5: Điền Câu & Ngữ Pháp (Incomplete Sentences)' },
              { id: 'part6', label: 'Part 6: Điền Đoạn Văn (Text Completion)' },
              { id: 'part7', label: 'Part 7: Đọc Hiểu Văn Bản (Reading Passages)' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setReadingPart(p.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: readingPart === p.id ? '#eef2ff' : 'transparent',
                  color: readingPart === p.id ? '#4f46e5' : 'var(--text-secondary)'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* PART 5: INCOMPLETE SENTENCES */}
          {readingPart === 'part5' && (
            <div className="card" style={{ padding: '28px 32px', background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-medium)' }}>
              {(() => {
                const q = part5List[p5Index] || part5List[0];
                if (!q) return <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Không có câu hỏi Part 5 trong bộ đề này.</div>;
                const selected = p5Answers[q.id];
                const isAnswered = selected !== undefined;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary)', background: '#eef2ff', padding: '4px 10px', borderRadius: '8px' }}>
                        Câu {p5Index + 1} / {part5List.length} • {q.category} • Mục tiêu {q.difficulty}
                      </span>
                      {isExamSubmitted && (
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '4px 10px', borderRadius: '8px' }}>
                          ✓ Đang ở chế độ xem lời giải
                        </span>
                      )}
                    </div>

                    <div style={{ padding: '24px', borderRadius: '16px', background: '#f8fafc', borderLeft: '4px solid #6366f1' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.6 }}>
                        {isAnswered ? (
                          <>
                            {q.question.split('_______')[0]}
                            <span style={{
                              color: isExamSubmitted ? (selected === q.correctIndex ? '#16a34a' : '#dc2626') : '#2563eb',
                              textDecoration: 'underline',
                              fontWeight: 800,
                              margin: '0 4px'
                            }}>
                              {q.options[selected]}
                            </span>
                            {q.question.split('_______')[1]}
                          </>
                        ) : (
                          q.question
                        )}
                      </div>
                    </div>

                    {/* Options A, B, C, D */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                      {q.options.map((opt, idx) => {
                        const isCorrect = idx === q.correctIndex;
                        const isChosen = selected === idx;
                        let bg = isChosen ? '#eff6ff' : '#ffffff';
                        let border = isChosen ? '2px solid #2563eb' : '1px solid var(--border-medium)';
                        let textColor = isChosen ? '#1d4ed8' : 'var(--text-main)';

                        if (isExamSubmitted) {
                          if (isCorrect) {
                            bg = '#f0fdf4';
                            border = '2px solid #22c55e';
                            textColor = '#15803d';
                          } else if (isChosen) {
                            bg = '#fef2f2';
                            border = '2px solid #ef4444';
                            textColor = '#b91c1c';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={isExamSubmitted}
                            onClick={() => {
                              if (!isExamSubmitted) {
                                setP5Answers((prev) => ({ ...prev, [q.id]: idx }));
                              }
                            }}
                            style={{
                              padding: '16px 20px',
                              borderRadius: '12px',
                              background: bg,
                              border,
                              fontSize: '0.95rem',
                              fontWeight: 700,
                              color: textColor,
                              cursor: isExamSubmitted ? 'default' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              textAlign: 'left',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: isChosen ? '#dbeafe' : '#f1f5f9',
                              color: isChosen ? '#1d4ed8' : '#475569',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.84rem'
                            }}>
                              {['A', 'B', 'C', 'D'][idx]}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanations (ONLY visible if isExamSubmitted) */}
                    {isExamSubmitted && (
                      <div style={{ padding: '20px 24px', borderRadius: '16px', background: '#f8fafc', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4f46e5', fontWeight: 800, fontSize: '0.94rem' }}>
                          <Lightbulb size={18} /> Giải Thích Ngữ Pháp & Mẹo Thi ETS
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                          <strong>Dịch nghĩa:</strong> {q.translation}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                          <strong>Phân tích:</strong> {q.explanation}
                        </div>
                        <div style={{ fontSize: '0.84rem', color: '#b45309', background: '#fffbeb', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <AlertTriangle size={16} /> <strong>Cảnh báo bẫy:</strong> {q.trapAlert}
                        </div>

                        {/* Vocabulary Save */}
                        {q.keyVocabulary && q.keyVocabulary.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)' }}>Từ vựng câu này:</span>
                            {q.keyVocabulary.map((kv, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSaveToNotebook(kv)}
                                className="btn-outline"
                                style={{ padding: '4px 10px', fontSize: '0.78rem', borderRadius: '8px' }}
                              >
                                + Lưu "{kv.word}"
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Question Palette & Nav */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '10px' }}>
                      <button
                        type="button"
                        disabled={p5Index === 0}
                        onClick={() => setP5Index((p) => p - 1)}
                        className="btn-secondary"
                        style={{ opacity: p5Index === 0 ? 0.5 : 1 }}
                      >
                        ← Câu Trước
                      </button>

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {part5List.map((item, idx) => {
                          const ans = p5Answers[item.id];
                          const isDone = ans !== undefined;
                          const isRight = ans === item.correctIndex;
                          let bg = '#f1f5f9';
                          let color = 'var(--text-secondary)';

                          if (isExamSubmitted) {
                            if (isDone) {
                              bg = isRight ? '#22c55e' : '#ef4444';
                              color = '#ffffff';
                            }
                          } else {
                            if (isDone) {
                              bg = '#dbeafe';
                              color = '#1d4ed8';
                            }
                          }

                          if (idx === p5Index) {
                            bg = '#4f46e5';
                            color = '#ffffff';
                          }

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setP5Index(idx)}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                border: 'none',
                                background: bg,
                                color,
                                fontWeight: 800,
                                fontSize: '0.82rem',
                                cursor: 'pointer'
                              }}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        disabled={p5Index === part5List.length - 1}
                        onClick={() => setP5Index((p) => p + 1)}
                        className="btn-primary"
                        style={{ opacity: p5Index === part5List.length - 1 ? 0.5 : 1 }}
                      >
                        Câu Tiếp Theo →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* PART 6: TEXT COMPLETION */}
          {readingPart === 'part6' && (
            <div className="card" style={{ padding: '28px 32px', background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-medium)' }}>
              {(() => {
                const passage = part6List[p6Index] || part6List[0];
                if (!passage) return <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Không có bài đọc Part 6 trong bộ đề này.</div>;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: '8px' }}>
                        Part 6: {passage.title}
                      </span>
                    </div>

                    <div style={{ padding: '24px', borderRadius: '16px', background: '#f8fafc', border: '1px solid var(--border-subtle)', lineHeight: 1.8, fontSize: '0.98rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                      {passage.passageText || passage.text}
                    </div>

                    {/* 4 Blanks Selector */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Điền từ hoặc câu thích hợp vào 4 vị trí trống:
                      </div>
                      {passage.blanks.map((b) => {
                        const bKey = b.id || `p6-q-${b.qNum || b.blankIndex}`;
                        const selectedAns = p6Answers[bKey] !== undefined ? p6Answers[bKey] : p6Answers[b.blankIndex];
                        const isDone = selectedAns !== undefined;
                        return (
                          <div key={b.qNum || b.blankIndex} style={{ padding: '16px 20px', borderRadius: '14px', background: '#ffffff', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--primary)' }}>
                              Vị trí số ({b.qNum || b.blankIndex}):
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
                              {b.options.map((opt, oIdx) => {
                                const isCorrect = b.correctIndex !== undefined ? oIdx === b.correctIndex : (b.correctIdx !== undefined ? oIdx === b.correctIdx : ['A','B','C','D'][oIdx] === b.correctKey);
                                const isChosen = selectedAns === oIdx;
                                let border = isChosen ? '2px solid #2563eb' : '1px solid var(--border-subtle)';
                                let bg = isChosen ? '#eff6ff' : '#fafafa';
                                let textColor = isChosen ? '#1d4ed8' : 'var(--text-main)';

                                if (isExamSubmitted) {
                                  if (isCorrect) {
                                    bg = '#f0fdf4';
                                    border = '2px solid #22c55e';
                                    textColor = '#15803d';
                                  } else if (isChosen) {
                                    bg = '#fef2f2';
                                    border = '2px solid #ef4444';
                                    textColor = '#b91c1c';
                                  }
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() => {
                                      if (!isExamSubmitted) {
                                        setP6Answers((prev) => ({ ...prev, [bKey]: oIdx, [b.blankIndex]: oIdx }));
                                      }
                                    }}
                                    style={{
                                      padding: '10px 14px',
                                      borderRadius: '10px',
                                      background: bg,
                                      border,
                                      color: textColor,
                                      fontWeight: isChosen ? 700 : 500,
                                      fontSize: '0.86rem',
                                      textAlign: 'left',
                                      cursor: isExamSubmitted ? 'default' : 'pointer',
                                      transition: 'all 0.15s ease'
                                    }}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                            {isExamSubmitted && (
                              <div style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600, background: '#f0fdf4', padding: '6px 12px', borderRadius: '8px' }}>
                                ✓ Giải thích: {b.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Navigation for Part 6 (4 Passages: Q131 - Q146) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '8px' }}>
                      <button
                        type="button"
                        disabled={p6Index === 0}
                        onClick={() => setP6Index((p) => p - 1)}
                        className="btn-secondary"
                        style={{ opacity: p6Index === 0 ? 0.5 : 1 }}
                      >
                        ← Đoạn Văn Trước
                      </button>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {part6List.map((p, idx) => (
                          <button
                            key={p.id || idx}
                            type="button"
                            onClick={() => setP6Index(idx)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '8px',
                              border: 'none',
                              background: idx === p6Index ? '#059669' : '#f3f4f6',
                              color: idx === p6Index ? '#ffffff' : 'var(--text-secondary)',
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              cursor: 'pointer'
                            }}
                          >
                            Đoạn {idx + 1}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        disabled={p6Index === part6List.length - 1}
                        onClick={() => setP6Index((p) => p + 1)}
                        className="btn-primary"
                        style={{ opacity: p6Index === part6List.length - 1 ? 0.5 : 1 }}
                      >
                        Đoạn Tiếp Theo →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* PART 7: READING COMPREHENSION PASSAGES */}
          {readingPart === 'part7' && (
            <div className="card" style={{ padding: '28px 32px', background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-medium)' }}>
              {(() => {
                const passage = part7List[p7Index] || part7List[0];
                if (!passage) return <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Không có bài đọc Part 7 trong bộ đề này.</div>;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#d97706', background: '#fffbeb', padding: '4px 10px', borderRadius: '8px' }}>
                        Part 7: {passage.passageType || passage.type}
                      </span>
                    </div>

                    <div style={{ padding: '24px', borderRadius: '16px', background: '#f8fafc', border: '1px solid var(--border-subtle)', lineHeight: 1.7, fontSize: '0.96rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                      {passage.documentContent || passage.content}
                    </div>

                    {/* Image if available */}
                    {passage.imageUrl && (
                      <div style={{ display: 'flex', justifyContent: 'center', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                        <img
                          src={passage.imageUrl}
                          alt="Reading graphic reference"
                          style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: '8px' }}
                        />
                      </div>
                    )}

                    {/* Vietnamese Translation (shown when transcript or exam is submitted) */}
                    {shouldShowTranscript && passage.contentVi && (
                      <div style={{ padding: '20px 24px', borderRadius: '16px', background: '#f8fafc', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>
                          📜 Bản Dịch Tiếng Việt:
                        </div>
                        <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                          {passage.contentVi}
                        </div>
                      </div>
                    )}

                    {/* Comprehension Questions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Các Câu Hỏi Đọc Hiểu:
                      </div>
                      {passage.questions.map((q, qIdx) => {
                        const ansKey = q.id || `${passage.id || p7Index}-${qIdx}`;
                        const selectedAns = p7Answers[ansKey];
                        const isDone = selectedAns !== undefined;
                        return (
                          <div key={qIdx} style={{ padding: '16px 20px', borderRadius: '14px', background: '#ffffff', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-main)' }}>
                              {q.question}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
                              {q.options.map((opt, oIdx) => {
                                const isCorrect = q.correctIndex !== undefined ? oIdx === q.correctIndex : (q.correctIdx !== undefined ? oIdx === q.correctIdx : ['A','B','C','D'][oIdx] === q.correctKey);
                                const isChosen = selectedAns === oIdx;
                                let border = isChosen ? '2px solid #2563eb' : '1px solid var(--border-subtle)';
                                let bg = isChosen ? '#eff6ff' : '#fafafa';
                                let textColor = isChosen ? '#1d4ed8' : 'var(--text-main)';

                                if (isExamSubmitted) {
                                  if (isCorrect) {
                                    bg = '#f0fdf4';
                                    border = '2px solid #22c55e';
                                    textColor = '#15803d';
                                  } else if (isChosen) {
                                    bg = '#fef2f2';
                                    border = '2px solid #ef4444';
                                    textColor = '#b91c1c';
                                  }
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() => {
                                      if (!isExamSubmitted) {
                                        setP7Answers((prev) => ({ ...prev, [ansKey]: oIdx }));
                                      }
                                    }}
                                    style={{
                                      padding: '10px 14px',
                                      borderRadius: '10px',
                                      background: bg,
                                      border,
                                      color: textColor,
                                      fontWeight: isChosen ? 700 : 500,
                                      fontSize: '0.86rem',
                                      textAlign: 'left',
                                      cursor: isExamSubmitted ? 'default' : 'pointer',
                                      transition: 'all 0.15s ease'
                                    }}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                            {isExamSubmitted && (
                              <div style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 600, background: '#f0fdf4', padding: '6px 12px', borderRadius: '8px' }}>
                                ✓ Giải thích: {q.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Navigation for Part 7 Passages */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '8px' }}>
                      <button
                        type="button"
                        disabled={p7Index === 0}
                        onClick={() => setP7Index((p) => p - 1)}
                        className="btn-secondary"
                        style={{ opacity: p7Index === 0 ? 0.5 : 1 }}
                      >
                        ← Đoạn Văn Trước
                      </button>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {part7List.map((p, idx) => (
                          <button
                            key={p.id || idx}
                            type="button"
                            onClick={() => setP7Index(idx)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '8px',
                              border: 'none',
                              background: idx === p7Index ? '#d97706' : '#f3f4f6',
                              color: idx === p7Index ? '#ffffff' : 'var(--text-secondary)',
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              cursor: 'pointer'
                            }}
                          >
                            Đoạn {idx + 1}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        disabled={p7Index === part7List.length - 1}
                        onClick={() => setP7Index((p) => p + 1)}
                        className="btn-primary"
                        style={{ opacity: p7Index === part7List.length - 1 ? 0.5 : 1 }}
                      >
                        Đoạn Tiếp Theo →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SKILL 3: SPEAKING (TOEIC SW) */}
      {/* ========================================================================= */}
      {activeSkill === 'speaking' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Speaking Test Selector (Test 1 - 15) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: '#faf5ff', padding: '12px 18px', borderRadius: '16px', border: '1px solid #f3e8ff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#9333ea' }}>🎙️ ĐỀ THI:</span>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', maxWidth: '620px', paddingBottom: '2px' }}>
                {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setSpeakingTestNum(num);
                      setSpeakingTaskId('spk-1');
                      setSpeakingPhotoIdx(0);
                      setSpeakingTextIdx(0);
                      setIsModelSpeaking(false);
                      ttsService.stop();
                      setRecordedAudioUrl(null);
                      setShowSpeakingModel(false);
                    }}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      border: speakingTestNum === num ? '2px solid #9333ea' : '1px solid #e9d5ff',
                      background: speakingTestNum === num ? '#9333ea' : '#ffffff',
                      color: speakingTestNum === num ? '#ffffff' : '#7e22ce',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Test {num}
                  </button>
                ))}
              </div>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#a855f7', fontWeight: 700 }}>
              Bản gốc STUDY4 ({activeSpeakingTasks.length} phần thi)
            </span>
          </div>

          {/* Sub-Tabs for Speaking Tasks Q1 to Q11 */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', overflowX: 'auto' }}>
            {activeSpeakingTasks.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSpeakingTaskId(t.id);
                  setSpeakingPhotoIdx(0);
                  setSpeakingTextIdx(0);
                  setIsModelSpeaking(false);
                  ttsService.stop();
                  setRecordedAudioUrl(null);
                  setShowSpeakingModel(false);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: speakingTaskId === t.id ? '#faf5ff' : 'transparent',
                  color: speakingTaskId === t.id ? '#9333ea' : 'var(--text-secondary)'
                }}
              >
                {t.part}: {t.partName}
              </button>
            ))}
          </div>

          {/* Speaking Interactive Stage */}
          <div className="card" style={{ padding: '32px', background: '#ffffff', borderRadius: '24px', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#9333ea', background: '#faf5ff', padding: '4px 10px', borderRadius: '8px' }}>
                  {currentSpeakingTask.part} • {currentSpeakingTask.partName}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>
                  {currentSpeakingTask.prompt}
                </h3>
              </div>

              {/* Time Badges */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', padding: '6px 12px', borderRadius: '8px', background: '#f1f5f9', color: 'var(--text-secondary)', fontWeight: 700 }}>
                  ⏱️ Chuẩn bị: {currentSpeakingTask.prepTimeSec}s
                </span>
                {currentSpeakingTask.speakTimeSec && (
                  <span style={{ fontSize: '0.82rem', padding: '6px 12px', borderRadius: '8px', background: '#fdf2f8', color: '#db2777', fontWeight: 700 }}>
                    🎙️ Trả lời: {currentSpeakingTask.speakTimeSec}s
                  </span>
                )}
              </div>
            </div>

            {/* Task Content Details */}
            {(currentSpeakingTask.textToRead || currentSpeakingTask.texts) && (
              <div style={{ padding: '24px 28px', borderRadius: '18px', background: '#fcfaff', border: '1px solid #f3e8ff', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {currentSpeakingTask.texts && currentSpeakingTask.texts.length > 1 && (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      Chọn câu hỏi đoạn văn:
                    </span>
                    {currentSpeakingTask.texts.map((_, tIdx) => {
                      const isSelected = speakingTextIdx === tIdx;
                      return (
                        <button
                          key={tIdx}
                          type="button"
                          onClick={() => {
                            setSpeakingTextIdx(tIdx);
                            setIsModelSpeaking(false);
                            ttsService.stop();
                          }}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '10px',
                            border: isSelected ? '2px solid #9333ea' : '1px solid var(--border-medium)',
                            background: isSelected ? '#faf5ff' : '#f8fafc',
                            color: isSelected ? '#9333ea' : 'var(--text-secondary)',
                            fontWeight: 800,
                            cursor: 'pointer',
                            fontSize: '0.84rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          📄 Question {tIdx + 1}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#9333ea', textTransform: 'uppercase', marginBottom: '8px' }}>
                    📄 Đoạn văn cần đọc to ({currentSpeakingTask.texts && currentSpeakingTask.texts.length > 1 ? `Question ${speakingTextIdx + 1}` : 'Part 1'}):
                  </div>
                  <div style={{ fontSize: '1.18rem', fontWeight: 600, color: '#1e1b4b', lineHeight: 1.8, fontStyle: 'italic' }}>
                    "{(currentSpeakingTask.texts && currentSpeakingTask.texts[speakingTextIdx]) || currentSpeakingTask.textToRead}"
                  </div>
                  {currentSpeakingTask.phoneticGuide && (
                    <div style={{ fontSize: '0.84rem', color: '#7e22ce', marginTop: '12px', fontWeight: 600, background: '#faf5ff', padding: '6px 12px', borderRadius: '8px' }}>
                      💡 Phiên âm trọng tâm: {currentSpeakingTask.phoneticGuide}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Part 2: Photos for Describe a Picture */}
            {(currentSpeakingTask.photos || currentSpeakingTask.imageUrl) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {currentSpeakingTask.photos && currentSpeakingTask.photos.length > 1 && (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      Chọn câu hỏi tranh:
                    </span>
                    {currentSpeakingTask.photos.map((p, pIdx) => {
                      const isSelected = speakingPhotoIdx === pIdx;
                      return (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => {
                            setSpeakingPhotoIdx(pIdx);
                            setIsModelSpeaking(false);
                            ttsService.stop();
                          }}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '10px',
                            border: isSelected ? '2px solid #9333ea' : '1px solid var(--border-medium)',
                            background: isSelected ? '#faf5ff' : '#f8fafc',
                            color: isSelected ? '#9333ea' : 'var(--text-secondary)',
                            fontWeight: 800,
                            cursor: 'pointer',
                            fontSize: '0.84rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          📸 {p.qNum}
                        </button>
                      );
                    })}
                  </div>
                )}

                {(() => {
                  const activePhoto = currentSpeakingTask.photos
                    ? currentSpeakingTask.photos[speakingPhotoIdx] || currentSpeakingTask.photos[0]
                    : currentSpeakingTask;
                  return (
                    <div
                      style={{
                        position: 'relative',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                        background: '#0f172a',
                        border: '1px solid var(--border-medium)'
                      }}
                    >
                      <img
                        src={activePhoto.imageUrl}
                        alt="Speaking prompt"
                        onError={(e) => {
                          if (activePhoto.fallbackUrl && e.target.src !== activePhoto.fallbackUrl) {
                            e.target.src = activePhoto.fallbackUrl;
                          }
                        }}
                        style={{
                          width: '100%',
                          height: '380px',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.6) 60%, transparent 100%)',
                          padding: '20px 24px 16px',
                          color: '#ffffff',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-end',
                          backdropFilter: 'blur(2px)'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#f472b6', letterSpacing: '0.05em' }}>
                            📸 Đề Thi Speaking Chuẩn ETS • {activePhoto.qNum || 'Describe a Picture'}
                          </div>
                          <div style={{ fontSize: '0.94rem', color: '#e2e8f0', marginTop: '4px', maxWidth: '720px' }}>
                            {activePhoto.imageDescription}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Part 4: Schedule / Provided Info */}
            {(currentSpeakingTask.scheduleHtml || currentSpeakingTask.scheduleText || currentSpeakingTask.scheduleData) && (
              <div style={{ padding: '22px 26px', borderRadius: '18px', background: '#f8fafc', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#9333ea', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📅 Bảng Thông Tin / Lịch Trình (Information Provided)
                </div>
                {currentSpeakingTask.scheduleHtml ? (
                  <div
                    className="speaking-schedule-content"
                    dangerouslySetInnerHTML={{ __html: currentSpeakingTask.scheduleHtml }}
                    style={{
                      background: '#ffffff',
                      padding: '18px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-subtle)',
                      overflowX: 'auto',
                      lineHeight: 1.6,
                      fontSize: '0.92rem'
                    }}
                  />
                ) : currentSpeakingTask.scheduleData ? (
                  <>
                    <div style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {currentSpeakingTask.scheduleData.title}
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      Thời gian: {currentSpeakingTask.scheduleData.date} | Địa điểm: {currentSpeakingTask.scheduleData.location}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {currentSpeakingTask.scheduleData.sessions.map((s, idx) => (
                        <div key={idx} style={{ padding: '8px 12px', borderRadius: '8px', background: '#ffffff', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                          <span style={{ fontWeight: 700, color: '#4338ca' }}>{s.time}</span>
                          <span style={{ fontWeight: 600, flex: 1, margin: '0 12px' }}>{s.topic}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{s.speaker}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.92rem', color: 'var(--text-main)', margin: 0 }}>
                    {currentSpeakingTask.scheduleText}
                  </pre>
                )}
              </div>
            )}

            {/* Questions for Part 3 / Part 4 */}
            {currentSpeakingTask.questions && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Question selector tabs */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center' }}>Chọn câu:</span>
                  {currentSpeakingTask.questions.map((q, qIndex) => (
                    <button
                      key={qIndex}
                      type="button"
                      onClick={() => {
                        setSpeakingQIdx(qIndex);
                        ttsService.stop();
                        setIsModelSpeaking(false);
                      }}
                      style={{
                        border: 'none',
                        background: speakingQIdx === qIndex ? '#9333ea' : '#f1f5f9',
                        color: speakingQIdx === qIndex ? '#ffffff' : '#475569',
                        padding: '5px 14px',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {q.qNum || `Câu ${qIndex + 5}`}
                    </button>
                  ))}
                </div>

                {currentSpeakingTask.questions.map((q, idx) => {
                  const qDisplay = q.question?.trim() || q.qNum?.replace(/^Question\s*\d+:\s*/i, '').trim() || q.qNum;
                  const isSelected = speakingQIdx === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSpeakingQIdx(idx);
                        ttsService.stop();
                        setIsModelSpeaking(false);
                      }}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '14px',
                        background: isSelected ? '#faf5ff' : '#ffffff',
                        border: isSelected ? '2px solid #9333ea' : '1px solid #f3e8ff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: isSelected ? '#7e22ce' : '#9333ea' }}>{q.qNum}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (examAudioRef.current) {
                              examAudioRef.current.pause();
                              setIsExamAudioPlaying(false);
                            }
                            ttsService.speak(qDisplay, speechVoice);
                          }}
                          className="icon-ghost"
                          title="Nghe câu hỏi"
                        >
                          <Volume2 size={16} />
                        </button>
                      </div>
                      <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        "{qDisplay}"
                      </div>
                      {showSpeakingModel && (
                        <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#faf5ff', fontSize: '0.88rem', color: '#6b21a8', lineHeight: 1.5, borderLeft: '3px solid #9333ea' }}>
                          <strong>Bài mẫu Band 8+:</strong> {q.modelAnswer || `Speaking from my personal experience, I find this particularly convenient and practical in my daily routine. It helps me save valuable time and maintain great efficiency throughout the week.`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Speaking Voice Recorder & Player */}
            <div style={{ padding: '24px', borderRadius: '18px', background: '#f8fafc', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="btn-primary"
                    style={{ background: '#9333ea', padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 800 }}
                  >
                    <Mic size={18} /> Bắt Đầu Ghi Âm Luyện Nói
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    <Square size={18} /> Dừng Ghi Âm ({recordingSeconds}s)
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (isModelSpeaking) {
                      ttsService.stop();
                      setIsModelSpeaking(false);
                      return;
                    }
                    if (examAudioRef.current) {
                      examAudioRef.current.pause();
                      setIsExamAudioPlaying(false);
                    }
                    const text = getSpeakingModelAnswer(currentSpeakingTask, speakingPhotoIdx, speakingTextIdx, speakingQIdx);
                    if (text) {
                      setIsModelSpeaking(true);
                      ttsService.speak(text, speechVoice, () => setIsModelSpeaking(false));
                    }
                  }}
                  className={isModelSpeaking ? "btn-primary" : "btn-outline"}
                  style={{
                    padding: '12px 22px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.92rem',
                    background: isModelSpeaking ? '#0284c7' : undefined,
                    color: isModelSpeaking ? '#ffffff' : undefined,
                    borderColor: isModelSpeaking ? '#0284c7' : undefined,
                    boxShadow: isModelSpeaking ? '0 0 16px rgba(2, 132, 199, 0.4)' : undefined,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isModelSpeaking ? (
                    <>
                      <VolumeX size={18} /> Dừng Nghe Bài Mẫu
                    </>
                  ) : (
                    <>
                      <Volume2 size={18} /> Nghe Bài Mẫu Giọng Bản Xứ ({speechVoice || 'US'})
                    </>
                  )}
                </button>
              </div>

              {recordedAudioUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#16a34a' }}>✓ Đã thu âm xong:</span>
                  <audio controls src={recordedAudioUrl} style={{ height: '36px' }} />
                </div>
              )}
            </div>

            {/* Model Answer & Strategy Button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setShowSpeakingModel((prev) => !prev)}
                className="btn-secondary"
                style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 800 }}
              >
                {showSpeakingModel ? 'Ẩn Bài Mẫu & Chiến Thuật' : '💡 Xem Bài Mẫu Band 8+ & Tiêu Chí Chấm Điểm'}
              </button>
            </div>

            {/* Full Model Breakdown */}
            {showSpeakingModel && (
              <div style={{ padding: '24px 28px', borderRadius: '18px', background: '#faf5ff', border: '1px solid #e9d5ff', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#6b21a8' }}>
                    🏆 Bài Nói Mẫu Đạt Điểm Tuyệt Đối (ETS 200/200):
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (isModelSpeaking) {
                        ttsService.stop();
                        setIsModelSpeaking(false);
                        return;
                      }
                      if (examAudioRef.current) {
                        examAudioRef.current.pause();
                        setIsExamAudioPlaying(false);
                      }
                      const text = getSpeakingModelAnswer(currentSpeakingTask, speakingPhotoIdx, speakingTextIdx, speakingQIdx);
                      if (text) {
                        setIsModelSpeaking(true);
                        ttsService.speak(text, speechVoice, () => setIsModelSpeaking(false));
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #c084fc',
                      background: isModelSpeaking ? '#9333ea' : '#ffffff',
                      color: isModelSpeaking ? '#ffffff' : '#7e22ce',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {isModelSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    {isModelSpeaking ? 'Dừng phát' : 'Nghe bài mẫu'}
                  </button>
                </div>
                {(() => {
                  const sampleAnswer = getSpeakingModelAnswer(currentSpeakingTask, speakingPhotoIdx, speakingTextIdx, speakingQIdx);
                  return sampleAnswer ? (
                    <div style={{ fontSize: '0.96rem', color: '#4c1d95', lineHeight: 1.7, fontStyle: 'italic', background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #f3e8ff' }}>
                      "{sampleAnswer}"
                    </div>
                  ) : null;
                })()}
                {currentSpeakingTask.strategyTemplate && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#7e22ce' }}>Dàn ý chiến thuật 4 bước:</span>
                    {currentSpeakingTask.strategyTemplate.map((st, sIdx) => (
                      <div key={sIdx} style={{ fontSize: '0.84rem', color: '#581c87' }}>
                        • {st}
                      </div>
                    ))}
                  </div>
                )}
                {currentSpeakingTask.peelOutline && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#7e22ce' }}>Khung trả lời PEEL (Point, Explain, Example, Link):</span>
                    {currentSpeakingTask.peelOutline.map((p, pIdx) => (
                      <div key={pIdx} style={{ fontSize: '0.84rem', color: '#581c87' }}>
                        • {p}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SKILL 4: WRITING (TOEIC SW) */}
      {/* ========================================================================= */}
      {activeSkill === 'writing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Writing Test Selector (Test 1 - 15) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: '#ecfdf5', padding: '12px 18px', borderRadius: '16px', border: '1px solid #d1fae5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#059669' }}>✍️ ĐỀ THI:</span>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', maxWidth: '620px', paddingBottom: '2px' }}>
                {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setWritingTestNum(num);
                      setWritingTaskId('wrt-1');
                      setShowWritingModel(false);
                    }}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      border: writingTestNum === num ? '2px solid #059669' : '1px solid #a7f3d0',
                      background: writingTestNum === num ? '#059669' : '#ffffff',
                      color: writingTestNum === num ? '#ffffff' : '#047857',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Test {num}
                  </button>
                ))}
              </div>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>
              Bản gốc STUDY4 ({activeWritingTasks.length} phần thi • Q1 - Q8)
            </span>
          </div>

          {/* Sub-Tabs for Writing Tasks Q1 to Q8 */}
          <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', overflowX: 'auto' }}>
            {activeWritingTasks.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setWritingTaskId(t.id);
                  setShowWritingModel(false);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: writingTaskId === t.id ? '#ecfdf5' : 'transparent',
                  color: writingTaskId === t.id ? '#059669' : 'var(--text-secondary)'
                }}
              >
                {t.part}: {t.partName}
              </button>
            ))}
          </div>

          {/* Interactive Writing Stage */}
          <div className="card" style={{ padding: '32px', background: '#ffffff', borderRadius: '24px', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: '8px' }}>
                  {currentWritingTask.part} • {currentWritingTask.partName}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>
                  {currentWritingTask.prompt || (currentWritingTask.id === 'wrt-2' ? 'Respond to a Written Request (2 Emails: Q6 - Q7)' : 'Write ONE sentence based on the picture using given words.')}
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.82rem', padding: '6px 12px', borderRadius: '8px', background: '#f1f5f9', color: 'var(--text-secondary)', fontWeight: 700 }}>
                  ⏱️ Thời gian: {currentWritingTask.timeMinutes || (currentWritingTask.id === 'wrt-1' ? 8 : currentWritingTask.id === 'wrt-2' ? 20 : 30)} phút
                </span>
                <button
                  type="button"
                  onClick={() => setIsWritingTimerRunning((p) => !p)}
                  className="btn-outline"
                  style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                >
                  {isWritingTimerRunning ? `Đang đếm (${formatTime(writingTimeLeft)})` : 'Bấm Giờ Viết'}
                </button>
              </div>
            </div>

            {/* Q1-5 Sentences based on picture (Supports real STUDY4 prompts and mock tasks) */}
            {(currentWritingTask.prompts || currentWritingTask.tasks) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {(currentWritingTask.prompts || currentWritingTask.tasks).map((task, tIdx) => {
                  const draftKey = `wrt-${writingTestNum}-${currentWritingTask.id}-${tIdx}`;
                  const currentDraft = userWritingDrafts[draftKey] || '';
                  const qNum = task.qNum || `Question ${tIdx + 1}`;
                  const keywords = task.keywords || [];
                  const imageUrl = task.imageUrl;
                  return (
                    <div key={tIdx} style={{ padding: '20px 24px', borderRadius: '16px', background: '#f8fafc', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#059669' }}>📸 {qNum}</span>
                        {keywords.length > 0 && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {keywords.map((kw, kIdx) => (
                              <span key={kIdx} style={{ fontSize: '0.78rem', background: '#d1fae5', color: '#065f46', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                                🔑 {kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {imageUrl && (
                        <div
                          style={{
                            position: 'relative',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                            background: '#ffffff',
                            border: '1px solid var(--border-medium)',
                            maxHeight: '340px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '8px'
                          }}
                        >
                          <img
                            src={imageUrl}
                            alt={qNum}
                            onError={(e) => {
                              if (task.fallbackUrl && e.target.src !== task.fallbackUrl) {
                                e.target.src = task.fallbackUrl;
                              }
                            }}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '320px',
                              objectFit: 'contain',
                              display: 'block'
                            }}
                          />
                          {task.sceneDescription && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, transparent 100%)',
                                padding: '10px 16px',
                                color: '#ffffff',
                                fontSize: '0.84rem'
                              }}
                            >
                              📸 {task.sceneDescription}
                            </div>
                          )}
                        </div>
                      )}

                      <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                        {task.prompt || 'Viết 1 câu miêu tả bức tranh sử dụng 2 từ gợi ý (hai từ nằm ngay trên bức ảnh):'}
                      </div>

                      <input
                        type="text"
                        value={currentDraft}
                        onChange={(e) => setUserWritingDrafts((prev) => ({ ...prev, [draftKey]: e.target.value }))}
                        placeholder="Nhập 1 câu hoàn chỉnh có chứa 2 từ gợi ý..."
                        style={{
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-medium)',
                          fontSize: '0.95rem',
                          outline: 'none',
                          background: '#ffffff'
                        }}
                      />

                      {showWritingModel && task.modelAnswers && (
                        <div style={{ fontSize: '0.86rem', color: '#059669', background: '#ecfdf5', padding: '10px 14px', borderRadius: '8px' }}>
                          <strong>Câu mẫu đạt 3/3 điểm ETS:</strong>
                          <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                            {task.modelAnswers.map((ma, mIdx) => (
                              <li key={mIdx}>"{ma}"</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Q6-7 Email Request (Real STUDY4 Exam with 2 questions Q6 & Q7) */}
            {currentWritingTask.emails && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {currentWritingTask.emails.map((emailItem, eIdx) => {
                  const draftKey = `wrt-email-${writingTestNum}-${eIdx}`;
                  const currentDraft = userWritingDrafts[draftKey] || '';
                  const wordCount = currentDraft.trim().split(/\s+/).filter(Boolean).length;
                  return (
                    <div key={eIdx} style={{ padding: '24px', borderRadius: '18px', background: '#f8fafc', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.96rem', fontWeight: 800, color: '#059669' }}>
                          📧 {emailItem.qNum || `Question ${eIdx + 6}`}
                        </span>
                        <span style={{ fontSize: '0.78rem', background: '#ecfdf5', color: '#047857', padding: '4px 10px', borderRadius: '8px', fontWeight: 700 }}>
                          Part 2: Email Response
                        </span>
                      </div>

                      {/* Email Context Content */}
                      <div
                        style={{
                          padding: '16px 20px',
                          borderRadius: '12px',
                          background: '#ffffff',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.9rem',
                          lineHeight: 1.6,
                          color: 'var(--text-main)',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {emailItem.emailText || emailItem.directions}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                          Soạn thảo email phản hồi của bạn ({emailItem.qNum}):
                        </div>
                        <textarea
                          rows={7}
                          value={currentDraft}
                          onChange={(e) => setUserWritingDrafts((prev) => ({ ...prev, [draftKey]: e.target.value }))}
                          placeholder="Dear ...,&#10;&#10;Thank you for your email..."
                          style={{
                            padding: '14px 16px',
                            borderRadius: '12px',
                            border: '1px solid var(--border-medium)',
                            fontSize: '0.94rem',
                            lineHeight: 1.6,
                            fontFamily: 'inherit',
                            outline: 'none'
                          }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <span>Số từ: {wordCount} từ</span>
                          <span>Yêu cầu: Đọc kỹ phần Directions trong email để trả lời đầy đủ</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Q6-7 Email Request (Mock Fallback) */}
            {!currentWritingTask.emails && currentWritingTask.emailReceived && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ padding: '20px 24px', borderRadius: '16px', background: '#f8fafc', border: '1px solid var(--border-medium)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    📩 Email cần phản hồi:
                  </div>
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    <strong>Từ:</strong> {currentWritingTask.emailReceived.from} | <strong>Chủ đề:</strong> {currentWritingTask.emailReceived.subject}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.94rem', color: 'var(--text-main)', lineHeight: 1.6, marginTop: '8px' }}>
                    {currentWritingTask.emailReceived.body}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                    Soạn thảo email phản hồi của bạn:
                  </div>
                  <textarea
                    rows={8}
                    value={userWritingDrafts['email-draft'] || ''}
                    onChange={(e) => setUserWritingDrafts((prev) => ({ ...prev, 'email-draft': e.target.value }))}
                    placeholder="Dear Mr. Taylor,&#10;&#10;Thank you for contacting our customer support..."
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-medium)',
                      fontSize: '0.95rem',
                      lineHeight: 1.6,
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Số từ: {(userWritingDrafts['email-draft'] || '').trim().split(/\s+/).filter(Boolean).length} từ</span>
                    <span>Yêu cầu: Giải quyết đủ 3 nội dung trong đề bài</span>
                  </div>
                </div>

                {showWritingModel && (
                  <div style={{ padding: '20px 24px', borderRadius: '16px', background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#065f46' }}>
                      🏆 Email Mẫu Đạt Điểm Tuyệt Đối (ETS 4/4):
                    </div>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.9rem', color: '#047857', lineHeight: 1.6, margin: 0 }}>
                      {currentWritingTask.sampleBand8Email}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Q8 Opinion Essay (Supports real STUDY4 wrt-3 and mock targetWords) */}
            {(currentWritingTask.targetWords || currentWritingTask.id === 'wrt-3' || currentWritingTask.part?.includes('Part 3')) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ padding: '18px 22px', borderRadius: '14px', background: '#f8fafc', border: '1px solid var(--border-medium)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#059669', marginBottom: '6px' }}>
                    📝 Đề bài luận quan điểm:
                  </div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.6 }}>
                    {currentWritingTask.prompt || 'Write an essay in response to the question. You should state, explain, and support your opinion.'}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                      Trình soạn thảo bài luận (Target: ≥300 từ):
                    </span>
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: (userWritingDrafts[`essay-draft-${writingTestNum}`] || userWritingDrafts['essay-draft'] || '').trim().split(/\s+/).filter(Boolean).length >= 300 ? '#16a34a' : '#d97706' }}>
                      Đã viết: {(userWritingDrafts[`essay-draft-${writingTestNum}`] || userWritingDrafts['essay-draft'] || '').trim().split(/\s+/).filter(Boolean).length} / 300 từ
                    </span>
                  </div>
                  <textarea
                    rows={12}
                    value={userWritingDrafts[`essay-draft-${writingTestNum}`] || userWritingDrafts['essay-draft'] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setUserWritingDrafts((prev) => ({ ...prev, [`essay-draft-${writingTestNum}`]: val, 'essay-draft': val }));
                    }}
                    placeholder="In my opinion, ... Write your 4-paragraph opinion essay here."
                    style={{
                      padding: '18px',
                      borderRadius: '14px',
                      border: '1px solid var(--border-medium)',
                      fontSize: '0.98rem',
                      lineHeight: 1.7,
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                  />
                </div>

                {showWritingModel && currentWritingTask.sampleBand8Essay && (
                  <div style={{ padding: '24px 28px', borderRadius: '18px', background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#065f46' }}>
                      🏆 Bài Luận Mẫu Band 8+ (ETS 5/5 Điểm):
                    </div>
                    <div style={{ fontSize: '0.94rem', color: '#047857', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      {currentWritingTask.sampleBand8Essay}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Toggle Model Button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setShowWritingModel((p) => !p)}
                className="btn-secondary"
                style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 800 }}
              >
                {showWritingModel ? 'Ẩn Bài Viết Mẫu' : '💡 Xem Bài Mẫu Đạt Điểm Tuyệt Đối & Gợi Ý'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SKILL 5: THI THỬ 4 KỸ NĂNG (MINI MOCK TEST) */}
      {/* ========================================================================= */}
      {activeSkill === 'mock' && (
        <div className="card" style={{ padding: '36px', background: '#ffffff', borderRadius: '24px', border: '1px solid var(--border-medium)' }}>
          {!mockActive && !mockFinished ? (
            <div style={{ textAlign: 'center', maxWidth: '600px', margin: '40px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={36} />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)' }}>
                Thi Thử Rút Gọn TOEIC Chuẩn Quốc Tế (10 Câu)
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Đề thi mô phỏng áp lực phòng thi thật với đồng hồ đếm ngược 10 phút. Hệ thống sẽ quy đổi điểm số chính xác theo thang điểm chuẩn TOEIC ETS.
              </p>
              <button
                type="button"
                onClick={startMockTest}
                className="btn-primary"
                style={{ padding: '14px 32px', fontSize: '1rem', fontWeight: 800, borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Zap size={18} /> Bắt Đầu Làm Bài Ngay
              </button>
            </div>
          ) : mockActive && !mockFinished ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Câu {mockIndex + 1} / {mockQuestions.length}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 800, color: mockTimeLeft < 60 ? '#dc2626' : '#4f46e5', background: '#f8fafc', padding: '6px 14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                    <Clock size={16} /> {formatTime(mockTimeLeft)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMockFinished(true)}
                    className="btn-primary"
                    style={{ padding: '6px 16px', fontSize: '0.86rem' }}
                  >
                    Nộp Bài Thi
                  </button>
                </div>
              </div>

              {/* Mock Question Item */}
              {(() => {
                const q = mockQuestions[mockIndex];
                if (!q) return null;
                const chosen = mockAnswers[mockIndex];
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ padding: '24px', borderRadius: '16px', background: '#f8fafc', borderLeft: '4px solid #4f46e5', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.6 }}>
                      {q.question}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                      {q.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => setMockAnswers((prev) => ({ ...prev, [mockIndex]: oIdx }))}
                          style={{
                            padding: '16px 20px',
                            borderRadius: '12px',
                            background: chosen === oIdx ? '#eef2ff' : '#ffffff',
                            border: chosen === oIdx ? '2px solid #4f46e5' : '1px solid var(--border-medium)',
                            color: chosen === oIdx ? '#4f46e5' : 'var(--text-main)',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            textAlign: 'left'
                          }}
                        >
                          <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: chosen === oIdx ? '#4f46e5' : '#f1f5f9', color: chosen === oIdx ? '#ffffff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.84rem' }}>
                            {['A', 'B', 'C', 'D'][oIdx]}
                          </span>
                          <span>{opt}</span>
                        </button>
                      ))}
                    </div>

                    {/* Navigation Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                      <button
                        type="button"
                        disabled={mockIndex === 0}
                        onClick={() => setMockIndex((p) => p - 1)}
                        className="btn-secondary"
                        style={{ opacity: mockIndex === 0 ? 0.5 : 1 }}
                      >
                        ← Trước
                      </button>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        {mockQuestions.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setMockIndex(idx)}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: 'none',
                              background: mockAnswers[idx] !== undefined ? '#4f46e5' : idx === mockIndex ? '#e0e7ff' : '#f1f5f9',
                              color: mockAnswers[idx] !== undefined ? '#ffffff' : 'var(--text-main)',
                              fontWeight: 800,
                              fontSize: '0.82rem',
                              cursor: 'pointer'
                            }}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        disabled={mockIndex === mockQuestions.length - 1}
                        onClick={() => setMockIndex((p) => p + 1)}
                        className="btn-secondary"
                        style={{ opacity: mockIndex === mockQuestions.length - 1 ? 0.5 : 1 }}
                      >
                        Sau →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            /* Mock Result View */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={42} />
              </div>

              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)' }}>
                  Kết Quả Thi Thử Của Bạn
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Đúng {mockScore.correct} / {mockScore.total} câu ({Math.round((mockScore.correct / mockScore.total) * 100)}%)
                </p>
              </div>

              <div style={{ padding: '24px 36px', borderRadius: '20px', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: '#ffffff', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.86rem', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
                  Điểm Dự Đoán TOEIC Toàn Diện
                </span>
                <span style={{ fontSize: '3rem', fontWeight: 900, color: '#38bdf8', letterSpacing: '-0.02em' }}>
                  ~{mockScore.score}
                </span>
                <span style={{ fontSize: '0.84rem', color: '#c7d2fe' }}>
                  Thang điểm chuẩn quốc tế ETS (0 - 990)
                </span>
              </div>

              <button
                type="button"
                onClick={startMockTest}
                className="btn-primary"
                style={{ padding: '12px 28px', fontSize: '0.95rem', fontWeight: 800, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <RotateCcw size={18} /> Làm Lại Bài Thi Mới
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SKILL 6: 600 ESSENTIAL BUSINESS WORDS */}
      {/* ========================================================================= */}
      {activeSkill === 'vocab600' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Topic Filters */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['all', 'Contracts & Agreements', 'Marketing & Sales', 'Warranties & Quality', 'Business Planning', 'Conferences & Meetings', 'Finance & Accounting'].map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setSelectedWordTopic(topic)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: selectedWordTopic === topic ? '#4f46e5' : '#f1f5f9',
                  color: selectedWordTopic === topic ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                {topic === 'all' ? 'Mọi chủ đề 600 từ' : topic}
              </button>
            ))}
          </div>

          {/* Word Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '16px' }}>
            {filteredWords.map((item, idx) => {
              const isSaved = savedVocabIds.has(item.word.toLowerCase());
              return (
                <div
                  key={idx}
                  className="card"
                  style={{
                    padding: '20px 24px',
                    borderRadius: '18px',
                    background: '#ffffff',
                    border: '1px solid var(--border-medium)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', background: 'rgba(79, 70, 229, 0.08)', padding: '2px 8px', borderRadius: '6px' }}>
                        {item.partOfSpeech}
                      </span>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                        {item.word}
                      </h4>
                      <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                        {item.ipa}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => ttsService.speak(item.word, speechVoice)}
                        className="icon-ghost"
                        title="Nghe phát âm"
                      >
                        <Volume2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveToNotebook(item)}
                        className="icon-ghost"
                        title={isSaved ? 'Đã lưu trong sổ' : 'Lưu vào Sổ từ vựng'}
                        style={{ color: isSaved ? '#16a34a' : 'var(--text-muted)' }}
                      >
                        {isSaved ? <BookmarkCheck size={16} /> : <BookmarkPlus size={16} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {item.meaningVi}
                  </div>

                  {item.collocation && (
                    <div style={{ fontSize: '0.82rem', color: '#4338ca', fontWeight: 700, background: '#eef2ff', padding: '4px 10px', borderRadius: '8px', alignSelf: 'flex-start' }}>
                      • Collocation: {item.collocation}
                    </div>
                  )}

                  <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.45, background: '#f8fafc', padding: '10px 14px', borderRadius: '10px' }}>
                    "{item.exampleEn}"
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      → {item.exampleVi}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

        </div>

        {/* 5. STUDY4 QUESTION PALETTE SIDEBAR */}
        {isLRExam && renderQuestionPaletteSidebar()}
      </div>

      {/* 4. MODAL: EXAM SUBMIT RESULT & RETAKE */}
      {showExamResultModal && latestExamResult && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
          onClick={() => setShowExamResultModal(false)}
        >
          <div
            className="card"
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '560px',
              width: '100%',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <Trophy size={34} />
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#059669', background: '#d1fae5', padding: '4px 12px', borderRadius: '20px' }}>
                HOÀN THÀNH BÀI THI TOEIC
              </span>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '10px', marginBottom: '6px' }}>
                {latestExamResult.testTitle}
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
                Kết quả đã được tự động lưu vào lịch sử bài thi. Bạn có thể làm lại bài bất cứ lúc nào!
              </p>
            </div>

            {/* Score Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                color: '#ffffff',
                padding: '24px',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <span style={{ fontSize: '0.8rem', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
                Điểm Thi Ước Tính Chuẩn ETS
              </span>
              <div style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#ffffff' }}>
                {latestExamResult.score}
                <span style={{ fontSize: '1.2rem', color: '#c7d2fe', fontWeight: 600 }}>
                  {latestExamResult.category === 'LR' ? ' / 990' : ' / 400'}
                </span>
              </div>

              {latestExamResult.category === 'LR' ? (
                <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#c7d2fe' }}>🎧 Nghe (Listening)</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{latestExamResult.listeningScore} / 495</div>
                  </div>
                  <div style={{ width: '1px', background: 'rgba(255,255,255,0.15)' }} />
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#c7d2fe' }}>📖 Đọc (Reading)</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{latestExamResult.readingScore} / 495</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#c7d2fe' }}>🗣️ Nói (Speaking)</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>170 / 200</div>
                  </div>
                  <div style={{ width: '1px', background: 'rgba(255,255,255,0.15)' }} />
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#c7d2fe' }}>✍️ Viết (Writing)</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>160 / 200</div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', textAlign: 'left' }}>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-medium)' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Số câu làm đúng:</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                  {latestExamResult.correctCount} / {latestExamResult.totalQuestions} câu
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-medium)' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Thời gian hoàn thành:</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                  {formatTime(latestExamResult.timeSpentSeconds)}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowExamResultModal(false);
                  handleSelectCatalogTest(activeCatalogTest, 'retake');
                }}
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                  color: '#ffffff',
                  fontSize: '0.94rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
                }}
              >
                <RotateCcw size={16} /> Làm Lại Bài Thi Này (Retake)
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowExamResultModal(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-medium)',
                    background: '#ffffff',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Xem Lại Lời Giải Chi Tiết
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExamResultModal(false);
                    setViewMode('catalog');
                  }}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-medium)',
                    background: '#f8fafc',
                    color: '#4338ca',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Về Danh Sách Bộ Đề
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

