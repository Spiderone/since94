import SplitType from "https://since94.s3.eu-west-3.amazonaws.com/site-system/pushed_modules/split-type/index.min.js";
import { gsap } from "https://since94.s3.eu-west-3.amazonaws.com/site-system/pushed_modules/gsap/gsap.min.js";
import { ScrollTrigger } from "https://since94.s3.eu-west-3.amazonaws.com/site-system/pushed_modules/gsap/ScrollTrigger.js";

console.log("txt-anims.js module loaded");

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

function initTextAnimations() {
  console.log("Initializing text animations");

  // Split text into spans
  let typeSplit = new SplitType("[text-split]", {
    types: "words, chars",
    tagName: "span",
  });

  // Words slide up animation
  document.querySelectorAll("[words-slide-up]").forEach(function (element) {
    let tl = gsap.timeline({ paused: true });
    tl.from(element.querySelectorAll(".word"), {
      opacity: 0,
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

  // Avoid flash of unstyled content
  gsap.set("[text-split]", { opacity: 1 });

  // Handle gradient text effect
  document.querySelectorAll(".txtgrad").forEach((element) => {
    const text = element.getAttribute("data-text");
    element.innerHTML = `<span aria-hidden="true">${text}</span>${text}`;
  });

  console.log("Text animations initialized");
}

// Run initialization immediately
initTextAnimations();

// Export the function if you need to use it in other modules
export { initTextAnimations };
