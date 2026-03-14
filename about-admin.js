import { supabase } from "../auth/auth.js";
import {
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_GLOBAL_FOOTER,
  loadAboutContent,
  loadGlobalFooterContent,
  saveAboutContent,
  saveGlobalFooterContent,
} from "../about-data.js?v=20260314?v=20260314";

const form = document.getElementById("about-admin-form");
const statusNode = document.getElementById("admin-status");
const saveButton = document.getElementById("save-button");
const reloadButton = document.getElementById("reload-button");
const gate = document.getElementById("admin-gate");
const gateForm = document.getElementById("admin-gate-form");
const gatePassword = document.getElementById("admin-password");
const gateError = document.getElementById("admin-gate-error");
const ADMIN_PASSWORD = "pakistan@123";
const ADMIN_GATE_KEY = "allpanga_admin_gate";

function unlockAdmin() {
  document.body.classList.remove("locked");
  gate.style.display = "none";
}

function lockAdmin() {
  document.body.classList.add("locked");
  gate.style.display = "flex";
}

function setStatus(message, type = "") {
  statusNode.textContent = message;
  statusNode.className = `status ${type}`.trim();
}

function createField(label, name, value = "", type = "text") {
  const wrapper = document.createElement("div");
  const labelNode = document.createElement("label");
  const input = document.createElement(type === "textarea" ? "textarea" : "input");
  labelNode.textContent = label;
  input.name = name;
  input.value = value ?? "";
  wrapper.append(labelNode, input);
  return wrapper;
}

function renderStats(stats) {
  const container = document.getElementById("stats-group");
  container.innerHTML = "";
  stats.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "repeat-item";
    card.innerHTML = `<h4>Stat ${index + 1}</h4>`;
    const grid = document.createElement("div");
    grid.className = "field-grid columns-3";
    grid.append(
      createField("Value", `hero.stats.${index}.value`, item.value),
      createField("Suffix", `hero.stats.${index}.suffix`, item.suffix),
      createField("Label", `hero.stats.${index}.label`, item.label)
    );
    card.append(grid);
    container.append(card);
  });
}

function renderCards(containerId, items, fields) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  items.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "repeat-item";
    card.innerHTML = `<h4>Item ${index + 1}</h4>`;
    const grid = document.createElement("div");
    grid.className = "field-grid";
    fields.forEach((field) => {
      grid.append(
        createField(
          field.label,
          `${field.root}.${index}.${field.key}`,
          item[field.key],
          field.type || "text"
        )
      );
    });
    card.append(grid);
    container.append(card);
  });
}

function fillSimpleFields(content) {
  const entries = {
    "hero.title": content.hero.title,
    "hero.missionTitle": content.hero.missionTitle,
    "hero.missionBody": content.hero.missionBody,
    "hero.visionTitle": content.hero.visionTitle,
    "hero.visionBody": content.hero.visionBody,
    "quality.title": content.quality.title,
    "quality.subtitle": content.quality.subtitle,
    "features.badge": content.features.badge,
    "features.title": content.features.title,
    "features.intro": content.features.intro,
    "features.outro": content.features.outro,
    "testimonials.title": content.testimonials.title,
    "testimonials.subtitle": content.testimonials.subtitle,
    "focus.badge": content.focus.badge,
    "focus.title": content.focus.title,
    "focus.intro": content.focus.intro,
    "focus.outro": content.focus.outro,
    "focus.videoUrl": content.focus.videoUrl,
    "projects.title": content.projects.title,
    "projects.subtitle": content.projects.subtitle,
    "subscribe.title": content.subscribe.title,
    "subscribe.body": content.subscribe.body,
    "footer.intro": content.footer.intro,
    "footer.contactTitle": content.footer.contactTitle,
    "footer.address": content.footer.address,
    "footer.phone": content.footer.phone,
    "footer.email": content.footer.email,
    "footer.fax": content.footer.fax,
    "footer.footerBottom": content.footer.footerBottom,
    "media.hero.0": content.media.hero[0] || "",
    "media.hero.1": content.media.hero[1] || "",
    "media.features.0": content.media.features[0] || "",
    "media.features.1": content.media.features[1] || "",
    "media.focus.0": content.media.focus[0] || "",
  };

  Object.entries(entries).forEach(([name, value]) => {
    const field = form.querySelector(`[name="${name}"]`);
    if (field) field.value = value ?? "";
  });
}

function collectField(name) {
  return form.querySelector(`[name="${name}"]`)?.value?.trim() || "";
}

function collectRepeat(prefix, count, keys) {
  return Array.from({ length: count }, (_, index) => {
    const item = {};
    keys.forEach((key) => {
      item[key] = collectField(`${prefix}.${index}.${key}`);
    });
    return item;
  });
}

function getContentFromForm() {
  return {
    hero: {
      title: collectField("hero.title"),
      missionTitle: collectField("hero.missionTitle"),
      missionBody: collectField("hero.missionBody"),
      visionTitle: collectField("hero.visionTitle"),
      visionBody: collectField("hero.visionBody"),
      stats: collectRepeat("hero.stats", 4, ["value", "suffix", "label"]),
    },
    quality: {
      title: collectField("quality.title"),
      subtitle: collectField("quality.subtitle"),
      cards: collectRepeat("quality.cards", 3, ["iconClass", "title", "body"]),
    },
    features: {
      badge: collectField("features.badge"),
      title: collectField("features.title"),
      intro: collectField("features.intro"),
      bullets: collectRepeat("features.bullets", 4, ["text"]).map((item) => item.text),
      outro: collectField("features.outro"),
    },
    testimonials: {
      title: collectField("testimonials.title"),
      subtitle: collectField("testimonials.subtitle"),
      items: collectRepeat("testimonials.items", 3, ["name", "role", "quote", "rating", "verifiedLabel", "imagePath"]),
    },
    focus: {
      badge: collectField("focus.badge"),
      title: collectField("focus.title"),
      intro: collectField("focus.intro"),
      bullets: collectRepeat("focus.bullets", 3, ["text"]).map((item) => item.text),
      outro: collectField("focus.outro"),
      videoUrl: collectField("focus.videoUrl"),
    },
    projects: {
      title: collectField("projects.title"),
      subtitle: collectField("projects.subtitle"),
      items: collectRepeat("projects.items", 4, ["title", "label", "imagePath", "altText"]),
    },
    subscribe: {
      title: collectField("subscribe.title"),
      body: collectField("subscribe.body"),
    },
    footer: {
      intro: collectField("footer.intro"),
      contactTitle: collectField("footer.contactTitle"),
      address: collectField("footer.address"),
      phone: collectField("footer.phone"),
      email: collectField("footer.email"),
      fax: collectField("footer.fax"),
      categories: collectRepeat("footer.categories", 6, ["text"]).map((item) => item.text),
      footerBottom: collectField("footer.footerBottom"),
    },
    media: {
      hero: [collectField("media.hero.0"), collectField("media.hero.1")].filter(Boolean),
      features: [collectField("media.features.0"), collectField("media.features.1")].filter(Boolean),
      focus: [collectField("media.focus.0")].filter(Boolean),
    },
  };
}

function renderRepeatingGroups(content) {
  renderStats(content.hero.stats);
  renderCards("quality-cards-group", content.quality.cards, [
    { root: "quality.cards", key: "iconClass", label: "Icon class" },
    { root: "quality.cards", key: "title", label: "Title" },
    { root: "quality.cards", key: "body", label: "Body", type: "textarea" },
  ]);
  renderCards("features-bullets-group", content.features.bullets.map((text) => ({ text })), [
    { root: "features.bullets", key: "text", label: "Bullet", type: "textarea" },
  ]);
  renderCards("testimonials-group", content.testimonials.items, [
    { root: "testimonials.items", key: "name", label: "Student name" },
    { root: "testimonials.items", key: "role", label: "Role / label" },
    { root: "testimonials.items", key: "rating", label: "Rating" },
    { root: "testimonials.items", key: "verifiedLabel", label: "Verified label" },
    { root: "testimonials.items", key: "imagePath", label: "Image path" },
    { root: "testimonials.items", key: "quote", label: "Quote", type: "textarea" },
  ]);
  renderCards("focus-bullets-group", content.focus.bullets.map((text) => ({ text })), [
    { root: "focus.bullets", key: "text", label: "Bullet", type: "textarea" },
  ]);
  renderCards("projects-group", content.projects.items, [
    { root: "projects.items", key: "title", label: "Card title" },
    { root: "projects.items", key: "label", label: "Small label" },
    { root: "projects.items", key: "imagePath", label: "Image path" },
    { root: "projects.items", key: "altText", label: "Alt text" },
  ]);
  renderCards("footer-categories-group", content.footer.categories.map((text) => ({ text })), [
    { root: "footer.categories", key: "text", label: "Category" },
  ]);
}


async function loadIntoForm() {
  setStatus("Loading About page content...");
  const [aboutContent, footerContent] = await Promise.all([
    loadAboutContent(supabase).catch(() => DEFAULT_ABOUT_CONTENT),
    loadGlobalFooterContent(supabase).catch(() => DEFAULT_GLOBAL_FOOTER),
  ]);
  const content = {
    ...aboutContent,
    footer: footerContent,
  };
  fillSimpleFields(content);
  renderRepeatingGroups(content);
  setStatus("About page content is ready.", "success");
}

reloadButton.addEventListener("click", async () => {
  await loadIntoForm();
});

saveButton.addEventListener("click", async () => {
  try {
    saveButton.disabled = true;
    setStatus("Saving About page content...");
    const payload = getContentFromForm();
    await Promise.all([
      saveAboutContent(supabase, payload),
      saveGlobalFooterContent(supabase, payload.footer),
    ]);
    setStatus("About page and shared footer content saved to Supabase.", "success");
  } catch (error) {
    setStatus(error.message || "Failed to save About page content.", "error");
  } finally {
    saveButton.disabled = false;
  }
});

gateForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (gatePassword.value !== ADMIN_PASSWORD) {
    gateError.textContent = "Wrong password. Try again.";
    return;
  }

  sessionStorage.setItem(ADMIN_GATE_KEY, "open");
  gateError.textContent = "";
  unlockAdmin();
  await loadIntoForm();
});

(async () => {
  try {
    if (sessionStorage.getItem(ADMIN_GATE_KEY) === "open") {
      unlockAdmin();
      await loadIntoForm();
      return;
    }

    lockAdmin();
    gatePassword.focus();
    setStatus("Enter the admin password to continue.");
  } catch (error) {
    setStatus(error.message || "Unable to open the admin panel.", "error");
  }
})();





