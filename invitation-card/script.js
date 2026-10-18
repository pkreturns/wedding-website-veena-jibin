const canvas = document.getElementById("card");
const context = canvas.getContext("2d");
const form = document.getElementById("card-form");
const download = document.getElementById("download");
const status = document.getElementById("status");
const flowers = new Image();
const colors = { olive: "#525d40", gold: "#aa915e", cream: "#faf8ef" };
let flowersReady = false;

function value(name) {
  return form.elements[name].value.trim();
}

// All text and artwork are drawn directly onto the preview canvas.
// The downloaded PNG is therefore the same card, without editor controls.
function text(content, y, size = 30, options = {}) {
  const { italic = false, color = colors.olive, maxWidth = 1120 } = options;
  context.fillStyle = color;
  context.textAlign = "center";
  let actualSize = size;
  do {
    context.font = `${italic ? "italic " : ""}${actualSize}px Georgia, serif`;
    if (context.measureText(content).width <= maxWidth) break;
    actualSize -= 1;
  } while (actualSize > 18);
  context.fillText(content, 750, y, maxWidth);
}

function label(content, y, size = 20, spacing = 4) {
  context.font = `${size}px Arial, sans-serif`;
  context.fillStyle = colors.olive;
  const characters = Array.from(content);
  const width =
    characters.reduce(
      (total, character) => total + context.measureText(character).width,
      0,
    ) +
    Math.max(0, characters.length - 1) * spacing;
  let x = (1500 - width) / 2;
  context.textAlign = "left";
  for (const character of characters) {
    context.fillText(character, x, y);
    x += context.measureText(character).width + spacing;
  }
}

function wrapped(content, y, maxWidth, maxLines, size) {
  // Preserve deliberate address line breaks and split long words when needed.
  const lines = [];
  context.font = `${size}px Georgia, serif`;
  for (const paragraph of content.split("\n")) {
    let line = "";
    for (const character of Array.from(paragraph)) {
      if (context.measureText(line + character).width > maxWidth) {
        const split = line.lastIndexOf(" ");
        if (split > 0) {
          lines.push(line.slice(0, split));
          line = line.slice(split + 1) + character;
        } else {
          lines.push(line);
          line = character;
        }
      } else line += character;
    }
    lines.push(line.trim());
  }
  if (lines.length > maxLines && size > 20) {
    return wrapped(content, y, maxWidth, maxLines, size - 2);
  }
  lines.forEach((line, index) =>
    text(line, y + index * (size + 10), size, { maxWidth }),
  );
}

function rule(y, width = 460) {
  context.strokeStyle = colors.gold;
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(750 - width / 2, y);
  context.lineTo(750 + width / 2, y);
  context.stroke();
}

function drawCard() {
  context.clearRect(0, 0, 1500, 2100);
  context.fillStyle = colors.cream;
  context.fillRect(0, 0, 1500, 2100);

  // Quiet paper texture, generated deterministically to keep every export identical.
  let seed = 17;
  for (let i = 0; i < 16000; i += 1) {
    seed = (seed * 16807) % 2147483647;
    const x = seed % 1500;
    seed = (seed * 16807) % 2147483647;
    context.fillStyle = i % 2 ? "#525d4007" : "#aa915e09";
    context.fillRect(x, seed % 2100, 1.5, 1.5);
  }

  context.strokeStyle = colors.olive;
  context.lineWidth = 2;
  context.strokeRect(65, 65, 1370, 1970);
  context.strokeStyle = colors.gold;
  context.lineWidth = 1;
  context.strokeRect(83, 83, 1334, 1934);

  if (flowersReady) {
    context.save();
    context.translate(255, 120);
    context.rotate(-0.23);
    context.drawImage(flowers, -410, -230, 820, 547);
    context.restore();
    context.save();
    context.translate(1430, 2130);
    context.rotate(Math.PI - 0.23);
    context.drawImage(flowers, -220, -147, 440, 293);
    context.restore();
  }

  const bride = value("bride") || "Bride";
  const groom = value("groom") || "Groom";
  context.strokeStyle = "#aa915e80";
  context.beginPath();
  context.ellipse(750, 235, 70, 85, 0, 0, Math.PI * 2);
  context.stroke();
  text(`${Array.from(bride)[0]} & ${Array.from(groom)[0]}`, 253, 37, {
    italic: true,
  });

  label("TOGETHER WITH OUR FAMILIES", 375, 20, 4);
  text("With joyful hearts, we invite you to celebrate", 431, 29, {
    italic: true,
  });
  label(`OUR ${value("occasion").toUpperCase()}`, 487, 23, 6);

  text(bride, 670, 110, { italic: true, maxWidth: 1100 });
  wrapped(
    `D/o ${value("brideParents") || "[Father’s name] & [Mother’s name]"}`,
    735,
    1040,
    2,
    29,
  );
  wrapped(
    value("brideAddress") || "[House name]\n[Place, district]",
    824,
    960,
    3,
    27,
  );

  text("&", 1030, 85, { italic: true, color: colors.gold });

  text(groom, 1180, 110, { italic: true, maxWidth: 1100 });
  wrapped(
    `S/o ${value("groomParents") || "[Father’s name] & [Mother’s name]"}`,
    1245,
    1040,
    2,
    29,
  );
  wrapped(
    value("groomAddress") || "[House name]\n[Place, district]",
    1334,
    960,
    3,
    27,
  );

  rule(1510);
  const date = new Date(`${value("date")}T12:00:00`);
  const validDate = !Number.isNaN(date.getTime());
  label(
    validDate
      ? date.toLocaleDateString("en-IN", { weekday: "long" }).toUpperCase()
      : "DATE TO BE ANNOUNCED",
    1570,
    20,
    4,
  );
  text(
    validDate
      ? date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "",
    1642,
    53,
  );
  const [hour, minute] = value("time").split(":").map(Number);
  label(
    Number.isFinite(hour)
      ? `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"} IST`
      : "",
    1695,
    22,
    3,
  );
  rule(1740);
  wrapped(value("venue"), 1810, 1020, 2, 37);
  text(value("location"), 1915, 28, { maxWidth: 980 });
  text("Your presence & blessings will make our day complete.", 1970, 24, {
    italic: true,
    maxWidth: 1000,
  });

  canvas.setAttribute(
    "aria-label",
    `${bride} and ${groom}: ${value("occasion")} invitation. ${value("brideParents")}. ${value("brideAddress")}. ${value("groomParents")}. ${value("groomAddress")}. ${value("date")} at ${value("time")} IST. ${value("venue")}, ${value("location")}.`,
  );
}

form.addEventListener("input", () => {
  status.textContent = "";
  drawCard();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  drawCard();
  download.disabled = true;
  download.textContent = "Saving your card…";
  try {
    canvas.toBlob((blob) => {
      download.disabled = false;
      download.textContent = "Download card as photo";
      if (!blob) {
        status.textContent =
          "The photo could not be created. Please try again.";
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        `${value("bride")}-${value("groom")}-${value("occasion")}.png`.replace(
          /[^a-zA-Z0-9.\-]/g,
          "-",
        );
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      status.textContent =
        "Your PNG is ready. If your phone opens the photo, press and hold it to save.";
    }, "image/png");
  } catch (error) {
    download.disabled = false;
    download.textContent = "Download card as photo";
    status.textContent =
      "Could not save the photo. Please reopen this page and try again.";
  }
});

flowers.onload = () => {
  flowersReady = true;
  drawCard();
  download.disabled = false;
  download.textContent = "Download card as photo";
};
flowers.onerror = () => {
  drawCard();
  download.disabled = false;
  download.textContent = "Download card as photo";
  status.textContent =
    "The floral artwork could not load. The card can still be downloaded.";
};
drawCard();
flowers.src = window.invitationFlorals || "";
