document.addEventListener("DOMContentLoaded", (event) => {
  // Make sure SplitType is loaded
  if (typeof SplitType !== "undefined") {
    // Split text into spans
    let typeSplit = new SplitType("[text-split]", {
      types: "words, chars",
      tagName: "span",
    });

    // Link timelines to scroll position
    function createScrollTrigger(triggerElement, timeline) {
      ScrollTrigger.create({
        trigger: triggerElement,
        start: "top bottom",
        onLeaveBack: () => {
          timeline.progress(0);
          timeline.pause();
        },
      });
      ScrollTrigger.create({
        trigger: triggerElement,
        start: "top 88%",
        onEnter: () => timeline.play(),
      });
    }

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
      createScrollTrigger(element, tl);
    });

    // Avoid flash of unstyled content
    gsap.set("[text-split]", { opacity: 1 });
  } else {
    console.error(
      "SplitType is not defined. Make sure you've included the library.",
    );
  }
});

// Add this code to handle the gradient text effect
document.querySelectorAll(".txtgrad").forEach((element) => {
  const text = element.getAttribute("data-text");
  element.innerHTML = `<span aria-hidden="true">${text}</span>${text}`;
});
