/* ==========================================================================
   Roll & Speak: Autumn Forest Path - Game Engine Logic
   ========================================================================== */

// --- EMBEDDED FALLBACK DATA (guarantees offline/local file functionality) ---
const FALLBACK_QUESTIONS = {
  "spaces": [
    { "id": 0, "type": "start", "text": "Start your journey through the Autumn Forest!" },
    { "id": 1, "type": "question", "text": "What is your favorite autumn activity and why?" },
    { "id": 2, "type": "question", "text": "Describe your favorite animal using 3 adjectives." },
    { "id": 3, "type": "special", "icon": "mushroom", "text": "🍄 Mushroom Patch! Slip on a damp mushroom. Go back 2 spaces.", "action": { "move": -2 } },
    { "id": 4, "type": "question", "text": "Talk about your best friend. What do you like doing together?" },
    { "id": 5, "type": "special", "icon": "acorn", "text": "🌰 Lucky Acorn! You found a crunchy treat. Move forward 1 space.", "action": { "move": 1 } },
    { "id": 6, "type": "question", "text": "What do you usually eat for breakfast on cold autumn mornings?" },
    { "id": 7, "type": "special", "icon": "leaf", "text": "🍂 Swirling Leaf! A gust of autumn wind boosts you! Take a bonus roll!", "action": { "bonus": true } },
    { "id": 8, "type": "question", "text": "Which season do you like best: Autumn, Winter, Spring, or Summer?" },
    { "id": 9, "type": "special", "icon": "hedgehog", "text": "🦔 Sleepy Hedgehog! You stopped to nap in warm leaves. Skip your next turn.", "action": { "skip": true } },
    { "id": 10, "type": "question", "text": "Tell us about something fun you did last weekend." },
    { "id": 11, "type": "special", "icon": "owl", "text": "🦉 Wise Owl! Wisdom share: Ask another player any question in English!", "action": { "ask_other": true } },
    { "id": 12, "type": "question", "text": "Name 3 things you can see in an autumn forest." },
    { "id": 13, "type": "special", "icon": "squirrel-run", "text": "🐿️ Squirrel Sprint! Dash along the treetops! Move forward 2 spaces.", "action": { "move": 2 } },
    { "id": 14, "type": "question", "text": "What is your favorite book, movie, or fairy tale?" },
    { "id": 15, "type": "special", "icon": "mushroom", "text": "🎭 Forest Charades! Act out your favorite animal without speaking for 20 seconds!", "action": { "act_out": true } },
    { "id": 16, "type": "question", "text": "What clothes do you wear when it rains outside?" },
    { "id": 17, "type": "special", "icon": "acorn", "text": "🌰 Heavy Acorn! Your backpack is too heavy. Go back 1 space.", "action": { "move": -1 } },
    { "id": 18, "type": "question", "text": "If you could have any superpower in the forest, what would it be?" },
    { "id": 19, "type": "question", "text": "What are you looking forward to doing this month?" },
    { "id": 20, "type": "finish", "text": "🎉 You made it through the Autumn Forest! Congratulations!" }
  ]
};

// --- DEFAULT CHARACTERS & TEAMS ---
const CHARACTER_DEFS = [
  { id: 'fox', name: 'Fox Team', icon: 'assets/tokens/token-fox.png', color: '#C4614A' },
  { id: 'owl', name: 'Owl Team', icon: 'assets/tokens/token-owl.png', color: '#6E7F4E' },
  { id: 'squirrel', name: 'Squirrel Team', icon: 'assets/tokens/token-squirrel.png', color: '#E3A857' },
  { id: 'hedgehog', name: 'Hedgehog Team', icon: 'assets/tokens/token-hedgehog.png', color: '#4A342A' }
];

// --- GAME STATE ---
let spacesData = [];
let players = [];
let currentPlayerIndex = 0;
let isRolling = false;
let isMoving = false;
let isBonusTurn = false;
let pendingSpecialAction = null;
let selectedPlayerCount = 2;

// --- DOM ELEMENTS ---
const setupModal = document.getElementById('setupModal');
const setupForm = document.getElementById('setupForm');
const teamInputsContainer = document.getElementById('teamInputs');
const boardGrid = document.getElementById('boardGrid');
const playersList = document.getElementById('playersList');
const turnPlayerAvatar = document.getElementById('turnPlayerToken');
const turnPlayerName = document.getElementById('turnPlayerName');

const diceImage = document.getElementById('diceImage');
const diceDisplay = document.getElementById('diceDisplay');
const btnRoll = document.getElementById('btnRoll');

const questionModal = document.getElementById('questionModal');
const qModalAvatar = document.getElementById('qModalAvatar');
const qModalPlayerName = document.getElementById('qModalPlayerName');
const qModalText = document.getElementById('qModalText');
const qSpaceNumber = document.getElementById('qSpaceNumber');
const btnCloseQuestion = document.getElementById('btnCloseQuestion');

const specialModal = document.getElementById('specialModal');
const specModalIcon = document.getElementById('specModalIcon');
const specModalTitle = document.getElementById('specModalTitle');
const specModalText = document.getElementById('specModalText');
const btnCloseSpecial = document.getElementById('btnCloseSpecial');

const victoryModal = document.getElementById('victoryModal');
const vicModalAvatar = document.getElementById('vicModalAvatar');
const vicModalWinnerName = document.getElementById('vicModalWinnerName');
const btnPlayAgain = document.getElementById('btnPlayAgain');
const btnChangeSetup = document.getElementById('btnChangeSetup');

const rulesModal = document.getElementById('rulesModal');
const btnRules = document.getElementById('btnRules');
const btnCloseRules = document.getElementById('btnCloseRules');
const btnNewGame = document.getElementById('btnNewGame');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
  await loadSpacesData();
  initSetupUI();
  setupEventListeners();
});

// Load questions via fetch with fallback
async function loadSpacesData() {
  try {
    const response = await fetch('data/questions.json');
    if (!response.ok) throw new Error('Network response not ok');
    const data = await response.json();
    spacesData = data.spaces || FALLBACK_QUESTIONS.spaces;
  } catch (err) {
    console.warn('Using fallback questions data (file fetch restricted or offline):', err);
    spacesData = FALLBACK_QUESTIONS.spaces;
  }
}

// Setup Form UI Initialization
function initSetupUI() {
  const countBtns = document.querySelectorAll('.count-btn');
  countBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      countBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPlayerCount = parseInt(btn.dataset.count, 10);
      renderTeamInputs(selectedPlayerCount);
    });
  });

  renderTeamInputs(selectedPlayerCount);
}

function renderTeamInputs(count) {
  teamInputsContainer.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const char = CHARACTER_DEFS[i];
    const row = document.createElement('div');
    row.className = 'team-input-row';
    row.innerHTML = `
      <img src="${char.icon}" alt="${char.name}" class="team-input-avatar">
      <input type="text" class="team-input-field" id="teamNameInput_${i}" value="${char.name}" placeholder="Team ${i+1} Name">
    `;
    teamInputsContainer.appendChild(row);
  }
}

function setupEventListeners() {
  setupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    startGame();
  });

  btnRoll.addEventListener('click', rollDie);
  diceDisplay.addEventListener('click', rollDie);

  btnCloseQuestion.addEventListener('click', () => {
    closeModal(questionModal);
    advanceTurn();
  });

  btnCloseSpecial.addEventListener('click', () => {
    closeModal(specialModal);
    if (pendingSpecialAction) {
      const act = pendingSpecialAction;
      pendingSpecialAction = null;

      if (act.move) {
        // Execute move effect (e.g. go back 2 spaces or forward 1)
        movePlayerRelative(act.move);
        return;
      } else if (act.bonus) {
        isBonusTurn = true;
      } else if (act.skip) {
        players[currentPlayerIndex].isSkipped = true;
      }
    }
    advanceTurn();
  });

  btnPlayAgain.addEventListener('click', () => {
    closeModal(victoryModal);
    resetGamePositions();
  });

  btnChangeSetup.addEventListener('click', () => {
    closeModal(victoryModal);
    openModal(setupModal);
  });

  btnNewGame.addEventListener('click', () => {
    openModal(setupModal);
  });

  btnRules.addEventListener('click', () => {
    openModal(rulesModal);
  });

  btnCloseRules.addEventListener('click', () => {
    closeModal(rulesModal);
  });

  // Global Keyboard Navigation
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      // Check if any modal is active
      const activeModal = document.querySelector('.modal-overlay.active');
      if (activeModal) {
        if (activeModal === questionModal) {
          btnCloseQuestion.click();
        } else if (activeModal === specialModal) {
          btnCloseSpecial.click();
        } else if (activeModal === rulesModal) {
          btnCloseRules.click();
        }
      } else {
        e.preventDefault();
        rollDie();
      }
    } else if (e.code === 'Escape') {
      const activeModal = document.querySelector('.modal-overlay.active');
      if (activeModal && activeModal !== setupModal) {
        closeModal(activeModal);
      }
    }
  });
}

// Start Game from Setup
function startGame() {
  players = [];
  for (let i = 0; i < selectedPlayerCount; i++) {
    const char = CHARACTER_DEFS[i];
    const nameInput = document.getElementById(`teamNameInput_${i}`);
    const name = nameInput ? nameInput.value.trim() || char.name : char.name;
    players.push({
      id: i,
      name: name,
      token: char.id,
      tokenImg: char.icon,
      color: char.color,
      position: 0,
      isSkipped: false
    });
  }

  currentPlayerIndex = 0;
  isBonusTurn = false;
  closeModal(setupModal);

  renderBoard();
  renderPlayersList();
  updateTurnIndicator();
  renderTokensOnBoard();
}

function resetGamePositions() {
  players.forEach(p => {
    p.position = 0;
    p.isSkipped = false;
  });
  currentPlayerIndex = 0;
  isBonusTurn = false;
  renderPlayersList();
  updateTurnIndicator();
  renderTokensOnBoard();
}

// --- RENDER BOARD (SERPENTINE SNAKE PATH) ---
function renderBoard() {
  boardGrid.innerHTML = '';

  // 4 rows of 5 spaces (0-4, 5-9, 10-14, 15-19) + 1 finish row (20)
  const rows = [
    { start: 0, end: 4, reverse: false },
    { start: 5, end: 9, reverse: true },
    { start: 10, end: 14, reverse: false },
    { start: 15, end: 19, reverse: true }
  ];

  rows.forEach((r, rowIdx) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'board-row';

    let spaceIds = [];
    for (let i = r.start; i <= r.end; i++) {
      spaceIds.push(i);
    }
    if (r.reverse) spaceIds.reverse();

    spaceIds.forEach(id => {
      const spaceObj = spacesData.find(s => s.id === id) || { id, type: 'question', text: '' };
      const spaceEl = createSpaceElement(spaceObj);
      rowEl.appendChild(spaceEl);
    });

    boardGrid.appendChild(rowEl);
  });

  // Finish row space 20
  const finishRow = document.createElement('div');
  finishRow.className = 'board-row board-row-finish';
  const finishObj = spacesData.find(s => s.id === 20) || { id: 20, type: 'finish', text: 'Finish!' };
  const finishEl = createSpaceElement(finishObj);
  finishRow.appendChild(finishEl);
  boardGrid.appendChild(finishRow);
}

function createSpaceElement(space) {
  const el = document.createElement('div');
  el.className = `board-space space-type-${space.type}`;
  el.id = `space-${space.id}`;

  let iconHtml = '';
  if (space.type === 'start') {
    iconHtml = `<div class="space-icon-wrap"><span class="space-q-bubble">🏁</span></div><div class="space-label">START</div>`;
  } else if (space.type === 'finish') {
    iconHtml = `<div class="space-icon-wrap"><span class="space-q-bubble">🏆</span></div><div class="space-label">FINISH</div>`;
  } else if (space.type === 'special') {
    iconHtml = `<div class="space-icon-wrap"><img src="assets/icons/icon-${space.icon}.png" class="space-icon" alt="${space.icon}"></div>
                <div class="space-label">${getSpecialLabel(space.icon)}</div>`;
  } else {
    // Question space
    iconHtml = `<div class="space-icon-wrap"><span class="space-q-bubble">💬</span></div><div class="space-label">QUESTION</div>`;
  }

  el.innerHTML = `
    <div class="space-header">
      <span class="space-number">${space.id}</span>
    </div>
    ${iconHtml}
    <div class="space-tokens-container" id="space-tokens-${space.id}"></div>
  `;
  return el;
}

function getSpecialLabel(iconKey) {
  switch (iconKey) {
    case 'mushroom': return 'Mushroom';
    case 'acorn': return 'Acorn';
    case 'leaf': return 'Bonus Roll';
    case 'hedgehog': return 'Rest Nap';
    case 'owl': return 'Wise Ask';
    case 'squirrel-run': return 'Sprint';
    default: return 'Special';
  }
}

// Render Player Tokens on the Board
function renderTokensOnBoard() {
  // Clear all token containers
  for (let i = 0; i <= 20; i++) {
    const container = document.getElementById(`space-tokens-${i}`);
    if (container) container.innerHTML = '';
  }

  // Clear landing highlight
  document.querySelectorAll('.board-space').forEach(el => el.classList.remove('active-landing'));

  // Place tokens
  players.forEach((p) => {
    const container = document.getElementById(`space-tokens-${p.position}`);
    if (container) {
      const img = document.createElement('img');
      img.src = p.tokenImg;
      img.alt = p.name;
      img.className = 'space-token-img';
      img.title = `${p.name} (Position: ${p.position})`;
      img.style.borderColor = p.color;
      container.appendChild(img);
    }
  });

  // Highlight current active player's space
  const curPlayer = players[currentPlayerIndex];
  if (curPlayer) {
    const activeSpace = document.getElementById(`space-${curPlayer.position}`);
    if (activeSpace) activeSpace.classList.add('active-landing');
  }
}

// Render Players Panel Status Cards
function renderPlayersList() {
  playersList.innerHTML = '';
  players.forEach((p, index) => {
    const isCurrent = index === currentPlayerIndex;
    const card = document.createElement('div');
    card.className = `player-status-card ${isCurrent ? 'active-turn' : ''}`;
    card.style.borderLeft = `6px solid ${p.color}`;

    card.innerHTML = `
      <div class="player-info">
        <img src="${p.tokenImg}" alt="${p.name}" class="player-token-badge">
        <div>
          <div class="player-name-text">${p.name}</div>
          ${p.isSkipped ? '<span class="status-skipped">Skipped next turn</span>' : ''}
        </div>
      </div>
      <div class="player-pos-badge" title="Current Space">#${p.position}</div>
    `;
    playersList.appendChild(card);
  });
}

// Update Turn Indicator Banner
function updateTurnIndicator() {
  const p = players[currentPlayerIndex];
  if (!p) return;
  turnPlayerAvatar.src = p.tokenImg;
  turnPlayerName.textContent = isBonusTurn ? `${p.name} (Bonus Roll!)` : p.name;
  turnPlayerName.style.color = p.color;
  renderPlayersList();
}

// --- DICE ROLL & MOVEMENT ---
function rollDie() {
  if (isRolling || isMoving) return;
  const activeModal = document.querySelector('.modal-overlay.active');
  if (activeModal) return;

  isRolling = true;
  btnRoll.disabled = true;

  // Dice shuffling animation
  diceImage.classList.add('rolling');
  let counter = 0;
  const rollInterval = setInterval(() => {
    const randomFace = Math.floor(Math.random() * 6) + 1;
    diceImage.src = `assets/dice/dice-${randomFace}.png`;
    counter++;
    if (counter > 7) {
      clearInterval(rollInterval);
      const result = Math.floor(Math.random() * 6) + 1;
      diceImage.src = `assets/dice/dice-${result}.png`;
      diceImage.classList.remove('rolling');

      setTimeout(() => {
        isRolling = false;
        btnRoll.disabled = false;
        stepPlayerForward(currentPlayerIndex, result);
      }, 200);
    }
  }, 70);
}

// Step player forward cell-by-cell
async function stepPlayerForward(playerIndex, steps) {
  isMoving = true;
  const player = players[playerIndex];
  const targetPos = Math.min(player.position + steps, 20);

  while (player.position < targetPos) {
    player.position++;
    renderTokensOnBoard();
    renderPlayersList();
    await delay(300);
  }

  isMoving = false;
  handleLanding(player.position);
}

// Step player backward or forward for relative special action
async function movePlayerRelative(steps) {
  isMoving = true;
  const player = players[currentPlayerIndex];
  let targetPos = player.position + steps;
  if (targetPos < 0) targetPos = 0;
  if (targetPos > 20) targetPos = 20;

  const direction = steps > 0 ? 1 : -1;
  while (player.position !== targetPos) {
    player.position += direction;
    renderTokensOnBoard();
    renderPlayersList();
    await delay(300);
  }

  isMoving = false;
  // If moving relative triggers landing, check if question or finish
  if (player.position === 20) {
    showVictoryScreen(player);
  } else {
    advanceTurn();
  }
}

// Handle Landing on a Space
function handleLanding(position) {
  const player = players[currentPlayerIndex];
  const space = spacesData.find(s => s.id === position) || { id: position, type: 'question', text: 'Answer the prompt!' };

  if (position === 20 || space.type === 'finish') {
    showVictoryScreen(player);
    return;
  }

  if (space.type === 'question') {
    qModalAvatar.src = player.tokenImg;
    qModalPlayerName.textContent = `${player.name}'s Question`;
    qModalPlayerName.style.color = player.color;
    qSpaceNumber.textContent = `Space #${space.id}`;
    qModalText.textContent = space.text;
    openModal(questionModal);
  } else if (space.type === 'special') {
    specModalIcon.src = `assets/icons/icon-${space.icon}.png`;
    specModalTitle.textContent = getSpecialTitle(space.icon);
    specModalText.textContent = space.text;
    pendingSpecialAction = space.action || null;
    openModal(specialModal);
  } else {
    // Start or plain space
    advanceTurn();
  }
}

function getSpecialTitle(iconKey) {
  switch (iconKey) {
    case 'mushroom': return 'Forest Mushroom!';
    case 'acorn': return 'Acorn Discovery!';
    case 'leaf': return 'Autumn Wind!';
    case 'hedgehog': return 'Sleepy Rest!';
    case 'owl': return 'Wise Owl Advice!';
    case 'squirrel-run': return 'Squirrel Sprint!';
    default: return 'Special Event!';
  }
}

// --- TURN MANAGEMENT ---
function advanceTurn() {
  if (isBonusTurn) {
    isBonusTurn = false;
    // Keep turn on current player!
  } else {
    // Advance to next player
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;

    // Check if next player is skipped
    if (players[currentPlayerIndex].isSkipped) {
      const skippedPlayer = players[currentPlayerIndex];
      skippedPlayer.isSkipped = false; // reset skip flag

      // Alert or brief notice then pass to next player
      setTimeout(() => {
        alert(`🦔 ${skippedPlayer.name} is sleeping in the leaves and skips this turn!`);
        advanceTurn();
      }, 100);
      return;
    }
  }

  updateTurnIndicator();
  renderTokensOnBoard();
}

// --- VICTORY SCREEN & CONFETTI ---
function showVictoryScreen(winnerPlayer) {
  vicModalAvatar.src = winnerPlayer.tokenImg;
  vicModalWinnerName.textContent = winnerPlayer.name;
  vicModalWinnerName.style.color = winnerPlayer.color;

  createConfetti();
  openModal(victoryModal);
}

function createConfetti() {
  const container = document.getElementById('confettiContainer');
  container.innerHTML = '';
  const colors = ['#C4614A', '#E3A857', '#6E7F4E', '#4A342A', '#FAF6EE'];

  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.style.position = 'absolute';
    piece.style.width = `${Math.random() * 10 + 6}px`;
    piece.style.height = `${Math.random() * 10 + 6}px`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.top = `-20px`;
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.opacity = Math.random() + 0.5;

    const duration = Math.random() * 2 + 1.5;
    const delayVal = Math.random() * 0.5;
    piece.style.animation = `fall ${duration}s ease-in ${delayVal}s infinite`;

    container.appendChild(piece);
  }
}

// Add CSS keyframe dynamically for confetti fall
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes fall {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(400px) rotate(360deg); opacity: 0; }
}
`;
document.head.appendChild(styleSheet);

// --- MODAL HELPERS ---
function openModal(modalEl) {
  modalEl.classList.add('active');
}

function closeModal(modalEl) {
  modalEl.classList.remove('active');
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
