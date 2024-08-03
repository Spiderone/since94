console.log("txt-anim.js loaded");
function initializeAnimations() {
  // Split text into spans
  let typeSplit = new SplitType("[text-split]", {
    types: "words, chars",
    tagName: "span",
  });

  // Link timelines to scroll position
  function createScrollTrigger(triggerElement, timeline) {
    // Reset tl when scroll out of view past bottom of screen
    ScrollTrigger.create({
      markers: false,
      trigger: triggerElement,
      start: "top bottom",
      onLeaveBack: () => {
        timeline.progress(0);
        timeline.pause();
      },
    });
    // Play tl when scrolled into view (60% from top of screen)
    ScrollTrigger.create({
      trigger: triggerElement,
      start: "top 88%",
      onEnter: () => timeline.play(),
    });
  }

  document.querySelectorAll("[words-slide-up2]").forEach(function (element) {
    let tl = gsap.timeline({ paused: true });
    tl.from(element.querySelectorAll(".word"), {
      anticipatePin: 1,
      opacity: 0,
      yPercent: 25,
      duration: 0.5,
      ease: "power2.out",
      stagger: { amount: 0.3 },
    });
    createScrollTrigger(element, tl);
  });

  // Similar modifications for other animations...

  // Avoid flash of unstyled content
  gsap.set("[text-split]", { opacity: 1 });
}

// This function should be called after all scripts are loaded
window.initializeAnimations = initializeAnimations;
