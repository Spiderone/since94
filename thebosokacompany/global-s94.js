console.log("S94 - global-s94.js loaded! Instructions below for dev mode");

// Config
// Tip change type by adding type like [{ name: "dots-bg.js", type: "module" }], to an object
const config = {
  folderName: "thebosokacompany", // Project or site name
  sandboxId: "xygvvh-3000", //Codesandbox
  scripts: {
    global: ["global.js"], // For scripts across all pages
    default: [], // Scripts to load if no matching page is found
    devdots: [{ name: "dots-bg.js", type: "module" }],
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

  function loadScript(scriptConfig) {
    const baseUrl = isDev
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
    script.onerror = () =>
      console.error(`Failed to load script: ${scriptName}`);
    document.body.appendChild(script);
  }

  try {
    // Load global scripts if they exist
    if (Array.isArray(config.scripts.global)) {
      config.scripts.global.forEach(loadScript);
      console.table("S94 - Global scripts loaded:", config.scripts.global);
    }

    // Load page-specific scripts
    if (Array.isArray(config.scripts[page])) {
      config.scripts[page].forEach(loadScript);
      console.table(
        "S94 - Page-specific scripts loaded:",
        config.scripts[page],
      );
      console.table(config.scripts);
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

  console.log("S94 - Current page ID is:", page);

  // Display dev mode instructions
  console.log(
    "%cS94 Dev Mode Controls: toggleDevMode(), toggleDevMode(true), toggleDevMode(false)",
    "font-size: 14px; font-weight: bold;",
  );
}

// Ensure the DOM is loaded before running the script
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeS94);
} else {
  initializeS94();
}

// Make toggleDevMode global so it can be called from console
window.toggleDevMode = toggleDevMode;
