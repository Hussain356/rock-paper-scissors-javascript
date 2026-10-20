const gameContainer = document.querySelector(".container"),
  userResult = document.querySelector(".user_result img"),
  cpuResult = document.querySelector(".cpu_result img"),
  result = document.querySelector(".result"),
  optionButtons = document.querySelectorAll(".option_image"),
  resetBtn = document.querySelector("#reset"),
  scoreEls = {
    user: document.querySelector("#score-user"),
    draw: document.querySelector("#score-draw"),
    cpu: document.querySelector("#score-cpu"),
  };

const CHOICES = ["rock", "paper", "scissors"];
const IMAGES = {
  rock: "images/rock.png",
  paper: "images/paper.png",
  scissors: "images/scissors.png",
};
// Each key beats the value
const BEATS = { rock: "scissors", paper: "rock", scissors: "paper" };
const SHAKE_MS = 1500; // length of the "Wait..." shake animation
const STORAGE_KEY = "rps-score";

let busy = false; // blocks new rounds while one is being played
let score = { user: 0, draw: 0, cpu: 0 };

// Load the saved score (if any); storage can be unavailable, so guard it
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (saved && ["user", "draw", "cpu"].every((k) => Number.isInteger(saved[k]))) score = saved;
} catch (e) {}

const renderScore = () => {
  Object.keys(scoreEls).forEach((k) => (scoreEls[k].textContent = score[k]));
};

const saveScore = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(score));
  } catch (e) {}
};

const getOutcome = (user, cpu) => {
  if (user === cpu) return "draw";
  return BEATS[user] === cpu ? "user" : "cpu";
};

const playRound = (userChoice) => {
  if (busy) return;
  busy = true;

  optionButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.choice === userChoice));
  userResult.src = cpuResult.src = IMAGES.rock;
  result.className = "result";
  result.textContent = "Wait...";
  gameContainer.classList.add("start");
  optionButtons.forEach((btn) => (btn.disabled = true));

  setTimeout(() => {
    const cpuChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];
    const outcome = getOutcome(userChoice, cpuChoice);

    gameContainer.classList.remove("start");
    userResult.src = IMAGES[userChoice];
    cpuResult.src = IMAGES[cpuChoice];

    score[outcome]++;
    renderScore();
    saveScore();

    result.classList.add(outcome);
    result.textContent =
      outcome === "draw" ? "Match Draw" : outcome === "user" ? "You Won!!" : "CPU Won!!";

    optionButtons.forEach((btn) => (btn.disabled = false));
    busy = false;
  }, SHAKE_MS);
};

optionButtons.forEach((btn) => btn.addEventListener("click", () => playRound(btn.dataset.choice)));

// Keyboard shortcuts: R / P / S (or 1 / 2 / 3)
const KEYS = { r: "rock", p: "paper", s: "scissors", 1: "rock", 2: "paper", 3: "scissors" };
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
  const choice = KEYS[e.key.toLowerCase()];
  if (choice) playRound(choice);
});

resetBtn.addEventListener("click", () => {
  if (busy) return;
  score = { user: 0, draw: 0, cpu: 0 };
  renderScore();
  saveScore();
  optionButtons.forEach((btn) => btn.classList.remove("active"));
  userResult.src = cpuResult.src = IMAGES.rock;
  result.className = "result";
  result.textContent = "Let's Play!!";
});

renderScore();
