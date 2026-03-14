const pageKey = "about";
const globalPageKey = "global";
const footerSectionKey = "footer";

export const DEFAULT_GLOBAL_FOOTER = {
  intro:
    "Allpanga is a student marketplace platform for buying, selling, reusing academic items, and building stronger learning communities across campuses.",
  contactTitle: "Allpanga Contact",
  address: "Address: [Campus hub placeholder]",
  phone: "Phone: [Allpanga phone placeholder]",
  email: "[hello@allpanga.example]",
  fax: "[hello@allpanga.example]",
  categories: [
    "IT & Computer Fields",
    "Engineering & Technology",
    "Natural & Applied Sciences",
    "Medical & Health Sciences",
    "Agriculture & Veterinary",
    "Business, Commerce & Management"
  ],
  footerBottom: "2026 Allpanga"
};

export const DEFAULT_ABOUT_CONTENT = {
  hero: {
    title: "About Allpanga",
    missionTitle: "Our Mission",
    missionBody:
      "Our mission is to help students buy, sell, and reuse academic items more easily while sharing knowledge, supporting one another, and reducing the cost of student life. Allpanga turns unused books, notes, lab tools, project materials, and essentials into opportunities for other learners, making campus exchange more affordable, collaborative, and sustainable.",
    visionTitle: "Our Vision",
    visionBody:
      "Our vision is to become the largest trusted student-powered ecosystem for academic exchange and collaboration. We want Allpanga to be the place where students confidently connect to access affordable resources, discover peer support, and build stronger learning communities across campuses.",
    stats: [
      { value: "50", suffix: "+", label: "Universities Connected" },
      { value: "10", suffix: "K+", label: "Items Listed & Exchanged" },
      { value: "5", suffix: "K+", label: "Active Student Members" },
      { value: "98", suffix: "%", label: "Student Satisfaction Rate" }
    ]
  },
  quality: {
    title: "Built for Student Trust and Growth",
    subtitle: "Built on accountability, student safety, and shared opportunity.",
    cards: [
      {
        iconClass: "hgi hgi-stroke hgi-student",
        title: "Affordable Student Marketplace",
        body: "Find affordable textbooks, notes, lab tools, devices, and student essentials through a marketplace designed around real campus budgets."
      },
      {
        iconClass: "hgi hgi-stroke hgi-customer-support",
        title: "Secure In-Platform Communication",
        body: "Use built-in communication to message safely, ask questions, and coordinate exchanges without leaving the Allpanga experience."
      },
      {
        iconClass: "hgi hgi-stroke hgi-shield-check",
        title: "Trusted Campus Community",
        body: "Connect through a trusted student network where accountability, familiar campuses, and peer reputation make collaboration safer and easier."
      }
    ]
  },
  features: {
    badge: "Features",
    title: "Built for Learning and Collaboration",
    intro:
      "Allpanga helps students access affordable academic resources, communicate safely, and collaborate through a campus-centered marketplace. Whether you need textbooks, project materials, notes, or help from a peer, the platform is designed to make student exchange practical, trusted, and supportive. Here is what makes Allpanga valuable:",
    bullets: [
      "Affordable student marketplace for textbooks, supplies, devices, and project materials.",
      "Secure in-platform communication for asking questions, arranging exchanges, and staying connected.",
      "Trusted campus community built around student accountability and shared academic needs.",
      "Support for learning and collaboration through note sharing, peer help, and resource reuse."
    ],
    outro:
      "Allpanga is built to make student life more affordable, connected, and collaborative. Join the platform to reuse resources, save money, and learn together."
  },
  testimonials: {
    title: "What Students Say",
    subtitle: "Feedback from students using Allpanga.",
    items: [
      {
        name: "Areeb S.",
        role: "Mechanical Engineering Student",
        quote:
          "I listed my old textbooks and calculator, and within a day another student picked them up. It saved me money and helped someone else start the semester prepared.",
        rating: "4.5",
        verifiedLabel: "Verified student",
        imagePath: "assets/images/vendors-list/vendor-profile.png"
      },
      {
        name: "Hira N.",
        role: "Computer Science Student",
        quote:
          "The messaging and community side of Allpanga made it easy to ask seniors for advice and find affordable study materials without wasting time in random groups.",
        rating: "4.5",
        verifiedLabel: "Verified student",
        imagePath: "assets/images/vendors-list/vendor-profile.png"
      },
      {
        name: "Maham R.",
        role: "Architecture Student",
        quote:
          "I found used drafting tools and presentation supplies from another student at a student-friendly price. Platforms like this really reduce academic costs.",
        rating: "4.5",
        verifiedLabel: "Verified student",
        imagePath: "assets/images/vendors-list/vendor-profile.png"
      }
    ]
  },
  focus: {
    badge: "Features",
    title: "Focused on Academic Exchange",
    intro:
      "At Allpanga, every decision is guided by helping students exchange resources, communicate safely, and learn together. We believe affordable access, peer trust, and collaborative support can make academic life better for every learner. Here is what we focus on:",
    bullets: [
      "Affordable access to academic materials so more students can keep learning without extra financial pressure.",
      "Peer-to-peer trust through recognizable campus communities and accountable student exchange.",
      "Learning support through student messaging, shared knowledge, and collaboration around real academic needs."
    ],
    outro:
      "Allpanga grows when students can exchange resources confidently, save money, and support one another through every stage of academic life.",
    videoUrl: "https://www.youtube.com/watch?v=rkpzYNB6xks"
  },
  projects: {
    title: "Our Coming Projects",
    subtitle:
      "We are on the way to make this project more comfortable and useful for our you",
    items: [
      {
        title: "Make a messenger in App",
        label: "Message",
        imagePath: "assets/images/about/masege.png",
        altText: "Allpanga messenger feature preview"
      },
      {
        title: "Scale to National",
        label: "National",
        imagePath: "assets/images/about/flag1.avif",
        altText: "Allpanga national growth preview"
      },
      {
        title: "Make local Store",
        label: "Store",
        imagePath: "assets/images/about/store.png",
        altText: "Allpanga local store preview"
      },
      {
        title: "Launch Free AI",
        label: "AI",
        imagePath: "assets/images/about/Ai.webp",
        altText: "Allpanga AI preview"
      }
    ]
  },
  subscribe: {
    title: "Stay connected with Allpanga",
    body:
      "Subscribe for updates about new campus listings, student community features, and future Allpanga launches."
  },
  footer: DEFAULT_GLOBAL_FOOTER,
  media: {
    hero: ["assets/images/about/Enter.webp", "assets/images/about/main.webp"],
    features: ["assets/images/about/trust.jpg", "assets/images/about/scale.png"],
    focus: ["assets/images/about/affordable.jpg"]
  }
};

function parseJson(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeArray(value, fallback) {
  return Array.isArray(value) && value.length ? value : fallback;
}

function buildSectionMap(rows) {
  return Object.fromEntries((rows || []).map((row) => [row.section_key, row]));
}

function buildMediaMap(rows) {
  const grouped = {};
  for (const row of rows || []) {
    if (!grouped[row.section_key]) grouped[row.section_key] = [];
    grouped[row.section_key].push(row);
  }
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => a.sort_order - b.sort_order);
  }
  return grouped;
}

function parseFooterRow(row) {
  const footerBody = parseJson(row?.body, {});
  return {
    intro: footerBody.intro || DEFAULT_GLOBAL_FOOTER.intro,
    contactTitle: row?.title || DEFAULT_GLOBAL_FOOTER.contactTitle,
    address: footerBody.address || DEFAULT_GLOBAL_FOOTER.address,
    phone: footerBody.phone || DEFAULT_GLOBAL_FOOTER.phone,
    email: footerBody.email || DEFAULT_GLOBAL_FOOTER.email,
    fax: footerBody.fax || DEFAULT_GLOBAL_FOOTER.fax,
    categories: normalizeArray(footerBody.categories, DEFAULT_GLOBAL_FOOTER.categories),
    footerBottom: footerBody.footerBottom || DEFAULT_GLOBAL_FOOTER.footerBottom
  };
}

export async function loadGlobalFooterContent(supabase) {
  const { data, error } = await supabase
    .from("page_sections")
    .select("*")
    .eq("page_key", globalPageKey)
    .eq("section_key", footerSectionKey)
    .maybeSingle();

  if (error) throw error;
  return parseFooterRow(data);
}

export async function saveGlobalFooterContent(supabase, footer) {
  const row = {
    page_key: globalPageKey,
    section_key: footerSectionKey,
    title: footer.contactTitle,
    body: JSON.stringify({
      intro: footer.intro,
      address: footer.address,
      phone: footer.phone,
      email: footer.email,
      fax: footer.fax,
      categories: footer.categories,
      footerBottom: footer.footerBottom
    }),
    sort_order: 1
  };

  const result = await supabase
    .from("page_sections")
    .upsert(row, { onConflict: "page_key,section_key" });

  if (result.error) throw result.error;
}

export async function loadAboutContent(supabase) {
  const [sectionsResult, mediaResult] = await Promise.all([
    supabase.from("page_sections").select("*").eq("page_key", pageKey).order("sort_order", { ascending: true }),
    supabase.from("page_media").select("*").eq("page_key", pageKey).order("sort_order", { ascending: true })
  ]);

  if (sectionsResult.error) throw sectionsResult.error;
  if (mediaResult.error) throw mediaResult.error;

  const sections = buildSectionMap(sectionsResult.data);
  const media = buildMediaMap(mediaResult.data);

  const heroBody = parseJson(sections.hero?.body, {});
  const qualityBody = parseJson(sections.quality?.body, {});
  const featuresBody = parseJson(sections.features?.body, {});
  const testimonialsBody = parseJson(sections.testimonials?.body, {});
  const focusBody = parseJson(sections.focus?.body, {});
  const projectsBody = parseJson(sections.projects?.body, {});
  const subscribeBody = parseJson(sections.subscribe?.body, {});

  return {
    hero: {
      title: sections.hero?.title || DEFAULT_ABOUT_CONTENT.hero.title,
      missionTitle: heroBody.missionTitle || DEFAULT_ABOUT_CONTENT.hero.missionTitle,
      missionBody: heroBody.missionBody || DEFAULT_ABOUT_CONTENT.hero.missionBody,
      visionTitle: heroBody.visionTitle || DEFAULT_ABOUT_CONTENT.hero.visionTitle,
      visionBody: heroBody.visionBody || DEFAULT_ABOUT_CONTENT.hero.visionBody,
      stats: normalizeArray(heroBody.stats, DEFAULT_ABOUT_CONTENT.hero.stats)
    },
    quality: {
      title: sections.quality?.title || DEFAULT_ABOUT_CONTENT.quality.title,
      subtitle: sections.quality?.subtitle || DEFAULT_ABOUT_CONTENT.quality.subtitle,
      cards: normalizeArray(qualityBody.cards, DEFAULT_ABOUT_CONTENT.quality.cards)
    },
    features: {
      badge: sections.features?.subtitle || DEFAULT_ABOUT_CONTENT.features.badge,
      title: sections.features?.title || DEFAULT_ABOUT_CONTENT.features.title,
      intro: featuresBody.intro || DEFAULT_ABOUT_CONTENT.features.intro,
      bullets: normalizeArray(featuresBody.bullets, DEFAULT_ABOUT_CONTENT.features.bullets),
      outro: featuresBody.outro || DEFAULT_ABOUT_CONTENT.features.outro
    },
    testimonials: {
      title: sections.testimonials?.title || DEFAULT_ABOUT_CONTENT.testimonials.title,
      subtitle: sections.testimonials?.subtitle || DEFAULT_ABOUT_CONTENT.testimonials.subtitle,
      items: normalizeArray(testimonialsBody.items, DEFAULT_ABOUT_CONTENT.testimonials.items)
    },
    focus: {
      badge: sections.focus?.subtitle || DEFAULT_ABOUT_CONTENT.focus.badge,
      title: sections.focus?.title || DEFAULT_ABOUT_CONTENT.focus.title,
      intro: focusBody.intro || DEFAULT_ABOUT_CONTENT.focus.intro,
      bullets: normalizeArray(focusBody.bullets, DEFAULT_ABOUT_CONTENT.focus.bullets),
      outro: focusBody.outro || DEFAULT_ABOUT_CONTENT.focus.outro,
      videoUrl: focusBody.videoUrl || DEFAULT_ABOUT_CONTENT.focus.videoUrl
    },
    projects: {
      title: sections.projects?.title || DEFAULT_ABOUT_CONTENT.projects.title,
      subtitle: sections.projects?.subtitle || DEFAULT_ABOUT_CONTENT.projects.subtitle,
      items: normalizeArray(projectsBody.items, DEFAULT_ABOUT_CONTENT.projects.items)
    },
    subscribe: {
      title: sections.subscribe?.title || DEFAULT_ABOUT_CONTENT.subscribe.title,
      body: subscribeBody.body || DEFAULT_ABOUT_CONTENT.subscribe.body
    },
    footer: DEFAULT_GLOBAL_FOOTER,
    media: {
      hero: media.hero?.map((item) => item.image_path) || DEFAULT_ABOUT_CONTENT.media.hero,
      features: media.features?.map((item) => item.image_path) || DEFAULT_ABOUT_CONTENT.media.features,
      focus: media.focus?.map((item) => item.image_path) || DEFAULT_ABOUT_CONTENT.media.focus
    }
  };
}

export async function saveAboutContent(supabase, content) {
  const sectionRows = [
    {
      page_key: pageKey,
      section_key: "hero",
      title: content.hero.title,
      body: JSON.stringify({
        missionTitle: content.hero.missionTitle,
        missionBody: content.hero.missionBody,
        visionTitle: content.hero.visionTitle,
        visionBody: content.hero.visionBody,
        stats: content.hero.stats
      }),
      sort_order: 1
    },
    {
      page_key: pageKey,
      section_key: "quality",
      title: content.quality.title,
      subtitle: content.quality.subtitle,
      body: JSON.stringify({ cards: content.quality.cards }),
      sort_order: 2
    },
    {
      page_key: pageKey,
      section_key: "features",
      title: content.features.title,
      subtitle: content.features.badge,
      body: JSON.stringify({
        intro: content.features.intro,
        bullets: content.features.bullets,
        outro: content.features.outro
      }),
      sort_order: 3
    },
    {
      page_key: pageKey,
      section_key: "testimonials",
      title: content.testimonials.title,
      subtitle: content.testimonials.subtitle,
      body: JSON.stringify({ items: content.testimonials.items }),
      sort_order: 4
    },
    {
      page_key: pageKey,
      section_key: "focus",
      title: content.focus.title,
      subtitle: content.focus.badge,
      body: JSON.stringify({
        intro: content.focus.intro,
        bullets: content.focus.bullets,
        outro: content.focus.outro,
        videoUrl: content.focus.videoUrl
      }),
      sort_order: 5
    },
    {
      page_key: pageKey,
      section_key: "projects",
      title: content.projects.title,
      subtitle: content.projects.subtitle,
      body: JSON.stringify({ items: content.projects.items }),
      sort_order: 6
    },
    {
      page_key: pageKey,
      section_key: "subscribe",
      title: content.subscribe.title,
      body: JSON.stringify({ body: content.subscribe.body }),
      sort_order: 7
    }
  ];

  const mediaRows = [
    ...content.media.hero.map((imagePath, index) => ({
      page_key: pageKey,
      section_key: "hero",
      image_path: imagePath,
      sort_order: index
    })),
    ...content.media.features.map((imagePath, index) => ({
      page_key: pageKey,
      section_key: "features",
      image_path: imagePath,
      sort_order: index
    })),
    ...content.media.focus.map((imagePath, index) => ({
      page_key: pageKey,
      section_key: "focus",
      image_path: imagePath,
      sort_order: index
    }))
  ];

  const upsertResult = await supabase.from("page_sections").upsert(sectionRows, { onConflict: "page_key,section_key" });
  if (upsertResult.error) throw upsertResult.error;

  const deleteResult = await supabase.from("page_media").delete().eq("page_key", pageKey).in("section_key", ["hero", "features", "focus"]);
  if (deleteResult.error) throw deleteResult.error;

  if (mediaRows.length) {
    const insertResult = await supabase.from("page_media").insert(mediaRows);
    if (insertResult.error) throw insertResult.error;
  }
}
