// Real-time Human-like Voice Interview Service
export class VoiceInterviewService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private userSpeechCallback: ((transcript: string) => void) | null = null;
  private aiSpeechCompleteCallback: (() => void) | null = null;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('❌ Speech recognition not supported');
      return;
    }

    this.recognition = new SpeechRecognition();
    
    // Configure for natural conversation
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    // Handle speech results
    this.recognition.onresult = (event: any) => {
      let finalTranscript = "";
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript.trim()) {
        console.log('🎤 User said:', finalTranscript);
        if (this.userSpeechCallback) {
          this.userSpeechCallback(finalTranscript);
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('❌ Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        console.warn('🚫 Microphone permission denied');
      }
    };

    this.recognition.onend = () => {
      console.log('🔚 Speech recognition ended');
      this.isListening = false;
    };
  }

  // Natural AI Speech with human-like parameters
  speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (this.isSpeaking) {
        this.synthesis.cancel(); // Stop any previous speech
      }

      this.isSpeaking = true;
      console.log('🗣️ AI speaking:', text);

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Human-like speech parameters
      utterance.rate = 0.95; // Slightly slower than default
      utterance.pitch = 1.0; // Natural pitch
      utterance.volume = 1.0;
      utterance.rate = 0.9; // Conversational pace

      // Select natural voice
      const voices = this.synthesis.getVoices();
      const naturalVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Samantha') || 
        voice.name.includes('Karen') ||
        voice.name.includes('Microsoft')
      ) || voices[0];
      
      utterance.voice = naturalVoice;

      // Add natural pauses for longer sentences
      const sentences = text.split(/[.!?]+/);
      utterance.text = sentences.join('. ');

      utterance.onend = () => {
        console.log('🔚 AI finished speaking');
        this.isSpeaking = false;
        
        // Auto-start listening after AI speaks
        setTimeout(() => {
          if (this.aiSpeechCompleteCallback) {
            this.aiSpeechCompleteCallback();
          }
        }, 500); // Natural pause before listening
        
        resolve();
      };

      utterance.onerror = (event: any) => {
        console.error('❌ Speech synthesis error:', event);
        this.isSpeaking = false;
        resolve();
      };

      this.synthesis.speak(utterance);
    });
  }

  // Start listening with smart control
  startListening(): void {
    if (this.isSpeaking || this.isListening) {
      console.warn('⚠️ Cannot start listening - AI speaking or already listening');
      return;
    }

    if (!this.recognition) {
      console.error('❌ Speech recognition not available');
      return;
    }

    this.isListening = true;
    console.log('🎤 Starting to listen...');
    
    try {
      this.recognition.start();
    } catch (error) {
      console.error('❌ Failed to start recognition:', error);
      this.isListening = false;
    }
  }

  // Stop listening
  stopListening(): void {
    if (!this.isListening || !this.recognition) {
      return;
    }

    console.log('🛑 Stopping listening...');
    this.recognition.stop();
  }

  // Stop AI speech immediately
  stopSpeaking(): void {
    if (this.isSpeaking) {
      console.log('🔇 Stopping AI speech');
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  // Get current state
  getState() {
    return {
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      canListen: !!(window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    };
  }

  // Set event callbacks
  setUserSpeechCallback(callback: (transcript: string) => void) {
    this.userSpeechCallback = callback;
  }

  setAISpeechCompleteCallback(callback: () => void) {
    this.aiSpeechCompleteCallback = callback;
  }
}

// Export singleton instance
export const voiceInterviewService = new VoiceInterviewService();
