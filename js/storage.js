export class Storage {
    constructor() {
        this.storageKey = 'pomodoro-timer';
        this.defaultSettings = {
            workDuration: 25,
            shortBreak: 5,
            longBreak: 15,
            sessionsUntilLong: 4,
            soundEnabled: true,
            volume: 0.7,
            autoStartBreaks: false,
            autoStartPomodoros: false
        };
        
        this.defaultData = {
            points: 120, // Starting points as shown in design
            totalSessions: 0,
            totalWorkTime: 0,
            streak: 0,
            lastSessionDate: null,
            settings: this.defaultSettings
        };
        
        this.init();
    }

    init() {
        // Check if localStorage is available
        if (!this.isLocalStorageAvailable()) {
            console.warn('localStorage not available, using memory storage');
            this.data = { ...this.defaultData };
            return;
        }

        // Load or initialize data
        this.loadData();
    }

    isLocalStorageAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    loadData() {
        try {
            const storedData = localStorage.getItem(this.storageKey);
            if (storedData) {
                this.data = JSON.parse(storedData);
                
                // Ensure all default properties exist (for updates)
                this.data = { ...this.defaultData, ...this.data };
                this.data.settings = { ...this.defaultSettings, ...this.data.settings };
            } else {
                this.data = { ...this.defaultData };
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
            this.data = { ...this.defaultData };
        }
    }

    saveData() {
        if (!this.isLocalStorageAvailable()) {
            return;
        }

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
        }
    }

    // Settings management
    getSettings() {
        return { ...this.data.settings };
    }

    saveSettings(settings) {
        this.data.settings = { ...this.data.settings, ...settings };
        this.saveData();
    }

    resetSettings() {
        this.data.settings = { ...this.defaultSettings };
        this.saveData();
    }

    // Points system
    getPoints() {
        return this.data.points;
    }

    addPoints(amount) {
        this.data.points += amount;
        this.saveData();
        return this.data.points;
    }

    subtractPoints(amount) {
        this.data.points = Math.max(0, this.data.points - amount);
        this.saveData();
        return this.data.points;
    }

    setPoints(amount) {
        this.data.points = Math.max(0, amount);
        this.saveData();
        return this.data.points;
    }

    // Session tracking
    recordSession(sessionType, duration) {
        const now = new Date();
        
        this.data.totalSessions++;
        
        if (sessionType === 'work') {
            this.data.totalWorkTime += duration;
            this.addPoints(25); // Points for completed work session
            
            // Update streak
            this.updateStreak(now);
        }
        
        this.data.lastSessionDate = now.toISOString();
        this.saveData();
    }

    updateStreak(currentDate) {
        const lastDate = this.data.lastSessionDate ? new Date(this.data.lastSessionDate) : null;
        
        if (!lastDate) {
            this.data.streak = 1;
            return;
        }
        
        const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 0) {
            // Same day, no change to streak
        } else if (daysDiff === 1) {
            // Consecutive day, increment streak
            this.data.streak++;
        } else {
            // Streak broken, reset
            this.data.streak = 1;
        }
    }

    // Statistics
    getStats() {
        const stats = {
            points: this.data.points,
            totalSessions: this.data.totalSessions,
            totalWorkTime: this.data.totalWorkTime,
            streak: this.data.streak,
            lastSessionDate: this.data.lastSessionDate,
            averageSessionsPerDay: this.calculateAverageSessionsPerDay(),
            totalWorkHours: Math.round(this.data.totalWorkTime / 60 * 100) / 100
        };
        
        return stats;
    }

    calculateAverageSessionsPerDay() {
        if (this.data.totalSessions === 0 || !this.data.lastSessionDate) {
            return 0;
        }
        
        const firstSessionDate = new Date(this.data.lastSessionDate);
        const now = new Date();
        const daysDiff = Math.max(1, Math.floor((now - firstSessionDate) / (1000 * 60 * 60 * 24)));
        
        return Math.round((this.data.totalSessions / daysDiff) * 100) / 100;
    }

    // Daily goals and achievements
    getTodaysSessions() {
        const today = new Date().toDateString();
        return this.data.dailySessions?.[today] || 0;
    }

    incrementTodaysSessions() {
        const today = new Date().toDateString();
        if (!this.data.dailySessions) {
            this.data.dailySessions = {};
        }
        this.data.dailySessions[today] = (this.data.dailySessions[today] || 0) + 1;
        this.saveData();
    }

    // Data management
    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    importData(jsonData) {
        try {
            const importedData = JSON.parse(jsonData);
            
            // Validate imported data structure
            if (this.validateDataStructure(importedData)) {
                this.data = { ...this.defaultData, ...importedData };
                this.data.settings = { ...this.defaultSettings, ...importedData.settings };
                this.saveData();
                return true;
            } else {
                throw new Error('Invalid data structure');
            }
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    validateDataStructure(data) {
        // Basic validation of imported data
        return (
            typeof data === 'object' &&
            typeof data.points === 'number' &&
            typeof data.totalSessions === 'number' &&
            typeof data.settings === 'object'
        );
    }

    resetAllData() {
        this.data = { ...this.defaultData };
        this.saveData();
    }

    // Backup and restore
    createBackup() {
        const backup = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            data: this.data
        };
        
        return JSON.stringify(backup);
    }

    restoreFromBackup(backupJson) {
        try {
            const backup = JSON.parse(backupJson);
            
            if (backup.data && this.validateDataStructure(backup.data)) {
                this.data = { ...this.defaultData, ...backup.data };
                this.saveData();
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error restoring from backup:', error);
            return false;
        }
    }

    // Clean up old data (for performance)
    cleanupOldData() {
        if (this.data.dailySessions) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const cutoffDate = thirtyDaysAgo.toDateString();
            
            Object.keys(this.data.dailySessions).forEach(date => {
                if (new Date(date) < thirtyDaysAgo) {
                    delete this.data.dailySessions[date];
                }
            });
            
            this.saveData();
        }
    }

    // Achievement system (for future features)
    checkAchievements() {
        const achievements = [];
        
        // First session achievement
        if (this.data.totalSessions === 1) {
            achievements.push({
                id: 'first-session',
                title: 'Getting Started',
                description: 'Complete your first Pomodoro session',
                points: 10
            });
        }
        
        // Streak achievements
        if (this.data.streak === 7) {
            achievements.push({
                id: 'week-streak',
                title: 'Week Warrior',
                description: '7-day productivity streak',
                points: 50
            });
        }
        
        // Points milestones
        if (this.data.points >= 1000) {
            achievements.push({
                id: 'points-1000',
                title: 'Point Master',
                description: 'Earned 1000 points',
                points: 100
            });
        }
        
        return achievements;
    }
} 