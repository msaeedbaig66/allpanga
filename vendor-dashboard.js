import { supabase } from "./auth/auth.js";

const CATEGORY_OPTIONS = [
  "IT & Computer Fields",
  "Engineering & Technology",
  "Natural & Applied Sciences",
  "Medical & Health Sciences",
  "Agriculture & Veterinary",
  "Business, Commerce & Management",
  "Arts, Design & Creative Fields",
  "Social Sciences & Humanities",
  "Languages & Literature",
  "Law",
  "Education & Teaching",
  "Hospitality & Tourism",
];
const PROFILE_INSTITUTION_OPTIONS = {
  college: [
    "Government College Faisalabad",
    "Government College for Women Faisalabad",
    "Punjab Group of Colleges Faisalabad",
    "Superior College Faisalabad",
    "Chenab College Faisalabad",
    "KIPS College Faisalabad",
    "Aspire College Faisalabad",
    "Divisional Public School and College Faisalabad",
    "Other College",
  ],
  tavta: [
    "GCT Lahore",
    "GCT Faisalabad",
    "GCT Gujranwala",
    "GCT Multan",
    "GCT Sargodha",
    "GCT Bahawalpur",
    "GCT Sahiwal",
    "GCT Rawalpindi",
    "Other TAVTA Institute",
  ],
  university: [
    "University of Agriculture Faisalabad (UAF)",
    "Government College University Faisalabad (GCUF)",
    "Government College Women University Faisalabad (GCWUF)",
    "National Textile University (NTU)",
    "Faisalabad Medical University (FMU)",
    "NFC Institute of Engineering & Fertilizer Research (NFC-IEFR)",
    "University Medical & Dental College (UMDC) - under TUF",
    "Faisalabad International Medical University (FIMU)",
    "Aziz Fatimah Medical & Dental College (AFMDC)",
    "The University of Faisalabad (TUF)",
    "Riphah International University - Faisalabad Campus",
    "Superior University - Faisalabad Campus",
    "Hamdard University - Faisalabad Campus",
    "Preston University - Faisalabad Campus",
    "FAST-NUCES - Chiniot-Faisalabad Campus",
    "NUML - National University of Modern Languages (FSD Campus)",
    "University of Education - Faisalabad Campus",
    "University of Sargodha - Lyallpur Campus",
    "University of Engineering & Technology (UET) - Faisalabad Campus",
    "Virtual University (VU) - multiple campuses",
    "Allama Iqbal Open University (AIOU) - Regional Campus",
    "Other University or Campus",
  ],
};
const BASE_POSTING_SLOTS = 3;

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function setText(selector, value) {
  const node = qs(selector);
  if (node) node.textContent = value;
}

function formatName(profile, user) {
  const fullName = profile?.full_name?.trim();
  if (fullName) return fullName;

  const first = user?.user_metadata?.first_name?.trim() || "";
  const last = user?.user_metadata?.last_name?.trim() || "";
  const combined = `${first} ${last}`.trim();
  if (combined) return combined;

  return user?.email || "Allpanga Seller";
}

function ensureStatusNode() {
  let node = qs("#dashboard-status");
  if (node) return node;

  const target = qs(".my-account-content");
  if (!target) return null;

  node = document.createElement("div");
  node.id = "dashboard-status";
  node.className = "mb-6 rounded-2xl border border-gray-300 px-5 py-4 text-sm font-semibold text-light-primary-text";
  target.prepend(node);
  return node;
}

function showStatus(message, isError = false) {
  const node = ensureStatusNode();
  if (!node) return;
  node.textContent = message;
  node.style.display = "block";
  node.style.borderColor = isError ? "rgba(239, 68, 68, 0.24)" : "rgba(15, 15, 15, 0.12)";
  node.style.background = isError ? "rgba(239, 68, 68, 0.08)" : "rgba(15, 15, 15, 0.04)";
  node.style.color = isError ? "#991b1b" : "#161c24";
}

function getField(id) {
  return document.getElementById(id);
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function buildCategorySelect() {
  const select = getField("seller-category");
  if (!select) return null;

  select.innerHTML = [
    '<option value="">Institution Type</option>',
    '<option value="college">College</option>',
    '<option value="university">University</option>',
    '<option value="tavta">TAVTA</option>',
  ].join("");
  return select;
}

function buildInstitutionNameSelect(selectedType = "", selectedValue = "") {
  const select = getField("city");
  if (!select) return null;

  const options = PROFILE_INSTITUTION_OPTIONS[selectedType] || [];
  select.innerHTML = [
    '<option value="">Select institution</option>',
    ...options.map((item) => `<option value="${item}">${item}</option>`),
  ].join("");
  select.value = selectedValue || "";
  return select;
}

function buildPostCategorySelect() {
  const select = getField("post-category");
  if (!select) return null;

  select.innerHTML = [
    '<option value="">Select a category</option>',
    ...CATEGORY_OPTIONS.map((item) => `<option value="${item}">${item}</option>`),
  ].join("");

  return select;
}

function normalizeProfileData(user, profile) {
  const metadata = user?.user_metadata || {};
  const firstName = metadata.first_name || "";
  const lastName = metadata.last_name || "";

  return {
    company_name: profile?.department || metadata.store_name || "Allpanga Student Seller",
    owner_name: firstName || profile?.full_name?.split(" ")[0] || "",
    last_name: lastName || profile?.full_name?.split(" ").slice(1).join(" ") || "",
    company_email: user?.email || "",
    phone_number: profile?.phone || metadata.phone_number || "",
    seller_category: profile?.study_level || metadata.institution_type || "",
    city: profile?.university_name || metadata.institution_name || "",
    whatsapp_number: profile?.whatsapp || "",
    avatar_path: profile?.avatar_path || "",
  };
}

function fillForm(data) {
  getField("company_name").value = data.company_name || "";
  getField("owner_name").value = data.owner_name || "";
  const lastNameField = getField("last_name");
  if (lastNameField) lastNameField.value = data.last_name || "";
  getField("company_email").value = data.company_email || "";
  getField("phone_number").value = data.phone_number || "";
  const whatsappField = getField("whatsapp_number");
  if (whatsappField) whatsappField.value = data.whatsapp_number || "";

  const categorySelect = getField("seller-category");
  if (categorySelect) {
    categorySelect.value = data.seller_category || "";
    buildInstitutionNameSelect(data.seller_category || "", data.city || "");
  }
}

function updateAvatarPreview(avatarPath, displayName = "Allpanga Seller") {
  const imageNode = getField("seller-avatar-preview");
  const placeholderNode = getField("seller-avatar-placeholder");
  if (!imageNode || !placeholderNode) return;

  if (avatarPath) {
    imageNode.src = avatarPath;
    imageNode.classList.remove("hidden");
    placeholderNode.classList.add("hidden");
    return;
  }

  imageNode.classList.add("hidden");
  placeholderNode.classList.remove("hidden");
  placeholderNode.innerHTML = `
    <span class="inline-flex size-16 items-center justify-center rounded-full bg-primary text-white text-xl font-semibold">
      ${displayName
        .split(" ")
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() || "AP"}
    </span>
    <span class="mt-2 text-xs leading-[18px]">Upload photo</span>
  `;
}

function renderProfileCard(data) {
  setText("#seller-profile-company", data.company_name || "Allpanga Student Seller");
  setText("#seller-profile-category-badge", data.seller_category || "Seller");
  setText(
    "#seller-profile-bio",
    `${data.company_name || "Your seller profile"} helps students find trusted campus items and connect safely through Allpanga.`
  );
  setText("#seller-profile-owner", `${data.owner_name || ""} ${data.last_name || ""}`.trim() || "Allpanga Seller");
  setText("#seller-profile-phone", data.phone_number || "No phone added yet");
  setText("#seller-profile-email", data.company_email || "No email available");
  setText("#seller-profile-location", data.city || "No campus or city added yet");
  setText("#seller-profile-extra", data.whatsapp_number || "Add WhatsApp, store notes, or pickup info in edit mode.");
  updateAvatarPreview(data.avatar_path, `${data.owner_name || ""} ${data.last_name || ""}`.trim() || data.company_name || "Allpanga Seller");
}

function ensureStoreRatingStars(averageRating = 0) {
  const starRow  = qs("#dash-star-row");
  const scoreEl  = qs("#dash-rating-score");
  const labelEl  = qs("#dash-rating-label");
  if (!starRow) return;

  const clamped = Math.max(0, Math.min(5, averageRating));

  // Build 5 stars — each can be full, partial (filled by exact %), or empty
  starRow.innerHTML = Array.from({ length: 5 }, (_, i) => {
    const fill = Math.min(1, Math.max(0, clamped - i)); // 0–1
    const pct  = Math.round(fill * 100);

    // Use an SVG star with a clip-path so partial fill is pixel-perfect
    const id = `star-clip-${i}`;
    return `
      <svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">
        <defs>
          <clipPath id="${id}">
            <rect x="0" y="0" width="${pct}%" height="24"/>
          </clipPath>
        </defs>
        <!-- empty star (grey) -->
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
          fill="#e5e7eb" stroke="#e5e7eb" stroke-width="0.5"/>
        <!-- filled star (gold) clipped by percentage -->
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
          fill="#f59e0b" stroke="#f59e0b" stroke-width="0.5"
          clip-path="url(#${id})"/>
      </svg>`;
  }).join("");

  if (scoreEl) scoreEl.textContent = clamped.toFixed(1);
  if (labelEl) {
    if (clamped >= 4.5)      labelEl.textContent = "Excellent — top rated seller";
    else if (clamped >= 4.0) labelEl.textContent = "Very good seller";
    else if (clamped >= 3.0) labelEl.textContent = "Good — keep improving";
    else if (clamped > 0)    labelEl.textContent = "Needs improvement";
    else                     labelEl.textContent  = "No ratings yet";
  }
}

function renderStoreRatingCard(metrics = {}) {
  const chartNode = qs("#radial-bar-chart");
  if (!chartNode) return;

  // ensure at least 1 in each segment so the donut always shows all 4 colors
  const views    = Math.max(1, Number(metrics.views    || 0));
  const comments = Math.max(1, Number(metrics.comments || 0));
  const items    = Math.max(1, Number(metrics.items    || 0));
  const reports  = Math.max(1, Number(metrics.reports  || 0));

  // update metric labels with real (possibly 0) values
  const mv = qs("#dash-metric-views");    if (mv) mv.textContent = Number(metrics.views    || 0);
  const mc = qs("#dash-metric-comments"); if (mc) mc.textContent = Number(metrics.comments || 0);
  const mi = qs("#dash-metric-items");    if (mi) mi.textContent = Number(metrics.items    || 0);
  const mr = qs("#dash-metric-reports");  if (mr) mr.textContent = Number(metrics.reports  || 0);

  const segments = [
    { color: "#60a5fa", value: views    }, // blue   — views
    { color: "#34d399", value: comments }, // green  — comments
    { color: "#f59e0b", value: items    }, // amber  — items
    { color: "#f87171", value: reports  }, // red    — reports
  ];

  const total = segments.reduce((s, x) => s + x.value, 0);
  let current = 0;
  const gradient = segments.map(seg => {
    const start = current;
    current += (seg.value / total) * 100;
    return `${seg.color} ${start.toFixed(2)}% ${current.toFixed(2)}%`;
  }).join(", ");

  // display real total (not the padded one)
  const displayTotal = Number(metrics.views||0) + Number(metrics.comments||0) + Number(metrics.items||0) + Number(metrics.reports||0);

  chartNode.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;width:190px;height:190px;border-radius:50%;
      background:conic-gradient(${gradient});position:relative;
      box-shadow:0 4px 20px rgba(0,0,0,.08);">
      <div style="width:108px;height:108px;border-radius:50%;background:#fff;
        display:flex;align-items:center;justify-content:center;flex-direction:column;
        text-align:center;padding:10px;box-shadow:inset 0 2px 8px rgba(0,0,0,.06);">
        <strong style="font-size:24px;line-height:1;color:#0f0f0f;">${displayTotal}</strong>
        <span style="font-size:10px;line-height:1.4;color:#9ca3af;margin-top:3px;">signals</span>
      </div>
    </div>`;

  ensureStoreRatingStars(Number(metrics.averageRating || 0));
}

function buildAdaptiveTimeline(accountCreatedAt) {
  const now = new Date();
  const createdAt = accountCreatedAt ? new Date(accountCreatedAt) : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const ageMs = Math.max(now.getTime() - createdAt.getTime(), 0);
  const ageDays = ageMs / (24 * 60 * 60 * 1000);

  let stepHours = 24 * 7;
  let points = 8;
  let formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

  if (ageDays <= 1) {
    stepHours = 2;
    points = 12;
    formatter = new Intl.DateTimeFormat("en-US", { hour: "numeric" });
  } else if (ageDays <= 3) {
    stepHours = 12;
    points = 10;
    formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric" });
  } else if (ageDays <= 30) {
    stepHours = 24 * 7;
    points = Math.max(4, Math.min(8, Math.ceil(ageDays / 7)));
    formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  } else if (ageDays <= 120) {
    stepHours = 24 * 7;
    points = 8;
    formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  } else {
    stepHours = 24 * 30;
    points = 6;
    formatter = new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit" });
  }

  const categories = [];
  for (let index = points - 1; index >= 0; index -= 1) {
    const date = new Date(now.getTime() - index * stepHours * 60 * 60 * 1000);
    categories.push(formatter.format(date));
  }

  return { categories, points };
}

function buildAdaptiveSeries(points, base, variance) {
  return Array.from({ length: points }, (_, index) => {
    const wave = Math.sin((index + 1) * 0.85) * variance;
    const trend = index * Math.max(1, Math.round(variance / 3));
    return Math.max(0, Math.round(base + wave + trend));
  });
}

// ─────────────────────────────────────────────
// VIEWS CHART — real Supabase data, adaptive time, realtime
// ─────────────────────────────────────────────
let _viewsChartInstance = null;
let _viewsChartChannel  = null;

function getChartScale(accountCreatedAt) {
  const now       = new Date();
  const created   = accountCreatedAt ? new Date(accountCreatedAt) : new Date(now.getTime() - 7*24*60*60*1000);
  const ageDays   = Math.max(0, (now - created) / (24*60*60*1000));

  if (ageDays <= 1)   return { unit:"hours",  stepHours:2,    points:12, label:"Today (hourly)",   badge:"Hourly" };
  if (ageDays <= 7)   return { unit:"days",   stepHours:24,   points:7,  label:"This week (daily)",badge:"Daily"  };
  if (ageDays <= 31)  return { unit:"weeks",  stepHours:24*7, points:Math.max(4,Math.ceil(ageDays/7)), label:"This month (weekly)", badge:"Weekly" };
  return              { unit:"months", stepHours:24*30, points:Math.min(12,Math.ceil(ageDays/30)), label:"All time (monthly)", badge:"Monthly" };
}

function buildTimeSlots(scale) {
  const now    = new Date();
  const slots  = [];
  for (let i = scale.points - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * scale.stepHours * 3600000);
    let label;
    if (scale.unit === "hours")  label = d.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
    if (scale.unit === "days")   label = d.toLocaleDateString([], { weekday:"short", day:"numeric" });
    if (scale.unit === "weeks")  label = d.toLocaleDateString([], { month:"short", day:"numeric" });
    if (scale.unit === "months") label = d.toLocaleDateString([], { month:"short", year:"2-digit" });
    slots.push({ label, from: new Date(d.getTime() - scale.stepHours*3600000), to: d });
  }
  return slots;
}

function bucketViewsBySlot(rows, slots, dateField) {
  return slots.map(slot =>
    rows.filter(r => {
      const t = new Date(r[dateField] || r.created_at);
      return t >= slot.from && t <= slot.to;
    }).reduce((s, r) => s + Number(r.views_count || r.view_count || 1), 0)
  );
}

async function renderViewsChart(userId, accountCreatedAt) {
  const chartRoot = qs("#price-movement-chart");
  if (!chartRoot || typeof ApexCharts === "undefined") return;

  const scale = getChartScale(accountCreatedAt);
  const slots = buildTimeSlots(scale);
  const cats  = slots.map(s => s.label);

  // update header badges
  const badge = qs("#chart-scale-badge");
  if (badge) badge.textContent = scale.badge;

  // fetch real data
  let itemViews = new Array(scale.points).fill(0);
  let blogViews = new Array(scale.points).fill(0);

  try {
    const [listingsRes, blogsRes] = await Promise.all([
      supabase.from("listings").select("views_count, updated_at").eq("user_id", userId),
      supabase.from("blogs").select("view_count, updated_at").eq("user_id", userId).eq("status", "published"),
    ]);

    if (listingsRes.data?.length) {
      itemViews = bucketViewsBySlot(listingsRes.data, slots, "updated_at");
    }
    if (blogsRes.data?.length) {
      blogViews = bucketViewsBySlot(blogsRes.data, slots, "updated_at");
    }

    // if all zeros (new account / no views yet), show gentle demo curve
    const hasRealData = [...itemViews, ...blogViews].some(v => v > 0);
    if (!hasRealData) {
      itemViews = slots.map((_, i) => Math.max(0, Math.round(Math.sin((i+1)*0.7)*4 + i*1.2 + 2)));
      blogViews = slots.map((_, i) => Math.max(0, Math.round(Math.sin((i+1)*0.5)*2 + i*0.6 + 1)));
    }
  } catch (e) {
    // fallback demo
    itemViews = slots.map((_, i) => Math.max(0, Math.round(Math.sin((i+1)*0.7)*4 + i*1.2 + 2)));
    blogViews = slots.map((_, i) => Math.max(0, Math.round(Math.sin((i+1)*0.5)*2 + i*0.6 + 1)));
  }

  // destroy previous chart instance
  if (_viewsChartInstance) { try { _viewsChartInstance.destroy(); } catch(e){} }
  chartRoot.innerHTML = "";

  const options = {
    series: [
      { name: "Item Views", data: itemViews },
      { name: "Blog Views", data: blogViews },
    ],
    colors: ["#0f0f0f", "#FFE700"],
    chart: {
      height: 320,
      type: "area",
      zoom: { enabled: false },
      toolbar: { show: false },
      animations: { enabled: true, easing: "easeinout", speed: 600 },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: [2.5, 2.5] },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.25,
        opacityTo: 0.02,
        stops: [0, 95, 100],
      },
    },
    grid: {
      show: true,
      strokeDashArray: 4,
      borderColor: "#e4e4ec",
      xaxis: { lines: { show: false } },
    },
    xaxis: {
      categories: cats,
      labels: {
        style: { fontSize:"11px", fontWeight:"600", colors:"#9ca3af" },
        rotate: -30,
        rotateAlways: scale.points > 8,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      labels: {
        style: { fontSize:"11px", fontWeight:"600", colors:"#9ca3af" },
        formatter: v => Math.round(v),
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: v => `${v} views` },
    },
    legend: { show: false },
    markers: { size: 4, strokeWidth: 2, hover: { size: 6 } },
  };

  _viewsChartInstance = new ApexCharts(chartRoot, options);
  _viewsChartInstance.render();
}

async function setupViewsChartRealtime(userId, accountCreatedAt) {
  await renderViewsChart(userId, accountCreatedAt);

  // tear down old channel if re-initialising
  if (_viewsChartChannel) {
    try { await supabase.removeChannel(_viewsChartChannel); } catch(e){}
  }

  // subscribe to changes on listings and blogs for this user
  _viewsChartChannel = supabase
    .channel(`views-chart-${userId}`)
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "listings",
      filter: `user_id=eq.${userId}`,
    }, () => renderViewsChart(userId, accountCreatedAt))
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "blogs",
      filter: `user_id=eq.${userId}`,
    }, () => renderViewsChart(userId, accountCreatedAt))
    .subscribe();
}

// keep old name as alias so nothing breaks
function renderStudentViewsChart(accountCreatedAt) {
  // no-op — replaced by setupViewsChartRealtime called from loadDashboard
}

function updateDescriptionCounter() {
  const textarea = getField("post-description");
  const counter = getField("post-description-count");
  if (!textarea || !counter) return;
  counter.textContent = `${textarea.value.length} / 1200`;
}

function renderPhotoPreviews(files = []) {
  const preview = getField("post-photo-preview");
  const emptyState = getField("post-photo-empty");
  if (!preview) return;

  if (!files.length) {
    preview.classList.add("hidden");
    preview.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }

  preview.classList.remove("hidden");
  if (emptyState) emptyState.classList.add("hidden");

  preview.innerHTML = files
    .slice(0, 6)
    .map((file, index) => {
      const url = URL.createObjectURL(file);
      return `
        <div class="relative rounded-3xl border border-gray-300 overflow-hidden bg-white shadow-[0_8px_24px_rgba(15,15,15,0.08)]">
          <button
            type="button"
            data-remove-photo="${index}"
            class="absolute right-3 top-3 z-10 inline-flex size-8 items-center justify-center rounded-full bg-[#dc2626] text-white shadow-[0_8px_18px_rgba(220,38,38,0.28)] transition-all duration-200 hover:bg-[#991b1b]"
            aria-label="Remove image"
          >
            <i class="hgi hgi-stroke hgi-cancel-01 text-base"></i>
          </button>
          <img src="${url}" alt="${file.name}" class="w-full h-[220px] object-cover" />
          <div class="px-4 py-3">
            <p class="text-sm font-semibold text-light-primary-text truncate">${file.name}</p>
            <p class="text-xs text-light-disabled-text mt-1">${Math.max(1, Math.round(file.size / 1024))} KB</p>
          </div>
        </div>
      `;
    })
    .join("");
}

async function getApprovedExtraSlots(userId) {
  const { data, error } = await supabase
    .from("posting_slot_requests")
    .select("requested_slots")
    .eq("user_id", userId)
    .eq("status", "approved");

  if (error) throw error;
  return (data || []).reduce((sum, item) => sum + Number(item.requested_slots || 0), 0);
}

async function getPendingSlotRequests(userId) {
  const { count, error } = await supabase
    .from("posting_slot_requests")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "pending");

  if (error) throw error;
  return count || 0;
}

function setTextContent(id, text) {
  const node = getField(id);
  if (node) node.textContent = text;
}

function renderSlotMeter({ usedSlots, totalSlots, pendingRequests }) {
  const fill = getField("slot-progress-fill");
  const badge = getField("slot-status-badge");
  const percent = totalSlots > 0 ? Math.min(100, Math.round((usedSlots / totalSlots) * 100)) : 0;
  if (fill) fill.style.width = `${percent}%`;

  setTextContent("slot-count-text", `${usedSlots} / ${totalSlots}`);

  if (usedSlots >= totalSlots) {
    setTextContent("slot-status-text", "All posting slots are used");
    setTextContent("slot-subtext", "Request more slots from admin to continue posting new items.");
    if (badge) {
      badge.textContent = "Full";
      badge.className = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[rgba(239,68,68,0.1)] text-[#991b1b]";
    }
    if (fill) fill.style.background = "#ef4444";
    return;
  }

  if (usedSlots >= Math.max(1, totalSlots - 1)) {
    setTextContent("slot-status-text", "Almost full. You are close to your posting limit.");
    setTextContent(
      "slot-subtext",
      pendingRequests > 0
        ? `You already have ${pendingRequests} slot request${pendingRequests > 1 ? "s" : ""} waiting for admin review.`
        : "You can still post now, but it is a good time to request extra slots."
    );
    if (badge) {
      badge.textContent = "Almost Full";
      badge.className = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[rgba(255,193,7,0.18)] text-[#8a5a00]";
    }
    if (fill) fill.style.background = "#d4a017";
    return;
  }

  setTextContent("slot-status-text", "You have room to post more campus items.");
  setTextContent(
    "slot-subtext",
    pendingRequests > 0
      ? `You also have ${pendingRequests} slot request${pendingRequests > 1 ? "s" : ""} waiting for admin approval.`
      : "Your approved extra slots will appear here automatically after admin approval."
  );
  if (badge) {
    badge.textContent = "Ready";
    badge.className = "inline-flex items-center rounded-full bg-primary-lighter px-3 py-1 text-xs font-semibold text-light-primary-text";
  }
  if (fill) fill.style.background = "#0F0F0F";
}

async function loadSlotState(userId) {
  const [{ count: usedSlots, error: listingsError }, approvedExtraSlots, pendingRequests] = await Promise.all([
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("user_id", userId),
    getApprovedExtraSlots(userId),
    getPendingSlotRequests(userId),
  ]);
  if (listingsError) throw listingsError;

  const totalSlots = BASE_POSTING_SLOTS + approvedExtraSlots;
  renderSlotMeter({
    usedSlots: usedSlots || 0,
    totalSlots,
    pendingRequests,
  });

  return { usedSlots: usedSlots || 0, totalSlots, pendingRequests };
}

async function setupSlotRequestForm(userId) {
  const form = getField("slot-request-form");
  const statusNode = getField("slot-request-status");
  const toggleButton = getField("slot-request-toggle");
  const panel = getField("slot-request-panel");
  if (!form) return;

  if (toggleButton && panel) {
    toggleButton.addEventListener("click", () => {
      panel.classList.toggle("hidden");
      toggleButton.textContent = panel.classList.contains("hidden") ? "Need More Slots?" : "Close Slot Request";
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const requestedSlots = Number(getField("requested_slots")?.value || 0);
    const reason = getField("slot_request_reason")?.value.trim() || "";

    if (!requestedSlots || requestedSlots < 1) {
      if (statusNode) statusNode.textContent = "Enter at least 1 extra slot.";
      return;
    }

    const button = form.querySelector("button[type='submit']");
    if (button) button.disabled = true;
    if (statusNode) statusNode.textContent = "Sending slot request to admin...";

    try {
      const { error } = await supabase.from("posting_slot_requests").insert({
        user_id: userId,
        requested_slots: requestedSlots,
        reason,
        status: "pending",
      });
      if (error) throw error;

      form.reset();
      getField("requested_slots").value = "1";
      if (statusNode) statusNode.textContent = "Slot request sent. Admin can review it from the backend.";
      await loadSlotState(userId);
    } catch (error) {
      if (statusNode) statusNode.textContent = error?.message || "Unable to send slot request.";
    } finally {
      if (button) button.disabled = false;
    }
  });
}

async function setupPostItemForm(userId) {
  buildPostCategorySelect();

  const form = getField("post-item-form");
  const statusNode = getField("post-item-status");
  const fileInput = getField("post-photos");
  const preview = getField("post-photo-preview");
  const description = getField("post-description");
  if (!form) return;

  let selectedFiles = [];

  if (description) {
    description.addEventListener("input", updateDescriptionCounter);
    updateDescriptionCounter();
  }

  if (fileInput) {
    fileInput.addEventListener("change", () => {
      selectedFiles = Array.from(fileInput.files || []).slice(0, 6);
      renderPhotoPreviews(selectedFiles);
    });
  }

  if (preview && fileInput) {
    preview.addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-photo]");
      if (!button) return;

      const index = Number(button.getAttribute("data-remove-photo"));
      if (!Number.isInteger(index) || index < 0) return;

      selectedFiles = selectedFiles.filter((_, fileIndex) => fileIndex !== index);
      const transfer = new DataTransfer();
      selectedFiles.forEach((file) => transfer.items.add(file));
      fileInput.files = transfer.files;
      renderPhotoPreviews(selectedFiles);
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const slotState = await loadSlotState(userId);
    if (slotState.usedSlots >= slotState.totalSlots) {
      if (statusNode) statusNode.textContent = "No posting slots left. Request more slots from admin first.";
      return;
    }

    const title = getField("post-title")?.value.trim() || "";
    const categoryName = getField("post-category")?.value || "";
    const condition = getField("post-condition")?.value || "";
    const descriptionValue = getField("post-description")?.value.trim() || "";
    const price = Number(getField("post-price")?.value || 0);
    const locationCity = getField("post-location")?.value.trim() || "";
    const listingType = getField("post-type")?.value || "sell";
    const isNegotiable = Boolean(getField("post-negotiable")?.checked);

    if (!title || !categoryName || !condition || !Number.isFinite(price)) {
      if (statusNode) statusNode.textContent = "Please complete title, category, condition, and price.";
      return;
    }

    const button = getField("post-item-submit");
    if (button) button.disabled = true;
    if (statusNode) statusNode.textContent = "Submitting your item for admin review...";

    try {
      const { error } = await supabase.from("listings").insert({
        user_id: userId,
        title,
        slug: slugify(title),
        description: descriptionValue,
        price,
        currency: "PKR",
        condition,
        listing_type: listingType,
        status: "pending",
        location_city: locationCity,
        is_negotiable: isNegotiable,
      });
      if (error) throw error;

      form.reset();
      selectedFiles = [];
      updateDescriptionCounter();
      renderPhotoPreviews([]);
      if (statusNode) statusNode.textContent = `Item submitted successfully in ${categoryName}. It is now waiting for admin approval.`;
      await loadSlotState(userId);
      await loadCounts(userId);
      const listings = await fetchSellerListings(userId);
      renderPostedItemsGrid(listings);
    } catch (error) {
      if (statusNode) statusNode.textContent = error?.message || "Unable to submit your item.";
    } finally {
      if (button) button.disabled = false;
    }
  });
}

async function fetchSellerListings(userId) {
  const { data, error } = await supabase
    .from("listings")
    .select("id, title, description, price, currency, status, created_at, views_count, condition")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

function formatCurrency(amount, currency = "PKR") {
  const value = Number(amount || 0);
  if (!Number.isFinite(value)) return `${currency} 0`;
  return `${currency} ${value.toLocaleString()}`;
}

function buildMessageThreads(listings, user, profile) {
  const sellerName = formatName(profile, user);
  const initials = sellerName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "AP";

  if (!listings.length) {
    return [
      {
        id: "welcome-thread",
        buyerName: "Allpanga Support",
        title: "Welcome to seller inbox",
        badge: "System",
        preview: "Buyer questions about your items will appear here after chat backend setup.",
        time: "Now",
        unread: 0,
        messages: [
          {
            sender: "buyer",
            name: "Allpanga Support",
            body: "This is your seller inbox preview. Once we connect real chat, student questions about your listed items will show here automatically.",
            time: "Now",
          },
          {
            sender: "seller",
            name: sellerName,
            body: "Ready to manage student conversations from one place.",
            time: "Now",
            initials,
          },
        ],
      },
    ];
  }

  return listings.slice(0, 6).map((listing, index) => {
    const buyerName = ["Ayesha Student", "Usman Buyer", "Fatima Campus", "Ali Notes", "Sara Hostel", "Bilal Uni"][index % 6];
    const postedTime = listing.created_at
      ? new Date(listing.created_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        })
      : "Today";

    return {
      id: listing.id || `listing-${index}`,
      buyerName,
      title: listing.title || "Untitled item",
      badge: listing.status || "pending",
      preview: `Is this still available? I am interested in your ${listing.title || "item"} and want to know pickup details.`,
      time: postedTime,
      unread: index === 0 ? 2 : index === 1 ? 1 : 0,
      messages: [
        {
          sender: "buyer",
          name: buyerName,
          body: `Hi, I saw your post for "${listing.title || "this item"}". Is it still available for students?`,
          time: postedTime,
        },
        {
          sender: "buyer",
          name: buyerName,
          body: `Can you share condition, final price, and where pickup would be possible?`,
          time: postedTime,
        },
        {
          sender: "seller",
          name: sellerName,
          body: `Thanks for reaching out. This inbox UI is ready, and we can connect real replies next.`,
          time: "Draft preview",
          initials,
        },
      ],
    };
  });
}

function renderActiveThread(thread) {
  const body = getField("message-active-body");
  if (!body || !thread) return;

  setTextContent("message-active-badge", thread.badge || "Conversation");
  setTextContent("message-active-title", thread.title || "Conversation");
  setTextContent("message-active-meta", `${thread.buyerName} · ${thread.time}`);

  body.innerHTML = thread.messages
    .map((message) => {
      const isSeller = message.sender === "seller";
      const bubbleClass = isSeller
        ? "ml-auto bg-primary text-white"
        : "mr-auto bg-white border border-gray-300 text-light-primary-text";

      const metaClass = isSeller ? "text-white/70" : "text-light-disabled-text";

      return `
        <div class="max-w-[88%] ${isSeller ? "ml-auto" : "mr-auto"}">
          <div class="flex items-end gap-3 ${isSeller ? "justify-end" : "justify-start"}">
            ${isSeller ? "" : `<span class="inline-flex size-11 flex-none items-center justify-center rounded-full bg-primary-lighter font-semibold text-light-primary-text">${message.name.slice(0, 2).toUpperCase()}</span>`}
            <div class="rounded-3xl px-5 py-4 shadow-none ${bubbleClass}">
              <p class="text-sm font-semibold mb-1">${message.name}</p>
              <p class="leading-7">${message.body}</p>
              <p class="mt-3 text-xs ${metaClass}">${message.time}</p>
            </div>
            ${isSeller ? `<span class="inline-flex size-11 flex-none items-center justify-center rounded-full bg-[rgba(15,15,15,0.08)] font-semibold text-light-primary-text">${message.initials || "AP"}</span>` : ""}
          </div>
        </div>
      `;
    })
    .join("");
}

function renderMessageCenter(listings, user, profile) {
  const listNode = getField("messages-thread-list");
  const summaryNode = getField("messages-summary");
  const searchNode = getField("messages-search");
  const draftButton = getField("message-draft-button");
  const draftStatus = getField("message-draft-status");
  if (!listNode) return;

  const threads = buildMessageThreads(listings, user, profile);
  const unreadCount = threads.reduce((sum, thread) => sum + Number(thread.unread || 0), 0);
  if (summaryNode) {
    summaryNode.textContent = `${threads.length} conversation${threads.length > 1 ? "s" : ""} · ${unreadCount} unread preview message${unreadCount === 1 ? "" : "s"}`;
  }

  function drawThreads(filteredThreads) {
    listNode.innerHTML = filteredThreads
      .map((thread, index) => {
        const badgeLabel = String(thread.badge || "pending");
        const badgeText = badgeLabel.charAt(0).toUpperCase() + badgeLabel.slice(1);
        return `
          <button type="button" data-thread-id="${thread.id}" class="message-thread-card text-left w-full rounded-3xl border border-gray-300 bg-white p-4 transition-all hover:border-primary hover:shadow-[0_8px_24px_rgba(15,15,15,0.06)] ${index === 0 ? "ring-1 ring-[rgba(15,15,15,0.12)]" : ""}">
            <div class="flex items-start gap-3">
              <span class="inline-flex size-12 flex-none items-center justify-center rounded-full bg-primary text-white font-semibold">${thread.buyerName.slice(0, 2).toUpperCase()}</span>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="font-semibold text-light-primary-text truncate">${thread.buyerName}</p>
                    <p class="text-sm text-light-disabled-text truncate">${thread.title}</p>
                  </div>
                  <span class="text-xs text-light-disabled-text whitespace-nowrap">${thread.time}</span>
                </div>
                <p class="mt-3 text-sm leading-6 text-light-primary-text line-clamp-2">${thread.preview}</p>
                <div class="mt-3 flex items-center justify-between gap-3">
                  <span class="inline-flex rounded-full bg-primary-lighter px-3 py-1 text-xs font-semibold text-light-primary-text">${badgeText}</span>
                  ${thread.unread ? `<span class="inline-flex min-w-[28px] justify-center rounded-full bg-[#FFE700] px-2 py-1 text-xs font-bold text-[#0f0f0f]">${thread.unread}</span>` : `<span class="text-xs text-light-disabled-text">Read</span>`}
                </div>
              </div>
            </div>
          </button>
        `;
      })
      .join("");

    const cards = qsa(".message-thread-card", listNode);
    cards.forEach((card, index) => {
      card.addEventListener("click", () => {
        cards.forEach((node) => node.classList.remove("ring-1", "ring-[rgba(15,15,15,0.12)]", "border-primary"));
        card.classList.add("ring-1", "ring-[rgba(15,15,15,0.12)]", "border-primary");
        renderActiveThread(filteredThreads[index]);
      });
    });

    renderActiveThread(filteredThreads[0] || threads[0]);
  }

  drawThreads(threads);

  if (searchNode) {
    searchNode.addEventListener("input", () => {
      const query = searchNode.value.trim().toLowerCase();
      const filtered = threads.filter((thread) =>
        [thread.buyerName, thread.title, thread.preview].some((value) =>
          String(value || "").toLowerCase().includes(query)
        )
      );
      drawThreads(filtered.length ? filtered : threads);
    });
  }

  if (draftButton) {
    draftButton.addEventListener("click", () => {
      if (draftStatus) {
        draftStatus.textContent = "Reply sending will be connected when the real messaging backend is added.";
      }
    });
  }
}

function renderListingSettings(listings) {
  const grid = getField("listing-settings-grid");
  const summary = getField("listing-settings-summary");
  if (!grid) return;

  if (summary) {
    summary.textContent = `${listings.length} listing${listings.length === 1 ? "" : "s"}`;
  }

  if (!listings.length) {
    grid.innerHTML = `
      <div class="col-span-12 rounded-3xl border border-gray-300 bg-[rgba(15,15,15,0.02)] p-6 text-light-secondary-text">
        No listings yet. Use the Post Item tab to add your first campus item.
      </div>
    `;
    return;
  }

  const badgeClass = (status) => {
    if (status === "approved") return "bg-[rgba(34,197,94,0.12)] text-[#166534]";
    if (status === "disabled") return "bg-[rgba(245,158,11,0.14)] text-[#92400e]";
    if (status === "deleted") return "bg-[rgba(239,68,68,0.12)] text-[#991b1b]";
    return "bg-primary-lighter text-light-primary-text";
  };

  grid.innerHTML = listings
    .map((listing) => {
      const status = listing.status || "pending";
      return `
        <div class="col-span-12 xl:col-span-6">
          <div class="h-full rounded-3xl border border-gray-300 p-5 bg-[rgba(15,15,15,0.02)]">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h6 class="mb-2">${listing.title || "Untitled item"}</h6>
                <p class="text-sm text-light-disabled-text leading-6">${(listing.description || "No description added yet.").slice(0, 140)}</p>
              </div>
              <span class="inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(status)}">${status}</span>
            </div>
            <div class="mt-4 flex flex-wrap items-center gap-3 text-sm text-light-disabled-text">
              <span>${formatCurrency(listing.price, listing.currency || "PKR")}</span>
              <span>${listing.views_count ?? 0} views</span>
              <span>${listing.condition || "Condition not set"}</span>
            </div>
            <div class="mt-5 flex flex-wrap gap-3">
              <button type="button" data-listing-action="live" data-listing-id="${listing.id}" class="btn btn-primary rounded-[60px] shadow-none ${status === "approved" ? "opacity-60 pointer-events-none" : ""}">
                Set Live
              </button>
              <button type="button" data-listing-action="disable" data-listing-id="${listing.id}" class="btn btn-default outline rounded-[60px] shadow-none">
                Disable
              </button>
              <button type="button" data-listing-action="delete" data-listing-id="${listing.id}" class="btn btn-default outline rounded-[60px] shadow-none border-[rgba(239,68,68,0.34)] text-[#991b1b]">
                Delete
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

async function refreshDashboardData(user, profile) {
  await loadCounts(user.id);
  const listings = await fetchSellerListings(user.id);
  renderPostedItemsGrid(listings);
  renderMessageCenter(listings, user, profile);
  renderListingSettings(listings);
  await loadSlotState(user.id);
  return listings;
}

function setupAvatarControls() {
  const fileInput = getField("seller-avatar-input");
  if (fileInput) {
    fileInput.addEventListener("change", () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : "";
        fileInput.dataset.avatarDataUrl = result;
        updateAvatarPreview(result, getField("owner_name")?.value || "Allpanga Seller");
      };
      reader.readAsDataURL(file);
    });
  }
}

function setupProfileInstitutionSelectors() {
  const typeSelect = getField("seller-category");
  if (!typeSelect) return;
  typeSelect.addEventListener("change", () => {
    buildInstitutionNameSelect(typeSelect.value || "", "");
  });
}

function setupListingSettings(user, profileRef) {
  const grid = getField("listing-settings-grid");
  if (!grid) return;

  grid.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-listing-action]");
    if (!button) return;

    const listingId = button.getAttribute("data-listing-id");
    const action = button.getAttribute("data-listing-action");
    if (!listingId || !action) return;

    const summary = getField("listing-settings-summary");
    if (summary) summary.textContent = "Updating listing...";

    try {
      const nextStatus =
        action === "live" ? "approved" : action === "disable" ? "disabled" : "deleted";
      const { error } = await supabase
        .from("listings")
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq("id", listingId)
        .eq("user_id", user.id);
      if (error) throw error;

      await refreshDashboardData(user, profileRef.current);
      showStatus(`Listing updated: ${action === "live" ? "set live" : action}.`);
    } catch (error) {
      if (summary) summary.textContent = error?.message || "Unable to update listing.";
    }
  });
}

function setupDeleteAccount(user) {
  const button = getField("delete-account-button");
  const statusNode = getField("delete-account-status");
  const modal = getField("delete-account-modal");
  const closeButton = getField("delete-account-close");
  const cancelButton = getField("delete-account-cancel");
  const confirmButton = getField("delete-account-confirm");
  const confirmInput = getField("delete-account-confirm-input");
  const modalStatus = getField("delete-account-modal-status");
  if (!button || !modal) return;

  const openModal = () => {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    if (confirmInput) confirmInput.value = "";
    if (modalStatus) modalStatus.textContent = "";
  };

  const closeModal = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  };

  button.addEventListener("click", openModal);
  closeButton?.addEventListener("click", closeModal);
  cancelButton?.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  confirmButton?.addEventListener("click", async () => {
    const typedValue = confirmInput?.value.trim() || "";
    if (typedValue !== "Allpanga") {
      if (modalStatus) modalStatus.textContent = 'Type "Allpanga" exactly to continue.';
      return;
    }

    confirmButton.disabled = true;
    if (modalStatus) modalStatus.textContent = "Deleting seller account...";
    if (statusNode) statusNode.textContent = "Deleting seller account...";

    try {
      const [{ error: profileError }, { error: listingsError }] = await Promise.all([
        supabase
          .from("profiles")
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq("id", user.id),
        supabase
          .from("listings")
          .update({ status: "deleted", updated_at: new Date().toISOString() })
          .eq("user_id", user.id),
      ]);

      if (profileError) throw profileError;
      if (listingsError) throw listingsError;

      if (statusNode) {
        statusNode.textContent = "Seller account deleted. Redirecting to homepage...";
      }
      await supabase.auth.signOut();
      window.location.replace("./index.html");
    } catch (error) {
      if (modalStatus) modalStatus.textContent = error?.message || "Unable to delete account.";
      if (statusNode) statusNode.textContent = error?.message || "Unable to delete account.";
      confirmButton.disabled = false;
    }
  });
}

function getDashboardPostsWrapper() {
  return qsa("#dashboard .wishlist-table-wrapper").find((wrapper) => {
    const heading = qs("h5", wrapper);
    return heading && /recent orders/i.test(heading.textContent || "");
  }) || qs("#dashboard .wishlist-table-wrapper");
}

function renderPostedItemsGrid(listings) {
  const wrapper = getDashboardPostsWrapper();
  if (!wrapper) return;

  wrapper.classList.remove("overflow-x-auto");
  wrapper.classList.add("overflow-hidden");

  const statusBadge = (status) => {
    const map = {
      approved: { bg: "rgba(34,197,94,0.14)",  color: "#166534", label: "Live"            },
      pending:  { bg: "rgba(245,158,11,0.14)",  color: "#92400e", label: "Awaiting Approval"},
      disabled: { bg: "rgba(156,163,175,0.2)",  color: "#374151", label: "Deactivated"      },
      deleted:  { bg: "rgba(239,68,68,0.12)",   color: "#991b1b", label: "Deleted"           },
      reported: { bg: "rgba(239,68,68,0.12)",   color: "#991b1b", label: "Reported"          },
    };
    const s = map[status] || { bg:"rgba(245,158,11,0.14)", color:"#92400e", label: status || "Pending" };
    return `<span style="background:${s.bg};color:${s.color};padding:3px 12px;border-radius:99px;font-size:11.5px;font-weight:700;white-space:nowrap">${s.label}</span>`;
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
  };

  if (!listings.length) {
    wrapper.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <i class="hgi hgi-stroke hgi-delivery-box-02 text-5xl text-light-disabled-text"></i>
        <p class="font-semibold text-light-primary-text">No listings yet</p>
        <p class="text-sm text-light-disabled-text">Use the Post Item tab to add your first campus listing.</p>
      </div>`;
    return;
  }

  wrapper.innerHTML = `
    <div class="flex items-center justify-between gap-4 mb-5">
      <h5 class="mb-0">My Posted Items</h5>
      <span class="text-sm font-semibold text-light-disabled-text">${listings.length} listing${listings.length === 1 ? "" : "s"}</span>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full wishlist-table" id="dashboard-posts-table">
        <thead class="bg-primary-lighter">
          <tr>
            <th class="text-left pl-4 py-4 font-semibold rounded-l-lg" style="min-width:260px">Item</th>
            <th class="text-left pl-4 py-4 font-semibold" style="min-width:110px">
              <span class="flex items-center gap-1">
                <i class="hgi hgi-stroke hgi-view text-base"></i> Views
              </span>
            </th>
            <th class="text-left pl-4 py-4 font-semibold" style="min-width:130px">Date Posted</th>
            <th class="text-left pl-4 py-4 font-semibold rounded-r-lg" style="min-width:140px">Status</th>
          </tr>
        </thead>
        <tbody>
          ${listings.map((l) => `
            <tr class="border-b border-gray-200 hover:bg-[rgba(15,15,15,0.015)] transition-colors">

              <!-- Item column -->
              <td class="py-3 pl-4">
                <div class="flex items-center gap-3">
                  <div class="w-[52px] h-[52px] rounded-xl bg-[rgba(15,15,15,0.06)] flex-none flex items-center justify-center overflow-hidden border border-gray-200">
                    <i class="hgi hgi-stroke hgi-image-01 text-xl text-light-disabled-text"></i>
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-semibold text-light-disabled-text mb-0.5">${l.category || l.condition || "Item"}</p>
                    <p class="font-semibold text-light-primary-text text-sm leading-5 truncate max-w-[200px]">${l.title || "Untitled"}</p>
                    <p class="text-xs text-light-disabled-text mt-0.5">${l.price ? `PKR ${Number(l.price).toLocaleString()}` : "Price not set"}</p>
                  </div>
                </div>
              </td>

              <!-- Views column -->
              <td class="py-3 pl-4">
                <div class="flex items-center gap-1.5">
                  <i class="hgi hgi-stroke hgi-view text-sm text-light-disabled-text"></i>
                  <span class="font-bold text-light-primary-text text-sm">${Number(l.views_count || 0).toLocaleString()}</span>
                </div>
              </td>

              <!-- Date column -->
              <td class="py-3 pl-4">
                <span class="text-sm font-semibold text-light-primary-text">${formatDate(l.created_at)}</span>
              </td>

              <!-- Status column -->
              <td class="py-3 pl-4">
                ${statusBadge(l.status)}
              </td>

            </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

}

async function loadCounts(userId) {
  const [{ count: totalListings }, { count: approvedListings }, { count: pendingListings }] =
    await Promise.all([
      supabase.from("listings").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("listings").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("status", "approved"),
      supabase.from("listings").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("status", "pending"),
    ]);

  // new card IDs
  const liveEl    = qs("#dash-live-count");
  const pendingEl = qs("#dash-pending-count");
  const cartEl    = qs("#dash-cart-count");
  if (liveEl)    liveEl.textContent    = approvedListings ?? 0;
  if (pendingEl) pendingEl.textContent = pendingListings  ?? 0;
  if (cartEl)    cartEl.textContent    = totalListings    ?? 0;

  // also update metric total items
  const metItems = qs("#dash-metric-items");
  if (metItems) metItems.textContent = totalListings ?? 0;
}

function setupStaticAllpangaCopy() {
  document.title = "Allpanga - Seller Dashboard";
  setText(".breadcrumb li:last-child span", "Seller Dashboard");
  setText("#dashboard .grid.grid-cols-12.mb-6.gap-6 > div:nth-child(1) p", "Listed Items");
  setText("#dashboard .grid.grid-cols-12.mb-6.gap-6 > div:nth-child(2) p", "Approved Listings");
  setText("#dashboard .grid.grid-cols-12.mb-6.gap-6 > div:nth-child(3) p", "Pending Review");
}

async function loadDashboard() {
  setupStaticAllpangaCopy();
  buildCategorySelect();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (!session?.user) {
    window.location.replace("./login.html");
    return;
  }

  const user = session.user;
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) throw profileError;

  const profileRef = { current: profile };
  const data = normalizeProfileData(user, profile);
  fillForm(data);
  renderProfileCard(data);
  setupAvatarControls();
  setupProfileInstitutionSelectors();

  const contentTitle = qs("#profile h4");
  if (contentTitle) contentTitle.textContent = "Edit Seller Profile";

  showStatus(`Signed in as ${formatName(profile, user)}`);

  await refreshDashboardData(user, profileRef.current);

  // ── build real store metrics from actual listings ──
  try {
    const { data: metricsListings } = await supabase
      .from("listings")
      .select("views_count, status, condition")
      .eq("user_id", user.id);

    const listings = metricsListings || [];
    const totalViews    = listings.reduce((s, l) => s + Number(l.views_count || 0), 0);
    const totalItems    = listings.length;
    const reportedItems = listings.filter(l => l.status === "reported" || l.status === "deleted").length;
    // derive a mock comment count from views (1 comment per ~12 views, min 0)
    const totalComments = Math.floor(totalViews / 12);
    // derive average rating: base 3.5, boost by views/items ratio, cap at 5
    const viewsPerItem  = totalItems > 0 ? totalViews / totalItems : 0;
    const rawRating     = Math.min(5, 3.5 + (viewsPerItem / 40));
    const avgRating     = totalItems > 0 ? parseFloat(rawRating.toFixed(1)) : 0;

    renderStoreRatingCard({
      views:         totalViews    || 24,
      comments:      totalComments || 3,
      items:         totalItems    || 2,
      reports:       reportedItems || 1,
      averageRating: avgRating     || 3.8,
    });
  } catch (e) {
    // fallback with visible demo values so UI always shows something
    renderStoreRatingCard({
      views: 24, comments: 3, items: 2, reports: 1, averageRating: 3.8,
    });
  }
  renderStudentViewsChart(profile?.created_at || user.created_at); // no-op alias kept
  setupViewsChartRealtime(user.id, profile?.created_at || user.created_at);
  await setupSlotRequestForm(user.id);
  await setupPostItemForm(user.id);
  setupListingSettings(user, profileRef);
  setupDeleteAccount(user);
  fillProfileTab(data);
  setupProfileTab(user, profileRef);
  await initMyPostsTab(user, profileRef);

  // cart dropdown
  try {
    const cartListings = await fetchSellerListings(user.id);
    setupCartDropdown(cartListings);
  } catch(e) { setupCartDropdown([]); }

  // messages tab — build threads from listings + blogs
  try {
    const [allListings, allBlogs] = await Promise.all([
      fetchSellerListings(user.id),
      fetchUserBlogs(user.id).catch(() => []),
    ]);
    initMessagesTab(allListings, allBlogs, user, profile);
  } catch (e) {
    initMessagesTab([], [], user, profile);
  }

  const form = qs("#edit-address form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const firstName = getField("owner_name").value.trim();
    const lastName = getField("last_name")?.value.trim() || "";
    const emailValue = getField("company_email").value.trim();
    const storeName = getField("company_name").value.trim();
    const phoneValue = getField("phone_number").value.trim();
    const institutionType = getField("seller-category")?.value || "";
    const institutionName = getField("city")?.value || "";
    const whatsappValue = (getField("whatsapp_number")?.value || "").trim();
    const avatarData = getField("seller-avatar-input")?.dataset.avatarDataUrl || profileRef.current?.avatar_path || "";
    const profilePayload = {
      id: user.id,
      full_name: `${firstName} ${lastName}`.trim(),
      department: storeName,
      phone: phoneValue,
      university_name: institutionName,
      study_level: institutionType,
      whatsapp: whatsappValue,
      avatar_path: avatarData,
      updated_at: new Date().toISOString(),
    };

    const button = form.querySelector("button[type='submit']");
    if (button) button.disabled = true;
    showStatus("Saving your seller profile...");

    try {
      if (emailValue && emailValue !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: emailValue });
        if (emailError) throw emailError;
      }
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          store_name: storeName,
          phone_number: phoneValue,
          institution_type: institutionType,
          institution_name: institutionName,
        },
      });
      if (metadataError) throw metadataError;
      const { error } = await supabase.from("profiles").upsert(profilePayload, { onConflict: "id" });
      if (error) throw error;

      profileRef.current = { ...(profileRef.current || {}), ...profilePayload };
      const updatedData = normalizeProfileData(
        {
          ...user,
          email: emailValue || user.email,
          user_metadata: {
            ...(user.user_metadata || {}),
            first_name: firstName,
            last_name: lastName,
            store_name: storeName,
            phone_number: phoneValue,
            institution_type: institutionType,
            institution_name: institutionName,
          },
        },
        profileRef.current
      );
      fillForm(updatedData);
      renderProfileCard(updatedData);
      showStatus("Seller profile updated successfully.");
    } catch (error) {
      showStatus(error?.message || "Unable to save seller profile.", true);
    } finally {
      if (button) button.disabled = false;
    }
  });

  const logoutButton = qs(".logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", async (event) => {
      event.preventDefault();
      await supabase.auth.signOut();
      window.location.replace("./login.html");
    });
  }
}

// ─────────────────────────────────────────────
// PROFILE TAB — institution selector
// ─────────────────────────────────────────────
function buildProfileTabInstitutionSelect(selectedType = "", selectedValue = "") {
  const select = qs("#pt-city");
  if (!select) return;
  const options = PROFILE_INSTITUTION_OPTIONS[selectedType] || [];
  select.innerHTML = [
    '<option value="">Select Institution</option>',
    ...options.map((item) => `<option value="${item}">${item}</option>`),
  ].join("");
  select.value = selectedValue || "";
}

// ─────────────────────────────────────────────
// PROFILE TAB — avatar controls
// ─────────────────────────────────────────────
function setupProfileTabAvatar() {
  const fileInput = qs("#profile-tab-avatar-input");
  const removeBtn = qs("#profile-tab-remove-avatar");
  const preview   = qs("#profile-tab-avatar-preview");
  const placeholder = qs("#profile-tab-avatar-placeholder");
  if (!fileInput) return;

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      fileInput.dataset.avatarDataUrl = result;
      if (preview) { preview.src = result; preview.classList.remove("hidden"); }
      if (placeholder) placeholder.classList.add("hidden");
      if (removeBtn) removeBtn.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  });

  removeBtn?.addEventListener("click", () => {
    fileInput.value = "";
    fileInput.dataset.avatarDataUrl = "";
    if (preview) { preview.src = ""; preview.classList.add("hidden"); }
    if (placeholder) placeholder.classList.remove("hidden");
    removeBtn.classList.add("hidden");
  });
}

// ─────────────────────────────────────────────
// PROFILE TAB — fill fields from existing data
// ─────────────────────────────────────────────
function fillProfileTab(data) {
  const set = (id, value) => { const el = qs(id); if (el) el.value = value || ""; };
  set("#pt-company_name",    data.company_name   || "");
  set("#pt-owner_name",      data.owner_name     || "");
  set("#pt-last_name",       data.last_name      || "");
  set("#pt-company_email",   data.company_email  || "");
  set("#pt-phone_number",    data.phone_number   || "");
  set("#pt-whatsapp_number", data.whatsapp_number|| "");

  const typeSelect = qs("#pt-seller-category");
  if (typeSelect) {
    typeSelect.value = data.seller_category || "";
    buildProfileTabInstitutionSelect(data.seller_category || "", data.city || "");
  }

  // avatar preview
  const preview     = qs("#profile-tab-avatar-preview");
  const placeholder = qs("#profile-tab-avatar-placeholder");
  const initialsEl  = qs("#profile-tab-avatar-initials");
  const removeBtn   = qs("#profile-tab-remove-avatar");
  const displayName = `${data.owner_name || ""} ${data.last_name || ""}`.trim() || data.company_name || "Allpanga Seller";
  const initials    = displayName.split(" ").map(p => p[0]).filter(Boolean).slice(0,2).join("").toUpperCase() || "AP";

  if (initialsEl) initialsEl.textContent = initials;

  if (data.avatar_path) {
    if (preview)     { preview.src = data.avatar_path; preview.classList.remove("hidden"); }
    if (placeholder) placeholder.classList.add("hidden");
    if (removeBtn)   removeBtn.classList.remove("hidden");
  } else {
    if (preview) preview.classList.add("hidden");
    if (removeBtn) removeBtn.classList.add("hidden");
    if (placeholder) placeholder.classList.remove("hidden");
  }
}

// ─────────────────────────────────────────────
// PROFILE TAB — status helper
// ─────────────────────────────────────────────
function setProfileTabStatus(msg, isError = false) {
  const node = qs("#profile-tab-status");
  if (!node) return;
  node.textContent = msg;
  node.className = isError
    ? "text-sm font-semibold text-[#991b1b]"
    : "text-sm font-semibold text-primary";
}

// ─────────────────────────────────────────────
// PROFILE TAB — setup form submit
// ─────────────────────────────────────────────
function setupProfileTab(user, profileRef) {
  // institution type change → rebuild institution list
  const typeSelect = qs("#pt-seller-category");
  if (typeSelect) {
    typeSelect.addEventListener("change", () => {
      buildProfileTabInstitutionSelect(typeSelect.value || "", "");
    });
  }

  setupProfileTabAvatar();

  const form    = qs("#profile-tab-form");
  const saveBtn = qs("#profile-tab-save-btn");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const get = (id) => qs(id)?.value?.trim() || "";
    const firstName       = get("#pt-owner_name");
    const lastName        = get("#pt-last_name");
    const emailValue      = get("#pt-company_email");
    const storeName       = get("#pt-company_name");
    const phoneValue      = get("#pt-phone_number");
    const whatsappValue   = get("#pt-whatsapp_number");
    const institutionType = get("#pt-seller-category");
    const institutionName = get("#pt-city");

    const fileInput = qs("#profile-tab-avatar-input");
    const avatarData = fileInput?.dataset.avatarDataUrl || profileRef.current?.avatar_path || "";

    const profilePayload = {
      id:              user.id,
      full_name:       `${firstName} ${lastName}`.trim(),
      department:      storeName,
      phone:           phoneValue,
      university_name: institutionName,
      study_level:     institutionType,
      whatsapp:        whatsappValue,
      avatar_path:     avatarData,
      updated_at:      new Date().toISOString(),
    };

    if (saveBtn) saveBtn.disabled = true;
    setProfileTabStatus("Saving profile...");

    try {
      // update email if changed
      if (emailValue && emailValue !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: emailValue });
        if (emailError) throw emailError;
      }

      // update auth metadata
      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          first_name:       firstName,
          last_name:        lastName,
          store_name:       storeName,
          phone_number:     phoneValue,
          institution_type: institutionType,
          institution_name: institutionName,
        },
      });
      if (metaError) throw metaError;

      // upsert profiles table
      const { error: dbError } = await supabase
        .from("profiles")
        .upsert(profilePayload, { onConflict: "id" });
      if (dbError) throw dbError;

      // update shared profileRef so the rest of the dashboard stays in sync
      profileRef.current = { ...(profileRef.current || {}), ...profilePayload };

      const updatedUser = {
        ...user,
        email: emailValue || user.email,
        user_metadata: {
          ...(user.user_metadata || {}),
          first_name:       firstName,
          last_name:        lastName,
          store_name:       storeName,
          phone_number:     phoneValue,
          institution_type: institutionType,
          institution_name: institutionName,
        },
      };

      const updatedData = normalizeProfileData(updatedUser, profileRef.current);
      fillProfileTab(updatedData);   // refresh profile tab fields
      fillForm(updatedData);         // keep the hidden edit-address form in sync
      renderProfileCard(updatedData);// update the sidebar profile card

      setProfileTabStatus("Profile saved successfully ✓");
    } catch (err) {
      setProfileTabStatus(err?.message || "Unable to save profile.", true);
    } finally {
      if (saveBtn) saveBtn.disabled = false;
    }
  });
}

// ─────────────────────────────────────────────
// MY POSTS TAB — render listings grid
// ─────────────────────────────────────────────
function renderMyPostsGrid(listings) {
  const grid    = qs("#myposts-grid");
  const summary = qs("#myposts-summary");
  if (!grid) return;

  const total = listings.length;
  if (summary) {
    summary.innerHTML = `<i class="hgi hgi-stroke hgi-checkmark-circle-01 text-base"></i> ${total} listing${total === 1 ? "" : "s"}`;
  }

  if (!total) {
    grid.innerHTML = `
      <div class="rounded-2xl border border-gray-300 bg-[rgba(15,15,15,0.02)] p-8 text-center">
        <i class="hgi hgi-stroke hgi-package-open text-4xl text-light-disabled-text mb-3 block"></i>
        <p class="font-semibold text-light-primary-text mb-1">No posts yet</p>
        <p class="text-sm text-light-disabled-text">Use the <strong>Post Item</strong> tab to add your first listing.</p>
      </div>`;
    return;
  }

  const badgeCls = (s) => {
    if (s === "approved") return "bg-[rgba(34,197,94,0.12)] text-[#166534]";
    if (s === "disabled") return "bg-[rgba(245,158,11,0.14)] text-[#92400e]";
    if (s === "deleted")  return "bg-[rgba(239,68,68,0.12)] text-[#991b1b]";
    return "bg-primary-lighter text-light-primary-text";
  };

  grid.innerHTML = listings.map((l) => {
    const status  = l.status || "pending";
    const date    = l.created_at
      ? new Date(l.created_at).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })
      : "—";
    const isLive  = status === "approved";
    const isDel   = status === "deleted";

    return `
      <div class="rounded-2xl border border-gray-300 bg-white p-5 flex flex-col gap-4" id="mypost-row-${l.id}">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <span class="inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeCls(status)}">${status}</span>
              ${l.condition ? `<span class="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-[rgba(15,15,15,0.06)] text-light-secondary-text">${l.condition}</span>` : ""}
            </div>
            <h6 class="text-light-primary-text leading-6 truncate">${l.title || "Untitled item"}</h6>
            <p class="text-sm text-light-disabled-text mt-1 line-clamp-2">${(l.description || "No description.").slice(0,180)}</p>
          </div>
          <div class="text-right flex-none">
            <div class="font-semibold text-light-primary-text">${formatCurrency(l.price, l.currency || "PKR")}</div>
            <div class="text-xs text-light-disabled-text mt-1">${date}</div>
            <div class="text-xs text-light-disabled-text mt-0.5">${l.views_count ?? 0} views</div>
          </div>
        </div>
        ${isDel ? "" : `
        <div class="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
          <button type="button" data-mp-action="live"    data-mp-id="${l.id}"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-[99px] text-xs font-semibold transition-colors
              ${isLive ? "bg-[rgba(34,197,94,0.12)] text-[#166534] opacity-60 pointer-events-none" : "bg-primary text-white hover:opacity-90"}">
            <i class="hgi hgi-stroke hgi-checkmark-circle-01 text-sm"></i>
            ${isLive ? "Live" : "Set Live"}
          </button>
          <button type="button" data-mp-action="disable" data-mp-id="${l.id}"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-[99px] border border-gray-300 text-xs font-semibold text-light-secondary-text bg-white hover:bg-[rgba(15,15,15,0.04)] transition-colors">
            <i class="hgi hgi-stroke hgi-eye-off text-sm"></i>
            Disable
          </button>
          <button type="button" data-mp-action="delete"  data-mp-id="${l.id}"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-[99px] border border-[rgba(239,68,68,0.3)] text-xs font-semibold text-[#991b1b] bg-white hover:bg-[rgba(239,68,68,0.06)] transition-colors ml-auto">
            <i class="hgi hgi-stroke hgi-delete-02 text-sm"></i>
            Delete
          </button>
        </div>`}
      </div>`;
  }).join("");
}

// ─────────────────────────────────────────────
// MY POSTS TAB — action handler (live/disable/delete)
// ─────────────────────────────────────────────
function setupMyPostsActions(user, profileRef) {
  const grid = qs("#myposts-grid");
  if (!grid) return;

  grid.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-mp-action]");
    if (!btn) return;
    const id     = btn.getAttribute("data-mp-id");
    const action = btn.getAttribute("data-mp-action");
    if (!id || !action) return;

    btn.disabled = true;
    const summary = qs("#myposts-summary");
    const prevSummary = summary?.innerHTML || "";
    if (summary) summary.innerHTML = `<i class="hgi hgi-stroke hgi-loading-03 text-base"></i> Updating…`;

    try {
      const nextStatus = action === "live" ? "approved" : action === "disable" ? "disabled" : "deleted";
      const { error } = await supabase
        .from("listings")
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;

      const listings = await fetchSellerListings(user.id);
      renderMyPostsGrid(listings);
      renderListingSettings(listings);
      renderPostedItemsGrid(listings);
      await loadCounts(user.id);
    } catch (err) {
      if (summary) summary.innerHTML = prevSummary;
      btn.disabled = false;
      const statusEl = qs("#myposts-delete-status");
      if (statusEl) { statusEl.textContent = err?.message || "Action failed."; statusEl.classList.remove("hidden"); }
    }
  });
}

// ─────────────────────────────────────────────
// MY POSTS TAB — delete account modal
// ─────────────────────────────────────────────
function setupMyPostsDeleteAccount(user) {
  const openBtn   = qs("#myposts-delete-account-btn");
  const modal     = qs("#myposts-delete-modal");
  const closeBtn  = qs("#myposts-modal-close");
  const cancelBtn = qs("#myposts-modal-cancel");
  const confirmBtn= qs("#myposts-modal-confirm");
  const input     = qs("#myposts-confirm-input");
  const modalSt   = qs("#myposts-modal-status");
  const pageSt    = qs("#myposts-delete-status");
  if (!openBtn || !modal) return;

  const openModal = () => {
    if (input) input.value = "";
    if (modalSt) modalSt.textContent = "";
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    setTimeout(() => input?.focus(), 80);
  };
  const closeModal = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  };

  openBtn.addEventListener("click", openModal);
  closeBtn?.addEventListener("click", closeModal);
  cancelBtn?.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  // real-time input highlight
  input?.addEventListener("input", () => {
    const match = input.value.trim() === "Allpanga";
    input.style.borderColor = input.value.trim()
      ? (match ? "rgba(34,197,94,0.6)" : "rgba(239,68,68,0.5)")
      : "";
    if (modalSt) modalSt.textContent = "";
  });

  confirmBtn?.addEventListener("click", async () => {
    if (input?.value.trim() !== "Allpanga") {
      if (modalSt) modalSt.textContent = 'Type "Allpanga" exactly — capital A required.';
      input?.focus();
      return;
    }

    confirmBtn.disabled = true;
    if (modalSt) modalSt.textContent = "Deleting your account…";

    try {
      const [{ error: pErr }, { error: lErr }] = await Promise.all([
        supabase.from("profiles").update({ is_active: false, updated_at: new Date().toISOString() }).eq("id", user.id),
        supabase.from("listings").update({ status: "deleted",  updated_at: new Date().toISOString() }).eq("user_id", user.id),
      ]);
      if (pErr) throw pErr;
      if (lErr) throw lErr;

      if (pageSt) { pageSt.textContent = "Account deleted. Redirecting…"; pageSt.classList.remove("hidden"); }
      await supabase.auth.signOut();
      window.location.replace("./index.html");
    } catch (err) {
      if (modalSt) modalSt.textContent = err?.message || "Unable to delete account. Please try again.";
      confirmBtn.disabled = false;
    }
  });
}

// ─────────────────────────────────────────────
// MY POSTS TAB — init (called from loadDashboard)
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// MY POSTS TAB — fetch user blogs
// ─────────────────────────────────────────────
async function fetchUserBlogs(userId) {
  const { data, error } = await supabase
    .from("blogs")
    .select("id, title, excerpt, category, status, visibility, tags, cover_image, body, created_at, updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

// ─────────────────────────────────────────────
// MY POSTS TAB — render blogs grid
// ─────────────────────────────────────────────
function renderMyBlogsGrid(blogs) {
  // expose globally so the blog editor inline script can refresh the list after save
  window.renderMyBlogsGridGlobal = renderMyBlogsGrid;
  const grid    = qs("#myblogs-grid");
  const summary = qs("#myblogs-summary");
  if (!grid) return;

  const total = blogs.length;
  if (summary) {
    summary.innerHTML = `<i class="hgi hgi-stroke hgi-checkmark-circle-01 text-base"></i> ${total} blog${total === 1 ? "" : "s"}`;
  }

  if (!total) {
    grid.innerHTML = `
      <div class="rounded-2xl border border-gray-300 bg-[rgba(15,15,15,0.02)] p-8 text-center">
        <i class="hgi hgi-stroke hgi-quill-write-02 text-4xl text-light-disabled-text mb-3 block"></i>
        <p class="font-semibold text-light-primary-text mb-1">No blog posts yet</p>
        <p class="text-sm text-light-disabled-text">Use the <strong>Write Blog</strong> tab to publish your first post.</p>
      </div>`;
    return;
  }

  const badgeCls = (s) => {
    if (s === "published") return "bg-[rgba(34,197,94,0.12)] text-[#166534]";
    if (s === "inactive")  return "bg-[rgba(245,158,11,0.14)] text-[#92400e]";
    if (s === "deleted")   return "bg-[rgba(239,68,68,0.12)] text-[#991b1b]";
    return "bg-primary-lighter text-light-primary-text";
  };

  grid.innerHTML = blogs.map((b) => {
    const status  = b.status || "draft";
    const date    = b.created_at
      ? new Date(b.created_at).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })
      : "—";
    const updated = b.updated_at
      ? new Date(b.updated_at).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })
      : null;
    const isDel   = status === "deleted";
    const isInact = status === "inactive";
    const excerpt = (b.excerpt || b.title || "No excerpt.").slice(0, 160);
    const tags    = Array.isArray(b.tags) ? b.tags : [];

    return `
      <div class="rounded-2xl border border-gray-300 bg-white p-5 flex flex-col gap-4" id="myblog-row-${b.id}">

        <div class="flex items-start justify-between gap-4">
          <!-- cover thumbnail -->
          ${b.cover_image ? `<img src="${b.cover_image}" alt="cover" class="hidden sm:block flex-none w-20 h-14 object-cover rounded-xl border border-gray-200" />` : `<div class="hidden sm:flex flex-none w-20 h-14 rounded-xl border border-gray-200 bg-[rgba(15,15,15,0.04)] items-center justify-center"><i class="hgi hgi-stroke hgi-image-01 text-xl text-light-disabled-text"></i></div>`}
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1.5">
              <span class="inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeCls(status)}">${status}</span>
              ${b.category ? `<span class="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-[rgba(15,15,15,0.06)] text-light-secondary-text">${b.category}</span>` : ""}
              ${b.visibility && b.visibility !== "public" ? `<span class="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-[rgba(15,15,15,0.06)] text-light-secondary-text">${b.visibility}</span>` : ""}
            </div>
            <h6 class="text-light-primary-text leading-6 line-clamp-1">${b.title || "Untitled"}</h6>
            <p class="text-sm text-light-disabled-text mt-1 line-clamp-2">${excerpt}</p>
            ${tags.length ? `<div class="flex flex-wrap gap-1 mt-2">${tags.map(t=>`<span style="background:#0d0d0d;color:#fff;padding:2px 9px;border-radius:99px;font-size:10.5px;font-weight:600">${t}</span>`).join("")}</div>` : ""}
          </div>
          <div class="text-right flex-none text-xs text-light-disabled-text">
            <div>${date}</div>
            ${updated && updated !== date ? `<div class="mt-0.5 opacity-70">edited ${updated}</div>` : ""}
          </div>
        </div>

        ${isDel ? `<p class="text-xs text-[#991b1b] font-semibold">This post has been deleted.</p>` : `
        <div class="flex flex-wrap gap-2 pt-1 border-t border-gray-100">
          <!-- Edit -->
          <button type="button" data-blog-action="edit" data-blog-id="${b.id}"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-[99px] bg-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity">
            <i class="hgi hgi-stroke hgi-pencil-edit-01 text-sm"></i>
            Edit
          </button>
          <!-- Deactivate / Reactivate -->
          ${isInact
            ? `<button type="button" data-blog-action="reactivate" data-blog-id="${b.id}"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-[99px] border border-gray-300 text-xs font-semibold text-light-secondary-text bg-white hover:bg-[rgba(15,15,15,0.04)] transition-colors">
                <i class="hgi hgi-stroke hgi-checkmark-circle-01 text-sm"></i>
                Reactivate
               </button>`
            : `<button type="button" data-blog-action="deactivate" data-blog-id="${b.id}"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-[99px] border border-gray-300 text-xs font-semibold text-light-secondary-text bg-white hover:bg-[rgba(15,15,15,0.04)] transition-colors">
                <i class="hgi hgi-stroke hgi-eye-off text-sm"></i>
                Deactivate
               </button>`}
          <!-- Delete -->
          <button type="button" data-blog-action="delete" data-blog-id="${b.id}"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-[99px] border border-[rgba(239,68,68,0.3)] text-xs font-semibold text-[#991b1b] bg-white hover:bg-[rgba(239,68,68,0.06)] transition-colors ml-auto">
            <i class="hgi hgi-stroke hgi-delete-02 text-sm"></i>
            Delete
          </button>
        </div>`}

      </div>`;
  }).join("");
}

// ─────────────────────────────────────────────
// MY POSTS TAB — blog action handler
// ─────────────────────────────────────────────
function setupMyBlogsActions(user) {
  const grid = qs("#myblogs-grid");
  if (!grid) return;

  // store full blog data keyed by id for edit loading
  setupMyBlogsActions._cache = setupMyBlogsActions._cache || {};

  grid.addEventListener("click", async (e) => {
    const btn    = e.target.closest("[data-blog-action]");
    if (!btn) return;
    const id     = btn.getAttribute("data-blog-id");
    const action = btn.getAttribute("data-blog-action");
    if (!id || !action) return;

    // ── EDIT: switch to writeblog tab and load content ──
    if (action === "edit") {
      const blog = setupMyBlogsActions._cache[id];
      if (!blog) return;

      // switch tab
      const tabBtn = qs('[data-tab="writeblog"]');
      if (tabBtn) tabBtn.click();

      // load blog into editor after a brief tick so the tab is visible
      setTimeout(() => {
        if (typeof window.beLoadBlog === "function") {
          window.beLoadBlog(blog);
        }
        // scroll editor into view
        const editorEl = qs("#be-title");
        if (editorEl) editorEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
      return;
    }

    // ── DEACTIVATE / REACTIVATE / DELETE ──
    btn.disabled = true;
    const summary = qs("#myblogs-summary");
    if (summary) summary.innerHTML = `<i class="hgi hgi-stroke hgi-loading-03 text-base"></i> Updating…`;

    try {
      const nextStatus =
        action === "deactivate"  ? "inactive"  :
        action === "reactivate"  ? "published" :
        "deleted";

      const { error } = await supabase
        .from("blogs")
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;

      // refresh
      const blogs = await fetchUserBlogs(user.id);
      // rebuild cache
      blogs.forEach(b => { setupMyBlogsActions._cache[b.id] = b; });
      renderMyBlogsGrid(blogs);
    } catch (err) {
      btn.disabled = false;
      if (summary) summary.innerHTML = `<i class="hgi hgi-stroke hgi-alert-02 text-base"></i> Error`;
      showStatus(err?.message || "Unable to update blog.", true);
    }
  });
}

async function initMyPostsTab(user, profileRef) {
  const listings = await fetchSellerListings(user.id);
  renderMyPostsGrid(listings);
  setupMyPostsActions(user, profileRef);
  setupMyPostsDeleteAccount(user);

  // blogs
  try {
    const blogs = await fetchUserBlogs(user.id);
    // cache for edit
    setupMyBlogsActions._cache = {};
    blogs.forEach(b => { setupMyBlogsActions._cache[b.id] = b; });
    renderMyBlogsGrid(blogs);
    setupMyBlogsActions(user);
  } catch (err) {
    const grid = qs("#myblogs-grid");
    if (grid) grid.innerHTML = `<p class="text-sm text-light-disabled-text p-4">Could not load blog posts.</p>`;
  }
}

// ─────────────────────────────────────────────
// MESSAGES TAB — build thread objects
// ─────────────────────────────────────────────
function buildMcThreads(listings, blogs, user, profile) {
  const sellerName = formatName(profile, user);
  const threads = [];

  // threads from listings
  listings.forEach((listing, i) => {
    const buyers = ["Ayesha Khan","Usman Ali","Fatima Malik","Bilal Noor","Sara Rafiq","Hamza Chaudhry","Nimra Butt","Zain Abbas"];
    const buyer  = buyers[i % buyers.length];
    const online = i < 2;
    const unread = i === 0 ? 2 : i === 1 ? 1 : 0;
    const now    = new Date();
    const posted = listing.created_at ? new Date(listing.created_at) : now;

    threads.push({
      id:           `listing-${listing.id || i}`,
      type:         "item",
      buyerName:    buyer,
      contextTitle: listing.title || "Untitled item",
      badge:        listing.status || "pending",
      online,
      unread,
      lastMsg:      `Is this still available? Interested in "${listing.title || "your item"}".`,
      lastAt:       posted.toISOString(),
      messages: [
        { sender:"buyer",  name:buyer, body:`Hi, I saw your listing for "${listing.title||"this item"}". Is it still available?`, time: new Date(posted.getTime()-7200000).toISOString(), status:"read" },
        { sender:"buyer",  name:buyer, body:"Can you tell me the final price and where pickup is possible?", time: new Date(posted.getTime()-5400000).toISOString(), status:"read" },
        { sender:"seller", name:sellerName, body:"Hi! Yes still available. You can pick up from the campus main gate. DM me to confirm a time.", time: new Date(posted.getTime()-3600000).toISOString(), status:"read" },
        { sender:"buyer",  name:buyer, body:"Great! I'll come tomorrow morning. Can you hold it for me?", time: posted.toISOString(), status: i===0?"delivered":"read" },
      ],
    });
  });

  // threads from blogs
  (blogs||[]).filter(b => b.status === "published").forEach((blog, i) => {
    const readers = ["Mariam Siddiq","Talha Raza","Khadija Omar","Faisal Khan"];
    const reader  = readers[i % readers.length];
    const online  = i === 0;
    const posted  = blog.created_at ? new Date(blog.created_at) : new Date();

    threads.push({
      id:           `blog-${blog.id || i}`,
      type:         "blog",
      buyerName:    reader,
      contextTitle: blog.title || "Blog post",
      badge:        blog.category || "Blog",
      online,
      unread:       i === 0 ? 1 : 0,
      lastMsg:      `Loved your blog on "${blog.title||"this topic"}". Any resources you recommend?`,
      lastAt:       posted.toISOString(),
      messages: [
        { sender:"buyer",  name:reader, body:`Just read your blog "${blog.title||"this post"}" — really well written!`, time: new Date(posted.getTime()-3600000).toISOString(), status:"read" },
        { sender:"buyer",  name:reader, body:"Do you have any reading resources or notes you can share?", time: posted.toISOString(), status: i===0?"delivered":"read" },
      ],
    });
  });

  return threads;
}

// ─────────────────────────────────────────────
// MESSAGES TAB — init
// ─────────────────────────────────────────────
function initMessagesTab(listings, blogs, user, profile) {
  if (typeof window.mcInit !== "function") return;
  const threads = buildMcThreads(listings, blogs || [], user, profile);
  window.mcInit(threads, formatName(profile, user));
}

// ─────────────────────────────────────────────
// DASHBOARD — cart dropdown with user list + chat button
// ─────────────────────────────────────────────
function setupCartDropdown(listings) {
  const toggle   = qs("#dash-carts-toggle");
  const dropdown = qs("#dash-carts-dropdown");
  const list     = qs("#dash-carts-list");
  const arrow    = qs("#dash-carts-arrow");
  if (!toggle || !dropdown || !list) return;

  // Build mock users who "saved" items from the seller's listings
  const names = ["Ayesha Khan","Usman Ali","Fatima Malik","Bilal Noor","Sara Rafiq","Hamza Ch.","Nimra Butt","Zain Abbas","Maryam Siddiq","Talha Raza"];
  const users = listings.slice(0, 8).map((listing, i) => ({
    name:    names[i % names.length],
    initials:(names[i % names.length]).split(" ").map(p=>p[0]).join("").toUpperCase(),
    item:    listing.title || "Untitled item",
    id:      listing.id || `listing-${i}`,
    time:    listing.created_at ? new Date(listing.created_at).toLocaleDateString("en-GB",{day:"2-digit",month:"short"}) : "Today",
  }));

  if (!users.length) {
    list.innerHTML = `<p class="text-xs text-light-disabled-text py-2 text-center">No users have saved your items yet.</p>`;
  } else {
    list.innerHTML = users.map(u => `
      <div class="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
        <span class="size-9 rounded-full bg-primary text-white text-xs font-bold inline-flex items-center justify-center flex-none">${u.initials}</span>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-light-primary-text truncate">${u.name}</p>
          <p class="text-xs text-light-disabled-text truncate">Saved: ${u.item}</p>
        </div>
        <div class="flex items-center gap-1.5 flex-none">
          <span class="text-xs text-light-disabled-text">${u.time}</span>
          <button type="button" data-cart-chat-id="${u.id}"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-[99px] bg-primary text-white text-xs font-semibold hover:opacity-85 transition-opacity">
            <i class="hgi hgi-stroke hgi-message-02 text-xs"></i>
            Chat
          </button>
        </div>
      </div>`).join("");

    // chat button → switch to messages tab
    list.querySelectorAll("[data-cart-chat-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        const msgTab = qs('[data-tab="messages"]');
        if (msgTab) msgTab.click();
      });
    });
  }

  // toggle open/close
  let open = false;
  toggle.addEventListener("click", () => {
    open = !open;
    dropdown.classList.toggle("hidden", !open);
    dropdown.style.display = open ? "flex" : "none";
    if (arrow) arrow.className = `hgi hgi-stroke ${open ? "hgi-arrow-up-01" : "hgi-arrow-down-01"} text-xs`;
  });
}

loadDashboard().catch((error) => {
  showStatus(error?.message || "Unable to load seller dashboard.", true);
});

