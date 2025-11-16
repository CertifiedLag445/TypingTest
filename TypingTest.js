// TypingTest.js

// DOM Elements
const textContainer = document.getElementById('text');
const textParagraph = textContainer.querySelector('p');
const inputField = document.getElementById('inputField');
const timeElement = document.getElementById('time');
const accuracyElement = document.getElementById('accuracy');
const wpmElement = document.getElementById('wpm');
const cpmElement = document.getElementById('cpm');
const resetButton = document.getElementById('reset');
const startButton = document.getElementById('startButton');
const timeSelect = document.getElementById('timeSelect');
const resultsOverlay = document.getElementById('resultsOverlay');
const finalWpm = document.getElementById('finalWpm');
const finalCpm = document.getElementById('finalCpm');
const finalAccuracy = document.getElementById('finalAccuracy');
const closeResults = document.getElementById('closeResults');

// Word list (all lowercase)
const wordList = [
  "window", "garden", "mountain", "keyboard", "coffee", "puzzle", "elephant",
  "orange", "river", "bicycle", "notebook", "camera", "library", "forest", 
  "sunset", "chocolate", "guitar", "planet", "rainbow", "umbrella", "building",
  "computer", "telephone", "painting", "vehicle", "animal", "season", "weather",
  "journey", "message", "history", "science", "problem", "solution", "project",
  "meeting", "question", "answer", "document", "process", "system", "theory",
  "concept", "activity", "product", "service", "customer", "employee",
  "the", "of", "and", "to", "in", "a", "is", "that", "for", "it", "as", "was",
  "with", "be", "this", "by", "on", "not", "he", "are", "from", "at", "or",
  "have", "an", "one", "had", "were", "all", "their", "what", "can", "we",
  "there", "if", "use", "each", "which", "she", "do", "how", "will", "up",
  "other", "about", "out", "many", "then", "them", "these", "so", "some",
  "her", "would", "make", "like", "him", "into", "time", "has", "look",
  "two", "more", "write", "go", "see", "number", "way", "could", "people",
  "my", "than", "water", "first", "been", "call", "who", "oil", "its", "adventure", "innovation", "programming", "challenge", "efficient", "dynamic",
  "syntax", "variable", "function", "accuracy", "strategy", "workflow",
  "responsive", "interface", "design", "development", "optimization",
  "debugging", "scripting", "algorithm", "benchmark", "exploration"
];

let charSpans = [];    
let charIndex = 0;      
let mistakes = 0;      
let typedChars = 0;   
let timer = null;
let maxTime = 60;
let timeLeft = 60;
let isTyping = false;
let gameOver = false; 
let hasStarted = false; 


function generateRandomWords(count = 250) {
  let arr = [];
  for (let i = 0; i < count; i++) {
    let word;
    do {
      word = wordList[Math.floor(Math.random() * wordList.length)];
    } while (i > 0 && word === arr[i - 1]);
    arr.push(word);
  }
  return arr.join(" ");
}


function appendText(str) {
  const words = str.split(' ');
  textParagraph.innerHTML = ''; 
  charSpans = []; 
  
  words.forEach((word, index) => {
    const wordContainer = document.createElement('span');
    wordContainer.className = 'word-container';
    
    [...word].forEach(char => {
      const span = document.createElement('span');
      span.innerText = char;
      wordContainer.appendChild(span);
      charSpans.push(span);
    });


    textParagraph.appendChild(wordContainer);
    

    if (index < words.length - 1) {
      const spaceSpan = document.createElement('span');
      spaceSpan.innerText = ' ';
      spaceSpan.className = 'space';
      textParagraph.appendChild(spaceSpan);
      charSpans.push(spaceSpan);
    }
  });


  textContainer.scrollTop = 0;
}

function appendAdditionalText(str) {
  const words = str.split(' ');
  
  words.forEach((word, index) => {
 
    const wordContainer = document.createElement('span');
    wordContainer.className = 'word-container';
    
    [...word].forEach(char => {
      const span = document.createElement('span');
      span.innerText = char;
      wordContainer.appendChild(span);
      charSpans.push(span);
    });

    textParagraph.appendChild(wordContainer);
    

    if (index < words.length - 1) {
      const spaceSpan = document.createElement('span');
      spaceSpan.innerText = ' ';
      spaceSpan.className = 'space';
      textParagraph.appendChild(spaceSpan);
      charSpans.push(spaceSpan);
    }
  });
}


function loadText() {
  textParagraph.innerHTML = "";
  charSpans = [];
  charIndex = 0;
  mistakes = 0;
  typedChars = 0;
  timeLeft = maxTime;
  isTyping = false;
  gameOver = false;

  timeElement.innerText = timeLeft;
  accuracyElement.innerText = "100%";
  wpmElement.innerText = 0;
  cpmElement.innerText = 0;
  inputField.value = "";


  resetButton.style.display = "none";


  if (!hasStarted) {
    textContainer.classList.add("blurred");
  } else {
    textContainer.classList.remove("blurred");
  }


  const initialText = generateRandomWords(250);
  appendText(initialText);
  

  textContainer.scrollTop = 0;
  requestAnimationFrame(() => {
    textContainer.scrollTop = 0;
  });
}


function maybeAppendMoreText() {
  if (charIndex > charSpans.length - 50) {
    const moreText = generateRandomWords(100);
    appendAdditionalText(moreText);
  }
}


function scrollToActiveLetter() {
  const activeSpan = charSpans[charIndex];
  if (!activeSpan) return;

  const wordContainer = activeSpan.closest('.word-container');
  if (!wordContainer) return;

  const containerHeight = textContainer.clientHeight;
  const currentScroll = textContainer.scrollTop;
  const wordOffsetTop = wordContainer.offsetTop;
  const wordHeight = wordContainer.offsetHeight;


  if (wordOffsetTop + wordHeight > currentScroll + containerHeight) {
    textContainer.scrollTop = wordOffsetTop - 20; 
  }

  else if (wordOffsetTop < currentScroll) {
    textContainer.scrollTop = wordOffsetTop - 20;
  }
}


function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const scrollToActiveLetterDebounced = debounce(scrollToActiveLetter, 16);


function handleTyping() {
  try {
    if (!isTyping) {
      if (!hasStarted) hasStarted = true;
      textContainer.classList.remove("blurred");
      timer = setInterval(updateTimer, 1000);
      isTyping = true;
    }
    if (gameOver) return;

    let inputVal = inputField.value;
    let inputLen = inputVal.length;

    if (inputLen > charIndex) {
      let enteredChar = inputVal[inputLen - 1];
      let correctChar = charSpans[charIndex].innerText;
      typedChars++;

      if (enteredChar === correctChar) {
        charSpans[charIndex].classList.add("correct");
      } else {
        mistakes++;
        charSpans[charIndex].classList.add("incorrect");
      }
      charIndex++;
      maybeAppendMoreText();
    } else if (inputLen < charIndex) {

      if (charIndex > 0) {
        charIndex--;
        if (charSpans[charIndex].classList.contains("incorrect")) {
          mistakes--;
        }
        charSpans[charIndex].classList.remove("correct", "incorrect");
      }
    }
    updateStats();
    scrollToActiveLetterDebounced();
    updateActiveCursor(charIndex);
  } catch (error) {
    console.error('Error in typing handler:', error);
    endTest(); 
  }
}

function updateStats() {
  const timeElapsed = maxTime - timeLeft;
  const netChars = charIndex - mistakes;
  let wpm = 0;
  if (timeElapsed > 0) {
    wpm = Math.round((netChars / 5) / (timeElapsed / 60));
  }
  wpmElement.innerText = wpm;

  let cpm = 0;
  if (timeElapsed > 0) {
    cpm = Math.round(netChars / (timeElapsed / 60));
  }
  cpmElement.innerText = cpm;

  let accuracy = 100;
  if (typedChars > 0) {
    accuracy = Math.round((netChars / typedChars) * 100);
  }
  accuracyElement.innerText = accuracy + "%";
}


function updateTimer() {
  if (timeLeft > 0) {
    timeLeft--;
    timeElement.innerText = timeLeft;
  } else {
    endTest();
  }
}


function endTest() {
  clearInterval(timer);
  inputField.disabled = true;
  gameOver = true;
  const timeElapsed = maxTime - timeLeft;
  const netChars = charIndex - mistakes;


  let wpm = 0;
  if (timeElapsed > 0) {
    wpm = Math.round((netChars / 5) / (timeElapsed / 60));
  }
  finalWpm.innerText = wpm;


  let cpm = 0;
  if (timeElapsed > 0) {
    cpm = Math.round(netChars / (timeElapsed / 60));
  }
  finalCpm.innerText = cpm;


  let accuracy = 100;
  if (typedChars > 0) {
    accuracy = Math.round((netChars / typedChars) * 100);
  }
  finalAccuracy.innerText = accuracy + "%";


  resultsOverlay.classList.remove("hidden");
  resetButton.style.display = "block";
}


function resetTest() {
  if (!gameOver) return;
  clearInterval(timer);
  resultsOverlay.classList.add("hidden");
  inputField.disabled = false;
  maxTime = parseInt(timeSelect.value);
  loadText();
}


let keysPressed = {};
document.addEventListener("keydown", (e) => {
  keysPressed[e.key] = true;
  if (gameOver && keysPressed["Tab"] && keysPressed["Enter"]) {
    e.preventDefault();
    resetTest();
    keysPressed = {}; 
  }
});
document.addEventListener("keyup", (e) => {
  delete keysPressed[e.key];
});


inputField.addEventListener("input", handleTyping);
resetButton.addEventListener("click", resetTest);
startButton.addEventListener("click", () => {
  resetTest();
  textContainer.classList.remove("blurred");
  inputField.focus();
});
closeResults.addEventListener("click", () => {
  resultsOverlay.classList.add("hidden");
});

timeSelect.addEventListener("change", () => {
  if (!isTyping) {
    maxTime = parseInt(timeSelect.value);
    loadText();
  }
});


maxTime = parseInt(timeSelect.value);
loadText();


function updateActiveCursor(currentIndex) {
  document.querySelectorAll('.typing-text span').forEach(span => {
    span.classList.remove('active');
  });
  

  const currentSpan = charSpans[currentIndex];
  if (currentSpan) {
    const wordContainer = currentSpan.closest('.word-container');
    if (wordContainer) {
      wordContainer.style.backgroundColor = 'rgba(112, 161, 255, 0.1)';
      document.querySelectorAll('.word-container').forEach(container => {
        if (container !== wordContainer) {
          container.style.backgroundColor = 'transparent';
        }
      });
    }
    currentSpan.classList.add('active');
  }
}

