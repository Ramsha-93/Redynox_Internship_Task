// Spoke & Wrench — site script
// Two jobs on this page: (1) toggle the mobile nav, (2) validate + "submit" the contact form.

// ---------- dark mode toggle ----------
// remembers the choice in localStorage; falls back to the OS preference
// on first visit if the person hasn't picked one yet

const themeToggle = document.getElementById("themeToggle");
const storedTheme = localStorage.getItem("sw-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

if (storedTheme) {
  document.documentElement.setAttribute("data-theme", storedTheme);
} else if (prefersDark) {
  document.documentElement.setAttribute("data-theme", "dark");
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("sw-theme", next);
  });
}

// ---------- scroll reveal ----------
// every element with .reveal fades/slides in the first time it enters view

const revealTargets = document.querySelectorAll(".reveal");

if (revealTargets.length && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealTargets.forEach((el) => revealObserver.observe(el));
} else {
  // no IntersectionObserver support (or no targets) - just show everything
  revealTargets.forEach((el) => el.classList.add("in-view"));
}

// ---------- animated stat counters (about page) ----------
// expects markup like: <span class="stat-num" data-count="1200" data-suffix="+">0</span>

const statEls = document.querySelectorAll(".stat-num[data-count]");

if (statEls.length && "IntersectionObserver" in window) {
  const statObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );

  statEls.forEach((el) => statObserver.observe(el));
}

function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || "";
  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    // ease-out so it slows down near the end instead of stopping abruptly
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    el.textContent = value.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

// ---------- sticky header shrink + scroll progress bar ----------

const header = document.querySelector(".site-header");
const progressBar = document.getElementById("scrollProgress");

window.addEventListener("scroll", () => {
  if (header) {
    header.classList.toggle("scrolled", window.scrollY > 40);
  }
  if (progressBar) {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    progressBar.style.width = pct + "%";
  }
}, { passive: true });

// ---------- confetti ----------
// small celebratory burst, used on a successful form submit

function launchConfetti() {
  const colors = ["#C6863C", "#3C7A78", "#A76E2C", "#EDEBE4"];
  const pieceCount = 28;

  for (let i = 0; i < pieceCount; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = 1.8 + Math.random() * 1.2 + "s";
    piece.style.animationDelay = Math.random() * 0.3 + "s";
    document.body.appendChild(piece);

    // clean up after the animation finishes so these don't pile up in the DOM
    piece.addEventListener("animationend", () => piece.remove());
  }
}

// ---------- mobile nav ----------

const navToggle = document.getElementById("navToggle");
const navList = document.getElementById("navList");

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = navList.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen);
  });
}

// ---------- 3D tilt on cards ----------
// tracks the cursor over each card and tilts it slightly toward the pointer,
// then eases back flat when the mouse leaves. Skipped on touch devices since
// there's no hover/pointer position to track there.

const tiltCards = document.querySelectorAll(".bin, .team-card, .gallery-grid figure");
const supportsHover = window.matchMedia("(hover: hover)").matches;

if (supportsHover) {
  tiltCards.forEach((card) => {
    const maxTilt = 7; // degrees - kept small so it reads as polish, not a gimmick

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const percentX = x / rect.width - 0.5;  // -0.5 .. 0.5
      const percentY = y / rect.height - 0.5;

      const rotateY = percentX * maxTilt * 2;
      const rotateX = percentY * -maxTilt * 2;

      card.style.transform =
        `perspective(800px) translateY(-6px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(800px)";
    });
  });
}

// ---------- video placeholders ----------
// no real video files shipped with this project yet — these buttons just
// explain that, instead of doing nothing when clicked

document.querySelectorAll(".play-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    alert("No video file added yet — drop an .mp4 into the media/ folder and wire it up in the HTML (see README).");
  });
});

// ---------- contact form ----------
// only runs on contact.html since that's the only page with #contactForm

const form = document.getElementById("contactForm");

if (form) {
  const nameField = document.getElementById("name");
  const emailField = document.getElementById("email");
  const messageField = document.getElementById("message");
  const successBox = document.getElementById("formSuccess");

  // basic email pattern - not perfect RFC-compliant regex, but good enough
  // to catch "missing @" or "missing dot" type typos
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    let isValid = true;

    isValid = validateName() && isValid;
    isValid = validateEmail() && isValid;
    isValid = validateMessage() && isValid;

    if (!isValid) {
      successBox.hidden = true;
      return;
    }

    // In a real site this is where you'd send the data to a server, e.g:
    //
    //   fetch("/api/contact", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(formData)
    //   })
    //
    // We don't have a backend here, so we just log what would have been sent.
    const formData = {
      name: nameField.value.trim(),
      email: emailField.value.trim(),
      message: messageField.value.trim(),
      submittedAt: new Date().toISOString()
    };

    console.log("Contact form submitted:", formData);

    successBox.hidden = false;
    form.reset();
    clearAllErrors();
    launchConfetti();
  });

  // clear a field's error as soon as the user starts fixing it
  nameField.addEventListener("input", () => clearError(nameField, "nameError"));
  emailField.addEventListener("input", () => clearError(emailField, "emailError"));
  messageField.addEventListener("input", () => clearError(messageField, "messageError"));

  function validateName() {
    const value = nameField.value.trim();
    if (value.length < 2) {
      showError(nameField, "nameError", "Enter your name (at least 2 characters).");
      return false;
    }
    clearError(nameField, "nameError");
    return true;
  }

  function validateEmail() {
    const value = emailField.value.trim();
    if (!emailPattern.test(value)) {
      showError(emailField, "emailError", "That doesn't look like a valid email address.");
      return false;
    }
    clearError(emailField, "emailError");
    return true;
  }

  function validateMessage() {
    const value = messageField.value.trim();
    if (value.length < 10) {
      showError(messageField, "messageError", "Tell us a bit more — at least 10 characters.");
      return false;
    }
    clearError(messageField, "messageError");
    return true;
  }

  function showError(field, errorId, message) {
    field.closest(".form-row").classList.add("has-error");
    document.getElementById(errorId).textContent = message;
  }

  function clearError(field, errorId) {
    field.closest(".form-row").classList.remove("has-error");
    document.getElementById(errorId).textContent = "";
  }

  function clearAllErrors() {
    clearError(nameField, "nameError");
    clearError(emailField, "emailError");
    clearError(messageField, "messageError");
  }
}
