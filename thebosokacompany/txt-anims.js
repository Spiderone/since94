window.addEventListener("DOMContentLoaded", (event) => {
    // Split text into spans
    let typeSplit = new SplitType("[text-split]", {
      types: "words, chars",
      tagName: "span"
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
      }
    });
    // Play tl when scrolled into view (60% from top of screen)
    ScrollTrigger.create({
      trigger: triggerElement,
      start: "top 88%",
      onEnter: () => timeline.play()
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
      stagger: { amount: 0.3 }
    });
    createScrollTrigger($(this), tl);
  });