(() => {
  let currentMode = 'solve';
  let selectedNumber = null;
  let boardSize = null;
  const boardData = [];
  const modeCandidateBtn = document.getElementById('modeCandidate');
  const modeSolveBtn = document.getElementById('modeSolve');

  function blurCell() {
    document.querySelectorAll('.cell').forEach(el => el.classList.remove('same'));
  }

  function hoverCell() {
    const selector = `[data-row="${this.dataset.row}"],` + 
                     `[data-col="${this.dataset.col}"]`;
                     //`[data-region="${this.dataset.region}"]`;
    document.querySelectorAll(selector).forEach(el => el.classList.add('same'));
  }

  function save() {
    var data = [];
    document.querySelectorAll('#board .cell').forEach(cell => {
      data.push([cell.dataset.value || '', cell.dataset.candidates || ''].join('|'));
    });
    localStorage.setItem(`save-${boardSize}`, data.join(','));
  }

  function load() {
    var storedData = localStorage.getItem(`save-${boardSize}`); 
    if (!storedData) return;
    storedData.split(',').forEach((item, i) => {
      let value, candidates;
      [value, candidates] = item.split('|');
      const cell = document.querySelector(`#board .cell:nth-child(${i+1})`);
      cell.dataset.value = value;
      cell.dataset.candidates = candidates;
      updateCell(cell);
    });

  }

  function updateCell(el) {
    if (el.dataset.value) {
      el.classList.add('solved');
    } else {
      el.classList.remove('solved');
    }
    // set candidate numbers
    el.querySelectorAll('.candidates span').forEach(el => el.textContent = '');
    const currentNums = new Set();
    (el.dataset.candidates || '').split('').forEach(n => currentNums.add(n));
    Array.from(currentNums).sort().forEach(num => {
      const span = el.querySelector(`.candidates span[data-number="${num.toLowerCase()}"]`);
      span.textContent = num;
    });
  }

  function clickCell() {
    if (currentMode == 'solve') {
      if (!selectedNumber) return;
      if (selectedNumber == this.dataset.value) {
        this.dataset.value = '';
      } else {
        this.dataset.value = selectedNumber;
      }
    } else {
      if (!selectedNumber) return;
      if (this.dataset.value) return;
      const currentNums = new Set();
      (this.dataset.candidates || '').split('').forEach(n => currentNums.add(n));
      if (currentNums.has(selectedNumber)) {
        currentNums.delete(selectedNumber);
      } else {
        currentNums.add(selectedNumber);
      }
      this.dataset.candidates = Array.from(currentNums).sort().join('');
    }
    updateCell(this);
    save();
    //chooseNumber(null);
  }

  function chooseMode(mode) {
    currentMode = mode;
    document.querySelectorAll('#modeButtons button').forEach(el => el.classList.remove('active'));
    if (currentMode == 'solve') modeSolve.classList.add('active');
    if (currentMode == 'candidate') modeCandidate.classList.add('active');
  }

  function chooseNumber(num) {
    document.querySelectorAll('#numberButtons button').forEach(el => el.classList.remove('active'));
    if (!num || num == selectedNumber) {
      selectedNumber = null;
      return;
    }
    document.querySelector(`#numberButtons button[data-number="${num}"]`).classList.add('active');
    selectedNumber = num;
  }

  function idxToNum(i) {
    return boardSize < 10 ? (i + 1).toString() : i.toString(boardSize)
  }

  const sizeSelect = document.querySelector('select[name="boardSize"]');
  const initBoard = function() {
    boardSize = localStorage.getItem('boardSize') || 9;
    const regionSize = Math.sqrt(boardSize);
    const board = document.getElementById('board');
    const root = document.querySelector('html');

    sizeSelect.value = boardSize.toString();
    board.dataset.size = boardSize;
    root.setAttribute('style', `--board-size: ${boardSize}; --region-size: ${regionSize}`);

    // modes
    modeCandidateBtn.addEventListener('click', () => chooseMode('candidate'));
    modeSolveBtn.addEventListener('click', () => chooseMode('solve'));

    // clear board
    board.innerHTML = '';
    i = 0;
    for (let row=0; row<boardSize; row++) {
      for (let col=0; col<boardSize; col++) {
        let cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.dataset.region = (Math.floor(row / regionSize) * regionSize) + Math.floor(col / regionSize);
        cell.dataset.regionRow = Math.floor(row % regionSize);
        cell.dataset.regionCol = Math.floor(col % regionSize);
        board.appendChild(cell);
        i++;

        cell.addEventListener('mouseover', hoverCell);
        cell.addEventListener('mouseout', blurCell);
        cell.addEventListener('click', clickCell);

        let candidates = document.createElement('div');
        candidates.classList.add('candidates');
        cell.appendChild(candidates);

        for (let i=0; i<boardSize; i++) {
          let span = document.createElement('span');
          span.dataset.number = idxToNum(i);
          candidates.appendChild(span);
        }
      };
    }
    
    // set up number buttons
    const numberButtonsRow = document.getElementById('numberButtons');
    numberButtonsRow.innerHTML = '';
    for (let i=0; i<boardSize; i++) {
      const num = idxToNum(i);
      if (i == 0) currentNumber = num;
      const btn = document.createElement('button');
      btn.dataset.number = num.toUpperCase();
      btn.textContent = num.toUpperCase();
      btn.addEventListener('click', () => chooseNumber(btn.dataset.number));
      numberButtonsRow.appendChild(btn);
    }

    chooseMode('solve');
    load();
  }

  initBoard();
  sizeSelect.addEventListener('change', () => {
    localStorage.setItem('boardSize', sizeSelect.value);
    initBoard();
  });
})();
