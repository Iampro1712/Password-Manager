// Password Generator Class
class PasswordGenerator {
    constructor() {
        this.characters = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };

        this.passwordHistory = [];
        this.maxHistorySize = 10;

        this.init();
        this.initPasswordChecker();
        this.initHistory();
        this.createParticles();
        this.startParticleAnimation();
    }

    init() {
        // DOM Elements
        this.lengthSlider = document.getElementById('lengthSlider');
        this.lengthValue = document.getElementById('lengthValue');
        this.generateBtn = document.getElementById('generateBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.generatedPassword = document.getElementById('generatedPassword');
        this.strengthBar = document.getElementById('strengthBar');
        this.strengthText = document.getElementById('strengthText');
        
        // Checkboxes
        this.includeUppercase = document.getElementById('includeUppercase');
        this.includeLowercase = document.getElementById('includeLowercase');
        this.includeNumbers = document.getElementById('includeNumbers');
        this.includeSymbols = document.getElementById('includeSymbols');

        // Event Listeners
        this.lengthSlider.addEventListener('input', () => this.updateLength());
        this.generateBtn.addEventListener('click', () => this.generatePassword());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        
        // Auto-generate on option change
        [this.includeUppercase, this.includeLowercase, this.includeNumbers, this.includeSymbols]
            .forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    if (this.generatedPassword.value) {
                        this.generatePassword();
                    }
                });
            });

        // Generate initial password
        this.generatePassword();
    }

    updateLength() {
        this.lengthValue.textContent = this.lengthSlider.value;
        if (this.generatedPassword.value) {
            this.generatePassword();
        }
    }

    generatePassword() {
        const length = parseInt(this.lengthSlider.value);
        let charset = '';
        
        // Build character set based on selected options
        if (this.includeUppercase.checked) charset += this.characters.uppercase;
        if (this.includeLowercase.checked) charset += this.characters.lowercase;
        if (this.includeNumbers.checked) charset += this.characters.numbers;
        if (this.includeSymbols.checked) charset += this.characters.symbols;
        
        // Ensure at least one option is selected
        if (charset === '') {
            this.showError('Selecciona al menos una opción');
            return;
        }

        // Generate password
        let password = '';
        
        // Ensure at least one character from each selected type
        if (this.includeUppercase.checked) {
            password += this.getRandomChar(this.characters.uppercase);
        }
        if (this.includeLowercase.checked) {
            password += this.getRandomChar(this.characters.lowercase);
        }
        if (this.includeNumbers.checked) {
            password += this.getRandomChar(this.characters.numbers);
        }
        if (this.includeSymbols.checked) {
            password += this.getRandomChar(this.characters.symbols);
        }

        // Fill remaining length with random characters
        for (let i = password.length; i < length; i++) {
            password += this.getRandomChar(charset);
        }

        // Shuffle the password
        password = this.shuffleString(password);
        
        // Display password with animation
        this.displayPassword(password);
        this.updateStrengthMeter(password);
        this.addToHistory(password);

        // Add generation animation
        this.generateBtn.classList.add('loading');
        setTimeout(() => {
            this.generateBtn.classList.remove('loading');
        }, 500);
    }

    getRandomChar(charset) {
        const crypto = window.crypto || window.msCrypto;
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return charset[array[0] % charset.length];
    }

    shuffleString(str) {
        const array = str.split('');
        const crypto = window.crypto || window.msCrypto;
        
        for (let i = array.length - 1; i > 0; i--) {
            const randomArray = new Uint32Array(1);
            crypto.getRandomValues(randomArray);
            const j = randomArray[0] % (i + 1);
            [array[i], array[j]] = [array[j], array[i]];
        }
        
        return array.join('');
    }

    displayPassword(password) {
        this.generatedPassword.style.animation = 'slideInUp 0.5s ease';
        this.generatedPassword.value = password;
        
        // Reset animation
        setTimeout(() => {
            this.generatedPassword.style.animation = '';
        }, 500);
    }

    updateStrengthMeter(password) {
        const strength = this.calculateStrength(password);
        const strengthBar = this.strengthBar;
        const strengthText = this.strengthText;
        
        // Remove existing classes
        strengthBar.className = 'h-full transition-all duration-500 rounded-full';
        
        let width, className, text, color;
        
        if (strength < 20) {
            width = '20%';
            className = 'strength-weak';
            text = 'Muy Débil';
            color = 'text-red-400';
        } else if (strength < 40) {
            width = '40%';
            className = 'strength-fair';
            text = 'Débil';
            color = 'text-orange-400';
        } else if (strength < 60) {
            width = '60%';
            className = 'strength-good';
            text = 'Buena';
            color = 'text-yellow-400';
        } else if (strength < 80) {
            width = '80%';
            className = 'strength-strong';
            text = 'Fuerte';
            color = 'text-green-400';
        } else {
            width = '100%';
            className = 'strength-very-strong';
            text = 'Muy Fuerte';
            color = 'text-green-300';
        }
        
        strengthBar.style.width = width;
        strengthBar.classList.add(className);
        strengthText.textContent = text;
        strengthText.className = `text-center mt-2 font-semibold ${color}`;
    }

    calculateStrength(password) {
        let score = 0;

        // Base length scoring (more generous for longer passwords)
        if (password.length >= 8) {
            score += 20; // Base score for minimum length
            score += Math.min((password.length - 8) * 3, 40); // Up to 40 extra points for length
        } else {
            score += password.length * 2; // Penalty for short passwords
        }

        // Character variety bonus (more points for diversity)
        let varietyCount = 0;
        if (/[a-z]/.test(password)) { score += 8; varietyCount++; }
        if (/[A-Z]/.test(password)) { score += 8; varietyCount++; }
        if (/[0-9]/.test(password)) { score += 8; varietyCount++; }
        if (/[^A-Za-z0-9]/.test(password)) { score += 12; varietyCount++; }

        // Bonus for using all character types
        if (varietyCount === 4) score += 10;

        // Extra length bonuses for very long passwords
        if (password.length >= 16) score += 5;
        if (password.length >= 20) score += 5;
        if (password.length >= 32) score += 10;

        // Pattern penalties
        if (/(.)\1{2,}/.test(password)) score -= 15; // Repeated characters
        if (/123|abc|qwe|password|admin|login/i.test(password)) score -= 20; // Common patterns
        if (/^[a-z]+$|^[A-Z]+$|^[0-9]+$/.test(password)) score -= 25; // Single character type

        // Severe penalties for very short passwords
        if (password.length < 6) score -= 30;
        if (password.length < 4) score -= 50;

        // Bonus for good entropy (unique characters)
        const uniqueChars = new Set(password).size;
        const entropyBonus = Math.min(uniqueChars * 0.5, 10);
        score += entropyBonus;

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    async copyToClipboard() {
        if (!this.generatedPassword.value) {
            this.showError('No hay contraseña para copiar');
            return;
        }

        try {
            await navigator.clipboard.writeText(this.generatedPassword.value);
            this.showSuccess('¡Contraseña copiada!');
            
            // Animation
            this.copyBtn.classList.add('copy-success');
            setTimeout(() => {
                this.copyBtn.classList.remove('copy-success');
            }, 600);
            
        } catch (err) {
            // Fallback for older browsers
            this.generatedPassword.select();
            document.execCommand('copy');
            this.showSuccess('¡Contraseña copiada!');
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 right-4 z-50 px-6 py-3 rounded-lg font-semibold text-white shadow-lg transform translate-x-full transition-transform duration-300 ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Slide in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Slide out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    createParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = window.innerWidth < 768 ? 20 : 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 4 + 1;
            const left = Math.random() * 100;
            const animationDuration = Math.random() * 10 + 10;
            const animationDelay = Math.random() * 15;
            
            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${left}%;
                animation-duration: ${animationDuration}s;
                animation-delay: ${animationDelay}s;
            `;
            
            particlesContainer.appendChild(particle);
        }
    }

    startParticleAnimation() {
        // Recreate particles periodically for continuous effect
        setInterval(() => {
            const particles = document.querySelectorAll('.particle');
            particles.forEach((particle, index) => {
                setTimeout(() => {
                    particle.style.animationDelay = '0s';
                }, index * 100);
            });
        }, 15000);
    }

    // Password Checker Methods
    initPasswordChecker() {
        this.checkPassword = document.getElementById('checkPassword');
        this.togglePassword = document.getElementById('togglePassword');
        this.checkStrengthBar = document.getElementById('checkStrengthBar');
        this.checkStrengthText = document.getElementById('checkStrengthText');
        this.strengthsList = document.getElementById('strengthsList');
        this.weaknessesList = document.getElementById('weaknessesList');
        this.crackTime = document.getElementById('crackTime');

        if (this.checkPassword) {
            this.checkPassword.addEventListener('input', () => this.analyzePassword());
            this.togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        }
    }

    togglePasswordVisibility() {
        const isPassword = this.checkPassword.type === 'password';
        this.checkPassword.type = isPassword ? 'text' : 'password';
        this.togglePassword.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    }

    analyzePassword() {
        const password = this.checkPassword.value;

        if (!password) {
            this.resetPasswordAnalysis();
            return;
        }

        const strength = this.calculateStrength(password);
        this.updateCheckStrengthMeter(password, strength);
        this.updateSecurityAnalysis(password);
        this.updateCrackTime(password);
    }

    resetPasswordAnalysis() {
        if (this.checkStrengthBar) {
            this.checkStrengthBar.style.width = '0%';
            this.checkStrengthBar.className = 'h-full transition-all duration-500 rounded-full';
        }
        if (this.checkStrengthText) this.checkStrengthText.textContent = '';
        if (this.strengthsList) this.strengthsList.innerHTML = '';
        if (this.weaknessesList) this.weaknessesList.innerHTML = '';
        if (this.crackTime) this.crackTime.textContent = '-';
    }

    updateCheckStrengthMeter(password, strength) {
        if (!this.checkStrengthBar || !this.checkStrengthText) return;

        const strengthBar = this.checkStrengthBar;
        const strengthText = this.checkStrengthText;

        strengthBar.className = 'h-full transition-all duration-500 rounded-full';

        let width, className, text, color;

        if (strength < 20) {
            width = '20%'; className = 'strength-weak'; text = 'Muy Débil'; color = 'text-red-400';
        } else if (strength < 40) {
            width = '40%'; className = 'strength-fair'; text = 'Débil'; color = 'text-orange-400';
        } else if (strength < 60) {
            width = '60%'; className = 'strength-good'; text = 'Buena'; color = 'text-yellow-400';
        } else if (strength < 80) {
            width = '80%'; className = 'strength-strong'; text = 'Fuerte'; color = 'text-green-400';
        } else {
            width = '100%'; className = 'strength-very-strong'; text = 'Muy Fuerte'; color = 'text-green-300';
        }

        strengthBar.style.width = width;
        strengthBar.classList.add(className);
        strengthText.textContent = text;
        strengthText.className = `text-center mb-6 font-semibold text-lg ${color}`;
    }

    updateSecurityAnalysis(password) {
        if (!this.strengthsList || !this.weaknessesList) return;

        const strengths = [];
        const weaknesses = [];

        // Check strengths
        if (password.length >= 12) strengths.push('Longitud adecuada (12+ caracteres)');
        if (/[a-z]/.test(password)) strengths.push('Contiene minúsculas');
        if (/[A-Z]/.test(password)) strengths.push('Contiene mayúsculas');
        if (/[0-9]/.test(password)) strengths.push('Contiene números');
        if (/[^A-Za-z0-9]/.test(password)) strengths.push('Contiene símbolos especiales');
        if (password.length >= 16) strengths.push('Longitud excelente (16+ caracteres)');

        // Check weaknesses
        if (password.length < 8) weaknesses.push('Muy corta (menos de 8 caracteres)');
        if (password.length < 12) weaknesses.push('Podría ser más larga');
        if (!/[a-z]/.test(password)) weaknesses.push('No contiene minúsculas');
        if (!/[A-Z]/.test(password)) weaknesses.push('No contiene mayúsculas');
        if (!/[0-9]/.test(password)) weaknesses.push('No contiene números');
        if (!/[^A-Za-z0-9]/.test(password)) weaknesses.push('No contiene símbolos especiales');
        if (/(.)\1{2,}/.test(password)) weaknesses.push('Contiene caracteres repetidos');
        if (/123|abc|qwe|password|admin/i.test(password)) weaknesses.push('Contiene patrones comunes');

        // Update lists
        this.strengthsList.innerHTML = strengths.map(s => `<li><i class="fas fa-check mr-2"></i>${s}</li>`).join('');
        this.weaknessesList.innerHTML = weaknesses.map(w => `<li><i class="fas fa-times mr-2"></i>${w}</li>`).join('');
    }

    updateCrackTime(password) {
        if (!this.crackTime) return;

        const charset = this.getCharsetSize(password);
        const combinations = Math.pow(charset, password.length);
        const seconds = combinations / (1000000000); // Assuming 1 billion attempts per second

        let timeText;
        if (seconds < 1) timeText = 'Instantáneo';
        else if (seconds < 60) timeText = `${Math.round(seconds)} segundos`;
        else if (seconds < 3600) timeText = `${Math.round(seconds / 60)} minutos`;
        else if (seconds < 86400) timeText = `${Math.round(seconds / 3600)} horas`;
        else if (seconds < 31536000) timeText = `${Math.round(seconds / 86400)} días`;
        else if (seconds < 31536000000) timeText = `${Math.round(seconds / 31536000)} años`;
        else timeText = 'Más de mil años';

        this.crackTime.textContent = timeText;
    }

    getCharsetSize(password) {
        let size = 0;
        if (/[a-z]/.test(password)) size += 26;
        if (/[A-Z]/.test(password)) size += 26;
        if (/[0-9]/.test(password)) size += 10;
        if (/[^A-Za-z0-9]/.test(password)) size += 32;
        return size || 1;
    }

    // History Methods
    initHistory() {
        this.passwordHistoryContainer = document.getElementById('passwordHistory');
        this.clearHistoryBtn = document.getElementById('clearHistory');

        if (this.clearHistoryBtn) {
            this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        }
    }

    addToHistory(password) {
        const timestamp = new Date().toLocaleString();
        const strength = this.calculateStrength(password);

        this.passwordHistory.unshift({
            password,
            timestamp,
            strength
        });

        if (this.passwordHistory.length > this.maxHistorySize) {
            this.passwordHistory.pop();
        }

        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        if (!this.passwordHistoryContainer) return;

        if (this.passwordHistory.length === 0) {
            this.passwordHistoryContainer.innerHTML = `
                <div class="text-center text-white/60 py-8">
                    <i class="fas fa-clock text-4xl mb-4"></i>
                    <p>No hay contraseñas en el historial</p>
                    <p class="text-sm mt-2">Las contraseñas generadas aparecerán aquí</p>
                </div>
            `;
            return;
        }

        this.passwordHistoryContainer.innerHTML = this.passwordHistory.map((item, index) => {
            const strengthColor = this.getStrengthColor(item.strength);
            const strengthText = this.getStrengthText(item.strength);

            return `
                <div class="bg-black/20 rounded-lg p-4 hover:bg-black/30 transition-all duration-300 animate-slideInUp" style="animation-delay: ${index * 0.1}s">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-white/60 text-sm">${item.timestamp}</span>
                        <span class="text-xs px-2 py-1 rounded-full ${strengthColor}">${strengthText}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <code class="text-white font-mono text-sm bg-black/30 px-3 py-1 rounded flex-1 mr-3 truncate">${item.password}</code>
                        <button onclick="passwordGenerator.copyHistoryPassword('${item.password}')"
                                class="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm transition-all duration-300 hover:scale-105">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getStrengthColor(strength) {
        if (strength < 20) return 'bg-red-500 text-white';
        if (strength < 40) return 'bg-orange-500 text-white';
        if (strength < 60) return 'bg-yellow-500 text-black';
        if (strength < 80) return 'bg-green-500 text-white';
        return 'bg-green-400 text-white';
    }

    getStrengthText(strength) {
        if (strength < 20) return 'Muy Débil';
        if (strength < 40) return 'Débil';
        if (strength < 60) return 'Buena';
        if (strength < 80) return 'Fuerte';
        return 'Muy Fuerte';
    }

    async copyHistoryPassword(password) {
        try {
            await navigator.clipboard.writeText(password);
            this.showSuccess('¡Contraseña copiada del historial!');
        } catch (err) {
            this.showError('Error al copiar la contraseña');
        }
    }

    clearHistory() {
        this.passwordHistory = [];
        this.updateHistoryDisplay();
        this.showSuccess('Historial limpiado');
    }
}

// Initialize when DOM is loaded
let passwordGenerator;
document.addEventListener('DOMContentLoaded', () => {
    passwordGenerator = new PasswordGenerator();
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInUp 0.6s ease forwards';
            }
        });
    }, observerOptions);
    
    // Observe sections for scroll animations
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
});

// Handle window resize for particles
window.addEventListener('resize', () => {
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        particlesContainer.innerHTML = '';

        // Recreate particles with new count
        setTimeout(() => {
            if (passwordGenerator) {
                passwordGenerator.createParticles();
            }
        }, 100);
    }
});
