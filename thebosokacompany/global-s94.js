console.log(
  "S94 - global-s94.js loaded! Follow instructions below for dev mode",
);

// Config
const config = {
  githubUsername: "Spiderone",
  folderName: "thebosokacompany",
  sandboxId: "2xt84w-2222",
  scripts: {
    global: ["global.js"], //For scripts across all pages
    devdots: ["dots-bg.js"],
    default: [], // Scripts to load if no matching page is found
    // Add more pages and their specific scripts as needed
  },
};

// Dev mode toggle function
function toggleDevMode(enable) {
  if (enable === undefined) {
    enable = localStorage.getItem("dev") !== "true";
  }
  localStorage.setItem("dev", enable);
  console.log(
    `Dev mode ${enable ? "enabled" : "disabled"}. Reload the page to apply changes.`,
  );
  return "Reload the page to apply changes.";
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
      ? `https://${config.sandboxId}.csb.app/${config.folderName}/`
      : `https://since94.s3.eu-west-3.amazonaws.com/site-system/${config.folderName}/`;
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

  // Display dev mode instructions
  console.log("%cDev Mode Controls:", "font-size: 14px; font-weight: bold;");
  console.log("To toggle dev mode, type: toggleDevMode()");
  console.log("To enable dev mode, type: toggleDevMode(true)");
  console.log("To disable dev mode, type: toggleDevMode(false)");
}

// Ensure the DOM is loaded before running the script
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeS94);
} else {
  initializeS94();
}

// Make toggleDevMode global so it can be called from console
window.toggleDevMode = toggleDevMode;
