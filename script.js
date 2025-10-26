// State
let isUpperCase = false;
let activeConsonants = new Set();

// Data
const vowels = ['a', 'e', 'i', 'o', 'u'];
const consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'ñ', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'];

// Utility Functions
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function applyCase(text) {
    return isUpperCase ? text.toUpperCase() : text.toLowerCase();
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
    }
}

// Vocales Tab
const vocalesDisplay = document.getElementById('vocalesDisplay');
vocalesDisplay.addEventListener('click', () => {
    const randomVowel = getRandomElement(vowels);
    const displayElement = vocalesDisplay.querySelector('.letter-display');
    displayElement.textContent = applyCase(randomVowel);
});

// Sílabas Tab
// Initialize consonants grid
const consonantsGrid = document.getElementById('consonantsGrid');
consonants.forEach(consonant => {
    const item = document.createElement('div');
    item.className = 'consonant-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `consonant-${consonant}`;
    checkbox.value = consonant;
    checkbox.checked = true;
    activeConsonants.add(consonant);
    
    const label = document.createElement('label');
    label.htmlFor = `consonant-${consonant}`;
    label.textContent = consonant;
    
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
    const syllable = randomConsonant + randomVowel;
    
    const displayElement = silabasDisplay.querySelector('.letter-display');
    displayElement.textContent = applyCase(syllable);
});

// Palabras Tab
const letterCountSlider = document.getElementById('letterCount');
const letterCountValue = document.getElementById('letterCountValue');

letterCountSlider.addEventListener('input', (e) => {
    letterCountValue.textContent = e.target.value;
});

const palabrasDisplay = document.getElementById('palabrasDisplay');
palabrasDisplay.addEventListener('click', () => {
    // Placeholder - not implemented yet
    const displayElement = palabrasDisplay.querySelector('.letter-display');
    displayElement.textContent = 'Próximamente';
});
