import { supabase } from "./auth/auth.js";
import { loadGlobalFooterContent } from "./about-data.js?v=20260314";

function setText(node, value) {
  if (node && value !== undefined && value !== null) {
    node.textContent = value;
  }
}

function renderFooterCategories(container, categories) {
  if (!container || !categories?.length) return;
  container.innerHTML = categories
    .map(
      (item) => `
        <li class="py-1.5 flex items-center gap-x-2">
          <span class="inline-flex items-center"><i class="hgi hgi-stroke hgi-arrow-right-01 text-xl text-primary-lighter"></i></span>
          <a href="#" class="text-primary-lighter font-semibold hover:underline">${item}</a>
        </li>
      `
    )
    .join("");
}

async function hydrateSharedFooter() {
  const footer = document.querySelector("footer");
  if (!footer) return;

  try {
    const content = await loadGlobalFooterContent(supabase);
    const headings = [...footer.querySelectorAll("h5")];
    const aboutColumn = headings.find((node) => node.textContent.includes("About"))?.closest("div");
    const intro = footer.querySelector(".text-primary-lighter.text-base");
    const contactHeading = headings.find((node) => node.textContent.includes("Contact"));
    const categoriesHeading = headings.find((node) => node.textContent.includes("Categories"));
    const contactItems = contactHeading?.closest("div")?.querySelectorAll("ul li p") || [];

    setText(intro, content.intro);
    setText(contactHeading, content.contactTitle);
    setText(contactItems[0], content.address);
    setText(contactItems[1], content.phone);
    setText(contactItems[2], content.email);
    setText(contactItems[3], content.fax);
    renderFooterCategories(categoriesHeading?.nextElementSibling, content.categories);
    setText(footer.querySelector(".text-center.text-white"), content.footerBottom);

    if (aboutColumn) {
      const aboutLinks = aboutColumn.querySelectorAll("ul li a");
      setText(aboutLinks[0], "About Us");
      setText(aboutLinks[1], "Product Detail");
      setText(aboutLinks[2], "Offers");
      setText(aboutLinks[3], "Community Updates");
      setText(aboutLinks[4], "Contact Us");
      setText(aboutLinks[5], "Privacy Policy");
    }

    const accountHeading = headings.find((node) => node.textContent.includes("My Account"));
    const accountLinks = accountHeading?.closest("div")?.querySelectorAll("ul li a") || [];
    setText(accountLinks[0], "Your Account");
    setText(accountLinks[1], "Trust and Safety");
    setText(accountLinks[2], "Become a Student Seller");
    setText(accountLinks[3], "Wishlist");
    setText(accountLinks[4], "Student Support");
    setText(accountLinks[5], "FAQs");
  } catch (error) {
    console.error("Shared footer fallback is active:", error);
  }
}

hydrateSharedFooter();

