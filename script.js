const winsList = document.getElementById("winsList");
const addButton = document.getElementById("addButton");
const addWinForm = document.getElementById("addWinForm");
const winInput = document.getElementById("winInput");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");
const emptyMessage = document.getElementById("emptyMessage");
const winCount = document.getElementById("winCount");
const counterSparkle = document.getElementById("counterSparkle");
const milestoneMessage = document.getElementById("milestoneMessage");
const trophyIcon = document.getElementById("trophyIcon");

const STORAGE_KEY = "tinyWins";
const DATE_KEY = "tinyWinsDate";
const COUNTER_ANIMATION_CLASS = "counter-pop-animation";
const SPARKLE_ANIMATION_CLASS = "active";
const MILESTONE_CLASS = "show";
const TROPHY_PULSE_CLASS = "trophy-pulse";
const MILESTONES = [5, 10, 25];

let wins = [];
let pulseIntervalId = null;

function showMilestoneMessage(count) {
  milestoneMessage.textContent = `🎉 ${count} Wins Today! Keep going!`;
  milestoneMessage.classList.add(MILESTONE_CLASS);
  setTimeout(() => {
    milestoneMessage.classList.remove(MILESTONE_CLASS);
  }, 3500);
}

function updateWinCounter(animate = false) {
  const count = wins.length;
  winCount.textContent = count;
  if (animate && count > 0) {
    winCount.classList.add(COUNTER_ANIMATION_CLASS);
    setTimeout(() => {
      winCount.classList.remove(COUNTER_ANIMATION_CLASS);
    }, 300);

    counterSparkle.classList.add(SPARKLE_ANIMATION_CLASS);
    setTimeout(() => {
      counterSparkle.classList.remove(SPARKLE_ANIMATION_CLASS);
    }, 500);
  }
}

function formatTime(date) {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function renderWin(win, prepend = true, animationDelay = 0) {
  const li = document.createElement("div");
  li.className = "px-4 py-3 win-item flex items-start ios-list-item-border";
  if (animationDelay > 0) {
    li.style.animationDelay = `${animationDelay}ms`;
  }
  const emojiSpan = document.createElement("span");
  emojiSpan.className = "mr-3 text-lg pt-1";
  emojiSpan.textContent = "⭐";
  const contentDiv = document.createElement("div");
  const timeSpan = document.createElement("span");
  timeSpan.className = "text-xs text-gray-500 block mb-1";
  timeSpan.textContent = win.time;
  const textP = document.createElement("p");
  textP.className = "text-gray-800";
  textP.textContent = win.text;
  contentDiv.appendChild(timeSpan);
  contentDiv.appendChild(textP);
  li.appendChild(emojiSpan);
  li.appendChild(contentDiv);
  if (prepend) {
    winsList.prepend(li);
  } else {
    winsList.appendChild(li);
  }
  emptyMessage.classList.add("hidden");
}

function renderAllWins() {
  winsList.innerHTML = "";
  if (wins.length === 0) {
    emptyMessage.classList.remove("hidden");
  } else {
    emptyMessage.classList.add("hidden");
    wins.forEach((win, index) => {
      renderWin(win, true, index * 75);
    });
  }
  updateWinCounter(false);
}

function saveWins() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wins));
    localStorage.setItem(DATE_KEY, new Date().toLocaleDateString());
  } catch (e) {
    console.error("Error saving to local storage:", e);
  }
}

function loadWins() {
  try {
    const storedDate = localStorage.getItem(DATE_KEY);
    const todayDate = new Date().toLocaleDateString();
    if (storedDate === todayDate) {
      const storedWins = localStorage.getItem(STORAGE_KEY);
      wins = storedWins ? JSON.parse(storedWins) : [];
    } else {
      wins = [];
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(DATE_KEY, todayDate);
      console.log("New day detected, cleared previous wins.");
    }
  } catch (e) {
    console.error("Error loading from local storage:", e);
    wins = [];
  }
  renderAllWins();
}

function showInputForm() {
  addWinForm.classList.remove("hidden");
  addWinForm.style.opacity = "0";
  addWinForm.style.transform = "translateY(10px)";
  addButton.classList.add("hidden");
  requestAnimationFrame(() => {
    addWinForm.style.opacity = "1";
    addWinForm.style.transform = "translateY(0)";
    winInput.focus();
  });
}

function hideInputForm() {
  addWinForm.style.opacity = "0";
  addWinForm.style.transform = "translateY(10px)";
  setTimeout(() => {
    addWinForm.classList.add("hidden");
    addButton.classList.remove("hidden");
    winInput.value = "";
  }, 300);
}

function checkTimeForPulse() {
  const currentHour = new Date().getHours();
  if (currentHour >= 17) {
    if (!trophyIcon.classList.contains(TROPHY_PULSE_CLASS)) {
      trophyIcon.classList.add(TROPHY_PULSE_CLASS);
    }
  } else {
    if (trophyIcon.classList.contains(TROPHY_PULSE_CLASS)) {
      trophyIcon.classList.remove(TROPHY_PULSE_CLASS);
    }
  }
}

addButton.addEventListener("click", showInputForm);
cancelButton.addEventListener("click", hideInputForm);
addWinForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const winText = winInput.value.trim();
  if (winText) {
    const newWin = { text: winText, time: formatTime(new Date()) };
    wins.unshift(newWin);
    saveWins();
    renderWin(newWin, true, 0);
    updateWinCounter(true);

    if (MILESTONES.includes(wins.length)) {
      showMilestoneMessage(wins.length);
    }

    hideInputForm();
  } else {
    winInput.classList.add("border-red-500", "ring-red-500", "ring-1");
    setTimeout(() => {
      winInput.classList.remove("border-red-500", "ring-red-500", "ring-1");
    }, 1500);
  }
});

window.addEventListener("load", () => {
  loadWins();
  checkTimeForPulse();
  if (pulseIntervalId) clearInterval(pulseIntervalId);
  pulseIntervalId = setInterval(checkTimeForPulse, 5 * 60 * 1000);
});
