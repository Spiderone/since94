(function () {
  console.log("txt-anims.js loaded");

  // Ensure GSAP, ScrollTrigger, and SplitType are available
  if (
    typeof gsap === "undefined" ||
    typeof ScrollTrigger === "undefined" ||
    typeof SplitType === "undefined"
  ) {
    console.error(
      "Required dependencies are not loaded. GSAP, ScrollTrigger, or SplitType is missing.",
    );
    return;
  }

  // Register ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);

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

  // Words slide up animation
  document.querySelectorAll("[words-slide-up]").forEach(function (element) {
    let tl = gsap.timeline({ paused: true });
    tl.from(element.querySelectorAll(".word"), {
      anticipatePin: 1,
      autoAlpha: 0, // Use autoAlpha to control both opacity and visibility
      yPercent: 25,
      duration: 0.5,
      ease: "power2.out",
      stagger: { amount: 0.3 },
    });
    createScrollTrigger(element, tl);
  });

  // Stagger slide up animation
  document.querySelectorAll("[stagger-slide-up2]").forEach(function (element) {
    let tl = gsap.timeline({ paused: true });
    tl.from(element.querySelectorAll(".stagger"), {
      anticipatePin: 1,
      autoAlpha: 0, // Use autoAlpha to control both opacity and visibility
      yPercent: 25,
      duration: 0.5,
      ease: "power2.out",
      stagger: { amount: 0.3 },
    });
    createScrollTrigger(element, tl);
  });

  // Block slide up animation
  document.querySelectorAll("[block-slide-up2]").forEach(function (element) {
    let tl = gsap.timeline({ paused: true });
    tl.from(element, {
      anticipatePin: 1,
      autoAlpha: 0, // Use autoAlpha to control both opacity and visibility
      y: 25,
      duration: 0.5,
      ease: "power2.out",
      stagger: { amount: 0.3 },
    });
    createScrollTrigger(element, tl);
  });

  // Set initial visibility and opacity
  gsap.set("[text-split]", { autoAlpha: 1 });

  // Hover effect for .char elements within .hero-cta
  const heroCta = document.querySelector(".hero-cta");
  if (heroCta) {
    const chars = heroCta.querySelectorAll(".char");

    let hoverTl = gsap.timeline({ paused: true });

    hoverTl
      .to(chars, {
        autoAlpha: 0,
        yPercent: -100,
        duration: 0.25,
        ease: "power2.out",
        stagger: { amount: 0.15 },
      })
      .set(chars, { yPercent: 100 })
      .to(chars, {
        autoAlpha: 1,
        yPercent: 0,
        duration: 0.25,
        ease: "power2.out",
        stagger: { amount: 0.15 },
      });

    heroCta.addEventListener("mouseenter", () => {
      hoverTl.restart();
    });

    heroCta.addEventListener("mouseleave", () => {
      hoverTl.pause(0);
    });
  }

  console.log("txt-anims.js animations initialized");
})();
