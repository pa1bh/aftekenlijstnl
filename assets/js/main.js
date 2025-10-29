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
const CONFIG_KEY = "lize-checklist-config";

const DEFAULT_CONFIG = {
  title: "Checklist Lize",
  tasks: [
    { id: "aankleden", icon: "👗", label: "Aankleden" },
    { id: "tandenpoetsen", icon: "🪥", label: "Tandenpoetsen" },
    { id: "haren", icon: "💇‍♀️", label: "Haren doen" },
    { id: "eten", icon: "🍽️", label: "Eten" },
    { id: "drinken", icon: "🥤", label: "Drinken" },
    { id: "schoenen", icon: "👟", label: "Schoenen aan" },
    { id: "tas", icon: "🎒", label: "Tas klaarmaken" },
    { id: "jas", icon: "🧥", label: "Jas aan" }
  ]
};

const sparkleGlyphs = ["✨", "🌟", "💖", "🎉", "💫", "🎈", "🦄", "☀️"];

const cardContainer = document.querySelector(".card");
const mainView = document.getElementById("main-view");
const configView = document.getElementById("config-view");
const checklist = document.getElementById("checklist");
const progressLabel = document.getElementById("progress-label");
const progressBar = document.getElementById("progress-bar");
const progressContainer = document.querySelector(".progress");
const celebrationMessage = document.getElementById("celebration-message");
const resetButton = document.getElementById("reset-checklist");
const openConfigButton = document.getElementById("open-config");
const closeConfigButton = document.getElementById("close-config");
const cancelConfigButton = document.getElementById("cancel-config");
const addTaskButton = document.getElementById("add-task");
const configForm = document.getElementById("config-form");
const configTitleInput = document.getElementById("config-title-input");
const configTaskList = document.getElementById("config-task-list");
const checklistTitle = document.getElementById("checklist-title");

const state = new Map();
const cardCache = new Map();

const cloneDefaultConfig = () => ({
  title: DEFAULT_CONFIG.title,
  tasks: DEFAULT_CONFIG.tasks.map((task) => ({ ...task }))
});

const sanitizeTask = (task, index) => {
  if (!task || typeof task !== "object") {
    return null;
  }

  const label = typeof task.label === "string" && task.label.trim().length > 0
    ? task.label.trim()
    : `Item ${index + 1}`;

  const icon = typeof task.icon === "string" && task.icon.trim().length > 0
    ? task.icon.trim().slice(0, 4)
    : "⭐";

  const id = typeof task.id === "string" && task.id.trim().length > 0
    ? task.id.trim()
    : `item-${index + 1}`;

  return { id, icon, label };
};

const sanitizeConfig = (rawConfig) => {
  if (!rawConfig || typeof rawConfig !== "object") {
    return cloneDefaultConfig();
  }

  const title = typeof rawConfig.title === "string" && rawConfig.title.trim().length > 0
    ? rawConfig.title.trim()
    : DEFAULT_CONFIG.title;

  const tasksArray = Array.isArray(rawConfig.tasks) ? rawConfig.tasks : DEFAULT_CONFIG.tasks;
  const cleanTasks = tasksArray
    .map((task, index) => sanitizeTask(task, index))
    .filter(Boolean);
  return { title, tasks: cleanTasks };
};

const loadConfig = () => {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (!stored) {
      return cloneDefaultConfig();
    }
    const parsed = JSON.parse(stored);
    return sanitizeConfig(parsed);
  } catch (error) {
    console.warn("Kon configuratie niet laden:", error.message);
    return cloneDefaultConfig();
  }
};

let config = loadConfig();

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

const persistConfig = () => {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Kon configuratie niet opslaan:", error.message);
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

const updateTitle = () => {
  if (checklistTitle) {
    checklistTitle.textContent = config.title;
  }
};

const syncStateWithConfig = (previousState = state) => {
  const nextState = new Map();
  config.tasks.forEach((task) => {
    nextState.set(task.id, Boolean(previousState.get(task.id)));
  });
  state.clear();
  nextState.forEach((value, key) => {
    state.set(key, value);
  });
};

const renderChecklist = () => {
  if (!checklist) {
    return;
  }
  cardCache.clear();
  checklist.innerHTML = "";

  config.tasks.forEach((task) => {
    if (!state.has(task.id)) {
      state.set(task.id, false);
    }
    const isCompleted = Boolean(state.get(task.id));

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
};

const updateProgress = () => {
  const totalTasks = config.tasks.length;
  const completed = Array.from(state.values()).filter(Boolean).length;

  if (totalTasks === 0) {
    if (progressLabel) {
      progressLabel.textContent = "Geen items";
      progressLabel.classList.remove("complete");
    }
    if (progressBar) {
      progressBar.style.width = "0%";
      progressBar.classList.remove("complete");
    }
    if (progressContainer) {
      progressContainer.classList.remove("complete");
    }
    if (celebrationMessage) {
      celebrationMessage.textContent = "";
      celebrationMessage.setAttribute("aria-hidden", "true");
    }
    if (resetButton) {
      resetButton.disabled = true;
      resetButton.setAttribute("aria-disabled", "true");
    }
    if (cardContainer) {
      cardContainer.classList.remove("all-complete");
    }
    return;
  }

  const isComplete = completed === totalTasks;
  const label = `${completed}/${totalTasks} klaar`;

  progressLabel.textContent = isComplete ? `${label} 🎉` : label;
  progressBar.style.width = `${(completed / totalTasks) * 100}%`;
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
  if (config.tasks.length === 0) {
    return;
  }

  let hadCompletedTask = false;

  config.tasks.forEach((task) => {
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

const createTaskId = (label, usedIds) => {
  const normalized = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const base = normalized || "item";
  let candidate = base;
  let counter = 2;

  while (usedIds.has(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }

  usedIds.add(candidate);
  return candidate;
};

const resetConfigErrors = () => {
  if (!configForm) {
    return;
  }
  configForm.querySelectorAll(".input-error").forEach((input) => {
    input.classList.remove("input-error");
    input.removeAttribute("aria-invalid");
  });
};

const createTaskRow = (task = { id: "", icon: "", label: "" }) => {
  const row = document.createElement("div");
  row.className = "config-task";
  if (task.id) {
    row.dataset.taskId = task.id;
  }

  const iconInput = document.createElement("input");
  iconInput.type = "text";
  iconInput.className = "task-icon-input";
  iconInput.value = task.icon || "";
  iconInput.maxLength = 4;
  iconInput.placeholder = "Emoji";
  iconInput.setAttribute("aria-label", "Pictogram");

  const labelInput = document.createElement("input");
  labelInput.type = "text";
  labelInput.className = "task-label-input";
  labelInput.value = task.label || "";
  labelInput.placeholder = "Bijv. Aankleden";
  labelInput.maxLength = 48;
  labelInput.required = true;
  labelInput.setAttribute("aria-label", "Taaknaam");

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "remove-task-button";
  removeButton.setAttribute("aria-label", "Item verwijderen");
  removeButton.textContent = "✕";

  const handleInputReset = (event) => {
    event.currentTarget.classList.remove("input-error");
    event.currentTarget.removeAttribute("aria-invalid");
  };

  iconInput.addEventListener("input", handleInputReset);
  labelInput.addEventListener("input", handleInputReset);

  removeButton.addEventListener("click", () => {
    row.remove();
    if (configTaskList.children.length === 0) {
      configTaskList.appendChild(createTaskRow({ icon: "⭐", label: "" }));
    }
  });

  row.appendChild(iconInput);
  row.appendChild(labelInput);
  row.appendChild(removeButton);

  return row;
};

const populateConfigForm = () => {
  if (!configForm || !configTitleInput || !configTaskList) {
    return;
  }
  resetConfigErrors();
  configTitleInput.value = config.title;
  configTaskList.innerHTML = "";

  if (config.tasks.length === 0) {
    configTaskList.appendChild(createTaskRow({ icon: "⭐", label: "" }));
    return;
  }

  config.tasks.forEach((task) => {
    configTaskList.appendChild(createTaskRow(task));
  });
};

const collectTasksFromForm = () => {
  if (!configTaskList) {
    return { tasks: [], invalidInput: null };
  }
  const rows = Array.from(configTaskList.querySelectorAll(".config-task"));
  const nextTasks = [];
  const usedIds = new Set();
  let firstInvalidInput = null;

  rows.forEach((row) => {
    const iconInput = row.querySelector(".task-icon-input");
    const labelInput = row.querySelector(".task-label-input");
    if (!iconInput || !labelInput) {
      return;
    }

    const label = labelInput.value.trim();
    if (!label) {
      labelInput.classList.add("input-error");
      labelInput.setAttribute("aria-invalid", "true");
      if (!firstInvalidInput) {
        firstInvalidInput = labelInput;
      }
      return;
    }

    const icon = iconInput.value.trim() || "⭐";
    const existingId = row.dataset.taskId;
    let id = existingId;

    if (!id || usedIds.has(id)) {
      id = createTaskId(label, usedIds);
    } else {
      usedIds.add(id);
    }

    nextTasks.push({ id, icon, label });
  });

  return { tasks: nextTasks, invalidInput: firstInvalidInput };
};

const openConfig = () => {
  if (!cardContainer || !mainView || !configView) {
    return;
  }
  populateConfigForm();
  cardContainer.classList.add("config-open");
  mainView.hidden = true;
  configView.hidden = false;
  configView.setAttribute("aria-hidden", "false");
  if (openConfigButton) {
    openConfigButton.setAttribute("aria-expanded", "true");
  }
  const focusTarget = configTitleInput || configView;
  focusTarget.focus({ preventScroll: true });
};

const closeConfig = () => {
  if (!cardContainer || !mainView || !configView) {
    return;
  }
  cardContainer.classList.remove("config-open");
  mainView.hidden = false;
  configView.hidden = true;
  configView.setAttribute("aria-hidden", "true");
  if (openConfigButton) {
    openConfigButton.setAttribute("aria-expanded", "false");
    openConfigButton.focus({ preventScroll: true });
  }
};

const handleConfigSubmit = (event) => {
  event.preventDefault();
  if (!configForm) {
    return;
  }
  resetConfigErrors();
  const titleInputValue = configTitleInput?.value?.trim();
  const title = titleInputValue && titleInputValue.length > 0 ? titleInputValue : DEFAULT_CONFIG.title;

  const { tasks: nextTasks, invalidInput } = collectTasksFromForm();

  if (invalidInput) {
    invalidInput.focus({ preventScroll: true });
    return;
  }

  const previousState = new Map(state);

  config = {
    title,
    tasks: nextTasks
  };

  persistConfig();
  syncStateWithConfig(previousState);
  renderChecklist();
  updateTitle();
  updateProgress();
  persistState();
  closeConfig();
};

const handleEscape = (event) => {
  if (event.key === "Escape" && cardContainer?.classList.contains("config-open")) {
    event.preventDefault();
    closeConfig();
  }
};

const initialize = () => {
  const storedState = loadStoredState();
  const storedStateMap = new Map();
  if (storedState) {
    Object.entries(storedState).forEach(([key, value]) => {
      storedStateMap.set(key, Boolean(value));
    });
  }

  syncStateWithConfig(storedStateMap);
  renderChecklist();
  updateTitle();
  updateProgress();
  persistState();

  if (resetButton) {
    resetButton.addEventListener("click", () => {
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

  if (openConfigButton) {
    openConfigButton.addEventListener("click", openConfig);
  }
  if (closeConfigButton) {
    closeConfigButton.addEventListener("click", closeConfig);
  }
  if (cancelConfigButton) {
    cancelConfigButton.addEventListener("click", () => {
      closeConfig();
    });
  }
  if (addTaskButton && configTaskList) {
    addTaskButton.addEventListener("click", () => {
      configTaskList.appendChild(createTaskRow({ icon: "⭐", label: "" }));
      const lastRow = configTaskList.lastElementChild;
      if (lastRow) {
        const labelInput = lastRow.querySelector(".task-label-input");
        labelInput?.focus({ preventScroll: true });
      }
    });
  }
  if (configForm) {
    configForm.addEventListener("submit", handleConfigSubmit);
  }

  document.addEventListener("keydown", handleEscape);
};

initialize();
