/* ===========================
   EczemAlert — app.js
   Screen router + onboarding
   =========================== */

// All screen names that exist as <div class="screen" id="screen-...">
const SCREENS = [
  "onboarding-1",
  "onboarding-2",
  "onboarding-3",
  "home",
  "upload",
  "log",
  "timeline",
  "doctor"
];

// Screens that should be reachable via the nav bar
const NAV_SCREENS = ["home", "upload", "log", "timeline", "doctor"];

/**
 * Show a single screen and hide all others.
 * Also updates the active state of the nav bar buttons.
 * @param {string} name - the screen name (without the "screen-" prefix)
 */
function showScreen(name) {
  if (!SCREENS.includes(name)) {
    console.error(`Unknown screen: "${name}"`);
    return;
  }

  SCREENS.forEach((screenName) => {
    const el = document.getElementById(`screen-${screenName}`);
    if (el) {
      el.classList.toggle("active", screenName === name);
    }
  });

  // Update nav button highlighting
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.screen === name);
  });

  // Hide the nav bar entirely during onboarding
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    navbar.style.display = name.startsWith("onboarding") ? "none" : "flex";
  }
}

/**
 * Wire up nav bar button clicks.
 */
function setupNav() {
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.screen;
      if (NAV_SCREENS.includes(target)) {
        showScreen(target);
      }
    });
  });
}

/**
 * Handle the onboarding profile form submission.
 * Saves the profile to localStorage and routes to the home screen.
 */
function setupProfileForm() {
  const form = document.getElementById("profile-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const profile = {
      name: document.getElementById("profile-name").value.trim(),
      ageRange: document.getElementById("profile-age").value,
      skinType: document.getElementById("profile-skin").value
    };

    localStorage.setItem("profile", JSON.stringify(profile));
    applyProfileToHome(profile);
    showScreen("home");
  });
}

/**
 * Personalize the home screen greeting using the saved profile.
 */
function applyProfileToHome(profile) {
  const nameEl = document.getElementById("home-username");
  if (nameEl) {
    nameEl.textContent = profile.name ? `, ${profile.name}` : "";
  }
}

/**
 * On load: check if a profile already exists.
 * If yes, skip onboarding and go straight to home.
 * If no, start the onboarding flow.
 */
function checkOnboarding() {
  const savedProfile = localStorage.getItem("profile");

  if (savedProfile) {
    try {
      const profile = JSON.parse(savedProfile);
      applyProfileToHome(profile);
    } catch (err) {
      console.error("Failed to parse saved profile:", err);
    }
    showScreen("home");
  } else {
    showScreen("onboarding-1");
  }
}

/**
 * Set up the image upload screen: click-to-select, drag-and-drop,
 * and image preview. The "Analyze" button is enabled once a valid
 * image is selected. Actual API integration comes in box 5.
 */
function setupUploadZone() {
  const uploadZone = document.getElementById("upload-zone");
  const imageInput = document.getElementById("image-input");
  const imagePreview = document.getElementById("image-preview");
  const analyzeBtn = document.getElementById("analyze-btn");

  if (!uploadZone || !imageInput) return;

  // Click the upload zone to open the file picker
  uploadZone.addEventListener("click", () => imageInput.click());

  // File selected via the picker
  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) handleImageFile(file, imagePreview, analyzeBtn);
  });

  // --- Drag and drop support ---
  uploadZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadZone.classList.add("dragover");
  });

  uploadZone.addEventListener("dragleave", () => {
    uploadZone.classList.remove("dragover");
  });

  uploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.classList.remove("dragover");

    const file = e.dataTransfer.files[0];
    if (file) {
      // Keep the hidden file input in sync so the same file
      // would also be picked up if the form were submitted natively
      imageInput.files = e.dataTransfer.files;
      handleImageFile(file, imagePreview, analyzeBtn);
    }
  });
}

/**
 * Validate and preview a selected image file.
 * @param {File} file
 * @param {HTMLImageElement} imagePreview
 * @param {HTMLButtonElement} analyzeBtn
 */
function handleImageFile(file, imagePreview, analyzeBtn) {
  if (!file.type.startsWith("image/")) {
    showAnalysisMessage("Please choose an image file (JPEG, PNG, etc.).", "error");
    return;
  }

  const reader = new FileReader();

  reader.onload = (e) => {
    imagePreview.src = e.target.result;
    imagePreview.hidden = false;
    analyzeBtn.disabled = false;
    clearAnalysisMessage();
  };

  reader.onerror = () => {
    showAnalysisMessage("Couldn't read that image. Please try a different file.", "error");
  };

  reader.readAsDataURL(file);
}

/**
 * Show a message in the analysis result area (used for upload
 * errors now, and for AI results / errors in box 5).
 * @param {string} text
 * @param {"error"|"info"} type
 */
function showAnalysisMessage(text, type = "info") {
  const resultEl = document.getElementById("analysis-result");
  if (!resultEl) return;

  resultEl.innerHTML = "";
  const msg = document.createElement("p");
  msg.className = type === "error" ? "disclaimer" : "";
  msg.textContent = text;
  resultEl.appendChild(msg);
}

/**
 * Clear any message shown in the analysis result area.
 */
function clearAnalysisMessage() {
  const resultEl = document.getElementById("analysis-result");
  if (resultEl) resultEl.innerHTML = "";
}

/**
 * App entry point.
 */
document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  setupProfileForm();
  setupUploadZone();
  checkOnboarding();
});
