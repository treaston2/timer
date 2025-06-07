export class Timer {
    constructor() {
        this.settings = {
            workDuration: 25,
            shortBreak: 5,
            longBreak: 15,
            sessionsUntilLong: 4
        };
        
        this.state = {
            currentTime: 0,
            totalTime: 0,
            isRunning: false,
            sessionType: 'work',
            sessionCount: 0,
            intervalId: null
        };
        
        this.events = {};
        this.reset();
    }

    // Event system
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    emit(event, ...args) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(...args));
        }
    }

    // Settings management
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        if (!this.state.isRunning) {
            this.reset();
        }
    }

    // Timer control
    start() {
        if (this.state.isRunning) return;
        
        this.state.isRunning = true;
        this.emit('stateChange', 'running', this.state.sessionType);
        
        this.state.intervalId = setInterval(() => {
            this.tick();
        }, 1000);
    }

    pause() {
        if (!this.state.isRunning) return;
        
        this.state.isRunning = false;
        clearInterval(this.state.intervalId);
        this.emit('stateChange', 'paused', this.state.sessionType);
    }

    reset() {
        this.pause();
        this.setSessionType(this.state.sessionType);
        this.emit('stateChange', 'stopped', this.state.sessionType);
    }

    tick() {
        if (this.state.currentTime <= 0) {
            this.sessionComplete();
            return;
        }
        
        this.state.currentTime--;
        this.emit('tick', this.state.currentTime, this.state.totalTime);
    }

    sessionComplete() {
        const completedSession = this.state.sessionType;
        this.emit('sessionComplete', completedSession);
        
        // Move to next session
        if (this.state.sessionType === 'work') {
            this.state.sessionCount++;
            
            // Determine break type
            if (this.state.sessionCount % this.settings.sessionsUntilLong === 0) {
                this.setSessionType('longBreak');
            } else {
                this.setSessionType('shortBreak');
            }
        } else {
            // Break completed, back to work
            this.setSessionType('work');
        }
        
        // Auto-start next session (can be changed to manual)
        this.pause();
        this.emit('stateChange', 'stopped', this.state.sessionType);
    }

    setSessionType(type) {
        this.state.sessionType = type;
        
        switch (type) {
            case 'work':
                this.state.totalTime = this.settings.workDuration * 60;
                break;
            case 'shortBreak':
                this.state.totalTime = this.settings.shortBreak * 60;
                break;
            case 'longBreak':
                this.state.totalTime = this.settings.longBreak * 60;
                break;
        }
        
        this.state.currentTime = this.state.totalTime;
    }

    // Getters
    isRunning() {
        return this.state.isRunning;
    }

    getCurrentTime() {
        return this.state.currentTime;
    }

    getTotalTime() {
        return this.state.totalTime;
    }

    getSessionType() {
        return this.state.sessionType;
    }

    getSessionCount() {
        return this.state.sessionCount;
    }

    // Time formatting utility
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Get remaining time in different formats
    getFormattedTime() {
        return this.formatTime(this.state.currentTime);
    }

    getProgress() {
        if (this.state.totalTime === 0) return 0;
        return ((this.state.totalTime - this.state.currentTime) / this.state.totalTime) * 100;
    }

    // Skip current session (for testing or user preference)
    skipSession() {
        this.sessionComplete();
    }

    // Get next session info
    getNextSessionInfo() {
        if (this.state.sessionType === 'work') {
            const nextSessionCount = this.state.sessionCount + 1;
            if (nextSessionCount % this.settings.sessionsUntilLong === 0) {
                return {
                    type: 'longBreak',
                    duration: this.settings.longBreak,
                    name: 'Long Break'
                };
            } else {
                return {
                    type: 'shortBreak',
                    duration: this.settings.shortBreak,
                    name: 'Short Break'
                };
            }
        } else {
            return {
                type: 'work',
                duration: this.settings.workDuration,
                name: 'Work Session'
            };
        }
    }

    // Get session statistics
    getStats() {
        return {
            completedSessions: this.state.sessionCount,
            currentSession: this.state.sessionType,
            timeRemaining: this.state.currentTime,
            totalTime: this.state.totalTime,
            progress: this.getProgress()
        };
    }
} 