/**
 * Shared by the root layout (server) and the intro component (client), so it lives in a plain
 * module: a server component cannot read a value exported from a "use client" file.
 */
export const INTRO_SEEN_KEY = "twt-intro-seen";

/**
 * Runs in <head>, before the first paint, so the intro covers the page from the very first frame
 * and returning visitors never see a flash of it. It marks <html data-intro="play"> only when the
 * visit opens on the home page, has not seen the intro in this browser session, and has not asked
 * for reduced motion. intro-splash.tsx later moves the attribute to "done". See globals.css.
 */
export const INTRO_GUARD_SCRIPT = `(function(){try{var d=document.documentElement;if(location.pathname==="/"&&!sessionStorage.getItem("${INTRO_SEEN_KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches)d.dataset.intro="play"}catch(e){}})()`;
