// State
let isUpperCase = true;
let activeConsonants = new Set();
let lastNumber = null;
let lastVowel = null;
let lastConsonant = null;
let lastSyllable = null;

// Data
const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const vowels = ['a', 'e', 'i', 'o', 'u'];
const consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'ñ', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'];
const fonts = [
    'Comic Sans MS, cursive',
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
    'Brush Script MT, cursive'
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
    displayElement.style.fontFamily = getRandomElement(fonts);
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

// Initialize case text to match default state
caseText.textContent = 'abc';

caseToggle.addEventListener('click', () => {
    isUpperCase = !isUpperCase;
    caseText.textContent = isUpperCase ? 'abc' : 'ABC';
    
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
const numerosDisplay = document.getElementById('numerosDisplay');
numerosDisplay.addEventListener('click', () => {
    const randomNumber = getRandomElementExcluding(numbers, lastNumber);
    lastNumber = randomNumber;
    const displayElement = numerosDisplay.querySelector('.letter-display');
    displayElement.textContent = randomNumber;
    adjustTextSize(displayElement);
});

// Vocales Tab
const vocalesDisplay = document.getElementById('vocalesDisplay');
vocalesDisplay.addEventListener('click', () => {
    const randomVowel = getRandomElementExcluding(vowels, lastVowel);
    lastVowel = randomVowel;
    const displayElement = vocalesDisplay.querySelector('.letter-display');
    displayElement.textContent = applyCase(randomVowel);
    adjustTextSize(displayElement);
});

// Consonantes Tab
const consonantesDisplay = document.getElementById('consonantesDisplay');
consonantesDisplay.addEventListener('click', () => {
    const randomConsonant = getRandomElementExcluding(consonants, lastConsonant);
    lastConsonant = randomConsonant;
    const displayElement = consonantesDisplay.querySelector('.letter-display');
    displayElement.textContent = applyCase(randomConsonant);
    adjustTextSize(displayElement);
});

// Sílabas Tab
// Initialize consonants grid
const consonantsGrid = document.getElementById('consonantsGrid');
consonants.forEach((consonant, index) => {
    const item = document.createElement('div');
    item.className = 'consonant-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `consonant-${consonant}`;
    checkbox.value = consonant;
    // Only the first consonant (b) is checked by default
    checkbox.checked = (index === 0);
    if (index === 0) {
        activeConsonants.add(consonant);
    }
    
    const label = document.createElement('label');
    label.htmlFor = `consonant-${consonant}`;
    label.textContent = consonant.toUpperCase();
    
    checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            activeConsonants.add(consonant);
        } else {
            activeConsonants.delete(consonant);
        }
    });
    
    item.appendChild(checkbox);
    item.appendChild(label);
    consonantsGrid.appendChild(item);
});

const silabasDisplay = document.getElementById('silabasDisplay');
silabasDisplay.addEventListener('click', () => {
    if (activeConsonants.size === 0) {
        const displayElement = silabasDisplay.querySelector('.letter-display');
        displayElement.textContent = '¡Selecciona consonantes!';
        return;
    }
    
    const activeConsonantsArray = Array.from(activeConsonants);
    const randomConsonant = getRandomElement(activeConsonantsArray);
    const randomVowel = getRandomElement(vowels);
    let syllable = randomConsonant + randomVowel;
    
    // Ensure we don't repeat the same syllable
    if (activeConsonantsArray.length > 1 || vowels.length > 1) {
        while (syllable === lastSyllable) {
            const newConsonant = getRandomElement(activeConsonantsArray);
            const newVowel = getRandomElement(vowels);
            syllable = newConsonant + newVowel;
        }
    }
    
    lastSyllable = syllable;
    const displayElement = silabasDisplay.querySelector('.letter-display');
    displayElement.textContent = applyCase(syllable);
    adjustTextSize(displayElement);
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
});

// Load words when page loads
loadWords();
