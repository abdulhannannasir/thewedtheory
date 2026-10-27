/**
 * Shared by the root layout (server) and the intro component (client), so it lives in a plain
 * module: a server component cannot read a value exported from a "use client" file.
 */
export const INTRO_SEEN_KEY = "twt-intro-seen";

/**
 * Runs in <head>, before the first paint, and decides two things.
 *
 * 1. MOTION. Unless the visitor asks for reduced motion it marks <html data-motion="full">, which
 *    switches the front page's scrolling journey to its cinematic layout (a pinned stage the
 *    visitor scrolls through). Without the mark (reduced motion, JavaScript off) the journey is an
 *    ordinary stack of full-width scenes. If the journey's script has not started within 10 seconds
 *    (blocked, or failed to load) the mark flips to "static", so a visitor is never left on a
 *    stage that does not move. See journey.css.
 * 2. INTRO. It marks <html data-intro="play"> only when the visit opens on the home page, has not
 *    seen the intro in this browser session, has not asked for reduced motion or Data Saver, and is
 *    not on a slow (2G or 3G) connection. The intro covers the page from the very first frame and
 *    returning visitors never see a flash of it. intro-sequence.tsx later moves the attribute to
 *    "done". A tap before the page has finished loading also ends it (the component's own Skip
 *    cannot respond until it has loaded). See globals.css.
 */
export const INTRO_GUARD_SCRIPT = `(function(){try{var d=document.documentElement,r=matchMedia("(prefers-reduced-motion: reduce)").matches;if(!r){d.dataset.motion="full";setTimeout(function(){if(document.getElementById("journey")&&!document.querySelector("[data-journey-ready]")&&d.dataset.motion==="full")d.dataset.motion="static"},10000)}if(location.pathname==="/"&&!sessionStorage.getItem("${INTRO_SEEN_KEY}")&&!r){var c=navigator.connection;if(!(c&&(c.saveData||/^(slow-2g|2g|3g)$/.test(c.effectiveType))))d.dataset.intro="play";document.addEventListener("click",function(){if(d.dataset.intro==="play")d.dataset.intro="done"},{once:true})}}catch(e){}})()`;
