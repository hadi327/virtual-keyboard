(function() {
  // ----- layout definition -----
  const rows = [
    // row 1
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    // row 2
    ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    // row 3
    ['CapsLock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
    // row 4
    ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
    // row 5 (bottom)
    ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Fn', 'Ctrl']
  ];

  // mapping for special keys (used to identify and handle)
  const SPECIAL_KEYS = new Set([
    'Backspace', 'Tab', 'CapsLock', 'Enter', 'Shift', 'Ctrl', 'Alt', 'Win', 'Fn', 'Space'
  ]);

  // key codes for physical keyboard mapping (only for common keys)
  const KEY_MAP = {
    'Backspace': 'Backspace',
    'Tab': 'Tab',
    'CapsLock': 'CapsLock',
    'Enter': 'Enter',
    'Shift': 'ShiftLeft',
    'Ctrl': 'ControlLeft',
    'Alt': 'AltLeft',
    'Win': 'MetaLeft',
    'Fn': 'Fn',
    'Space': 'Space',
    '`': 'Backquote',
    '-': 'Minus',
    '=': 'Equal',
    '[': 'BracketLeft',
    ']': 'BracketRight',
    '\\': 'Backslash',
    ';': 'Semicolon',
    "'": 'Quote',
    ',': 'Comma',
    '.': 'Period',
    '/': 'Slash'
  };

  // reverse map for physical key -> virtual key label (lowercase for letters)
  const REV_KEY_MAP = {};
  for (const [label, code] of Object.entries(KEY_MAP)) {
    REV_KEY_MAP[code] = label;
  }
  // add letters manually
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(97 + i);
    REV_KEY_MAP[`Key${letter.toUpperCase()}`] = letter;
  }
  // digits
  for (let i = 0; i < 10; i++) {
    REV_KEY_MAP[`Digit${i}`] = String(i);
  }
  // also map ShiftRight, ControlRight, AltRight, MetaRight
  REV_KEY_MAP['ShiftRight'] = 'Shift';
  REV_KEY_MAP['ControlRight'] = 'Ctrl';
  REV_KEY_MAP['AltRight'] = 'Alt';
  REV_KEY_MAP['MetaRight'] = 'Win';

  // state
  let capsLockOn = false;
  let shiftPressed = false;

  const textInput = document.getElementById('textDisplay');
  const grid = document.getElementById('keyboardGrid');

  // ---- helpers ----
  function isSpecial(label) {
    return SPECIAL_KEYS.has(label);
  }

  function getKeyClass(label) {
    const classes = ['key'];
    if (label === 'Space') classes.push('space');
    else if (label === 'Backspace' || label === 'Tab' || label === 'CapsLock' || label === 'Enter' || label === 'Shift' || label === 'Ctrl' || label === 'Alt' || label === 'Win' || label === 'Fn') {
      classes.push('special');
      if (label === 'Backspace' || label === 'Enter' || label === 'Shift') classes.push('wide');
    }
    // handle shift/capslock active state
    if (label === 'CapsLock' && capsLockOn) classes.push('locked');
    if (label === 'Shift' && shiftPressed) classes.push('locked');
    return classes.join(' ');
  }

  // returns the display label (for shift we show uppercase, but we keep label)
  function getDisplayLabel(label) {
    if (label === 'Space') return '␣';
    if (label === 'Backspace') return '⌫';
    if (label === 'Enter') return '↵';
    if (label === 'Tab') return '⇥';
    if (label === 'CapsLock') return '⇪';
    if (label === 'Shift') return '⇧';
    if (label === 'Ctrl') return '⌃';
    if (label === 'Alt') return '⌥';
    if (label === 'Win') return '⊞';
    if (label === 'Fn') return 'Fn';
    // letters: if shift or caps lock, show uppercase
    if (/^[a-zA-Z]$/.test(label)) {
      if (capsLockOn || shiftPressed) return label.toUpperCase();
      return label.toLowerCase();
    }
    // symbols: shift mapping for some common ones (only for display)
    if (shiftPressed) {
      const shiftMap = {
        '1': '!', '2': '@', '3': '#', '4': '$', '5': '%', '6': '^', '7': '&', '8': '*', '9': '(', '0': ')',
        '-': '_', '=': '+', '[': '{', ']': '}', '\\': '|', ';': ':', "'": '"', ',': '<', '.': '>', '/': '?', '`': '~'
      };
      if (shiftMap[label]) return shiftMap[label];
    }
    return label;
  }

  // --- render keyboard ---
  function renderKeyboard() {
    grid.innerHTML = '';
    rows.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'row';
      row.forEach(label => {
        const keyBtn = document.createElement('button');
        keyBtn.className = getKeyClass(label);
        const displayText = getDisplayLabel(label);
        keyBtn.textContent = displayText;
        keyBtn.dataset.label = label;
        keyBtn.setAttribute('aria-label', label);
        keyBtn.addEventListener('click', (e) => {
          e.preventDefault();
          handleKeyPress(label);
        });
        rowDiv.appendChild(keyBtn);
      });
      grid.appendChild(rowDiv);
    });
  }

  // --- core key handling ---
  function handleKeyPress(label) {
    // update shift/caps state if needed
    if (label === 'CapsLock') {
      capsLockOn = !capsLockOn;
      shiftPressed = false;
      renderKeyboard();
      textInput.focus();
      return;
    }

    if (label === 'Shift') {
      shiftPressed = !shiftPressed;
      renderKeyboard();
      textInput.focus();
      return;
    }

    // handle other special keys
    if (label === 'Backspace') {
      const start = textInput.selectionStart;
      const end = textInput.selectionEnd;
      if (start === 0 && end === 0) {
        textInput.focus();
        return;
      }
      const value = textInput.value;
      if (start === end) {
        const newValue = value.slice(0, start - 1) + value.slice(start);
        textInput.value = newValue;
        textInput.selectionStart = textInput.selectionEnd = start - 1;
      } else {
        const newValue = value.slice(0, start) + value.slice(end);
        textInput.value = newValue;
        textInput.selectionStart = textInput.selectionEnd = start;
      }
      textInput.focus();
      renderKeyboard();
      return;
    }

    if (label === 'Enter') {
      const start = textInput.selectionStart;
      const end = textInput.selectionEnd;
      const value = textInput.value;
      const newValue = value.slice(0, start) + '\n' + value.slice(end);
      textInput.value = newValue;
      textInput.selectionStart = textInput.selectionEnd = start + 1;
      textInput.focus();
      return;
    }

    if (label === 'Tab') {
      const start = textInput.selectionStart;
      const end = textInput.selectionEnd;
      const value = textInput.value;
      const newValue = value.slice(0, start) + '  ' + value.slice(end);
      textInput.value = newValue;
      textInput.selectionStart = textInput.selectionEnd = start + 2;
      textInput.focus();
      return;
    }

    if (['Ctrl', 'Alt', 'Win', 'Fn'].includes(label)) {
      textInput.focus();
      return;
    }

    if (label === 'Space') {
      const start = textInput.selectionStart;
      const end = textInput.selectionEnd;
      const value = textInput.value;
      const newValue = value.slice(0, start) + ' ' + value.slice(end);
      textInput.value = newValue;
      textInput.selectionStart = textInput.selectionEnd = start + 1;
      textInput.focus();
      return;
    }

    // regular character (letters, digits, symbols)
    let char = label;
    if (/^[a-zA-Z]$/.test(label)) {
      if (capsLockOn || shiftPressed) {
        char = label.toUpperCase();
      } else {
        char = label.toLowerCase();
      }
    } else {
      if (shiftPressed) {
        const shiftMap = {
          '1': '!', '2': '@', '3': '#', '4': '$', '5': '%', '6': '^', '7': '&', '8': '*', '9': '(', '0': ')',
          '-': '_', '=': '+', '[': '{', ']': '}', '\\': '|', ';': ':', "'": '"', ',': '<', '.': '>', '/': '?', '`': '~'
        };
        if (shiftMap[label]) char = shiftMap[label];
      }
    }

    const start = textInput.selectionStart;
    const end = textInput.selectionEnd;
    const value = textInput.value;
    const newValue = value.slice(0, start) + char + value.slice(end);
    textInput.value = newValue;
    textInput.selectionStart = textInput.selectionEnd = start + 1;
    textInput.focus();

    if (shiftPressed) {
      shiftPressed = false;
      renderKeyboard();
    }
  }

  // ---- physical keyboard support ----
  function handlePhysicalKeyDown(e) {
    const code = e.code;
    if (document.activeElement !== textInput) {
      textInput.focus();
    }

    const label = REV_KEY_MAP[code];
    if (!label) {
      if (code.startsWith('Key')) {
        const letter = code.charAt(3).toLowerCase();
        if (letter >= 'a' && letter <= 'z') {
          e.preventDefault();
          handleKeyPress(letter);
        }
      }
      return;
    }

    e.preventDefault();

    if (label === 'Shift') {
      shiftPressed = true;
      renderKeyboard();
      return;
    }
    if (label === 'CapsLock') {
      capsLockOn = !capsLockOn;
      renderKeyboard();
      return;
    }

    handleKeyPress(label);
  }

  function handlePhysicalKeyUp(e) {
    const code = e.code;
    const label = REV_KEY_MAP[code];
    if (label === 'Shift') {
      shiftPressed = false;
      renderKeyboard();
      e.preventDefault();
    }
  }

  function preventDefaults(e) {
    const code = e.code;
    const label = REV_KEY_MAP[code];
    if (label) {
      e.preventDefault();
    }
  }

  // ---- init ----
  function init() {
    renderKeyboard();
    textInput.focus();

    document.addEventListener('keydown', handlePhysicalKeyDown);
    document.addEventListener('keyup', handlePhysicalKeyUp);
    document.addEventListener('keydown', preventDefaults);

    textInput.addEventListener('keydown', (e) => {
      const code = e.code;
      const label = REV_KEY_MAP[code];
      if (label || code.startsWith('Key') || code.startsWith('Digit')) {
        e.preventDefault();
      }
    });
  }

  init();
})();