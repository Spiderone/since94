import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

function initializeAnimations() {
  console.log("initializeAnimations function called");

  let typeSplit = new SplitType("[text-split]", {
    types: "words, chars",
    tagName: "span",
  });

  console.log("SplitType initialized", typeSplit);

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
document.addEventListener("DOMContentLoaded", initializeAnimations);

// If you're using a module system that supports default exports:
export default initializeAnimations;
