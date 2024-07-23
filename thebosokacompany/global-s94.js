console.log("S94 - global-s94.js loaded!");

// Config setup
const config = {
  githubUsername: "Spiderone",
  githubRepo: "Since94",
  githubBranch: "main",
  githubFolder: "thebosokacompany",
  sandboxId: "2xt84w-2222",
  scripts: {
    global: [], //For scripts across all pages
    devdots: ["dots-bg.js"],
    // Add more pages and their specific scripts as needed
  },
};

// Script loading logic
(function () {
  const isDev = localStorage.getItem("dev") === "true";
  const page = document.body.getAttribute("data-page");

  if (isDev) {
    // Corrected: Added parentheses
    console.log(`S94 - Dev mode enabled!`);
  } else {
    console.log(`S94 - Dev mode disabled!`);
  }

  function loadScript(scriptName) {
    const baseUrl = isDev
      ? `https://${config.sandboxId}.csb.app/`
      : `https://cdn.jsdelivr.net/gh/${config.githubUsername}/${config.githubRepo}@${config.githubBranch}/${config.githubFolder}/`;
    const script = document.createElement("script");
    script.src = baseUrl + scriptName;
    document.body.appendChild(script);
  }

  // Load global scripts if they exist
  if (config.scripts.global && Array.isArray(config.scripts.global)) {
    config.scripts.global.forEach(loadScript);
  }

  // Load page-specific scripts
  if (config.scripts[page]) {
    config.scripts[page].forEach(loadScript);
  }
  console.log("S94 - Global scripts loaded:", config.scripts.global);
  console.log("S94 - Local scripts loaded:", config.scripts[page]);
  console.log("S94 - Page:", page);
})();
