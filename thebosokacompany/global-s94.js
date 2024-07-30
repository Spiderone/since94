console.log("S94 - global-s94.js loaded!");

// Config
const config = {
  folderName: "thebosokacompany",
  sandboxId: "xygvvh-3000",
  dependencies: [
    "pushed_modules/gsap/gsap.min.js",
    "pushed_modules/gsap/ScrollTrigger.min.js",
    "pushed_modules/split-type/index.min.js",
  ],
  scripts: {
    global: [],
    default: [],
    home: [
      { name: "dots-bg.js", type: "module" },
      { name: "txt-anims.js", type: "module" },
    ],
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

  console.log(`S94 - ${isDev ? "🛠️ Dev mode enabled!" : "🚀 You're in prod!"}`);

  function loadScript(scriptConfig) {
    return new Promise((resolve, reject) => {
      const isDependency = config.dependencies.includes(
        scriptConfig.name || scriptConfig,
      );
      const baseUrl = isDependency
        ? "https://since94.s3.eu-west-3.amazonaws.com/site-system/"
        : isDev
          ? `https://${config.sandboxId}.csb.app/${config.folderName}/`
          : `https://since94.s3.eu-west-3.amazonaws.com/site-system/${config.folderName}/`;

      let scriptName, scriptType;
      if (typeof scriptConfig === "string") {
        scriptName = scriptConfig;
        scriptType = "text/javascript";
      } else {
        scriptName = scriptConfig.name;
        scriptType = scriptConfig.type || "text/javascript";
      }

      const script = document.createElement("script");
      script.src = baseUrl + scriptName;
      script.type = scriptType;

      // Use defer to maintain order while not blocking page load
      script.defer = true;

      script.onload = resolve;
      script.onerror = () =>
        reject(new Error(`Failed to load script: ${scriptName}`));
      document.body.appendChild(script);
    });
  }

  async function loadScripts(scripts) {
    const loadPromises = scripts.map(loadScript);
    await Promise.all(loadPromises);
  }

  async function runScripts() {
    try {
      // Load dependencies first
      if (Array.isArray(config.dependencies)) {
        await loadScripts(config.dependencies);
        console.log("S94 - Dependencies loaded:", config.dependencies);
      }

      // Load global scripts if they exist
      if (Array.isArray(config.scripts.global)) {
        await loadScripts(config.scripts.global);
        console.log("S94 - Global scripts loaded:", config.scripts.global);
      }

      // Load page-specific scripts
      if (Array.isArray(config.scripts[page])) {
        await loadScripts(config.scripts[page]);
        console.log(
          "S94 - Page-specific scripts loaded:",
          config.scripts[page].name,
        );
      } else {
        console.warn(`S94 - No scripts found for page: ${page}`);
        // Load default scripts if no page-specific scripts are found
        if (Array.isArray(config.scripts.default)) {
          await loadScripts(config.scripts.default);
          console.log("S94 - Default scripts loaded:", config.scripts.default);
        }
      }
    } catch (error) {
      console.error("S94 - Error loading scripts:", error);
    }

    console.log("S94 - Current page ID is:", page);

    // Display dev mode instructions
    console.log(
      "%cS94 Dev Mode Controls: toggleDevMode(), toggleDevMode(true), toggleDevMode(false)",
      "font-size: 14px; font-weight: bold;",
    );
  }

  // Run the script loading process
  runScripts();
}

// Ensure the DOM is loaded before running the script
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeS94);
} else {
  initializeS94();
}

// Make toggleDevMode global so it can be called from console
window.toggleDevMode = toggleDevMode;
