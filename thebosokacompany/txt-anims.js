window.addEventListener("DOMContentLoaded", (event) => {
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

  $("[words-slide-up2]").each(function (index) {
    let tl = gsap.timeline({ paused: true });
    tl.from($(this).find(".word"), {
      anticipatePin: 1,
      opacity: 0,
      yPercent: 25,
      duration: 0.5,
      ease: "power2.out",
      stagger: { amount: 0.3 },
    });
    createScrollTrigger($(this), tl);
  });

  $("[stagger-slide-up2]").each(function (index) {
    let tl = gsap.timeline({ paused: true });
    tl.from($(this).find(".stagger"), {
      anticipatePin: 1,
      opacity: 0,
      yPercent: 25,
      duration: 0.5,
      ease: "power2.out",
      stagger: { amount: 0.3 },
    });
    createScrollTrigger($(this), tl);
  });

  $("[block-slide-up2]").each(function (index) {
    let tl = gsap.timeline({ paused: true });
    tl.from($(this), {
      anticipatePin: 1,
      autoAlpha: 0,
      y: 25,
      duration: 0.5,
      ease: "power2.out",
      stagger: { amount: 0.3 },
    });
    createScrollTrigger($(this), tl);
  });
  /*
    $("[words-slide-up]").each(function (index) {
      let tl = gsap.timeline({ paused: true });
      tl.from($(this).find(".word"), {
        autoAlpha: 0,
        yPercent: 100,
        duration: 0.5,
        ease: "back.out(2)",
        stagger: { amount: 0.3 }
      });
      createScrollTrigger($(this), tl);
    });
  
    $("[words-rotate-in]").each(function (index) {
      let tl = gsap.timeline({ paused: true });
      tl.set($(this).find(".word"), { transformPerspective: 1000 });
      tl.from($(this).find(".word"), {
        rotationX: -90,
        duration: 0.6,
        ease: "power2.out",
        stagger: { amount: 0.6 }
      });
      createScrollTrigger($(this), tl);
    });
  
    $("[words-slide-from-right]").each(function (index) {
      let tl = gsap.timeline({ paused: true });
      tl.from($(this).find(".word"), {
        autoAlpha: 0,
        x: "1em",
        duration: 0.6,
        ease: "power2.out",
        stagger: { amount: 0.2 }
      });
      createScrollTrigger($(this), tl);
    });
  
    $("[letters-slide-up]").each(function (index) {
      let tl = gsap.timeline({ paused: true });
      tl.from($(this).find(".char"), {
        yPercent: 100,
        duration: 0.2,
        ease: "power1.out",
        stagger: { amount: 0.6 }
      });
      createScrollTrigger($(this), tl);
    });
  
    $("[letters-slide-down]").each(function (index) {
      let tl = gsap.timeline({ paused: true });
      tl.from($(this).find(".char"), {
        yPercent: -120,
        duration: 0.3,
        ease: "power1.out",
        stagger: { amount: 0.7 }
      });
      createScrollTrigger($(this), tl);
    });
  
    $("[letters-fade-in]").each(function (index) {
      let tl = gsap.timeline({ paused: true });
      tl.from($(this).find(".char"), {
        autoAlpha: 0,
        duration: 0.2,
        ease: "power1.out",
        stagger: { amount: 0.8 }
      });
      createScrollTrigger($(this), tl);
    });
  
    $("[letters-fade-in-random]").each(function (index) {
      let tl = gsap.timeline({ paused: true });
      tl.from($(this).find(".char"), {
        autoAlpha: 0,
        duration: 0.05,
        ease: "power1.out",
        stagger: { amount: 0.4, from: "random" }
      });
      createScrollTrigger($(this), tl);
    });
  
    $("[scrub-each-word]").each(function (index) {
      let tl = gsap.timeline({
        scrollTrigger: {
          trigger: $(this),
          start: "top 90%",
          end: "top center",
          scrub: true
        }
      });
      tl.from($(this).find(".word"), {
        autoAlpha: 0.2,
        duration: 0.2,
        ease: "power1.out",
        stagger: { each: 0.4 }
      });
    });
  */
  // Avoid flash of unstyled content
  gsap.set("[text-split]", { opacity: 1 });
});
