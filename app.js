// --------------------------------------------------------------------
//
// Copyright @ Giovanny Hernandez
//
// --------------------------------------------------------------------

let locoScroll;
gsap.registerPlugin(SplitText);

const body = document.body;
const select = (e) => document.querySelector(e);
const selectAll = (e) => document.querySelectorAll(e);

// No need to understand all this.
// Only the instantiation of LocomotiveScroll.
function initSmoothScroll(container) {
  // Scrolling Animation
  locoScroll = new LocomotiveScroll({
    el: document.querySelector("[data-scroll-container]"),
    smooth: true,
    smoothMobile: true,
  });

  // each time Locomotive Scroll updates, tell ScrollTrigger to update too (sync positioning)
  locoScroll.on("scroll", ScrollTrigger.update);

  // tell ScrollTrigger to use these proxy methods for the ".smooth-scroll" element since Locomotive Scroll is hijacking things
  ScrollTrigger.scrollerProxy("[data-scroll-container]", {
    scrollTop(value) {
      return arguments.length
        ? locoScroll.scrollTo(value, { duration: 0, disableLerp: true })
        : locoScroll.scroll.instance.scroll.y;
    }, // we don't have to define a scrollLeft because we're only scrolling vertically.
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
    // LocomotiveScroll handles things completely differently on mobile devices - it doesn't even transform the container at all! So to get the correct behavior and avoid jitters, we should pin things with position: fixed on mobile. We sense it by checking to see if there's a transform applied to the container (the LocomotiveScroll-controlled element).
    pinType: container.querySelector("[data-scroll-container]").style.transform
      ? "transform"
      : "fixed",
  });

  ScrollTrigger.defaults({ scroller: "[data-scroll-container]" });

  // each time the window updates, we should refresh ScrollTrigger and then update LocomotiveScroll.
  ScrollTrigger.addEventListener("refresh", () => locoScroll.update());

  // after everything is set up, refresh() ScrollTrigger and update LocomotiveScroll because padding may have been added for pinning, etc.
  ScrollTrigger.refresh();
}
// Split Text
function initSplitText() {
  var splitTextLines = new SplitText(".split-lines", {
    type: "lines, chars",
    linesClass: "single-line", // name for this split element
  });

  // Rewrap the class
  $(".split-lines .single-line").wrapInner('<div class="single-line-inner">');

  // For the top left element
  var splitTextChars = new SplitText(".split-chars", {
    type: "chars",
    charsClass: "single-char",
  });

  // Scrolltrigger Animation : Gridroom
  $(".home-lottie-gridroom").each(function (index) {
    let triggerElement = $(this);
    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        scrub: 0.5,
        start: "0%",
        end: "+=225%", // must be a high value
        onUpdate: (self) => {
          if (self.progress > 0.33) {
            h4Animation.play();
          } else {
            h4Animation.reverse();
          }
          if (self.progress > 0.33) {
            h2Animation.play();
          } else {
            h2Animation.reverse();
          }
        },
      },
    });

    // No Scrub H4 Animation
    tl.set($(this).find("h4 .single-char"), {
      opacity: 0,
    });

    // Make visible
    let h4Animation = gsap.timeline({ paused: true }).fromTo(
      $(this).find("h4 .single-char"),
      0.01,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        ease: "none",
        stagger: 0.04,
      }
    );

    // h2 pops in
    tl.set($(this).find("h2 .single-line-inner"), {
      yPercent: 110,
    });

    let h2Animation = gsap.timeline({ paused: true }).fromTo(
      $(this).find("h2 .single-line-inner"),
      0.8,
      {
        yPercent: 110,
      },
      {
        yPercent: 0,
        ease: "Power3.easeOut",
        stagger: 0.2,
      }
    );

    // row scales in
    tl.fromTo(
      $(this).find(".container .row"),
      0.75,
      {
        scale: 0.82,
      },
      {
        scale: 1,
        ease: "none",
      },
      "1"
      // "<"
    );

    tl.fromTo(
      $(this).find("h2 .single-line-inner div"), // Target elements
      0.01, // Duration (in seconds)
      {
        // From properties
        color: "#767270", // Initial color
      },
      {
        // To properties
        color: "#000000", // Final color
        ease: "none", // Easing function (none in this case)
        stagger: 0.025, // Stagger between animations for each element
      },
      "0.75" // start 0.75 seconds into the timeline
    );
  });
}

// If button is hover do the animation else reset
function initButtonsAnimations() {
  const btnClick = document.querySelectorAll(".btn-click");
  btnClick.forEach((e) => {
    const btnFill = e.querySelector(".btn-fill");
    gsap.to(btnFill, { y: "-76%", ease: Power2.easeInOut });

    // Move it back down 76% then to the original y-axis
    e.addEventListener("mouseenter", function () {
      gsap.to(btnFill, 0.6, {
        startAt: { y: "76%" },
        y: "0%",
        ease: Power2.easeInOut,
      });
    });

    // Move it back up once mouseleave
    e.addEventListener("mouseleave", function () {
      gsap.to(btnFill, 0.5, { y: "-76%", ease: Power2.easeInOut });
    });
  });
}

function initMagneticButtons() {
  const magnets = document.querySelectorAll(".magnetic");
  var strength = 100;

  // START : If screen is bigger as 540 px do magnetic
  if (window.innerWidth > 540) {
    magnets.forEach((magnet) => {
      magnet.addEventListener("mousemove", moveMagnet);

      // reset to normal state
      magnet.addEventListener("mouseleave", function (event) {
        gsap.to(event.currentTarget, 1.5, {
          x: 0,
          y: 0,
          ease: Elastic.easeOut,
        });
        gsap.to($(this).find(".btn-text"), 1.5, {
          x: 0,
          y: 0,
          ease: Elastic.easeOut,
        });
      });
    });

    // Mouse move
    function moveMagnet(event) {
      var magnetButton = event.currentTarget; // <a data-strength="24" data-strength-text="12" class="btn-click magnetic clickable"...</a>
      var bounding = magnetButton.getBoundingClientRect();
      var magnetsStrength = magnetButton.getAttribute("data-strength");
      var magnetsStrengthText = magnetButton.getAttribute("data-strength-text");

      gsap.to(magnetButton, 1.5, {
        x:
          ((event.clientX - bounding.left) / magnetButton.offsetWidth - 0.5) *
          magnetsStrength,
        y:
          ((event.clientY - bounding.top) / magnetButton.offsetHeight - 0.5) *
          magnetsStrength,
        rotate: "0.001deg",
        ease: Power4.easeOut,
      });
      gsap.to($(this).find(".btn-text"), 1.5, {
        x:
          ((event.clientX - bounding.left) / magnetButton.offsetWidth - 0.5) *
          magnetsStrengthText,
        y:
          ((event.clientY - bounding.top) / magnetButton.offsetHeight - 0.5) *
          magnetsStrengthText,
        rotate: "0.001deg",
        ease: Power4.easeOut,
      });
    }
  }
}

function initHamburgerNav() {
  // Open/close navigation when clicked .btn-hamburger

  $(document).ready(function () {
    $(".btn-hamburger, .btn-menu").click(function () {
      // If already clicked then reset and continue scrolling
      if ($(".btn-hamburger, .btn-menu").hasClass("active")) {
        $(".btn-hamburger, .btn-menu").removeClass("active");
        $("main").removeClass("nav-active");
        scroll.start();
      } else {
        // Otherwise add the active class to make the transition animation
        $(".btn-hamburger, .btn-menu").addClass("active");
        $("main").addClass("nav-active");
        scroll.stop();
      }
    });
    $(".fixed-nav-back").click(function () {
      $(".btn-hamburger, .btn-menu").removeClass("active");
      $("main").removeClass("nav-active");
      scroll.start();
    });
  });

  // using key
  $(document).keydown(function (e) {
    if (e.keyCode == 27) {
      if ($("main").hasClass("nav-active")) {
        $(".btn-hamburger, .btn-menu").removeClass("active");
        $("main").removeClass("nav-active");
        scroll.start();
      }
    }
  });
}

/**
 * Scrolltrigger Scroll Check
 */
function initScrolltriggerNav() {
  const main = document.querySelector("main");

  // Pop Up Animation
  const tlPopUpNav = gsap.timeline({
    scrollTrigger: {
      trigger: main,
      start: "top -30%",
      toggleActions: "play none none reverse",
      onEnter: () => {
        // for css animation
        main.classList.add("scrolled");
      },
      onLeaveBack: () => {
        main.classList.remove("scrolled");
      },
    },
  });

  /**
   * Animated nav lines when clicked
   */
  const fixedNav = document.querySelector(".fixed-nav");
  const clickables = document.querySelectorAll(".clickable");
  const shadow = document.querySelector(".fixed-nav-back");
  const burger = document.querySelector(".btn-hamburger");

  burger.addEventListener("click", navToggle);

  // You must add classlist of .nav-active for css animations to work
  function navToggle(e) {
    if (!fixedNav.classList.contains("nav-active")) {
      fixedNav.classList.add("nav-active");
      shadow.classList.add("nav-active");

      gsap.to(".header__nav__line1", 0.5, { rotate: "45", y: 0 });
      gsap.to(".header__nav__line2", 0.5, { rotate: "-45", y: -5 });
    } else {
      removeNav();
    }

    // remove if clicked on a nav btn
    clickables.forEach((clickable) => {
      clickable.addEventListener("click", removeNav);
    });

    function removeNav() {
      fixedNav.classList.remove("nav-active");
      shadow.classList.remove("nav-active");

      gsap.to(".header__nav__line1", 0.5, { rotate: "0", y: 0 });
      gsap.to(".header__nav__line2", 0.5, { rotate: "0", y: 0 });
    }
  }
}

// Must include for Span Line Animations
function initTricksWords() {
  // Find all text with .tricks class and break each letter into a span
  const spanWord = document.getElementsByClassName("span-lines");
  for (let i = 0; i < spanWord.length; i++) {
    let wordWrap = spanWord.item(i);
    wordWrap.innerHTML = wordWrap.innerHTML.replace(
      /(^|<\/?[^>]+>|\s+)([^\s<]+)/g,
      '$1<span class="span-line"><span class="span-line-inner">$2</span></span>'
    );
  }
}

// Span Line Animations
function initScrolltriggerAnimations() {
  const spanLine = document.querySelector(".span-lines.animate"); // <h4 class="span-lines animate fs-500">
  const homeIntro = document.querySelector(".home-intro"); // <h4 class="span-lines animate fs-500">
  const workGrid = document.querySelector(".work-grid");

  // For Home Intros Section
  if (spanLine && homeIntro) {
    $(".home-intro .span-lines.animate").each(function (index) {
      let triggerElement = $(this);
      let targetElement = $(".home-intro .span-lines.animate .span-line-inner");

      let tl;

      if ($(window).width() > 540) {
        // Desktop Animation
        tl = gsap.timeline({
          scrollTrigger: {
            trigger: triggerElement,
            toggleActions: "play none none reverse",
            start: "-20% 20% ",
            end: "10% 0%",
            // markers: true,
          },
        });
      } else {
        tl = gsap.timeline({
          scrollTrigger: {
            trigger: triggerElement,
            toggleActions: "play none none reverse",
            start: "-69% 10% ",
            end: "10% 0%",
            // markers: true,
          },
        });
      }

      if (targetElement) {
        tl.from(targetElement, {
          y: "100%", // set visible
          stagger: 0.01,
          ease: "power3.out",
          duration: 1,
          delay: 0,
        });
      }
    });
  }

  // For Work Grid Animation
  if (spanLine && workGrid) {
    $(".work-grid .span-lines.animate").each(function (index) {
      let triggerElement = $(this);
      let targetElement = $(".work-grid .span-lines.animate .span-line-inner");

      let tl;

      if ($(window).width() > 540) {
        // Desktop Animation
        tl = gsap.timeline({
          scrollTrigger: {
            trigger: triggerElement,
            toggleActions: "play none none reverse",
            start: "+=-150% 20% ",
            // end: "10% 0%",
            // markers: true,
          },
        });
      } else {
        tl = gsap.timeline({
          scrollTrigger: {
            trigger: triggerElement,
            toggleActions: "play none none reverse",
            start: "-69% 10% ",
            end: "10% 0%",
            // markers: true,
          },
        });
      }

      if (targetElement) {
        tl.from(targetElement, {
          y: "100%", // set visible
          stagger: 0.01,
          ease: "power3.out",
          duration: 1,
          delay: 0,
        });
      }
    });
  }
}

function initHomeAnimations() {
  if (document.querySelector(".background")) {
    // Start slightly before the next page
    // Each .highlight needs to transition to clear light color and then reset (tlHRemove).
    // Ensure that each of these highlights go 1 by 1 (i.e stagger)
    const tlH = gsap.timeline({
      scrollTrigger: {
        trigger: ".background",
        // markers: { startColor: "blue", endColor: "blue" },
        scrub: true,
        start: "-40%",
        end: "40%",
      },
    });
    tlH.fromTo(
      ".highlight",
      { color: "rgba(255, 255, 255, 0.4)" },
      { color: "rgba(255, 255, 255, 1)", stagger: 1 }
    );

    const tlHRemove = gsap.timeline({
      scrollTrigger: {
        trigger: ".background",
        // markers: { startColor: "pink", endColor: "pink" },
        scrub: true,
        start: "-20%",
        end: "60%",
      },
    });
    tlHRemove.to(".highlight", {
      color: "rgba(255, 255, 255, 0.4)",
      stagger: 1,
    });

    //  Rounded Div animation
    const roundedElement = document.querySelector(
      ".footer-rounded-div .rounded-div-wrap"
    );

    var tl;

    if ($(window).width() > 540) {
      // Desktop
      tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".freelance",
          start: "60%",
          end: "190%",
          scrub: 0,
          // markers: true,
        },
      });
    } else {
      // For mobile
      tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".freelance",
          start: "-150%",
          end: "15%",
          scrub: 0,
          // markers: true,
        },
      });
    }

    tl.to(
      roundedElement,
      {
        height: 0,
        ease: "none",
      },
      0
    );

    if (document.querySelector(".section-tiles-grid")) {
      const containerGridCards = document.querySelectorAll(
        ".tiles-container .tile"
      );

      // Initially cards are hidden
      gsap.set(containerGridCards, {
        opacity: 0,
        y: 20,
        ease: "Power2.easeInOut",
      });

      // Global tl depending on screen size
      var secondTl;

      if ($(window).width() > 540) {
        // Desktop Animation
        secondTl = gsap.timeline({
          scrollTrigger: {
            trigger: ".section-tiles-grid",
            start: "50%",
            end: "100%",
            toggleActions: "play none none reverse",
            onEnter: runAnim,
            // markers: true,
          },
        });
      } else {
        // Mobile Animation
        secondTl = gsap.timeline({
          scrollTrigger: {
            trigger: ".tiles-container",
            start: "-20%",
            end: "100%",
            toggleActions: "play none none reverse",
            onEnter: runAnim,
            // markers: true,
          },
        });
      }

      // Local Fade Cards Anim
      function runAnim() {
        secondTl.to(
          containerGridCards,
          {
            duration: 1,
            opacity: 1,
            y: 0,
            stagger: 0.5,
            ease: "Power2.easeInOut",
          },
          "<"
        );
      }
    }

    // Tiles Animations
    if (document.querySelector(".tile")) {
      initCardTilesAnimations();
    }

    // Allow pinning animation only for Desktop/Ipad users
    // Fade In for Desktop Accordingly
    ScrollTrigger.matchMedia({
      "(min-width: 820px)": function () {
        const pinIntro = gsap.timeline({
          scrollTrigger: {
            trigger: ".home-intro",
            start: "30%",
            toggleActions: "play none none reverse",
            pin: true,
            pinSpacing: false,
          },
        });

        const pinBackground = gsap.timeline({
          scrollTrigger: {
            trigger: ".background",
            pin: true,
            start: "0%",
            end: "100%",
          },
        });

        const pinSkills = gsap.timeline({
          scrollTrigger: {
            trigger: ".skills",
            start: "0%",
            end: "100%",
            toggleActions: "play none none reverse",
            pin: true,
            pinSpacing: false,
          },
        });

        const pinLottie = gsap.timeline({
          scrollTrigger: {
            trigger: ".home-lottie-gridroom",
            scrub: 0.5,
            start: "0% ",
            end: "100%",
            pin: true,
          },
        });
      },

      "(max-width: 540px)": function () {
        const pinLottie = gsap.timeline({
          scrollTrigger: {
            trigger: ".home-lottie-gridroom",
            scrub: 0.5,
            start: "0% ",
            end: "+=250%",
            pin: true,
            // markers: true,
          },
        });

        // Delete any uneccessary animations for mobile
        $(".mouse-pos-list-image").remove();
        $(".mouse-pos-list-btn").remove();
        $(".mouse-pos-list-span").remove();

        // Resize inner text by changing the content in mobile tiles
        $(".tile.frontend .typography-tile-backface-content").remove();
        $(".tile.backend .typography-tile-backface-content").remove();

        $(".tile.frontend .content-column").append(
          "I specialize in creating captivating and user-friendly frontends, whether it's for personal portfolios, business websites, or custom projects."
        );

        $(".tile.backend .content-column").append(
          "I specialize in robust backend development, ensuring reliability and high performance for your projects."
        );
      },
    });
  }
}

/**
 * Initially the back-face is not visible
 * The front face should be visible and when clicked remove its visibility by calling "full-flip"
 * and then make the back face visible by calling "flip"
 *
 * Full flip - hides
 * no-flip - hides
 *
 */
function initCardTilesAnimations() {
  $(".back-face").toggleClass("no-flip");

  // Service Tile
  $(".service.tile.full .front-face").each(function (index) {
    $(this).on("click", function () {
      $(this).toggleClass("full-flip");
      $(".service .back-face").toggleClass("flip");
      $(".section-tiles-grid").toggleClass("tile-overlay");
    });

    $(".service .back-face").on("click", function () {
      $(".back-face").removeClass("flip");
      $(".tile.full .front-face").removeClass("full-flip");
      $(".section-tiles-grid").removeClass("tile-overlay");
    });
  });

  // Acmi Tile
  $(".acmi.tile.full .front-face").each(function (index) {
    $(this).on("click", function () {
      $(this).toggleClass("full-flip");
      $(".acmi .back-face").toggleClass("flip");
      $(".section-tiles-grid").toggleClass("tile-overlay");
    });

    $(".acmi .back-face").on("click", function () {
      $(".back-face").removeClass("flip");
      $(".tile.full .front-face").removeClass("full-flip");
      $(".section-tiles-grid").removeClass("tile-overlay");
    });
  });

  // Frontend
  $(".frontend.tile.half .front-face").each(function (index) {
    $(this).on("click", function () {
      $(this).toggleClass("half-flip");
      $(".frontend .back-face").toggleClass("half-flip-two");
      $(".section-tiles-grid").toggleClass("tile-overlay");
    });

    $(".back-face").on("click", function () {
      $(".back-face").removeClass("half-flip-two");
      $(".frontend.tile.half .front-face").removeClass("half-flip");
      $(".section-tiles-grid").removeClass("tile-overlay");
    });
  });

  // Backend
  $(".backend.tile.half .front-face").each(function (index) {
    $(this).on("click", function () {
      $(this).toggleClass("half-flip");
      $(".backend .back-face").toggleClass("half-flip-two");
      $(".section-tiles-grid").toggleClass("tile-overlay");
    });

    $(".back-face").on("click", function () {
      $(".back-face").removeClass("half-flip-two");
      $(".backend.tile.half .front-face").removeClass("half-flip");
      $(".section-tiles-grid").removeClass("tile-overlay");
    });
  });
}

function initWorkAnimations() {
  if ($(window).width() < 540) {
    // Delete any uneccessary animations for mobile
    $(".mouse-pos-list-image").remove();
    $(".mouse-pos-list-btn").remove();
    $(".mouse-pos-list-span").remove();
    $(".case-intro-image").remove();
    $(".description-speaker").html(
      "Feel free to message me directly on LinkedIn."
    );
  }
}

function initPageTransitions() {
  // do something before the transition starts
  barba.hooks.before(() => {
    select("html").classList.add("is-transitioning");
  });

  // do something after the transition finishes
  barba.hooks.after(() => {
    select("html").classList.remove("is-transitioning");
    // reinit locomotive scroll
    scroll.init();
    scroll.stop();
  });

  // scroll to the top of the page
  barba.hooks.enter(() => {
    scroll.destroy();
  });

  // scroll to the top of the page
  barba.hooks.afterEnter(() => {
    window.scrollTo(0, 0);
  });

  // NOTE: data.next = current container
  barba.init({
    sync: true,
    timeout: 7000,
    transitions: [
      {
        name: "default",
        once(data) {
          // Current page once transition (browser first load)
          initSmoothScroll(data.next.container);
          initScript();
          initLoader();
        },
        async leave(data) {
          // Current page leave transition
          pageTransitionIn(data.current);
          await delay(495);
          data.current.container.remove();
        },
        async enter(data) {
          // Next page enter transition
          pageTransitionOut(data.next); // optional
          initNextWord(data);
        },
        async beforeEnter(data) {
          //Before enter transition/view
          ScrollTrigger.getAll().forEach((t) => t.kill());
          locoScroll.destroy(); // Optional!
          initSmoothScroll(data.next.container);
          initScript();
          ScrollTrigger.refresh(); // IMPORTANT!
        },
      },
      {
        // If this isn't done then initLoader() will be called from once
        name: "to-home",
        from: {},
        to: {
          namespace: ["home"],
        },
        once(data) {
          // do something once on the initial page load
          initSmoothScroll(data.next.container);
          initScript();
          initLoaderHome();
        },
      },
    ],
  });
}

function delay(n) {
  n = n || 2000;
  return new Promise((done) => {
    setTimeout(() => {
      done();
    }, n);
  });
}

function initScript() {
  // initNavAnimations();
  initSplitText();
  initFlickitySlider();
  initHamburgerNav();
  initButtonsAnimations();
  initMagneticButtons();
  initScrolltriggerNav();
  initTricksWords();
  initScrolltriggerAnimations();
  initHomeAnimations();
  initWorkAnimations();
  initLazyLoad();
  initStickyCursorWithDelay();
  // setTimeout(() => {
  //   console.clear();
  // }, 5000);
}

// Animation - Page transition In
function pageTransitionIn() {
  var tl = gsap.timeline();

  tl.call(function () {
    locoScroll.stop();
  });

  tl.set(".loading-screen", {
    top: "100%",
  });

  tl.set(".loading-words", {
    opacity: 0,
    y: 0,
  });

  tl.set("html", {
    cursor: "wait",
  });

  if ($(window).width() > 540) {
    tl.set(".loading-screen .rounded-div-wrap.bottom", {
      height: "10vh",
    });
  } else {
    tl.set(".loading-screen .rounded-div-wrap.bottom", {
      height: "5vh",
    });
  }

  tl.to(".loading-screen", {
    duration: 0.5,
    top: "0%",
    ease: "Power4.easeIn",
  });

  if ($(window).width() > 540) {
    tl.to(
      ".loading-screen .rounded-div-wrap.top",
      {
        duration: 0.4,
        height: "10vh",
        ease: "Power4.easeIn",
      },
      "=-.5"
    );
  } else {
    tl.to(
      ".loading-screen .rounded-div-wrap.top",
      {
        duration: 0.4,
        height: "10vh",
        ease: "Power4.easeIn",
      },
      "=-.5"
    );
  }

  tl.to(".loading-words", {
    duration: 0.8,
    opacity: 1,
    y: -50,
    ease: "Power4.easeOut",
    delay: 0.05,
  });

  tl.set(".loading-screen .rounded-div-wrap.top", {
    height: "0vh",
  });

  tl.to(
    ".loading-screen",
    {
      duration: 0.8,
      top: "-100%",
      ease: "Power3.easeInOut",
    },
    "=-.2"
  );

  tl.to(
    ".loading-words",
    {
      duration: 0.6,
      opacity: 0,
      ease: "linear",
    },
    "=-.8"
  );

  tl.to(
    ".loading-screen .rounded-div-wrap.bottom",
    {
      duration: 0.85,
      height: "0",
      ease: "Power3.easeInOut",
    },
    "=-.6"
  );

  tl.set(
    "html",
    {
      cursor: "auto",
    },
    "=-0.6"
  );

  if ($(window).width() > 540) {
    tl.set(".loading-screen .rounded-div-wrap.bottom", {
      height: "10vh",
    });
  } else {
    tl.set(".loading-screen .rounded-div-wrap.bottom", {
      height: "5vh",
    });
  }

  tl.set(".loading-screen", {
    top: "100%",
  });

  tl.set(".loading-words", {
    opacity: 0,
  });
}

// Animation - Page transition Out
function pageTransitionOut() {
  var tl = gsap.timeline();

  if ($(window).width() > 540) {
    tl.set("main .once-in", {
      y: "50vh",
    });
  } else {
    tl.set("main .once-in", {
      y: "20vh",
    });
  }

  tl.call(function () {
    locoScroll.start();
  });

  tl.to("main .once-in", {
    duration: 1,
    y: "0vh",
    stagger: 0.05,
    ease: "Expo.easeOut",
    delay: 0.8,
    clearProps: "true",
  });
}

// Animation - First Page Load
function initLoader() {
  var tl = gsap.timeline();

  tl.set(".loading-screen", {
    top: "0",
  });

  if ($(window).width() > 540) {
    tl.set("main .once-in", {
      y: "50vh",
    });
  } else {
    tl.set("main .once-in", {
      y: "10vh",
    });
  }

  tl.set(".loading-words", {
    opacity: 1,
    y: -50,
  });

  if ($(window).width() > 540) {
    tl.set(".loading-screen .rounded-div-wrap.bottom", {
      height: "10vh",
    });
  } else {
    tl.set(".loading-screen .rounded-div-wrap.bottom", {
      height: "5vh",
    });
  }

  tl.set("html", {
    cursor: "wait",
  });

  // send to top (off screen)
  tl.to(".loading-screen", {
    duration: 0.8,
    top: "-100%",
    ease: "Power4.easeInOut",
    delay: 0.5,
  });

  tl.to(
    ".loading-screen .rounded-div-wrap.bottom",
    {
      duration: 1,
      height: "0vh",
      ease: "Power4.easeInOut",
    },
    "=-.8"
  );

  tl.to(
    ".loading-words",
    {
      duration: 0.3,
      opacity: 0,
      ease: "linear",
    },
    "=-.8"
  );

  tl.set(".loading-screen", {
    top: "calc(-100%)",
  });

  tl.set(".loading-screen .rounded-div-wrap.bottom", {
    height: "0vh",
  });

  tl.to(
    "main .once-in",
    {
      duration: 1,
      y: "0vh",
      stagger: 0.05,
      ease: "Expo.easeOut",
      clearProps: "true",
    },
    "=-.8"
  );

  tl.set(
    "html",
    {
      cursor: "auto",
    },
    "=-.8"
  );
}

function initLoaderHome() {
  var tl = gsap.timeline();

  // reset
  tl.set(".loading-screen", {
    top: "0", // bottom (full screen)
  });

  if ($(window).width() > 540) {
    tl.set("main .once-in", {
      y: "50vh", // up illusion
    });
  } else {
    tl.set("main .once-in", {
      y: "10vh",
    });
  }

  tl.set(".loading-words", {
    opacity: 0,
    y: -50,
  });

  // initially hide
  tl.set(".loading-words .active", {
    display: "none",
  });

  tl.set(".loading-words .home-active, .loading-words .home-active-last", {
    display: "block",
    opacity: 0,
  });

  tl.set(".loading-words .home-active-first", {
    opacity: 1,
  });

  if ($(window).width() > 540) {
    tl.set(".loading-screen .rounded-div-wrap.bottom", {
      height: "10vh", // bottom rounded div
    });
  } else {
    tl.set(".loading-screen .rounded-div-wrap.bottom", {
      height: "5vh",
    });
  }

  // set cursor to wait
  tl.set("html", {
    cursor: "wait",
  });

  tl.call(function () {
    locoScroll.stop();
  });

  tl.to(".loading-words", {
    duration: 0.8,
    opacity: 1,
    y: -50,
    ease: "Power4.easeOut",
    delay: 0.5,
  });

  tl.to(
    ".loading-words .home-active",
    {
      duration: 0.01,
      opacity: 1,
      stagger: 0.15,
      ease: "none",
      onStart: homeActive,
    },
    "=-.4"
  );

  function homeActive() {
    // reset
    gsap.to(".loading-words .home-active", {
      duration: 0.01,
      opacity: 0,
      stagger: 0.15,
      ease: "none",
      delay: 0.15,
    });
  }

  // tl.to(".loading-words .home-active-last", {
  //   duration: 0.01,
  //   opacity: 1,
  //   delay: 0.15,
  // });

  tl.to(".loading-screen", {
    duration: 0.8,
    top: "-100%",
    ease: "Power4.easeInOut",
    delay: 0.2,
  });

  tl.to(
    ".loading-screen .rounded-div-wrap.bottom",
    {
      duration: 1,
      height: "0vh",
      ease: "Power4.easeInOut",
    },
    "=-.8" // .8 secs before the animation
  );

  // Remove
  tl.to(
    ".loading-words",
    {
      duration: 0.3,
      opacity: 0,
      ease: "linear",
    },
    "=-.8"
  );

  // Remove from view
  tl.set(".loading-screen", {
    top: "calc(-100%)",
  });

  // Extra set (in case of issues)
  tl.set(".loading-screen .rounded-div-wrap.bottom", {
    height: "0vh",
  });

  // Place back in view
  tl.to(
    "main .once-in",
    {
      duration: 1.5,
      y: "0vh",
      stagger: 0.07,
      ease: "Expo.easeOut",
      clearProps: true,
    },
    "=-.8" // .8 secs before within html cursor finishes loading
  );

  tl.set(
    "html",
    {
      cursor: "auto",
    },
    "=-1.2"
  );

  tl.call(function () {
    locoScroll.start();
  });
}

function initNextWord(data) {
  let parser = new DOMParser();
  let dom = parser.parseFromString(data.next.html, "text/html");
  let nextProjects = dom.querySelector(".loading-words");

  // replace the next namespace HTML
  document.querySelector(".loading-words").innerHTML = nextProjects.innerHTML;
}

function initLazyLoad() {
  const blurDivs = document.querySelectorAll(".blur-load");

  blurDivs.forEach((div) => {
    const img = document.querySelector("img");

    function loaded() {
      // show img
      div.classList.add("loaded");
      // Once div contains loaded trigger the animation
      if (document.querySelector(".blur-load").classList.contains("loaded")) {
        gsap.to(".blur-load > img", {
          opacity: 1,
          duration: 0.1,
          ease: "ease-in-out",
        });
      }
    }

    // done loaded
    if (img.complete) {
      setTimeout(() => loaded(), 1000);
      // loaded()
    } else {
      img.addEventListener("load", () => {
        setTimeout(() => loaded(), 1000);
      });
    }
  });
}

function initStickyCursorWithDelay() {
  if (document.querySelector(".mouse-pos-list-image")) {
    var cursorImage = document.querySelector(".mouse-pos-list-image");
    var cursorBtn = document.querySelector(".mouse-pos-list-btn");
    var cursorSpan = document.querySelector(".mouse-pos-list-span");

    var posXImage = 0;
    var posYImage = 0;
    var posXBtn = 0;
    var posYBtn = 0;
    var posXSpan = 0;
    var posYSpan = 0;
    var mouseX = 0;
    var mouseY = 0;

    // Repeat indefinitely It has a duration of 0.0083333333 seconds (1/120th of a second), which corresponds to approximately 120 frames per second.
    // Ideally, you want a 0.0x... < 1
    // There's an onRepeat callback function that gets executed on each frame of the animation loop.
    // calculate new positions (posXImage and posYImage) for an element (cursorImage) based on the current mouse position (mouseX and mouseY).
    if (
      document.querySelector(
        ".mouse-pos-list-image, .mouse-pos-list-btn, .mouse-post-list-span"
      )
    ) {
      gsap.to({}, 0.0083333333, {
        repeat: -1,
        onRepeat: function () {
          // The higher the more the element are able to expand as the mouse moves
          if (document.querySelector(".mouse-pos-list-image")) {
            posXImage += (mouseX - posXImage) / 12;
            posYImage += (mouseY - posYImage) / 12;
            gsap.set(cursorImage, {
              css: {
                left: posXImage,
                top: posYImage,
              },
            });
          }

          // This button is optional (background btn)
          if (document.querySelector(".mouse-pos-list-btn")) {
            posXBtn += (mouseX - posXBtn) / 7;
            posYBtn += (mouseY - posYBtn) / 7;
            gsap.set(cursorBtn, {
              css: {
                left: posXBtn,
                top: posYBtn,
              },
            });
          }

          // Handle Circle with Text position
          if (document.querySelector(".mouse-pos-list-span")) {
            posXSpan += (mouseX - posXSpan) / 6;
            posYSpan += (mouseY - posYSpan) / 6;
            gsap.set(cursorSpan, {
              css: {
                left: posXSpan,
                top: posYSpan,
              },
            });
          }
        },
      });
    }

    // Get cursor coordinates and assign them respectively
    $(document).on("mousemove", function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Handle Enter and Leave events
    // Make them  visible and remove visibility respectively
    $(".mouse-pos-list-image-wrap a").on("mouseenter", function () {
      $(
        ".mouse-pos-list-image, .mouse-pos-list-btn, .mouse-pos-list-span, .mouse-pos-list-span-big"
      ).addClass("active");
    });
    $(".mouse-pos-list-image-wrap a").on("mouseleave", function () {
      $(
        ".mouse-pos-list-image, .mouse-pos-list-btn, .mouse-pos-list-span, .mouse-pos-list-span-big"
      ).removeClass("active");
    });

    // INNER IMAGE SWAP once enter in the grid
    $(".mouse-pos-list-image-wrap li.visible").on("mouseenter", function () {
      var $elements = $(".mouse-pos-list-image-wrap li.visible");
      var index = $elements.index($(this));
      var count = $(".mouse-pos-list-image li.visible").length;
      // Formula to calculate swap vertically
      if ($(".float-image-wrap")) {
        gsap.to($(".float-image-wrap"), {
          y: (index * 100) / (count * -1) + "%",
          duration: 0.6,
          ease: Power2.easeInOut,
        });
      }

      // OPTIONALS
      $(".mouse-pos-list-image.active .mouse-pos-list-image-bounce")
        .addClass("active")
        .delay(400)
        .queue(function (next) {
          $(this).removeClass("active");
          next();
        });
    });

    // OPTIONALS
    $(".archive-work-grid li").on("mouseenter", function () {
      $(".mouse-pos-list-btn")
        .addClass("hover")
        .delay(100)
        .queue(function (next) {
          $(this).removeClass("hover");
          next();
        });
    });
  }
}

function initFlickitySlider() {
  $(".single-flickity-slider").each(function (index) {
    var sliderIndexID = "flickity-slider-id-" + index;
    $(this).attr("id", sliderIndexID);

    var sliderThis = $(this);

    var flickitySliderMain = document.querySelector(
      "#" + sliderIndexID + " .flickity-carousel"
    );

    var flickityMain = sliderThis.find(".flickity-carousel").flickity({
      // options
      watchCSS: true,
      contain: true,
      wrapAround: false,
      dragThreshold: 10,
      prevNextButtons: false,
      pageDots: false,
      cellAlign: "left",
      selectedAttraction: 0.015,
      friction: 0.25,
      percentPosition: true,
      freeScroll: true,
      on: {
        dragStart: () => {
          flickityMain.css("pointer-events", "none");
        },
        dragEnd: () => {
          flickityMain.css("pointer-events", "auto");
        },
        change: function () {
          updatePagination();
        },
      },
    });

    // Flickity instance
    var flkty = flickityMain.data("flickity");

    // previous
    var prevButton = sliderThis
      .find(".flickity-btn-prev")
      .on("click", function () {
        flickityMain.flickity("previous");
      });
    // next
    var nextButton = sliderThis
      .find(".flickity-btn-next")
      .on("click", function () {
        flickityMain.flickity("next");
      });

    // Get the amount of columns variable and use to calc last slide
    var inviewColumns = window
      .getComputedStyle(flickitySliderMain)
      .getPropertyValue("--columns");

    function updatePagination() {
      // enable/disable previous/next buttons
      if (!flkty.cells[flkty.selectedIndex - 1]) {
        prevButton.attr("disabled", "disabled");
        nextButton.removeAttr("disabled"); // <-- remove disabled from the next
      } else if (!flkty.cells[flkty.selectedIndex + parseInt(inviewColumns)]) {
        nextButton.attr("disabled", "disabled");
        prevButton.removeAttr("disabled"); //<-- remove disabled from the prev
      } else {
        prevButton.removeAttr("disabled");
        nextButton.removeAttr("disabled");
      }
    }
  });
}

initPageTransitions();
