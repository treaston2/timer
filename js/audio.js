export class Audio {
    constructor() {
        this.enabled = true;
        this.volume = 0.7;
        
        // Create audio context for web audio API (more reliable than HTML5 audio)
        this.audioContext = null;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            // Create audio context with user gesture handling
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Handle audio context state changes
            if (this.audioContext.state === 'suspended') {
                // Will be resumed on first user interaction
                document.addEventListener('click', () => {
                    this.resumeAudioContext();
                }, { once: true });
            }
        } catch (error) {
            console.warn('Web Audio API not supported, falling back to HTML5 audio');
            this.audioContext = null;
        }
    }

    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // Generate completion sound using Web Audio API
    playCompletion() {
        if (!this.enabled) return;

        if (this.audioContext) {
            this.playWebAudioSound('completion');
        } else {
            this.playHTMLAudioSound('completion');
        }
    }

    // Generate tick sound (optional, for focus sessions)
    playTick() {
        if (!this.enabled) return;

        if (this.audioContext) {
            this.playWebAudioSound('tick');
        }
    }

    // Web Audio API sound generation
    playWebAudioSound(type) {
        if (!this.audioContext || this.audioContext.state !== 'running') {
            this.resumeAudioContext();
            if (this.audioContext.state !== 'running') return;
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        switch (type) {
            case 'completion':
                // Pleasant completion chime (C-E-G major chord sequence)
                this.playChord([523.25, 659.25, 783.99], 0.8); // C5-E5-G5
                break;
            case 'tick':
                // Subtle tick sound
                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1 * this.volume, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.1);
                break;
        }
    }

    // Play a chord sequence for completion sound
    playChord(frequencies, duration = 0.6) {
        const startTime = this.audioContext.currentTime;
        
        frequencies.forEach((frequency, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, startTime);
            oscillator.type = 'sine';
            
            // Envelope for pleasant sound
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.3 * this.volume, startTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            
            oscillator.start(startTime + index * 0.1);
            oscillator.stop(startTime + duration);
        });
    }

    // Fallback HTML5 audio for older browsers
    playHTMLAudioSound(type) {
        // Create audio data URLs for different sounds
        const audioData = this.generateAudioDataURL(type);
        
        if (audioData) {
            const audio = new Audio(audioData);
            audio.volume = this.volume;
            audio.play().catch(e => {
                console.warn('Could not play audio:', e);
            });
        }
    }

    // Generate audio data URLs (base64 encoded audio)
    generateAudioDataURL(type) {
        // For simplicity, we'll use a basic beep sound
        // In a production app, you might load actual audio files
        
        switch (type) {
            case 'completion':
                // Generate a simple completion sound
                return this.generateBeepDataURL(523.25, 0.5); // C5 note
            case 'tick':
                return this.generateBeepDataURL(800, 0.1); // High tick
            default:
                return null;
        }
    }

    // Generate a simple beep as data URL
    generateBeepDataURL(frequency, duration) {
        // This is a simplified implementation
        // In reality, you'd generate proper PCM audio data
        return null; // Fallback to Web Audio API
    }

    // Sound settings
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    isEnabled() {
        return this.enabled;
    }

    getVolume() {
        return this.volume;
    }

    // Test audio functionality
    test() {
        this.playCompletion();
    }

    // Play different sounds for different session types
    playSessionStart(sessionType) {
        if (!this.enabled) return;

        // Different tones for different sessions
        switch (sessionType) {
            case 'work':
                this.playWorkStartSound();
                break;
            case 'shortBreak':
            case 'longBreak':
                this.playBreakStartSound();
                break;
        }
    }

    playWorkStartSound() {
        if (this.audioContext) {
            // Energetic ascending tone
            this.playToneSequence([440, 554.37, 659.25], 0.2); // A4-C#5-E5
        }
    }

    playBreakStartSound() {
        if (this.audioContext) {
            // Relaxing descending tone
            this.playToneSequence([659.25, 554.37, 440], 0.3); // E5-C#5-A4
        }
    }

    playToneSequence(frequencies, noteDuration) {
        if (!this.audioContext || this.audioContext.state !== 'running') return;

        frequencies.forEach((frequency, index) => {
            const startTime = this.audioContext.currentTime + (index * noteDuration);
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, startTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.2 * this.volume, startTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration - 0.05);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + noteDuration);
        });
    }

    // Clean up audio resources
    destroy() {
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
} 