// txt-anims.js
console.log("txt-anims.js loaded");

function initializeAnimations() {
  // Check if required libraries are loaded
  if (
    typeof gsap === "undefined" ||
    typeof ScrollTrigger === "undefined" ||
    typeof SplitType === "undefined"
  ) {
    console.error(
      "Required libraries not loaded. Make sure they are in the global scripts config.",
    );
    return;
  }

  // Register ScrollTrigger with GSAP
  gsap.registerPlugin(ScrollTrigger);

  // Your animation code here
  let typeSplit = new SplitType("[text-split]", {
    types: "words, chars",
    tagName: "span",
  });

  // Words slide up animation
  document.querySelectorAll("[words-slide-up]").forEach(function (element) {
    let tl = gsap.timeline({ paused: true });
    tl.from(element.querySelectorAll(".word"), {
      autoAlpha: 0,
      yPercent: 25,
      duration: 0.5,
      ease: "power2.out",
      stagger: { amount: 0.3 },
    });

    ScrollTrigger.create({
      trigger: element,
      start: "top 88%",
      onEnter: () => tl.play(),
    });
  });
}

// Run initialization when the script loads
initializeAnimations();
