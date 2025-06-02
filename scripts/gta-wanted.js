// Register wanted level setting
Hooks.once("init", () => {
  game.settings.register("gta-wanted-system", "wantedLevel", {
    scope: "world",
    config: false,
    type: Number,
    default: 0
  });
});

// Render UI for all users
Hooks.once("ready", () => {
  const level = game.settings.get("gta-wanted-system", "wantedLevel");
  renderWantedUI(level);
});

// Render the star UI panel
function renderWantedUI(level) {
  const container = document.createElement("div");
  container.id = "gta-wanted-container";

  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("img");
    star.className = "wanted-star";
    star.dataset.index = i;
    container.appendChild(star);
  }

  makeDraggable(container);
  updateStars(level);

  // Disable right-click menu
  container.oncontextmenu = () => false;

  // Tooltip to explain who can click
  container.title = game.user.isGM
    ? "Left click to raise, right click to lower"
    : "Wanted Level (view only)";

  // Only GMs can change the level
  container.addEventListener("mousedown", (e) => {
    if (!game.user.isGM) return;

    e.preventDefault();
    let lvl = game.settings.get("gta-wanted-system", "wantedLevel");

    if (e.button === 0) {
      lvl = Math.min(5, lvl + 0.5);
    } else if (e.button === 2) {
      lvl = Math.max(0, lvl - 0.5);
    }

    game.settings.set("gta-wanted-system", "wantedLevel", lvl);
    updateStars(lvl);
  });

  document.body.appendChild(container);
}

// Updates stars based on current level
function updateStars(level) {
  const stars = document.querySelectorAll(".wanted-star");
  stars.forEach((star, i) => {
    const diff = level - i;

    if (diff >= 1) {
      star.src = "modules/gta-wanted-system/icons/star-full.png";
    } else if (diff === 0.5) {
      star.src = "modules/gta-wanted-system/icons/star-half.png";
    } else {
      star.src = "modules/gta-wanted-system/icons/star-empty.png";
    }
  });
}

// Enables dragging the container
function makeDraggable(element) {
  let posX = 0, posY = 0, mouseX = 0, mouseY = 0;

  element.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    // Prevent dragging if they click a star to change level
    if (e.target.classList.contains("wanted-star") && game.user.isGM) return;

    e.preventDefault();
    mouseX = e.clientX;
    mouseY = e.clientY;
    document.onmouseup = closeDrag;
    document.onmousemove = dragElement;
  }

  function dragElement(e) {
    e.preventDefault();
    posX = mouseX - e.clientX;
    posY = mouseY - e.clientY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    element.style.top = (element.offsetTop - posY) + "px";
    element.style.left = (element.offsetLeft - posX) + "px";
    element.style.right = "auto";
  }

  function closeDrag() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
