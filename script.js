// State
let isUpperCase = true;
let activeNumbers = new Set();
let activeConsonantLetters = new Set();
let activeSyllableConsonants = new Set();
let lastNumber = null;
let lastVowel = null;
let lastConsonant = null;
let lastSyllable = null;

// Data
const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const vowels = ['a', 'e', 'i', 'o', 'u'];
const consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'ñ', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'];
const fonts = [
    // 'Comic Sans MS, cursive',
    'Arial Rounded MT Bold, Arial, sans-serif',
    'Verdana, sans-serif',
    'Georgia, serif',
    'Trebuchet MS, sans-serif',
    'Impact, fantasy',
    'Courier New, monospace',
    'Palatino Linotype, serif',
    'Century Gothic, sans-serif',
    'Tahoma, sans-serif',
    'Arial Black, sans-serif',
    // 'Brush Script MT, cursive'
];

// Utility Functions
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomElementExcluding(array, excludeValue) {
    if (array.length <= 1) {
        return array[0];
    }
    
    let newElement;
    do {
        newElement = getRandomElement(array);
    } while (newElement === excludeValue);
    
    return newElement;
}

function applyCase(text) {
    return isUpperCase ? text.toUpperCase() : text.toLowerCase();
}

function isInteractionDisabled() {
    if (typeof isEffectInCooldown === 'function' && isEffectInCooldown()) {
        return true;
    }

    return document.body.classList.contains('effects-active');
}

// Adaptive text sizing
function adjustTextSize(displayElement) {
    const displayArea = displayElement.closest('.display-area');
    const text = displayElement.textContent;
    
    // Get container dimensions
    const containerWidth = displayArea.clientWidth;
    const containerHeight = displayArea.clientHeight;
    const textLength = text.length;
    
    // Estimate character width as a fraction of font size (average is ~0.6 for most fonts)
    const charWidthRatio = 0.6;
    
    let fontSize;
    
    if (containerHeight < containerWidth) {
        // Landscape: height is limiting factor initially
        // Font size based on height, but reduce if text is too wide
        const maxFontFromHeight = containerHeight * 0.7;
        const maxFontFromWidth = containerWidth * 0.7 / (textLength * charWidthRatio);
        fontSize = Math.min(maxFontFromHeight, maxFontFromWidth);
    } else {
        // Portrait or square: width is limiting factor
        // Font size proportional to width divided by text length
        fontSize = containerWidth *0.7 / (textLength * charWidthRatio);
    }
    
    // Apply minimum constraint
    fontSize = Math.max(fontSize, 32);
    
    displayElement.style.fontSize = `${fontSize}px`;
    
    // Apply random font
    const selectedFont = getRandomElement(fonts);
    displayElement.style.fontFamily = selectedFont;
    
    // Log the text and font
    console.log(`Text: "${text}" | Font: ${selectedFont}`);
}

// Tab Switching
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.dataset.tab;
        
        // Update buttons
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
    });
});

// Case Toggle
const caseToggle = document.getElementById('caseToggle');
const caseText = document.getElementById('caseText');
const settingsButton = document.getElementById('settingsButton');
const settingsMenu = document.getElementById('settingsMenu');
const effectsEnabledInput = document.getElementById('effectsEnabled');
const effectIntervalInput = document.getElementById('effectInterval');
const effectIntervalValue = document.getElementById('effectIntervalValue');
const effectDurationInput = document.getElementById('effectDuration');
const effectDurationValue = document.getElementById('effectDurationValue');
const cooldownDurationInput = document.getElementById('cooldownDuration');
const cooldownDurationValue = document.getElementById('cooldownDurationValue');

function formatMilliseconds(ms) {
    const seconds = ms / 1000;
    return Number.isInteger(seconds) ? seconds.toString() : seconds.toFixed(1);
}

function initializeSettingsMenu() {
    if (!settingsButton || !settingsMenu) {
        return;
    }

    const defaultSettings = typeof getEffectSettings === 'function'
        ? getEffectSettings()
        : { enabled: true, interval: 4, duration: 4000, cooldown: 1500 };

    if (effectsEnabledInput) {
        effectsEnabledInput.checked = defaultSettings.enabled;
        effectsEnabledInput.addEventListener('change', (event) => {
            if (typeof setEffectsEnabled === 'function') {
                setEffectsEnabled(event.target.checked);
            }
        });
    }

    if (effectIntervalInput && effectIntervalValue) {
        effectIntervalInput.value = defaultSettings.interval;
        effectIntervalValue.textContent = defaultSettings.interval;
        const handleIntervalChange = (event) => {
            const value = Math.max(1, Math.min(10, Math.round(Number(event.target.value) || 1)));
            event.target.value = value;
            effectIntervalValue.textContent = value;
            if (typeof setEffectInterval === 'function') {
                setEffectInterval(value);
            }
        };
        effectIntervalInput.addEventListener('change', handleIntervalChange);
        effectIntervalInput.addEventListener('input', handleIntervalChange);
    }

    if (effectDurationInput && effectDurationValue) {
        effectDurationInput.value = defaultSettings.duration;
        effectDurationValue.textContent = formatMilliseconds(defaultSettings.duration);
        const handleDurationInput = (event) => {
            const value = Math.max(500, Number(event.target.value) || 500);
            event.target.value = value;
            effectDurationValue.textContent = formatMilliseconds(value);
            if (typeof setEffectDuration === 'function') {
                setEffectDuration(value);
            }
        };
        effectDurationInput.addEventListener('input', handleDurationInput);
        effectDurationInput.addEventListener('change', handleDurationInput);
    }

    if (cooldownDurationInput && cooldownDurationValue) {
        cooldownDurationInput.value = defaultSettings.cooldown;
        cooldownDurationValue.textContent = formatMilliseconds(defaultSettings.cooldown);
        const handleCooldownInput = (event) => {
            const value = Math.max(0, Number(event.target.value) || 0);
            event.target.value = value;
            cooldownDurationValue.textContent = formatMilliseconds(value);
            if (typeof setEffectCooldown === 'function') {
                setEffectCooldown(value);
            }
        };
        cooldownDurationInput.addEventListener('input', handleCooldownInput);
        cooldownDurationInput.addEventListener('change', handleCooldownInput);
    }

    const closeSettingsMenu = () => {
        settingsMenu.classList.remove('open');
        settingsButton.setAttribute('aria-expanded', 'false');
    };

    settingsButton.addEventListener('click', (event) => {
        event.stopPropagation();
        const isOpen = settingsMenu.classList.toggle('open');
        settingsButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    settingsMenu.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    document.addEventListener('click', (event) => {
        if (!settingsMenu.contains(event.target) && event.target !== settingsButton) {
            closeSettingsMenu();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeSettingsMenu();
        }
    });
}

function updateCaseToggleLabel() {
    if (isUpperCase) {
        caseText.textContent = 'ABC → abc';
        caseToggle.setAttribute('aria-label', 'Cambiar a minúsculas');
    } else {
        caseText.textContent = 'abc → ABC';
        caseToggle.setAttribute('aria-label', 'Cambiar a mayúsculas');
    }
}

// Initialize case text to match default state
updateCaseToggleLabel();
initializeSettingsMenu();

caseToggle.addEventListener('click', () => {
    isUpperCase = !isUpperCase;
    updateCaseToggleLabel();

    // Update current display if there's content
    updateCurrentDisplay();
});

function updateCurrentDisplay() {
    const activeTab = document.querySelector('.tab-content.active');
    const displayArea = activeTab.querySelector('.letter-display');
    const currentText = displayArea.textContent;
    
    // Only update if it's a letter/syllable (not instructions)
    if (currentText && currentText.length <= 3 && /^[a-záéíóúñ]+$/i.test(currentText)) {
        displayArea.textContent = applyCase(currentText.toLowerCase());
        adjustTextSize(displayArea);
    }
}

// Números Tab
const numbersGrid = document.getElementById('numbersGrid');
const selectAllNumbersButton = document.getElementById('selectAllNumbers');
const selectNoNumbersButton = document.getElementById('selectNoNumbers');
const numberCheckboxes = [];

numbers.forEach((number) => {
    const item = document.createElement('div');
    item.className = 'number-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `number-${number}`;
    checkbox.value = number;
    checkbox.checked = true;
    activeNumbers.add(number);

    const label = document.createElement('label');
    label.htmlFor = `number-${number}`;
    label.textContent = number;

    checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            activeNumbers.add(number);
        } else {
            activeNumbers.delete(number);
        }
    });

    item.appendChild(checkbox);
    item.appendChild(label);
    numbersGrid.appendChild(item);
    numberCheckboxes.push(checkbox);
});

selectAllNumbersButton.addEventListener('click', () => {
    numberCheckboxes.forEach((checkbox) => {
        checkbox.checked = true;
        activeNumbers.add(checkbox.value);
    });
});

selectNoNumbersButton.addEventListener('click', () => {
    numberCheckboxes.forEach((checkbox) => {
        checkbox.checked = false;
    });
    activeNumbers.clear();
});

const numerosDisplay = document.getElementById('numerosDisplay');
numerosDisplay.addEventListener('click', () => {
    if (isInteractionDisabled()) {
        return;
    }
    const displayElement = numerosDisplay.querySelector('.letter-display');

    if (activeNumbers.size === 0) {
        displayElement.textContent = '¡Selecciona números!';
        adjustTextSize(displayElement);
        return;
    }

    const activeNumbersArray = Array.from(activeNumbers);
    const randomNumber = getRandomElementExcluding(activeNumbersArray, lastNumber);
    lastNumber = randomNumber;
    displayElement.textContent = randomNumber;
    adjustTextSize(displayElement);
    triggerRandomEffect();
});

// Vocales Tab
const vocalesDisplay = document.getElementById('vocalesDisplay');
vocalesDisplay.addEventListener('click', () => {
    if (isInteractionDisabled()) {
        return;
    }
    const randomVowel = getRandomElementExcluding(vowels, lastVowel);
    lastVowel = randomVowel;
    const displayElement = vocalesDisplay.querySelector('.letter-display');
    displayElement.textContent = applyCase(randomVowel);
    adjustTextSize(displayElement);
    triggerRandomEffect();
});

// Consonantes Tab
const consonantsTabGrid = document.getElementById('consonantsTabGrid');
const consonantTabCheckboxes = [];

consonants.forEach((consonant) => {
    const item = document.createElement('div');
    item.className = 'consonant-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `consonant-tab-${consonant}`;
    checkbox.value = consonant;
    checkbox.checked = true;
    activeConsonantLetters.add(consonant);

    const label = document.createElement('label');
    label.htmlFor = `consonant-tab-${consonant}`;
    label.textContent = consonant.toUpperCase();

    checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            activeConsonantLetters.add(consonant);
        } else {
            activeConsonantLetters.delete(consonant);
        }
    });

    item.appendChild(checkbox);
    item.appendChild(label);
    consonantsTabGrid.appendChild(item);
    consonantTabCheckboxes.push(checkbox);
});

const selectAllConsonantLettersButton = document.getElementById('selectAllConsonantLetters');
const deselectAllConsonantLettersButton = document.getElementById('deselectAllConsonantLetters');

selectAllConsonantLettersButton.addEventListener('click', () => {
    activeConsonantLetters.clear();
    consonantTabCheckboxes.forEach((checkbox) => {
        checkbox.checked = true;
        activeConsonantLetters.add(checkbox.value);
    });
});

deselectAllConsonantLettersButton.addEventListener('click', () => {
    consonantTabCheckboxes.forEach((checkbox) => {
        checkbox.checked = false;
    });
    activeConsonantLetters.clear();
});

const consonantesDisplay = document.getElementById('consonantesDisplay');
consonantesDisplay.addEventListener('click', () => {
    if (isInteractionDisabled()) {
        return;
    }
    const displayElement = consonantesDisplay.querySelector('.letter-display');

    if (activeConsonantLetters.size === 0) {
        displayElement.textContent = '¡Selecciona consonantes!';
        adjustTextSize(displayElement);
        return;
    }

    const activeConsonantLettersArray = Array.from(activeConsonantLetters);
    const randomConsonant = getRandomElementExcluding(activeConsonantLettersArray, lastConsonant);
    lastConsonant = randomConsonant;
    displayElement.textContent = applyCase(randomConsonant);
    adjustTextSize(displayElement);
    triggerRandomEffect();
});

// Sílabas Tab
// Initialize consonants grid
const syllableConsonantsGrid = document.getElementById('syllableConsonantsGrid');
const syllableConsonantCheckboxes = [];

consonants.forEach((consonant, index) => {
    const item = document.createElement('div');
    item.className = 'consonant-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `syllable-consonant-${consonant}`;
    checkbox.value = consonant;
    // Only the first consonant (b) is checked by default
    checkbox.checked = (index === 0);
    if (index === 0) {
        activeSyllableConsonants.add(consonant);
    }

    const label = document.createElement('label');
    label.htmlFor = `syllable-consonant-${consonant}`;
    label.textContent = consonant.toUpperCase();

    checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            activeSyllableConsonants.add(consonant);
        } else {
            activeSyllableConsonants.delete(consonant);
        }
    });

    item.appendChild(checkbox);
    item.appendChild(label);
    syllableConsonantsGrid.appendChild(item);
    syllableConsonantCheckboxes.push(checkbox);
});

const selectAllSyllableConsonantsButton = document.getElementById('selectAllSyllableConsonants');
const deselectAllSyllableConsonantsButton = document.getElementById('deselectAllSyllableConsonants');

selectAllSyllableConsonantsButton.addEventListener('click', () => {
    activeSyllableConsonants.clear();
    syllableConsonantCheckboxes.forEach((checkbox) => {
        checkbox.checked = true;
        activeSyllableConsonants.add(checkbox.value);
    });
});

deselectAllSyllableConsonantsButton.addEventListener('click', () => {
    syllableConsonantCheckboxes.forEach((checkbox) => {
        checkbox.checked = false;
    });
    activeSyllableConsonants.clear();
});

const silabasDisplay = document.getElementById('silabasDisplay');
silabasDisplay.addEventListener('click', () => {
    if (isInteractionDisabled()) {
        return;
    }
    if (activeSyllableConsonants.size === 0) {
        const displayElement = silabasDisplay.querySelector('.letter-display');
        displayElement.textContent = '¡Selecciona consonantes!';
        adjustTextSize(displayElement);
        return;
    }

    const activeSyllableConsonantsArray = Array.from(activeSyllableConsonants);
    const randomConsonant = getRandomElement(activeSyllableConsonantsArray);
    const randomVowel = getRandomElement(vowels);
    let syllable = randomConsonant + randomVowel;

    // Ensure we don't repeat the same syllable
    if (activeSyllableConsonantsArray.length > 1 || vowels.length > 1) {
        while (syllable === lastSyllable) {
            const newConsonant = getRandomElement(activeSyllableConsonantsArray);
            const newVowel = getRandomElement(vowels);
            syllable = newConsonant + newVowel;
        }
    }
    
    lastSyllable = syllable;
    const displayElement = silabasDisplay.querySelector('.letter-display');
    displayElement.textContent = applyCase(syllable);
    adjustTextSize(displayElement);
    triggerRandomEffect();
});

// Tab 3 - Palabras
const palabrasDisplayArea = document.getElementById('palabrasDisplay');
const letterSlider = document.getElementById('letterSlider');
const sliderValue = document.getElementById('sliderValue');

let allWords = [];
let lastWord = '';

// Load words from file
async function loadWords() {
    try {
        const response = await fetch('most-common-spanish-safe-words.txt');
        const text = await response.text();
        allWords = text.split('\n')
            .map(word => word.trim())
            .filter(word => word.length > 0 && word.length >= 3 && word.length <= 10);
        
        console.log(`Loaded ${allWords.length} words`);
    } catch (error) {
        console.error('Error loading words:', error);
        const displayElement = palabrasDisplayArea.querySelector('.letter-display');
        displayElement.textContent = 'Error al cargar palabras';
    }
}

// Filter words by length
function getWordsByLength(length) {
    return allWords.filter(word => word.length === length);
}

// Update slider value display
letterSlider.addEventListener('input', () => {
    sliderValue.textContent = letterSlider.value;
    // Reset last word when slider changes
    lastWord = '';
});

palabrasDisplayArea.addEventListener('click', () => {
    if (isInteractionDisabled()) {
        return;
    }
    const displayElement = palabrasDisplayArea.querySelector('.letter-display');
    
    if (allWords.length === 0) {
        displayElement.textContent = 'Haz clic para ver palabras';
        return;
    }
    
    const length = parseInt(letterSlider.value);
    const availableWords = getWordsByLength(length);
    
    if (availableWords.length === 0) {
        displayElement.textContent = 'No hay palabras disponibles';
        return;
    }
    
    const word = getRandomElementExcluding(availableWords, lastWord);
    lastWord = word;
    displayElement.textContent = isUpperCase ? word.toUpperCase() : word;
    adjustTextSize(displayElement);
    triggerRandomEffect();
});

// Load words when page loads
loadWords();
