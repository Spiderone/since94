// txt-anims.js
console.log("txt-anims.js module loaded");

// Import GSAP and ScrollTrigger from CDN
import { gsap } from "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
import { ScrollTrigger } from "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js";
// Import SplitType (adjust the URL if you're using a different CDN or version)
import SplitType from "https://cdn.jsdelivr.net/npm/split-type@0.3.4/+esm";

function initializeAnimations() {
  console.log("initializeAnimations function called");

  // Register ScrollTrigger with GSAP
  gsap.registerPlugin(ScrollTrigger);
  console.log("ScrollTrigger registered");

  // Your animation code here
  let typeSplit = new SplitType("[text-split]", {
    types: "words, chars",
    tagName: "span",
  });
  console.log("SplitType initialized", typeSplit);

  // Words slide up animation
  let elements = document.querySelectorAll("[words-slide-up]");
  console.log("Found elements with [words-slide-up]:", elements.length);

  elements.forEach(function (element, index) {
    console.log(`Processing element ${index + 1}`);
    let words = element.querySelectorAll(".word");
    console.log(`Found ${words.length} words in element ${index + 1}`);

    gsap.from(words, {
      autoAlpha: 0,
      yPercent: 25,
      duration: 0.5,
      ease: "power2.out",
      stagger: { amount: 0.3 },
      scrollTrigger: {
        trigger: element,
        start: "top 88%",
        onEnter: () =>
          console.log(`Animation triggered for element ${index + 1}`),
      },
    });
  });
}

// Run initialization when the DOM is fully loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeAnimations);
} else {
  initializeAnimations();
}

export { initializeAnimations };
