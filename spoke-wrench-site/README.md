# Spoke & Wrench — Project Documentation

A 3-page responsive website for a fictional neighborhood bike repair shop, built for
Task 1 (front-end basics) and Task 2 (form handling + client/server concepts).

## 1. Project structure

```
spoke-wrench-site/
├── index.html        Home page — hero, services ("pegboard"), about teaser
├── about.html         About page — shop story, stats, team, hours
├── contact.html        Contact page — shop info + validated contact form
├── css/
│   └── style.css       All layout, typography, color, and responsive rules
└── js/
    └── script.js       Mobile nav toggle + contact form validation
```

All three pages share the same header, navigation, and footer markup so the site
feels consistent. Only `contact.html` loads a `<form>`, but all three pages load
`script.js` — the form-handling code checks `document.getElementById("contactForm")`
exists before doing anything, so it's harmless on pages without a form.

Semantic elements used throughout: `<header>`, `<nav>`, `<main>`, `<section>`,
`<article>`, `<footer>`. Headings follow one `<h1>` per page, with `<h2>`/`<h3>`
nested underneath for section and card titles.

## 2. Styling decisions

- **Theme**: rather than a generic "corporate" palette, the site leans into the
  bike-shop subject — a workshop feel (charcoal, brass, muted teal) instead of
  default SaaS blues or purples.
- **Colors** are defined as CSS custom properties in `:root` (`--charcoal`,
  `--brass`, `--teal`, etc.) so every component pulls from the same palette
  instead of repeating hex codes.
- **Typography**: `Big Shoulders Display` (a condensed, industrial-feeling
  typeface) for headings, `Work Sans` for body copy, and `JetBrains Mono` used
  sparingly for the "BIN 01 / BIN 02" service codes — a nod to inventory labels
  you'd actually see in a repair shop.
- **Layout**: the services section ("What's on the bench") is a flexbox grid of
  bordered panels rather than rounded cards with drop shadows, to keep the
  workshop/pegboard feel instead of a generic dashboard look.
- All spacing uses a consistent scale (multiples of 4px) for visual rhythm.

## 3. Responsiveness approach

- **Flexbox** is used for nearly every layout block (`.hero`, `.bin-grid`,
  `.team-grid`, `.story`, `.contact-layout`, `.footer-grid`), with `flex-wrap`
  so items reflow onto new lines instead of overflowing on narrow screens.
- **Media queries**:
  - `max-width: 860px` — hero switches from a two-column layout to a stacked
    layout (image above text), and the "story" stats move from a left border
    to a top border, laid out horizontally.
  - `max-width: 680px` — the nav collapses into a hamburger menu
    (`.nav-toggle`), toggled by `script.js` adding/removing an `.open` class.
- Font sizes for headings use `clamp()` so they scale smoothly with viewport
  width instead of jumping at fixed breakpoints.
- Tested by resizing the browser window and using Chrome DevTools' device
  toolbar (iPhone SE, iPhone 12 Pro, iPad, and a generic 1440px desktop width).

## 4. Interactive polish

- **3D hover tilt** on service, team, and gallery cards — tracks the cursor
  and tilts the card toward it (`js/script.js`, mousemove/mouseleave).
- **Scroll-reveal animations** — sections fade/slide in the first time they
  enter the viewport, via `IntersectionObserver` (class `.reveal`).
- **Animated stat counters** on the About page — the "2016 / 3 / 1,200+"
  numbers count up from 0 once scrolled into view.
- **Sticky header** that shrinks slightly and gains a shadow after scrolling
  past 40px, plus a **scroll progress bar** at the very top of the page.
- **Dark mode toggle** (sun/moon icon in the nav) — swaps the CSS custom
  properties site-wide and remembers the choice in `localStorage`.
- **Confetti** on a successful contact-form submission.

All of these respect `prefers-reduced-motion` where relevant (the reveal
animation disables itself) and degrade gracefully — e.g. the tilt effect only
runs on devices that actually support hover.

## 5. Pictures and video (Home & About pages)

Both pages now include a **gallery section** and a **video section**:

- **Gallery**: instead of stock photos (which would need external hosting and
  proper licensing), the gallery uses original hand-drawn SVG illustrations
  — a bike on a repair stand, a wheel on a truing stand, the rental fleet,
  the shop's pegboard, a group ride, and the storefront. They're inline SVG,
  so they load instantly with no broken image links and no copyright
  concerns, and they inherit the site's color palette automatically.
- **Video**: there's a styled placeholder panel with a play button in both
  `index.html` and `about.html`. Clicking it currently shows an alert
  explaining no video file is wired up yet. The `media/` folder has a
  `README.txt` with the exact markup to swap in once you have a real file —
  drop in `shop-tour.mp4` / `team-intro.mp4`, replace the
  `<div class="video-placeholder">...</div>` block with a real `<video>`
  element (instructions included), and it'll work the same as any other
  HTML5 video.

**To use real photos instead of the illustrations**: drop `.jpg`/`.png`
files into `media/`, then in `index.html` / `about.html` replace the `<svg>`
block inside each `.gallery-grid` `<figure>` with
`<img src="media/your-photo.jpg" alt="...">`. The CSS (`.gallery-grid svg`)
would need a matching `.gallery-grid img { width: 100%; height: auto; }`
rule, which is already covered since `img { max-width: 100%; display: block; }`
is set globally near the top of `style.css`.

## 5. Form handling & validation (Task 2)

The contact form (`contact.html`) has three fields: Name, Email, Message.

**Client-side validation** (`js/script.js`) runs on `submit`:

| Field   | Rule                                      |
|---------|--------------------------------------------|
| Name    | At least 2 characters                     |
| Email   | Must match a basic `something@something.tld` pattern (regex) |
| Message | At least 10 characters                    |

If any field fails, `event.preventDefault()` stops the form from submitting,
an inline red error message appears under that field, and the field gets a
`.has-error` class (red border). Errors clear as soon as the user edits that
field again (`input` event listener).

If all fields pass, the script:
1. Builds a plain JS object (`formData`) with the field values and a timestamp.
2. Logs it to the browser console — open DevTools (F12) → Console tab after
   submitting to see it.
3. Shows a "message sent" confirmation box on the page.
4. Resets the form.

### GET vs POST, and how data would reach a server

- **GET** appends form data to the URL as a query string (e.g.
  `?name=Ali&email=ali@example.com`). It's visible in the URL, cacheable, and
  has practical length limits — fine for search boxes or filters, not for
  anything private.
- **POST** sends form data in the request body, not the URL. It's the standard
  choice for anything that creates or changes data on a server — like a
  contact form — because the data isn't exposed in the URL or browser history.

This project has no backend, so the form only runs client-side. In a real
deployment, the `submit` handler in `script.js` would instead call something
like:

```js
fetch("/api/contact", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(formData)
});
```

**Data flow**: browser collects and validates the input → JS sends it as an
HTTP POST request to a server endpoint → the server (Node/PHP/Python/etc.)
receives the request, validates it again server-side (never trust client-only
validation), stores it or emails it, and sends back a response (e.g. `200 OK`
or an error) → the browser reads that response and updates the UI (success or
error message) accordingly.

### Screenshots to include in your submission

Since this is a static hand-off, capture these yourself before submitting:
1. Contact form with all fields empty, after clicking "Send message" (shows
   all three validation errors).
2. Contact form with an invalid email (e.g. `test@test`) showing just the
   email error.
3. Contact form successfully submitted — the confirmation box.
4. Browser DevTools console showing the logged `formData` object.
