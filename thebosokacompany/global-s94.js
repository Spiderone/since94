console.log("S94 script loaded!");

// Configuration
const config = {
  githubUsername: "Spiderone",
  githubRepo: "Since94",
  githubBranch: "main",
  sandboxId: "2xt84w-2222",
  scripts: {
    global: [], //For scripts accross all pages
    home: ["homepage.js", "featured-products.js"],
    about: ["about.js", "team-members.js"],
    // Add more pages and their specific scripts as needed
  },
};

// Script loading logic
(function () {
  const isDev = localStorage.getItem("dev") === "true";
  const page = document.body.getAttribute("data-page");

  function loadScript(scriptName) {
    const baseUrl = isDev
      ? `https://${config.sandboxId}.csb.app/`
      : `https://cdn.jsdelivr.net/gh/${config.githubUsername}/${config.githubRepo}@${config.githubBranch}/`;
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
})();
