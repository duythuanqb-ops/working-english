/**
 * Native Text-to-Speech (TTS) Service using Web Speech Synthesis
 */

class TTSService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.isLoaded = false;

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
    this.isLoaded = true;
  }

  speak(text, options = {}) {
    if (!this.synth || !text) return;

    // Stop current speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const { rate = 1.0, voiceType = 'US' } = options;

    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Try to match standard native voices
    const targetLang = voiceType === 'UK' ? 'en-GB' : 'en-US';
    const matchedVoice = this.voices.find(
      (v) => v.lang.replace('_', '-') === targetLang || v.lang.startsWith(targetLang)
    );

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    } else {
      utterance.lang = targetLang;
    }

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const ttsService = new TTSService();
