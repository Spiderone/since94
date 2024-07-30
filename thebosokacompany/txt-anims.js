import SplitType from "https://unpkg.com/split-type@0.3.3/dist/split-type.es.min.js";
import { gsap } from "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.3/gsap.min.js";
import { ScrollTrigger } from "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.3/ScrollTrigger.min.js";

console.log("txt-anims.js module loaded");

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
