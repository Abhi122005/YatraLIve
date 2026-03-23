// Text-to-Speech Service
// Uses Google Translate TTS for Malayalam, Web Speech API for English

export class TTSService {
  constructor() {
    const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance;
    this.speechSynthesis = window.speechSynthesis;
    this.SpeechSynthesisUtterance = SpeechSynthesisUtterance;
    this.isSupported = !!this.speechSynthesis && !!this.SpeechSynthesisUtterance;
    this.audioQueue = [];
    this.isPlaying = false;
  }

  // Get available voices
  getVoices() {
    return this.speechSynthesis?.getVoices() || [];
  }

  // Find best voice for language
  getVoiceForLanguage(lang) {
    const voices = this.getVoices();
    const langCode = lang === 'ml' ? 'ml-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
    
    let bestVoice = voices.find(v => v.lang.startsWith(langCode));
    if (!bestVoice) {
      bestVoice = voices.find(v => v.lang.startsWith(lang)) || voices[0];
    }
    return bestVoice;
  }

  // Check if a native voice exists for the language
  hasNativeVoice(lang) {
    const voices = this.getVoices();
    const langCode = lang === 'ml' ? 'ml' : lang === 'hi' ? 'hi' : 'en';
    return voices.some(v => v.lang.toLowerCase().includes(langCode));
  }

  // Split long text into chunks for Google TTS (max ~200 chars per request)
  _splitText(text, maxLen = 200) {
    if (text.length <= maxLen) return [text];
    
    const chunks = [];
    let remaining = text;
    
    while (remaining.length > 0) {
      if (remaining.length <= maxLen) {
        chunks.push(remaining);
        break;
      }
      
      // Find a good split point (period, comma, or space)
      let splitAt = remaining.lastIndexOf('.', maxLen);
      if (splitAt < maxLen / 2) splitAt = remaining.lastIndexOf(',', maxLen);
      if (splitAt < maxLen / 2) splitAt = remaining.lastIndexOf(' ', maxLen);
      if (splitAt < 1) splitAt = maxLen;
      
      chunks.push(remaining.substring(0, splitAt + 1).trim());
      remaining = remaining.substring(splitAt + 1).trim();
    }
    
    return chunks;
  }

  // Speak using Google Translate TTS (works for Malayalam, Hindi, etc.)
  speakWithGoogleTTS(text, lang = 'ml') {
    return new Promise((resolve, reject) => {
      const langMap = { en: 'en', ml: 'ml', hi: 'hi' };
      const langCode = langMap[lang] || 'ml';
      
      const chunks = this._splitText(text);
      let chunkIndex = 0;
      
      const playNext = () => {
        if (chunkIndex >= chunks.length) {
          resolve();
          return;
        }
        
        const chunk = chunks[chunkIndex];
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${langCode}&client=tw-ob`;
        
        const audio = new Audio(url);
        audio.volume = 1;
        
        audio.onended = () => {
          chunkIndex++;
          playNext();
        };
        
        audio.onerror = (e) => {
          console.warn('Google TTS chunk failed, skipping:', e);
          chunkIndex++;
          playNext();
        };
        
        audio.play().catch((e) => {
          console.warn('Google TTS play failed:', e);
          chunkIndex++;
          playNext();
        });
      };
      
      playNext();
    });
  }

  // Speak text in specified language (auto-selects best method)
  speak(text, lang = 'en', rate = 1, pitch = 1) {
    // For Malayalam/Hindi: prefer Google Translate TTS (reliable ml-IN voice)
    if (lang === 'ml' || lang === 'hi') {
      // First check if system has a native voice
      if (this.isSupported && this.hasNativeVoice(lang)) {
        return this._speakNative(text, lang, rate, pitch);
      }
      // Use Google Translate TTS as primary method
      return this.speakWithGoogleTTS(text, lang);
    }
    
    // For English: use native Web Speech API
    if (this.isSupported) {
      return this._speakNative(text, lang, rate, pitch);
    }
    
    return this.speakWithGoogleTTS(text, lang);
  }

  // Speak using native Web Speech API
  _speakNative(text, lang = 'en', rate = 1, pitch = 1) {
    return new Promise((resolve, reject) => {
      try {
        const utterance = new this.SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'ml' ? 'ml-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = 1;

        const voice = this.getVoiceForLanguage(lang);
        if (voice) {
          utterance.voice = voice;
        }

        utterance.onend = () => resolve();
        utterance.onerror = (e) => {
          console.error('Speech synthesis error:', e);
          // Fallback to Google TTS
          this.speakWithGoogleTTS(text, lang).then(resolve).catch(reject);
        };

        this.speechSynthesis.cancel();
        this.speechSynthesis.speak(utterance);
      } catch (err) {
        this.speakWithGoogleTTS(text, lang).then(resolve).catch(reject);
      }
    });
  }

  // Speak formatted announcement text
  async speakAnnouncement(text, lang = 'ml') {
    return this.speak(text, lang, 0.9, 1);
  }

  // Stop current speech
  stop() {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }
}

// Create singleton instance
export const ttsService = new TTSService();
