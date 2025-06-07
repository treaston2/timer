import { Timer } from './timer.js';
import { UI } from './ui.js';
import { Audio } from './audio.js';
import { Storage } from './storage.js';

class PomodoroApp {
    constructor() {
        this.timer = new Timer();
        this.ui = new UI();
        this.audio = new Audio();
        this.storage = new Storage();
        
        this.init();
    }

    init() {
        // Load saved settings
        const settings = this.storage.getSettings();
        this.timer.updateSettings(settings);
        
        // Load points
        const points = this.storage.getPoints();
        this.ui.updatePoints(points);
        
        // Bind events
        this.bindEvents();
        
        // Initialize UI
        this.ui.updateDisplay(this.timer.getCurrentTime(), this.timer.getTotalTime());
    }

    bindEvents() {
        // Start/Pause button
        document.getElementById('start-button').addEventListener('click', () => {
            this.handleStartPause();
        });

        // Settings button
        document.getElementById('settings-button').addEventListener('click', () => {
            this.ui.showSettings();
        });

        // Close settings
        document.getElementById('close-settings').addEventListener('click', () => {
            this.ui.hideSettings();
        });

        // Settings inputs
        document.getElementById('work-duration').addEventListener('change', (e) => {
            this.updateSetting('workDuration', parseInt(e.target.value));
        });

        document.getElementById('short-break').addEventListener('change', (e) => {
            this.updateSetting('shortBreak', parseInt(e.target.value));
        });

        document.getElementById('long-break').addEventListener('change', (e) => {
            this.updateSetting('longBreak', parseInt(e.target.value));
        });

        document.getElementById('sessions-until-long').addEventListener('change', (e) => {
            this.updateSetting('sessionsUntilLong', parseInt(e.target.value));
        });

        // Timer events
        this.timer.on('tick', (timeLeft, totalTime) => {
            this.ui.updateDisplay(timeLeft, totalTime);
            this.ui.updateProgress(timeLeft, totalTime);
        });

        this.timer.on('sessionComplete', (sessionType) => {
            this.handleSessionComplete(sessionType);
        });

        this.timer.on('stateChange', (state, sessionType) => {
            this.ui.updateButtonState(state);
            this.ui.updateMode(sessionType);
        });

        // Navigation items (for future features)
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Remove active class from all items
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                // Add active class to clicked item
                e.currentTarget.classList.add('active');
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleStartPause();
            }
        });

        // Click outside settings modal to close
        document.getElementById('settings-modal').addEventListener('click', (e) => {
            if (e.target.id === 'settings-modal') {
                this.ui.hideSettings();
            }
        });
    }

    handleStartPause() {
        if (this.timer.isRunning()) {
            this.timer.pause();
        } else {
            this.timer.start();
        }
    }

    handleSessionComplete(sessionType) {
        // Play completion sound
        this.audio.playCompletion();
        
        // Add points for completed work sessions
        if (sessionType === 'work') {
            const newPoints = this.storage.addPoints(25);
            this.ui.updatePoints(newPoints);
            
            // Show completion notification
            this.ui.showNotification('Work session complete! Take a break.', 'success');
        } else {
            this.ui.showNotification('Break time is over! Ready to focus?', 'info');
        }

        // Show browser notification if supported
        this.showBrowserNotification(sessionType);
    }

    updateSetting(key, value) {
        const settings = this.storage.getSettings();
        settings[key] = value;
        this.storage.saveSettings(settings);
        this.timer.updateSettings(settings);
        
        // Update UI if timer is not running
        if (!this.timer.isRunning()) {
            this.ui.updateDisplay(this.timer.getCurrentTime(), this.timer.getTotalTime());
        }
    }

    showBrowserNotification(sessionType) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const title = sessionType === 'work' 
                ? '🍅 Work Session Complete!' 
                : '🌟 Break Time Over!';
            
            const body = sessionType === 'work'
                ? 'Great job! Time for a well-deserved break.'
                : 'Ready to get back to work? Let\'s focus!';

            new Notification(title, {
                body,
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNmZjZiNmIiLz4KPHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPC9zdmc+Cjwvc3ZnPgo='
            });
        }
    }
}

// Request notification permission when the app loads
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroApp();
}); 