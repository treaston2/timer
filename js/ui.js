export class UI {
    constructor() {
        this.elements = {
            timerText: document.getElementById('timer-text'),
            startButton: document.getElementById('start-button'),
            pointsValue: document.querySelector('.points-value'),
            progressRing: document.querySelector('.progress-ring-fill'),
            timerCard: document.querySelector('.timer-card'),
            settingsModal: document.getElementById('settings-modal'),
            workDurationInput: document.getElementById('work-duration'),
            shortBreakInput: document.getElementById('short-break'),
            longBreakInput: document.getElementById('long-break'),
            sessionsUntilLongInput: document.getElementById('sessions-until-long')
        };
        
        // Calculate progress ring circumference
        const radius = 90; // radius from CSS
        this.circumference = radius * 2 * Math.PI;
        
        // Initialize progress ring
        this.elements.progressRing.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        this.elements.progressRing.style.strokeDashoffset = this.circumference;
    }

    // Update timer display
    updateDisplay(timeLeft, totalTime) {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.elements.timerText.textContent = formattedTime;
        
        // Update document title
        document.title = `${formattedTime} - 🍅 Pomodoro Timer`;
    }

    // Update circular progress ring
    updateProgress(timeLeft, totalTime) {
        const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) : 0;
        const offset = this.circumference - (progress * this.circumference);
        
        this.elements.progressRing.style.strokeDashoffset = offset;
    }

    // Update start/pause button
    updateButtonState(state) {
        const button = this.elements.startButton;
        
        switch (state) {
            case 'running':
                button.textContent = 'Pause';
                button.classList.add('pause');
                break;
            case 'paused':
                button.textContent = 'Resume';
                button.classList.remove('pause');
                break;
            case 'stopped':
                button.textContent = 'Start';
                button.classList.remove('pause');
                break;
        }
    }

    // Update UI mode based on session type
    updateMode(sessionType) {
        const card = this.elements.timerCard;
        
        // Remove all mode classes
        card.classList.remove('break-mode', 'long-break-mode');
        
        // Add appropriate mode class
        switch (sessionType) {
            case 'shortBreak':
                card.classList.add('break-mode');
                break;
            case 'longBreak':
                card.classList.add('long-break-mode');
                break;
            case 'work':
            default:
                // Work mode is the default, no additional class needed
                break;
        }
    }

    // Update points display
    updatePoints(points) {
        this.elements.pointsValue.textContent = points;
        
        // Add a subtle animation when points update
        this.elements.pointsValue.style.transform = 'scale(1.2)';
        setTimeout(() => {
            this.elements.pointsValue.style.transform = 'scale(1)';
        }, 200);
    }

    // Show settings modal
    showSettings() {
        this.elements.settingsModal.classList.add('show');
        
        // Focus first input for accessibility
        this.elements.workDurationInput.focus();
    }

    // Hide settings modal
    hideSettings() {
        this.elements.settingsModal.classList.remove('show');
    }

    // Update settings inputs
    updateSettingsInputs(settings) {
        this.elements.workDurationInput.value = settings.workDuration;
        this.elements.shortBreakInput.value = settings.shortBreak;
        this.elements.longBreakInput.value = settings.longBreak;
        this.elements.sessionsUntilLongInput.value = settings.sessionsUntilLong;
    }

    // Show notification (simple toast-style)
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 24px',
            borderRadius: '12px',
            color: 'white',
            fontWeight: '500',
            fontSize: '14px',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        });
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.background = '#4caf50';
                break;
            case 'warning':
                notification.style.background = '#ff9800';
                break;
            case 'error':
                notification.style.background = '#f44336';
                break;
            case 'info':
            default:
                notification.style.background = '#2196f3';
                break;
        }
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Add visual feedback for interactions
    addButtonClickEffect(element) {
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = '';
        }, 100);
    }

    // Animate tomato character based on timer state
    animateTomato(state) {
        const tomato = document.querySelector('.tomato-character');
        
        switch (state) {
            case 'running':
                tomato.style.animation = 'float 2s ease-in-out infinite';
                break;
            case 'paused':
                tomato.style.animation = 'none';
                break;
            case 'completed':
                // Add a celebration effect
                tomato.style.animation = 'celebration 0.6s ease-in-out';
                setTimeout(() => {
                    tomato.style.animation = 'float 3s ease-in-out infinite';
                }, 600);
                break;
        }
    }

    // Update session info display (could be used for future features)
    updateSessionInfo(sessionType, sessionCount) {
        // This could be used to show current session info
        // For now, it's handled by the mode changes
    }

    // Handle responsive adjustments
    handleResize() {
        // Recalculate progress ring for mobile
        const isMobile = window.innerWidth <= 480;
        const radius = isMobile ? 80 : 90;
        const circumference = radius * 2 * Math.PI;
        
        if (this.circumference !== circumference) {
            this.circumference = circumference;
            this.elements.progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
            // Maintain current progress
            const currentOffset = parseFloat(this.elements.progressRing.style.strokeDashoffset) || circumference;
            const progress = (circumference - currentOffset) / circumference;
            const newOffset = circumference - (progress * circumference);
            this.elements.progressRing.style.strokeDashoffset = newOffset;
        }
    }

    // Initialize resize listener
    initResize() {
        window.addEventListener('resize', () => this.handleResize());
        this.handleResize(); // Initial call
    }

    // Accessibility improvements
    updateAccessibility(sessionType, timeLeft) {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        // Update aria-label for screen readers
        const sessionName = sessionType === 'work' ? 'Work session' : 
                           sessionType === 'shortBreak' ? 'Short break' : 'Long break';
        
        this.elements.timerText.setAttribute('aria-label', 
            `${sessionName}: ${minutes} minutes and ${seconds} seconds remaining`);
    }

    // Theme switching (for future dark mode)
    setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
    }
} 