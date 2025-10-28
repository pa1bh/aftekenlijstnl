// Register service worker for PWA support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js", { scope: "./" })
      .then((registration) => {
        console.log("Service Worker geregistreerd:", registration.scope);
      })
      .catch((error) => {
        console.error("Service Worker registratie mislukt:", error);
      });
  });
}

// Configuration constants
const ANIMATION_CONFIG = {
  SPARKLE_COUNT: 18,
  SPARKLE_MIN_DISTANCE: 48,
  SPARKLE_MAX_DISTANCE: 96,
  SPARKLE_MIN_SIZE: 22,
  SPARKLE_MAX_SIZE: 36,
  SPARKLE_ANIMATION_MAX_DELAY: 160,
  SPARKLE_DURATION: 1100,
  CELEBRATION_DURATION: 520
};

const STORAGE_KEY = "lize-checklist-state";

const sparkleGlyphs = ["✨", "🌟", "💖", "🎉", "💫", "🎈", "🦄", "☀️"];

const tasks = [
  { id: "aankleden", icon: "👗", label: "Aankleden" },
  { id: "tandenpoetsen", icon: "🪥", label: "Tandenpoetsen" },
  { id: "haren", icon: "💇‍♀️", label: "Haren doen" },
  { id: "eten", icon: "🍽️", label: "Eten" },
  { id: "drinken", icon: "🥤", label: "Drinken" },
  { id: "schoenen", icon: "👟", label: "Schoenen aan" },
  { id: "tas", icon: "🎒", label: "Tas klaarmaken" },
  { id: "jas", icon: "🧥", label: "Jas aan" }
];

const checklist = document.getElementById("checklist");
const progressLabel = document.getElementById("progress-label");
const progressBar = document.getElementById("progress-bar");
const progressContainer = document.querySelector(".progress");
const celebrationMessage = document.getElementById("celebration-message");
const resetButton = document.getElementById("reset-checklist");
const cardContainer = document.querySelector(".card");

const state = new Map();
const cardCache = new Map();
const total = tasks.length;

const loadStoredState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);
    return typeof parsed === "object" && parsed !== null ? parsed : null;
  } catch (error) {
    console.warn("Kon opgeslagen staat niet laden:", error.message);
    return null;
  }
};

const persistState = () => {
  try {
    const payload = {};
    state.forEach((value, key) => {
      payload[key] = value;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("Kon voortgang niet opslaan:", error.message);
    // Show user feedback if storage fails
    if (progressLabel) {
      const originalText = progressLabel.textContent;
      progressLabel.textContent = "⚠️ Opslaan mislukt";
      progressLabel.style.color = "#ff6b6b";
      setTimeout(() => {
        progressLabel.textContent = originalText;
        progressLabel.style.color = "";
      }, 2000);
    }
  }
};

const createSparkles = (target) => {
  const sparkleContainer = document.createElement("div");
  sparkleContainer.className = "sparkles";

  for (let i = 0; i < ANIMATION_CONFIG.SPARKLE_COUNT; i += 1) {
    const sparkle = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = ANIMATION_CONFIG.SPARKLE_MIN_DISTANCE +
      Math.random() * (ANIMATION_CONFIG.SPARKLE_MAX_DISTANCE - ANIMATION_CONFIG.SPARKLE_MIN_DISTANCE);
    const glyph = sparkleGlyphs[Math.floor(Math.random() * sparkleGlyphs.length)];
    const size = ANIMATION_CONFIG.SPARKLE_MIN_SIZE +
      Math.random() * (ANIMATION_CONFIG.SPARKLE_MAX_SIZE - ANIMATION_CONFIG.SPARKLE_MIN_SIZE);

    sparkle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    sparkle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    sparkle.style.fontSize = `${size}px`;
    sparkle.style.animationDelay = `${Math.random() * ANIMATION_CONFIG.SPARKLE_ANIMATION_MAX_DELAY}ms`;
    sparkle.textContent = glyph;

    sparkleContainer.appendChild(sparkle);
  }

  target.appendChild(sparkleContainer);
  setTimeout(() => {
    sparkleContainer.remove();
  }, ANIMATION_CONFIG.SPARKLE_DURATION);
};

const updateProgress = () => {
  const completed = Array.from(state.values()).filter(Boolean).length;
  const isComplete = completed === total;
  const label = `${completed}/${total} klaar`;
  progressLabel.textContent = isComplete ? `${label} 🎉` : label;
  progressBar.style.width = `${(completed / total) * 100}%`;
  progressBar.classList.toggle("complete", isComplete);
  progressLabel.classList.toggle("complete", isComplete);
  if (progressContainer) {
    progressContainer.classList.toggle("complete", isComplete);
  }
  if (celebrationMessage) {
    celebrationMessage.textContent = isComplete ? "Hoera! Alles is klaar, lieve Lize! 🌈" : "";
    celebrationMessage.setAttribute("aria-hidden", isComplete ? "false" : "true");
  }

  if (resetButton) {
    const isDisabled = completed === 0;
    resetButton.disabled = isDisabled;
    resetButton.setAttribute("aria-disabled", String(isDisabled));
  }

  if (cardContainer) {
    cardContainer.classList.toggle("all-complete", isComplete);
  }
};

const toggleTask = (taskId) => {
  const card = cardCache.get(taskId);
  if (!card) {
    console.error(`Card niet gevonden voor task: ${taskId}`);
    return;
  }

  const isCompleted = !state.get(taskId);
  state.set(taskId, isCompleted);

  card.classList.toggle("completed", isCompleted);
  card.setAttribute("aria-pressed", String(isCompleted));

  if (isCompleted) {
    createSparkles(card);
    card.classList.add("celebrate");
    setTimeout(() => {
      card.classList.remove("celebrate");
    }, ANIMATION_CONFIG.CELEBRATION_DURATION);
  } else {
    card.classList.remove("celebrate");
  }

  updateProgress();
  persistState();
};

const clearAllTasks = () => {
  let hadCompletedTask = false;

  tasks.forEach((task) => {
    if (state.get(task.id)) {
      hadCompletedTask = true;
    }
    state.set(task.id, false);
  });

  if (!hadCompletedTask) {
    return;
  }

  checklist.querySelectorAll(".check-card").forEach((card) => {
    card.classList.remove("completed", "celebrate");
    card.setAttribute("aria-pressed", "false");
  });

  updateProgress();
  persistState();
};

const storedState = loadStoredState();

tasks.forEach((task) => {
  const isCompleted = Boolean(storedState?.[task.id]);
  state.set(task.id, isCompleted);

  const card = document.createElement("button");
  card.type = "button";
  card.className = "check-card";
  card.dataset.task = task.id;
  card.setAttribute("role", "listitem");
  card.setAttribute("aria-pressed", String(isCompleted));
  card.innerHTML = `
    <span class="icon" aria-hidden="true">${task.icon}</span>
    <span class="label">${task.label}</span>
  `;

  card.classList.toggle("completed", isCompleted);

  card.addEventListener("click", () => toggleTask(task.id));

  checklist.appendChild(card);
  cardCache.set(task.id, card);
});

updateProgress();
persistState();

if (resetButton) {
  resetButton.addEventListener("click", () => {
    // Only show confirmation if there are completed tasks
    const hasCompletedTasks = Array.from(state.values()).some(Boolean);
    if (hasCompletedTasks) {
      const confirmed = confirm("Weet je zeker dat je alles wilt wissen?");
      if (!confirmed) {
        return;
      }
    }
    clearAllTasks();
  });
}
