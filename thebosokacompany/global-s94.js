console.log("S94 - global-s94.js loaded!");

// Config
const config = {
  githubUsername: "Spiderone",
  githubFolder: "thebosokacompany",
  sandboxId: "2xt84w-2222",
  scripts: {
    global: [global.js], //For scripts across all pages
    devdots: ["dots-bg.js"],
    default: [], // Scripts to load if no matching page is found
    // Add more pages and their specific scripts as needed
  },
};

// Create dev mode toggle buttons
function createDevModeButtons() {
  const styles = `
    .dev-button { 
      padding: 5px 10px; 
      margin-right: 10px; 
      cursor: pointer; 
      background-color: #f0f0f0; 
      border: 1px solid #ccc; 
      border-radius: 4px; 
    }
    .dev-on { color: green; }
    .dev-off { color: red; }
  `;

  const styleElement = document.createElement("style");
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);

  const buttonsHtml = `
    <button class="dev-button dev-on" onclick="toggleDevMode(true)">Enable Dev Mode</button>
    <button class="dev-button dev-off" onclick="toggleDevMode(false)">Disable Dev Mode</button>
  `;

  console.log("%cDev Mode Controls:", "font-size: 14px; font-weight: bold;");
  console.log(buttonsHtml);
}

// Toggle dev mode
function toggleDevMode(enable) {
  localStorage.setItem("dev", enable);
  console.log(`Dev mode ${enable ? "enabled" : "disabled"}. Reloading page...`);
  location.reload();
}

// Script loading logic
function initializeS94() {
  const isDev = localStorage.getItem("dev") === "true";
  let page = "default";

  try {
    if (document.body) {
      page = document.body.getAttribute("data-page") || "default";
    } else {
      console.warn("S94 - document.body not found, using default page");
    }
  } catch (error) {
    console.error("S94 - Error getting data-page attribute:", error);
  }

  console.log(`S94 - ${isDev ? "Dev mode enabled!" : "Dev mode disabled!"}`);

  function loadScript(scriptName) {
    const baseUrl = isDev
      ? `https://${config.sandboxId}.csb.app/`
      : `https://since94.s3.eu-west-3.amazonaws.com/site-system/${config.githubFolder}/`;
    const script = document.createElement("script");
    script.src = baseUrl + scriptName;
    script.onerror = () =>
      console.error(`Failed to load script: ${scriptName}`);
    document.body.appendChild(script);
  }

  try {
    // Load global scripts if they exist
    if (Array.isArray(config.scripts.global)) {
      config.scripts.global.forEach(loadScript);
      console.log("S94 - Global scripts loaded:", config.scripts.global);
    }

    // Load page-specific scripts
    if (Array.isArray(config.scripts[page])) {
      config.scripts[page].forEach(loadScript);
      console.log("S94 - Page-specific scripts loaded:", config.scripts[page]);
    } else {
      console.warn(`S94 - No scripts found for page: ${page}`);
      // Load default scripts if no page-specific scripts are found
      if (Array.isArray(config.scripts.default)) {
        config.scripts.default.forEach(loadScript);
        console.log("S94 - Default scripts loaded:", config.scripts.default);
      }
    }
  } catch (error) {
    console.error("S94 - Error loading scripts:", error);
  }

  console.log("S94 - Page:", page);

  // Create dev mode buttons in console
  createDevModeButtons();
}

// Ensure the DOM is loaded before running the script
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeS94);
} else {
  initializeS94();
}

// Make toggleDevMode global so it can be called from console
window.toggleDevMode = toggleDevMode;
