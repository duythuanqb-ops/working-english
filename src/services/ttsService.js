/**
 * Natural Audio & Speech Service
 * Combines authentic native human studio MP3 pronunciation (Level 1)
 * with intelligent neural/natural voice fallback in Web Speech API (Level 2).
 */

class TTSService {
  constructor() {
    this.currentAudio = null;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];

    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  /**
   * Play crystal-clear natural pronunciation
   * @param {string} text - Word or sentence to speak
   * @param {object} options - { voiceType: 'US' | 'UK', rate: 0.8 | 1.0 | 1.2 }
   */
  speak(text, options = {}) {
    if (!text) return;
    const cleanText = text.trim();
    if (!cleanText) return;

    const { rate = 1.0, voiceType = 'US' } = options;

    // 1. Stop any currently playing audio or speech
    this.stop();

    // 2. Select authentic studio native MP3 URL
    const isSingleWord = !cleanText.includes(' ') && cleanText.length < 35;
    let audioUrl = '';

    if (isSingleWord) {
      // High-definition native dictionary human pronunciation
      // type=1: UK Oxford/Cambridge native speaker, type=2: US Merriam-Webster/Cambridge native speaker
      const typeParam = voiceType === 'UK' ? 1 : 2;
      audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&type=${typeParam}`;
    } else {
      // Natural Google Neural speech stream for sentences
      const langParam = voiceType === 'UK' ? 'en-gb' : 'en';
      audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langParam}&client=tw-ob&q=${encodeURIComponent(cleanText)}`;
    }

    try {
      const audio = new Audio(audioUrl);
      audio.playbackRate = rate;
      this.currentAudio = audio;

      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // If network error, CORS, or blocked, fallback to curated natural system voice
          console.warn('Native MP3 audio stream blocked, using enhanced natural speech fallback:', err);
          this.speakWithBestSystemVoice(cleanText, voiceType, rate);
        });
      }
    } catch (e) {
      this.speakWithBestSystemVoice(cleanText, voiceType, rate);
    }
  }

  /**
   * Fallback using Web Speech API with smart selection of natural/enhanced macOS voices
   * Strictly excluding robotic novelty voices (Albert, Fred, Zarvox, etc.)
   */
  speakWithBestSystemVoice(text, voiceType = 'US', rate = 1.0) {
    if (!this.synth) return;

    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.0;

    const targetLang = voiceType === 'UK' ? 'en-GB' : 'en-US';
    utterance.lang = targetLang;

    // Filter out robotic novelty voices on macOS
    const roboticNames = [
      'albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos',
      'deranged', 'good news', 'hysterical', 'junior', 'kathy', 'pipe organ',
      'princess', 'ralph', 'trinoids', 'whisper', 'zarvox', 'fred'
    ];

    const availableVoices = this.voices.length > 0 ? this.voices : this.synth.getVoices();

    const qualityPriority = voiceType === 'UK'
      ? ['Daniel', 'Oliver', 'Serena', 'Kate', 'Stephanie', 'Google UK English Female', 'Google UK English Male', 'en-GB']
      : ['Samantha', 'Ava', 'Allison', 'Susan', 'Zoe', 'Tom', 'Nicky', 'Aaron', 'Google US English', 'en-US'];

    let bestVoice = null;

    // Try finding by high quality priority list
    for (const name of qualityPriority) {
      bestVoice = availableVoices.find(
        (v) =>
          v.name.includes(name) &&
          !roboticNames.some((r) => v.name.toLowerCase().includes(r))
      );
      if (bestVoice) break;
    }

    // Secondary search: match target language and not robotic
    if (!bestVoice) {
      bestVoice = availableVoices.find(
        (v) =>
          (v.lang.replace('_', '-').startsWith(targetLang) || v.lang.startsWith(targetLang.slice(0, 2))) &&
          !roboticNames.some((r) => v.name.toLowerCase().includes(r))
      );
    }

    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    this.synth.speak(utterance);
  }

  stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const ttsService = new TTSService();
