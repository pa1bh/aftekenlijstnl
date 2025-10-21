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

const state = new Map();
const total = tasks.length;

const sparkleGlyphs = ["✨", "🌟", "💖", "🎉", "💫", "🎈", "🦄", "☀️"];

const createSparkles = (target) => {
  const sparkleContainer = document.createElement("div");
  sparkleContainer.className = "sparkles";

  const sparkles = 18;
  for (let i = 0; i < sparkles; i += 1) {
    const sparkle = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 48 + Math.random() * 48;
    const glyph =
      sparkleGlyphs[Math.floor(Math.random() * sparkleGlyphs.length)];
    const size = 22 + Math.random() * 14;

    sparkle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    sparkle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    sparkle.style.fontSize = `${size}px`;
    sparkle.style.animationDelay = `${Math.random() * 160}ms`;
    sparkle.textContent = glyph;

    sparkleContainer.appendChild(sparkle);
  }

  target.appendChild(sparkleContainer);
  setTimeout(() => {
    sparkleContainer.remove();
  }, 1100);
};

const updateProgress = () => {
  const completed = Array.from(state.values()).filter(Boolean).length;
  progressLabel.textContent = `${completed}/${total} klaar`;
  progressBar.style.width = `${(completed / total) * 100}%`;
};

const toggleTask = (taskId) => {
  const card = document.querySelector(`[data-task="${taskId}"]`);
  const isCompleted = !state.get(taskId);
  state.set(taskId, isCompleted);

  card.classList.toggle("completed", isCompleted);
  card.setAttribute("aria-pressed", String(isCompleted));

  if (isCompleted) {
    createSparkles(card);
    card.classList.add("celebrate");
    setTimeout(() => {
      card.classList.remove("celebrate");
    }, 520);
  } else {
    card.classList.remove("celebrate");
  }

  updateProgress();
};

tasks.forEach((task) => {
  state.set(task.id, false);

  const card = document.createElement("button");
  card.type = "button";
  card.className = "check-card";
  card.dataset.task = task.id;
  card.setAttribute("role", "listitem");
  card.setAttribute("aria-pressed", "false");
  card.innerHTML = `
    <span class="icon" aria-hidden="true">${task.icon}</span>
    <span class="label">${task.label}</span>
  `;

  card.addEventListener("click", () => toggleTask(task.id));
  card.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      toggleTask(task.id);
    }
  });

  checklist.appendChild(card);
});

updateProgress();
