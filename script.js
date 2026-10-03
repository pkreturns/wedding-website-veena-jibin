const cover = document.querySelector(".cover"),
  content = document.querySelector("#invitation-content"),
  opener = document.querySelector("#open-invitation"),
  menu = document.querySelector("#menu-toggle"),
  nav = document.querySelector("#navigation");
let opened = false;
function openInvitation() {
  if (opened) return;
  opened = true;
  document.body.classList.add("opening");
  setTimeout(
    () => {
      cover.hidden = true;
      content.hidden = false;
      document.body.classList.remove("sealed", "opening");
      window.scrollTo(0, 0);
      document.querySelector("#invitation").setAttribute("tabindex", "-1");
      document.querySelector("#invitation").focus({ preventScroll: true });
    },
    matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1500,
  );
}
opener.addEventListener("click", openInvitation);
menu.addEventListener("click", () => {
  nav.hidden = !nav.hidden;
  menu.setAttribute("aria-expanded", String(!nav.hidden));
  menu.setAttribute(
    "aria-label",
    nav.hidden ? "Open navigation" : "Close navigation",
  );
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !document.querySelector("#photo-viewer").open) {
    nav.hidden = true;
    menu.setAttribute("aria-expanded", "false");
    menu.focus();
  }
});
nav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", (e) => {
    nav.hidden = true;
    menu.setAttribute("aria-expanded", "false");
    if (!opened) {
      e.preventDefault();
      openInvitation();
      setTimeout(
        () =>
          document.querySelector(a.hash).scrollIntoView({ behavior: "smooth" }),
        1600,
      );
    }
  }),
);
const music = document.querySelector("#music"),
  record = document.querySelector("#record");
record.addEventListener("click", async () => {
  if (music.paused) {
    try {
      await music.play();
      record.classList.add("playing");
      record.setAttribute("aria-label", "Pause background music");
      record.setAttribute("aria-pressed", "true");
    } catch {
      record.setAttribute("aria-label", "Music unavailable. Try again.");
    }
  } else {
    music.pause();
    record.classList.remove("playing");
    record.setAttribute("aria-label", "Play background music");
    record.setAttribute("aria-pressed", "false");
  }
});
function countdown() {
  let remaining = Math.max(
    0,
    Math.floor((Date.parse("2027-01-24T11:00:00+05:30") - Date.now()) / 1000),
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
    image.alt = photo.alt || `Praveena and Jibin — photograph ${index + 1}`;
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
