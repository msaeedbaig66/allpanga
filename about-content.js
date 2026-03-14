import { supabase } from "./auth/auth.js";
import { loadAboutContent } from "./about-data.js?v=20260314";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function setText(node, value) {
  if (node && value !== undefined && value !== null) {
    node.textContent = value;
  }
}

function setImage(node, src, alt = "") {
  if (!node || !src) return;
  node.src = src;
  if (alt) node.alt = alt;
}

function getAboutSections() {
  const sections = [...document.querySelectorAll("section")];
  return {
    hero: sections[0],
    quality: sections[1],
    features: sections[2],
    testimonials: sections[3],
    focus: sections[4],
    projects: sections[5],
    subscribe: sections[6],
  };
}

function renderStats(container, stats) {
  if (!container || !stats?.length) return;
  container.innerHTML = stats
    .map(
      (item, index) => `
        <div class="${index === stats.length - 1 ? "md:pt-0 pt-2 xl:pl-0 lg:pl-6 md:pl-4" : "md:pb-0 pb-2 md:pt-0 pt-2 md:border-none border-b border-gray-300 xl:px-0 lg:px-6 md:px-4"} wow animate__animated animate__fadeInUp" data-wow-delay=".${index + 2}s">
          <div class="flex items-center justify-center">
            <h3 class="about-us-counter">${escapeHtml(item.value)}</h3>
            <h3>${escapeHtml(item.suffix || "")}</h3>
          </div>
          <p class="text-center">${escapeHtml(item.label)}</p>
        </div>
        ${index === stats.length - 1 ? "" : '<div class="border-r border-gray-300 wow animate__animated animate__fadeInUp"></div>'}
      `
    )
    .join("");
}

function renderQualityCards(container, cards) {
  if (!container || !cards?.length) return;
  container.innerHTML = cards
    .map(
      (card, index) => `
        <div class="p-6 border-gray-300 border bg-white rounded-2xl text-center lg:w-[390px] w-full wow animate__animated animate__fadeInUp" data-wow-delay=".${index + 2}s">
          <span class="inline-flex items-center justify-center size-14 bg-warning-lighter rounded-full">
            <i class="${escapeHtml(card.iconClass || "hgi hgi-stroke hgi-student")} text-3xl text-light-primary-text"></i>
          </span>
          <h5 class="pt-3 pb-0.5">${escapeHtml(card.title)}</h5>
          <p>${escapeHtml(card.body)}</p>
        </div>
      `
    )
    .join("");
}

function renderBulletList(container, bullets) {
  if (!container || !bullets?.length) return;
  container.innerHTML = bullets
    .map(
      (bullet) => `
        <li class="flex gap-x-4">
          <span class="inline-flex flex-none items-center justify-center size-6 bg-primary text-white rounded-full">
            <i class="hgi hgi-stroke hgi-tick-02"></i>
          </span>
          <p>${escapeHtml(bullet)}</p>
        </li>
      `
    )
    .join("");
}

function renderTestimonials(container, items) {
  if (!container || !items?.length) return;
  container.innerHTML = items
    .map(
      (item, index) => `
        <div class="xl:col-span-4 md:col-span-6 col-span-12 bg-white rounded-3xl p-10 wow animate__animated animate__fadeInUp" data-wow-delay=".${index + 2}s">
          <div class="flex items-center gap-x-4 pb-6">
            <img src="${escapeHtml(item.imagePath || "assets/images/vendors-list/vendor-profile.png")}" alt="${escapeHtml(item.name || "Student Profile")}" class="rounded-full size-12 flex-none" />
            <div class="flex-1">
              <p class="pb-1 font-semibold text-light-primary-text">${escapeHtml(item.name)}</p>
              <p class="text-sm text-light-secondary-text leading-[22px]">${escapeHtml(item.role)}</p>
            </div>
          </div>
          <div class="flex items-center pb-3">
            <div class="rating-section flex items-center border-r border-gray-300 pr-3">
              <div class="bg-[url('../images/star-icon.png')] w-[90px] h-4.5 bg-repeat-x overflow-hidden bg-position-[0_0]">
                <div style="width: 80%" class="bg-[url('../images/star-icon.png')] h-4.5 bg-repeat-x bg-position-[0_-18px]"></div>
              </div>
              <span class="text-sm leading-[22px] font-normal inline-block ml-2 text-light-primary-text mt-1">${escapeHtml(item.rating || "4.5")}</span>
            </div>
            <div class="flex items-center gap-x-1 pl-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.5269 3.13379L13.9331 3.67969L13.7065 6.13965L15.3335 8L13.7065 9.86035L13.9331 12.3203L11.5269 12.8662L10.2661 14.9932L7.99951 14.0195L5.73291 15L4.47314 12.873L2.06689 12.3271L2.29346 9.86035L0.666504 8L2.29346 6.13379L2.06689 3.66699L4.47314 3.12695L5.73291 1L7.99951 1.97363L10.2661 1L11.5269 3.13379ZM6.72607 9.17285L5.18018 7.62012L4.19287 8.60645L6.72607 11.1465L11.6128 6.24707L10.6265 5.25977L6.72607 9.17285Z" fill="#0F0F0F" />
              </svg>
              <p class="text-primary text-sm leading-[22px]">${escapeHtml(item.verifiedLabel || "Verified student")}</p>
            </div>
          </div>
          <p>${escapeHtml(item.quote)}</p>
        </div>
      `
    )
    .join("");
}

function renderProjectCards(container, items) {
  if (!container || !items?.length) return;
  container.innerHTML = items
    .map(
      (item, index) => `
        <div class="xl:col-span-3 md:col-span-6 col-span-12 px-[21px] pt-[21px] pb-[27px] border border-gray-300 rounded-3xl wow animate__animated animate__fadeInUp" data-wow-delay=".${index + 2}s">
          <img src="${escapeHtml(item.imagePath)}" alt="${escapeHtml(item.altText || item.title)}" class="mb-6 rounded-3xl" />
          <div class="text-center pb-4">
            <h4 class="pb-2 font-semibold text-black leading-8">${escapeHtml(item.title)}</h4>
            <p class="font-medium text-[18px] leading-7 text-light-secondary-text font-urbanist">${escapeHtml(item.label)}</p>
          </div>
        </div>
      `
    )
    .join("");
}

async function hydrateAboutPage() {
  let content;
  try {
    content = await loadAboutContent(supabase);
    window.allpangaAboutContent = content;
  } catch (error) {
    console.error("About page is using fallback content:", error);
    return;
  }

  const sectionMap = getAboutSections();

  if (sectionMap.hero) {
    setText(sectionMap.hero.querySelector("h2"), content.hero.title);
    const headingBlocks = sectionMap.hero.querySelectorAll("h5.pb-3");
    const textBlocks = sectionMap.hero.querySelectorAll("h5.pb-3 + p");
    setText(headingBlocks[0], content.hero.missionTitle);
    setText(textBlocks[0], content.hero.missionBody);
    setText(headingBlocks[1], content.hero.visionTitle);
    setText(textBlocks[1], content.hero.visionBody);
    const images = sectionMap.hero.querySelectorAll("img");
    setImage(images[0], content.media.hero[0]);
    setImage(images[1], content.media.hero[1]);
    const statsContainer = sectionMap.hero.querySelector(".md\\:flex.justify-between.lg\\:p-10");
    renderStats(statsContainer, content.hero.stats);
  }

  if (sectionMap.quality) {
    setText(sectionMap.quality.querySelector("h3"), content.quality.title);
    setText(sectionMap.quality.querySelector("h3 + p"), content.quality.subtitle);
    renderQualityCards(
      sectionMap.quality.querySelector(".flex.flex-wrap.lg\\:flex-nowrap"),
      content.quality.cards
    );
  }

  if (sectionMap.features) {
    const badge = sectionMap.features.querySelector("p.text-primary");
    const title = sectionMap.features.querySelector("h3");
    const intro = title?.nextElementSibling;
    const list = intro?.nextElementSibling;
    const outro = list?.nextElementSibling;
    setText(badge, content.features.badge);
    setText(title, content.features.title);
    setText(intro, content.features.intro);
    renderBulletList(list, content.features.bullets);
    setText(outro, content.features.outro);
    const images = sectionMap.features.querySelectorAll("img");
    setImage(images[0], content.media.features[0]);
    setImage(images[1], content.media.features[1]);
  }

  if (sectionMap.testimonials) {
    setText(sectionMap.testimonials.querySelector("h3"), content.testimonials.title);
    setText(sectionMap.testimonials.querySelector("h3 + p"), content.testimonials.subtitle);
    renderTestimonials(
      sectionMap.testimonials.querySelector(".about-us-testimonial-wrapper"),
      content.testimonials.items
    );
  }

  if (sectionMap.focus) {
    const badge = sectionMap.focus.querySelector("p.text-primary");
    const title = sectionMap.focus.querySelector("h3");
    const intro = title?.nextElementSibling;
    const list = intro?.nextElementSibling;
    const outro = list?.nextElementSibling;
    setText(badge, content.focus.badge);
    setText(title, content.focus.title);
    setText(intro, content.focus.intro);
    renderBulletList(list, content.focus.bullets);
    setText(outro, content.focus.outro);
    setImage(sectionMap.focus.querySelector("img"), content.media.focus[0]);
    const videoLink = sectionMap.focus.querySelector("a.about-us-popup-youtube");
    if (videoLink && content.focus.videoUrl) videoLink.href = content.focus.videoUrl;
  }

  if (sectionMap.projects) {
    setText(sectionMap.projects.querySelector("h3"), content.projects.title);
    setText(sectionMap.projects.querySelector("h3 + p"), content.projects.subtitle);
    renderProjectCards(sectionMap.projects.querySelector(".grid.grid-cols-12"), content.projects.items);
  }

  if (sectionMap.subscribe) {
    setText(sectionMap.subscribe.querySelector("h3"), content.subscribe.title);
    setText(sectionMap.subscribe.querySelector("h3 + p"), content.subscribe.body);
  }
}

hydrateAboutPage();


