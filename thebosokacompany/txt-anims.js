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
  document.querySelectorAll("[stagger-slide-up]").forEach(function (element) {
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
  document.querySelectorAll("[block-slide-up]").forEach(function (element) {
    let tl = gsap.timeline({ paused: true });
    tl.from($(this), {
      anticipatePin: 1,
      autoAlpha: 0, // Use autoAlpha to control both opacity and visibility
      y: 25,
      duration: 0.5,
      ease: "power2.out",
      stagger: { amount: 0.3 },
    });
    createScrollTrigger(element, tl);
  });

  $("[letters-slide-up]").each(function (index) {
    let tl = gsap.timeline({ paused: true });
    tl.from($(this).find(".char"), {
      yPercent: 100,
      duration: 0.2,
      ease: "power1.out",
      stagger: { amount: 0.6 },
    });
    createScrollTrigger($(this), tl);
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
        duration: 0.15,
        ease: "power2.out",
        stagger: { amount: 0.15 },
      })
      .set(chars, { yPercent: 100 })
      .to(chars, {
        autoAlpha: 1,
        yPercent: 0,
        duration: 0.15,
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

  function animateGameCard() {
    const gameCards = document.querySelectorAll(".game-card");

    gameCards.forEach((card) => {
      const childElements = card.querySelectorAll(
        ".gc-txtwrap > *:not(.gc-video-wrap *)",
      );

      let tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: "top 65%",
          toggleActions: "play none none reverse",
        },
      });

      tl.from(card, {
        scale: 0.6,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      }).from(
        childElements,
        {
          x: -50,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.3",
      );
    });
  }

  // Call the new animation function
  animateGameCard();

  function animateHeroElements() {
    // Animate h1 text elements
    const headings = document.querySelectorAll("h1");

    headings.forEach((heading) => {
      const textElements = heading.querySelectorAll(".title-word, .txtgrad");

      if (textElements.length > 0) {
        gsap.from(textElements, {
          scrollTrigger: {
            trigger: heading,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          scale: 0.5,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.7)",
        });
      }
    });

    // Animate .h-wrap child elements
    const hWrapChildren = document.querySelector(".h-wrap")?.children;
    if (hWrapChildren) {
      gsap.from(hWrapChildren, {
        scrollTrigger: {
          trigger: ".h-wrap",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      });
    }

    // Animate .h-subwrap child elements
    const hSubwrapChildren = document.querySelector(".h-subwrap")?.children;
    if (hSubwrapChildren) {
      gsap.from(hSubwrapChildren, {
        scrollTrigger: {
          trigger: ".h-subwrap",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 20,
        opacity: 1,
        duration: 0.1,
        stagger: 0.1,
        ease: "power2.out",
      });
    }
  }

  // Call the animation function
  animateHeroElements();

  function animateTeamCards() {
    console.log("Initializing team card animations");
    const teamCardsWrap = document.querySelector(".team-cards-wrap");
    if (!teamCardsWrap) {
      console.log("Team cards wrap not found");
      return;
    }

    const cards = teamCardsWrap.querySelectorAll(".team-card");
    console.log(`Found ${cards.length} team cards`);

    gsap.from(cards, {
      scrollTrigger: {
        trigger: teamCardsWrap,
        start: "top 80%",
        toggleActions: "play none none reverse",
        onEnter: () => console.log("Team cards animation triggered"),
      },
      scale: 0.8,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1, // This creates the stagger effect
      ease: "back.out(1.5)",
      onComplete: () => console.log("All cards pop-in animation completed"),
      onStart: () => console.log("Starting cards animation"),
    });

    // Animate each card's children
    cards.forEach((card, index) => {
      const cardChildren = card.children;
      gsap.from(cardChildren, {
        scrollTrigger: {
          trigger: card,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        delay: index * 0.2, // This delays each card's children animation
        onComplete: () =>
          console.log(`Card ${index + 1} children animation completed`),
      });
    });
  }
  animateTeamCards();

  function animateContact() {
    console.log("Initializing contact animation");

    const formBlock = document.querySelector(".form-block");
    const submitButton = document.querySelector(".submit-button");

    if (formBlock) {
      console.log("Form block found");

      // Animate the form block and form fields
      gsap.from(formBlock, {
        scrollTrigger: {
          trigger: formBlock,
          start: "top 80%",
          toggleActions: "play none none reverse",
          onEnter: () => console.log("Form block ScrollTrigger entered"),
          onLeaveBack: () => console.log("Form block ScrollTrigger left"),
        },
        scale: 0.95,
        opacity: 0,
        duration: 0.6,
        ease: "back.out(1.7)",
        onStart: () => console.log("Form block animation started"),
        onComplete: () => console.log("Form block animation completed"),
      });

      const formFields = formBlock.querySelectorAll(".form-field-wrap");
      gsap.from(formFields, {
        scrollTrigger: {
          trigger: formBlock,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        scale: 0.9,
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.1,
        ease: "back.out(1.7)",
        delay: 0.15,
        onStart: () => console.log("Form fields animation started"),
        onComplete: () => console.log("Form fields animation completed"),
      });
    } else {
      console.log("Form block not found");
    }

    // Animate submit button separately
    if (submitButton) {
      console.log("Submit button found");
      gsap.from(submitButton, {
        scrollTrigger: {
          trigger: submitButton,
          start: "top bottom", // This will trigger the animation as soon as the button enters the viewport from the bottom
          toggleActions: "play none none none",
        },
        scale: 0.8,
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "back.out(1.7)",
        onStart: () => console.log("Submit button animation started"),
        onComplete: () => console.log("Submit button animation completed"),
      });
    } else {
      console.log("Submit button not found");
    }
  }

  // Call the animation function
  animateContact();

  console.log("txt-anims.js animations initialized");
})();
