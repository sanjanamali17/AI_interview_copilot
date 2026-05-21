// Speech Recognition API Types
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: ((event: Event) => void) | null;
  onerror: ((event: Event) => void) | null;
  onstart: ((event: Event) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export class VoiceService {
  private recognition: any = null;
  public onInterimResult: ((transcript: string) => void) | null = null;
  private finalTranscript: string = "";
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = this.checkSupport();
    console.log('✅ VoiceService initialized, supported:', this.isSupported);
  }

  public checkSupport(): boolean {
    return !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  /**
   * Check if voice is supported (alias for compatibility)
   */
  isVoiceSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Listen for speech (alias for startListening + stopListening)
   */
  async listen(): Promise<string> {
    this.startListening();
    return this.stopListening();
  }

  /**
   * Start listening for speech - FINAL TRANSCRIPT ONLY
   */
  startListening(): void {
    if (!this.isSupported) {
      throw new Error('Speech recognition not supported. Please use Chrome, Edge, or Safari.');
    }

    try {
      // Create fresh recognition instance
      const SpeechRecognitionClass = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionClass();
      
      // CRITICAL: Use ONLY final transcript
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      this.recognition.maxAlternatives = 1;
      
      // Reset transcript
      this.finalTranscript = "";

      // Set up event handlers
      this.recognition.onstart = () => {
        console.log('🎤 Recognition started');
        this.finalTranscript = "";
      };

      this.recognition.onresult = (event: any) => {
        // ONLY final transcript - no accumulation
        if (event.results && event.results[0] && event.results[0][0]) {
          this.finalTranscript = event.results[0][0].transcript;
          console.log('📝 Final transcript captured:', this.finalTranscript);
        }
      };

      this.recognition.onend = () => {
        console.log('🔚 Recognition ended');
        console.log('📝 Final transcript:', this.finalTranscript);
        
        // Set transcript in UI
        if (this.onInterimResult) {
          this.onInterimResult(this.finalTranscript);
        }
        
        this.recognition = null;
      };

      this.recognition.onerror = (event: any) => {
        console.error('❌ Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          console.warn('🚫 Microphone permission denied');
        }
        this.recognition = null;
      };

      // Start recognition
      this.recognition.start();
    } catch (error) {
      console.error('❌ Error starting speech recognition:', error);
      this.recognition = null;
      throw new Error('Failed to start speech recognition. Please use text input instead.');
    }
  }

  /**
   * STOP RECORDING PROPERLY
   */
  stopListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        // If recognition already ended, return final transcript
        resolve(this.finalTranscript);
        return;
      }

      // Set up one-time handler for end event
      const originalOnEnd = this.recognition.onend;
      this.recognition.onend = () => {
        console.log('🛑 Recognition stopped');
        if (originalOnEnd) originalOnEnd.call(this.recognition);
        resolve(this.finalTranscript);
      };
      
      // STOP RECORDING PROPERLY
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('❌ Error stopping recognition:', error);
        reject(new Error('Failed to stop recording'));
      }
    });
  }

  /**
   * Speak text using speech synthesis
   */
  async speak(text: string): Promise<void> {
    if (!text || text.trim().length === 0) return;

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      return new Promise((resolve, reject) => {
        utterance.onend = () => resolve();
        utterance.onerror = (event) => reject(event);
        
        speechSynthesis.speak(utterance);
      });
    } catch (error) {
      console.error('❌ Error speaking text:', error);
    }
  }

  /**
   * Stop speaking
   */
  stopSpeaking(): void {
    speechSynthesis.cancel();
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.warn('⚠️ Error stopping recognition during cleanup:', error);
      }
      this.recognition = null;
    }
    this.finalTranscript = '';
    this.onInterimResult = null;
  }
}

// Export singleton instance
export const voiceService = new VoiceService();
