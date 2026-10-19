const cover = document.querySelector(".cover"),
  content = document.querySelector("#pages"),
  opener = document.querySelector("#open-invitation");
let opened = false;
// Reveal each block the first time it enters the viewport. Closing and reopening
// the envelope does not reset blocks that have already appeared.
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
const revealBlocks = content.querySelectorAll(
  ".lace-invitation, .scrapbook > *, .with-love, .countdown, .calendar-download, " +
    ".story-page > h2, .story-paper, .candle-banner, .celebration-details > p, " +
    ".celebration-details > h2, .celebration-details > a, .celebration-venue, " +
    ".location > *, .ceremony-panel, .gift-note, .faq > *, " +
    ".gallery-page > h2, #gallery-empty, #gallery-ready, footer"
);

if (!motionPreference.matches) {
  const revealObserver = typeof IntersectionObserver === "function"
    ? new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-revealed");
        revealObserver?.unobserve(entry.target);
      }
    },
    { threshold: 0, rootMargin: "0px 0px -35px 0px" },
  ) : null;

  revealBlocks.forEach((block) => {
    block.classList.add("scroll-reveal");
    if (block.matches(".celebration-venue")) {
      block.classList.add("reveal-focus");
      const index = [...block.parentElement.children].indexOf(block);
      block.style.setProperty("--reveal-delay", `${index * 160}ms`);
    }
    if (block.matches(".gallery-empty, #gallery-ready")) {
      block.classList.add("reveal-unfold");
    }
    if (block.matches("h2, .countdown")) {
      block.classList.add("reveal-focus");
    }
    revealObserver?.observe(block);
  });

  // Older browsers use the same once-only behavior on scroll.
  if (!revealObserver) {
    const revealVisibleBlocks = () => {
      if (content.hidden) return;
      revealBlocks.forEach((block) => {
        const bounds = block.getBoundingClientRect();
        if (bounds.height && bounds.top < innerHeight - 35 && bounds.bottom > 0) {
          block.classList.add("is-revealed");
        }
      });
    };
    window.addEventListener("scroll", revealVisibleBlocks, { passive: true });
    window.addEventListener("resize", revealVisibleBlocks);
    new MutationObserver(revealVisibleBlocks).observe(content, {
      attributes: true,
      attributeFilter: ["hidden"],
    });
  }

  // Keyboard navigation must never land on an invisible control.
  content.addEventListener("focusin", (event) => {
    const block = event.target.closest(".scroll-reveal");
    if (!block) return;
    block.classList.add("is-revealed");
    revealObserver?.unobserve(block);
  });

  motionPreference.addEventListener("change", (event) => {
    if (!event.matches) return;
    revealObserver?.disconnect();
    revealBlocks.forEach((block) => block.classList.add("is-revealed"));
  });
}

function openInvitation() {
  if (opened) return;
  opened = true;
  playMusic();
  document.body.classList.add("opening");
  setTimeout(
    () => {
      cover.hidden = true;
      content.hidden = false;
      content.getBoundingClientRect();
      document.body.classList.remove("sealed", "opening");
      window.scrollTo(0, 0);
      document.querySelector("#invitation").setAttribute("tabindex", "-1");
      document.querySelector("#invitation").focus({ preventScroll: true });
    },
    matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 800,
  );
}
opener.addEventListener("click", openInvitation);
const music = document.querySelector("#music"),
  record = document.querySelector("#record");
// Start within the envelope click so browsers can allow audio playback.
async function playMusic() {
  try {
    await music.play();
  } catch {
    record.setAttribute("aria-label", "Play background music");
  }
}
function syncMusicButton() {
  const playing = !music.paused;
  record.classList.toggle("playing", playing);
  record.setAttribute("aria-label", playing ? "Pause background music" : "Play background music");
  record.setAttribute("aria-pressed", String(playing));
  record.querySelector("span").textContent = playing ? "CLICK TO PAUSE" : "CLICK TO LISTEN";
}
music.addEventListener("play", syncMusicButton);
music.addEventListener("pause", syncMusicButton);
record.addEventListener("click", () => {
  if (music.paused) playMusic();
  else music.pause();
});
function countdown() {
  let remaining = Math.max(
    0,
    Math.floor((Date.parse("2027-01-30T11:30:00+05:30") - Date.now()) / 1000),
  );
  for (const [id, unit] of [
    ["days", 86400],
    ["hours", 3600],
    ["minutes", 60],
    ["seconds", 1],
  ]) {
    document.getElementById(id).textContent = String(
      Math.floor(remaining / unit),
    ).padStart(2, "0");
    remaining %= unit;
  }
}
countdown();
setInterval(countdown, 1000);
document.querySelector("#close-invitation").addEventListener("click", () => {
  opened = false;
  content.hidden = true;
  cover.hidden = false;
  document.body.classList.add("sealed");
  music.pause();
  record.classList.remove("playing");
  record.setAttribute("aria-pressed", "false");
  record.setAttribute("aria-label", "Play background music");
  window.scrollTo(0, 0);
  opener.focus({ preventScroll: true });
});

// The carousel is enabled only when the couple's actual photographs are supplied.
const photos = (window.invitationPhotos || []).filter((photo) => photo.src);
if (photos.length) {
  const gallery = document.querySelector("#gallery"),
    image = document.querySelector("#gallery-image"),
    viewer = document.querySelector("#photo-viewer"),
    fullImage = document.querySelector("#viewer-image"),
    pause = document.querySelector("#gallery-pause");
  let index = 0,
    paused = matchMedia("(prefers-reduced-motion: reduce)").matches,
    hovering = false;
  document.querySelector("#gallery-empty").hidden = true;
  document.querySelector("#gallery-ready").hidden = false;
  function render() {
    const photo = photos[index];
    image.src = photo.src;
    image.alt = photo.alt || `Jibin Jose and Praveena Isaac — photograph ${index + 1}`;
    fullImage.src = photo.src;
    fullImage.alt = image.alt;
    document.querySelector("#gallery-count").textContent =
      `${index + 1} / ${photos.length}`;
    document.querySelector("#viewer-caption").textContent =
      `${index + 1} / ${photos.length}`;
    document
      .querySelector("#gallery-open")
      .setAttribute("aria-label", `View photograph ${index + 1} full size`);
  }
  function move(step) {
    index = (index + step + photos.length) % photos.length;
    render();
  }
  function updatePause() {
    pause.textContent = paused ? "Play slideshow" : "Pause slideshow";
    pause.setAttribute("aria-pressed", String(paused));
  }
  for (const [id, step] of [
    ["gallery-prev", -1],
    ["gallery-next", 1],
    ["viewer-prev", -1],
    ["viewer-next", 1],
  ])
    document.getElementById(id).addEventListener("click", () => move(step));
  pause.addEventListener("click", () => {
    paused = !paused;
    updatePause();
  });
  document.querySelector("#gallery-open").addEventListener("click", () => {
    viewer.showModal();
    document.body.classList.add("viewing-photo");
  });
  document
    .querySelector("#viewer-close")
    .addEventListener("click", () => viewer.close());
  viewer.addEventListener("close", () =>
    document.body.classList.remove("viewing-photo"),
  );
  viewer.addEventListener("click", (e) => {
    if (e.target === viewer) viewer.close();
  });
  viewer.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      move(-1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      move(1);
    }
  });
  gallery.addEventListener("mouseenter", () => (hovering = true));
  gallery.addEventListener("mouseleave", () => (hovering = false));
  setInterval(() => {
    if (
      !paused &&
      !hovering &&
      !viewer.open &&
      !document.hidden &&
      opened &&
      !gallery.contains(document.activeElement) &&
      gallery.getBoundingClientRect().top < innerHeight &&
      gallery.getBoundingClientRect().bottom > 0
    )
      move(1);
  }, 5000);
  if (photos.length === 1)
    document.querySelector(".gallery-controls").hidden = true;
  render();
  updatePause();
}
