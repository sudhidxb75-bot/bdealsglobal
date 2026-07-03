/*
  Bdeals Global Properties - Frontend Script V1.3.3
  Backend connection fix:
  - Restored fallback countries and banners
  - Added complete page initialization
  - Added clearer backend error handling
  - Added dashboard and seller workflow initialization
*/

const SAMPLE_PROPERTIES = [
  {
    propertyCode: "BGP-1001",
    propertyType: "Apartment",
    locality: "Calicut City",
    area: "Kozhikode",
    sizeText: "3 BHK / 1450 sqft",
    publicPriceRange: "₹75 Lakhs - ₹85 Lakhs",
    description: "Well-connected apartment option near major facilities. Exact tower, seller details, and documents are available only after verification.",
    highlights: "Lift, Parking, Family location, Nearby shops",
    imageURL: "",
    featured: "Yes"
  },
  {
    propertyCode: "BGP-1002",
    propertyType: "Villa",
    locality: "Kunnamangalam Side",
    area: "Kozhikode",
    sizeText: "4 BHK / 2200 sqft",
    publicPriceRange: "₹1.15 Cr - ₹1.35 Cr",
    description: "Independent villa option in a residential area. Exact location and owner details are protected in the backend.",
    highlights: "Road access, Parking, Open well, Quiet area",
    imageURL: "",
    featured: "Yes"
  },
  {
    propertyCode: "BGP-1003",
    propertyType: "Land",
    locality: "Peringolam Area",
    area: "Kozhikode",
    sizeText: "10 to 20 cents",
    publicPriceRange: "Price on verified request",
    description: "Residential land option suitable for home construction. Survey number and ownership details are backend-protected.",
    highlights: "Residential zone, Road access, Good frontage",
    imageURL: "",
    featured: "No"
  }
];

const SAMPLE_BANNERS = [
  {
    bannerId: "BNR-1001",
    title: "Verified Properties. Genuine Buyers. Secure Deals.",
    subtitle: "Bdeals Global Properties connects buyers and sellers through a private mediator process.",
    badge: "Bdeals Global Properties",
    buttonText: "Browse Properties",
    buttonLink: "buy-property.html",
    imageURL: "",
    sortOrder: "1"
  },
  {
    bannerId: "BNR-1002",
    title: "Sell your property without exposing your contact details.",
    subtitle: "Submit property details privately. We verify, list limited information, and bring serious buyers.",
    badge: "Seller Privacy",
    buttonText: "List Your Property",
    buttonLink: "sell-property.html",
    imageURL: "",
    sortOrder: "2"
  },
  {
    bannerId: "BNR-1003",
    title: "Post your requirement and get verified options.",
    subtitle: "Our team will shortlist suitable properties and manage the next steps.",
    badge: "Buyer Support",
    buttonText: "Post Requirement",
    buttonLink: "post-requirement.html",
    imageURL: "",
    sortOrder: "3"
  }
];

const FALLBACK_COUNTRIES = [
  { countryCode: "IN", countryName: "India", phoneCode: "+91", currency: "INR" },
  { countryCode: "AE", countryName: "United Arab Emirates", phoneCode: "+971", currency: "AED" },
  { countryCode: "SA", countryName: "Saudi Arabia", phoneCode: "+966", currency: "SAR" },
  { countryCode: "QA", countryName: "Qatar", phoneCode: "+974", currency: "QAR" },
  { countryCode: "KW", countryName: "Kuwait", phoneCode: "+965", currency: "KWD" },
  { countryCode: "OM", countryName: "Oman", phoneCode: "+968", currency: "OMR" }
];

let allProperties = [];
let bannerSlides = [];
let currentBannerIndex = 0;
let bannerTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  initPWAInstall();

  loadCountries();
  initCountrySyncHandlers();
  applyIncomingPropertyFilters();
  syncSelectedCountryToSearch();
  initCustomerDashboard();
  initSellerDashboard();

  if (document.getElementById("homeBannerSlider")) {
    loadHomeBanners();
  }

  if (document.getElementById("propertyList") || document.getElementById("featuredProperties")) {
    loadPublicProperties();
  }

  if (document.getElementById("propertyDetails")) {
    loadPropertyDetailsPage();
  }

  if (document.getElementById("backendTestBox")) {
    initBackendTestPage();
  }
});

function getBackendUrl() {
  return (typeof APPS_SCRIPT_URL !== "undefined" ? String(APPS_SCRIPT_URL || "").trim() : "");
}

function isBackendConfigured() {
  return !!getBackendUrl();
}

async function apiGet(action, params = {}) {
  const base = getBackendUrl();

  if (!base) {
    throw new Error("Backend URL is missing. Paste the Apps Script Web App URL in js/config.js.");
  }

  const url = new URL(base);
  url.searchParams.set("action", action);
  url.searchParams.set("ts", Date.now().toString());

  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.set(key, params[key]);
    }
  });

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    redirect: "follow"
  });

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error("Backend returned non-JSON response. Check deployment access. Response: " + text.slice(0, 160));
  }
}

async function apiPost(payload) {
  const base = getBackendUrl();

  if (!base) {
    return {
      ok: false,
      message: "Backend URL is missing. Paste the Apps Script Web App URL in js/config.js."
    };
  }

  // Apps Script sometimes returns a Google HTML page for cross-origin POST.
  // This package uses a safer GET submit route: ?action=submit&formType=...
  const url = new URL(base);
  url.searchParams.set("action", "submit");
  url.searchParams.set("ts", Date.now().toString());

  Object.keys(payload || {}).forEach(key => {
    if (payload[key] !== undefined && payload[key] !== null) {
      url.searchParams.set(key, String(payload[key]));
    }
  });

  if (url.toString().length > 7500) {
    return {
      ok: false,
      message: "Submission data is too long. Please shorten description/photo URL fields and try again."
    };
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    redirect: "follow"
  });

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch (err) {
    const cleanText = text.replace(/\s+/g, " ").slice(0, 180);
    throw new Error(
      "Backend returned a Google HTML/error page instead of JSON. Redeploy Apps Script as Web App with Execute as: Me and Who has access: Anyone. Response: " + cleanText
    );
  }
}


function toggleMenu() {
  const menu = document.getElementById("mainMenu");
  if (menu) menu.classList.toggle("open");
}

/* Countries */
async function loadCountries() {
  const selects = document.querySelectorAll(".country-select");
  if (!selects.length) return;

  let countries = FALLBACK_COUNTRIES;

  if (isBackendConfigured()) {
    try {
      const data = await apiGet("countries");
      if (data.ok && Array.isArray(data.countries) && data.countries.length) {
        countries = data.countries;
      }
    } catch (err) {
      console.warn("Using fallback countries:", err.message);
    }
  }

  const savedCountry = localStorage.getItem("bgpSelectedCountry") || "";

  selects.forEach(select => {
    const current = select.value;
    const isTopSelector = select.id === "topCountrySelect";
    const isVisibleSearchSelector = select.classList.contains("visible-country-select");

    select.innerHTML = `<option value="">${isTopSelector ? "Country" : "Select Country"}</option>` + countries.map(c => {
      const code = safe(c.countryCode || c.CountryCode || "");
      const name = safe(c.countryName || c.CountryName || "");
      const phone = safe(c.phoneCode || c.PhoneCode || "");
      return `<option value="${code}">${name}${phone ? " (" + phone + ")" : ""}</option>`;
    }).join("");

    if (current) {
      select.value = current;
    } else if (savedCountry && (isTopSelector || isVisibleSearchSelector)) {
      select.value = savedCountry;
    }
  });

  syncSelectedCountryToSearch(savedCountry || getCurrentSelectedCountry());
}

function initCountrySyncHandlers() {
  document.addEventListener("change", event => {
    const target = event.target;
    if (!target) return;

    if (
      target.id === "topCountrySelect" ||
      target.id === "homeCountryFilter" ||
      target.id === "countryFilter"
    ) {
      setSelectedCountry(target.value || "", {
        sourceId: target.id,
        applyBuyFilter: true
      });
    }
  });
}

function handleTopCountryChange(countryCode) {
  setSelectedCountry(countryCode || "", {
    sourceId: "topCountrySelect",
    applyBuyFilter: true
  });
}

function getCurrentSelectedCountry() {
  return document.getElementById("topCountrySelect")?.value ||
         document.getElementById("homeCountryFilter")?.value ||
         document.getElementById("countryFilter")?.value ||
         localStorage.getItem("bgpSelectedCountry") ||
         "";
}

function setSelectedCountry(countryCode, options = {}) {
  const value = countryCode || "";
  localStorage.setItem("bgpSelectedCountry", value);
  syncSelectedCountryToSearch(value);

  if (options.applyBuyFilter && document.getElementById("propertyList")) {
    applyPropertyFilters();
  }
}

function syncSelectedCountryToSearch(countryCode) {
  const selected = countryCode || localStorage.getItem("bgpSelectedCountry") || "";

  [
    "topCountrySelect",
    "homeCountryFilter",
    "countryFilter"
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.value !== selected) {
      el.value = selected;
    }
  });
}

/* Banners */
async function loadHomeBanners() {
  bannerSlides = SAMPLE_BANNERS;

  if (isBackendConfigured()) {
    try {
      const data = await apiGet("publicBanners");
      if (data.ok && Array.isArray(data.banners) && data.banners.length) {
        bannerSlides = data.banners;
      }
    } catch (err) {
      console.warn("Using sample banners:", err.message);
    }
  }

  renderHomeBanners();
  startBannerAutoSlide();
}

function renderHomeBanners() {
  const slider = document.getElementById("homeBannerSlider");
  const dots = document.getElementById("bannerDots");
  if (!slider) return;

  slider.querySelectorAll(".banner-slide").forEach(slide => slide.remove());

  bannerSlides
    .sort((a, b) => Number(a.sortOrder || a.SortOrder || 0) - Number(b.sortOrder || b.SortOrder || 0))
    .forEach((banner, index) => {
      const b = normalizeBanner(banner);
      const slide = document.createElement("div");
      slide.className = `banner-slide ${index === 0 ? "active" : ""}`;
      if (b.imageURL) slide.setAttribute("style", `--banner-image:url('${b.imageURL}')`);
      slide.innerHTML = `
        <div class="banner-content">
          <span class="eyebrow">${safe(b.badge || "Bdeals Global Properties")}</span>
          <h2>${safe(b.title)}</h2>
          <p>${safe(b.subtitle)}</p>
          ${b.buttonText ? `<a class="btn primary" href="${safe(b.buttonLink || "#")}">${safe(b.buttonText)}</a>` : ""}
        </div>
      `;

      const prevButton = slider.querySelector(".banner-arrow.prev");
      slider.insertBefore(slide, prevButton);
    });

  if (dots) {
    dots.innerHTML = bannerSlides.map((_, index) => `
      <button class="banner-dot ${index === 0 ? "active" : ""}" type="button" onclick="goToBanner(${index})" aria-label="Go to banner ${index + 1}"></button>
    `).join("");
  }

  currentBannerIndex = 0;
}

function normalizeBanner(banner) {
  return {
    bannerId: banner.bannerId || banner.BannerID || "",
    badge: banner.badge || banner.Badge || "",
    title: banner.title || banner.Title || "Bdeals Global Properties",
    subtitle: banner.subtitle || banner.Subtitle || "",
    buttonText: banner.buttonText || banner.ButtonText || "",
    buttonLink: banner.buttonLink || banner.ButtonLink || "#",
    imageURL: banner.imageURL || banner.ImageURL || "",
    sortOrder: banner.sortOrder || banner.SortOrder || "0"
  };
}

function moveBanner(direction) {
  if (!bannerSlides.length) return;
  const nextIndex = (currentBannerIndex + direction + bannerSlides.length) % bannerSlides.length;
  goToBanner(nextIndex);
  startBannerAutoSlide();
}

function goToBanner(index) {
  const slider = document.getElementById("homeBannerSlider");
  if (!slider) return;

  const slides = slider.querySelectorAll(".banner-slide");
  const dots = document.querySelectorAll(".banner-dot");
  if (!slides.length) return;

  slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
  dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
  currentBannerIndex = index;
}

function startBannerAutoSlide() {
  if (bannerTimer) clearInterval(bannerTimer);
  if (!bannerSlides || bannerSlides.length <= 1) return;

  bannerTimer = setInterval(() => {
    moveBanner(1);
  }, 5000);
}


function goToBuyWithLocation() {
  const country = getCurrentSelectedCountry();
  const location = document.getElementById("homeLocationFilter")?.value || "";
  if (country) localStorage.setItem("bgpSelectedCountry", country);

  const params = new URLSearchParams();
  if (country) params.set("country", country);
  if (location) params.set("location", location);
  window.location.href = `buy-property.html${params.toString() ? "?" + params.toString() : ""}`;
}

function applyIncomingPropertyFilters() {
  const params = new URLSearchParams(window.location.search);
  const country = params.get("country") || "";
  const location = params.get("location") || "";

  if (country) {
    localStorage.setItem("bgpSelectedCountry", country);
  }

  const setWhenReady = () => {
    if (country) {
      setSelectedCountry(country, {
        sourceId: "url",
        applyBuyFilter: false
      });
    } else {
      syncSelectedCountryToSearch();
    }

    const locationEl = document.getElementById("locationFilter");
    if (locationEl && location) locationEl.value = location;

    if ((country || location) && document.getElementById("propertyList")) {
      setTimeout(() => applyPropertyFilters(), 250);
    }
  };

  setTimeout(setWhenReady, 600);
}

/* Properties */
async function loadPublicProperties() {
  allProperties = SAMPLE_PROPERTIES;

  if (isBackendConfigured()) {
    try {
      const data = await apiGet("publicProperties");
      if (data.ok && Array.isArray(data.properties) && data.properties.length) {
        allProperties = data.properties;
      }
    } catch (err) {
      console.warn("Using sample properties:", err.message);
    }
  }

  renderProperties("propertyList", allProperties);
  renderProperties(
    "featuredProperties",
    allProperties.filter(p => String(p.featured || p.Featured || "").toLowerCase() === "yes").slice(0, 3)
  );
}

function renderProperties(targetId, list) {
  const target = document.getElementById(targetId);
  if (!target) return;

  if (!list || !list.length) {
    target.innerHTML = `
      <div class="policy-card">
        <h3>No public properties found</h3>
        <p>Please post your requirement and our team will contact you.</p>
      </div>
    `;
    return;
  }

  target.innerHTML = list.map(property => {
    const p = normalizeProperty(property);
    const imageStyle = p.imageURL ? `style="--property-image:url('${p.imageURL}')"` : "";

    return `
      <article class="property-card" data-type="${p.propertyType.toLowerCase()}" data-search="${(p.propertyCode + " " + p.propertyType + " " + p.country + " " + p.location + " " + p.locality + " " + p.area + " " + p.sizeText + " " + p.publicPriceRange + " " + p.highlights).toLowerCase()}">
        <div class="property-img" ${imageStyle}></div>
        <div class="property-body">
          <span class="property-code">${p.propertyCode}</span>
          <h3>${p.propertyType} in ${p.locality || p.area || "Selected Area"}</h3>
          <p>${p.description || "Controlled listing. Full details are shared only through the platform after verification."}</p>
          <div class="property-meta">
            ${p.area ? `<span>${p.area}</span>` : ""}
            ${p.sizeText ? `<span>${p.sizeText}</span>` : ""}
            ${p.highlights ? `<span>${p.highlights.split(",")[0]}</span>` : ""}
          </div>
          <div class="price">${p.publicPriceRange}</div>
          <div class="hero-actions">
            <a class="btn primary" href="property-details.html?code=${encodeURIComponent(p.propertyCode)}">View Details</a>
            <button class="btn secondary" onclick="quickPropertyEnquiry('${p.propertyCode}')">Enquire</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function applyPropertyFilters() {
  const country = (document.getElementById("countryFilter")?.value || "").toLowerCase().trim();
  const location = (document.getElementById("locationFilter")?.value || "").toLowerCase().trim();
  const search = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
  const type = (document.getElementById("typeFilter")?.value || "").toLowerCase();

  const filtered = allProperties.filter(property => {
    const p = normalizeProperty(property);
    const fullText = `${p.propertyCode} ${p.propertyType} ${p.country} ${p.location} ${p.locality} ${p.area} ${p.sizeText} ${p.publicPriceRange} ${p.highlights}`.toLowerCase();
    const countryText = `${p.country} ${p.countryName}`.toLowerCase();
    const locationText = `${p.location} ${p.locality} ${p.area}`.toLowerCase();

    return (!country || countryText.includes(country)) &&
           (!location || locationText.includes(location)) &&
           (!search || fullText.includes(search)) &&
           (!type || p.propertyType.toLowerCase() === type);
  });

  renderProperties("propertyList", filtered);
}
function quickPropertyEnquiry(code) {
  const msg = `I am interested in property code ${code}. Please contact me with verified details.`;

  if (typeof WHATSAPP_NUMBER !== "undefined" && WHATSAPP_NUMBER && WHATSAPP_NUMBER !== "910000000000") {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  } else {
    window.location.href = `property-details.html?code=${encodeURIComponent(code)}#enquiry`;
  }
}

async function loadPropertyDetailsPage() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code") || "";
  const input = document.getElementById("enquiryPropertyCode");
  if (input) input.value = code;

  let property = SAMPLE_PROPERTIES.find(p => p.propertyCode === code);

  if (isBackendConfigured() && code) {
    try {
      const data = await apiGet("property", { code });
      if (data.ok && data.property) property = data.property;
    } catch (err) {
      console.warn("Property details using fallback:", err.message);
    }
  }

  const title = document.getElementById("propertyTitle");
  const box = document.getElementById("propertyDetails");

  if (!property) {
    if (title) title.textContent = "Property Not Found";
    if (box) {
      box.innerHTML = `
        <div>
          <h2>Property not found</h2>
          <p>Please go back to the property listing page or post your requirement.</p>
          <a class="btn primary" href="buy-property.html">Back to Listings</a>
        </div>
      `;
    }
    return;
  }

  const p = normalizeProperty(property);
  if (title) title.textContent = `${p.propertyType} in ${p.locality || p.area}`;

  const imageStyle = p.imageURL ? `style="--property-image:url('${p.imageURL}')"` : "";

  if (box) {
    box.innerHTML = `
      <div class="details-image" ${imageStyle}></div>
      <div>
        <span class="property-code">${p.propertyCode}</span>
        <h2>${p.propertyType} in ${p.locality || p.area}</h2>
        <div class="price">${p.publicPriceRange}</div>
        <div class="property-meta">
          ${p.area ? `<span>${p.area}</span>` : ""}
          ${p.sizeText ? `<span>${p.sizeText}</span>` : ""}
          ${p.highlights ? p.highlights.split(",").slice(0, 4).map(h => `<span>${safe(h.trim())}</span>`).join("") : ""}
        </div>
        <p>${p.description}</p>
        <div class="notice">
          Seller contact, exact address, documents, and negotiation information are protected. Submit interest to proceed through verification.
        </div>
      </div>
    `;
  }
}

function normalizeProperty(property) {
  return {
    propertyCode: safe(property.propertyCode || property.PropertyCode || ""),
    propertyType: safe(property.propertyType || property.PropertyType || "Property"),
    country: safe(property.country || property.Country || ""),
    countryName: safe(property.countryName || property.CountryName || ""),
    location: safe(property.location || property.Location || ""),
    locality: safe(property.locality || property.Locality || ""),
    area: safe(property.area || property.Area || ""),
    sizeText: safe(property.sizeText || property.SizeText || ""),
    publicPriceRange: safe(property.publicPriceRange || property.PublicPriceRange || "Price on request"),
    description: safe(property.description || property.Description || "Controlled public listing. Details are shared only after verification."),
    highlights: safe(property.highlights || property.Highlights || ""),
    imageURL: safe(property.imageURL || property.ImageURL || "")
  };
}
/* General forms */
async function submitMediatorForm(event) {
  event.preventDefault();

  const form = event.target;
  const status = form.querySelector(".form-status");
  const button = form.querySelector("button[type='submit']");
  const formType = form.dataset.formType || "contact";

  setFormStatus(status, "Sending details...", "success");
  if (button) button.disabled = true;

  const payload = Object.fromEntries(new FormData(form).entries());
  payload.formType = formType;
  payload.pageURL = window.location.href;
  payload.submittedAt = new Date().toISOString();

  try {
    const data = await apiPost(payload);

    if (data.ok) {
      form.reset();
      loadCountries();
      const backendNote = formatBackendSaveNote(data);
      setFormStatus(status, (data.message || "Submitted successfully. Our team will contact you shortly.") + backendNote, "success");
    } else {
      setFormStatus(status, data.message || "Submission failed. Please try again.", "error");
    }
  } catch (err) {
    console.error(err);
    setFormStatus(status, err.message || "Submission could not be completed. Check Apps Script deployment access and Web App URL.", "error");
  } finally {
    if (button) button.disabled = false;
  }
}

/* Customer auth */
async function customerSignup(event) {
  event.preventDefault();

  const form = event.target;
  const status = form.querySelector(".form-status");
  const button = form.querySelector("button[type='submit']");
  const payload = Object.fromEntries(new FormData(form).entries());
  payload.formType = "customerSignup";

  setFormStatus(status, "Creating account...", "success");
  if (button) button.disabled = true;

  try {
    const data = await apiPost(payload);

    if (data.ok) {
      localStorage.setItem("bgpCustomerSession", JSON.stringify(data.customer));
      window.location.href = "customer-dashboard.html";
    } else {
      setFormStatus(status, data.message || "Signup failed.", "error");
    }
  } catch (err) {
    setFormStatus(status, err.message || "Signup failed. Check backend deployment.", "error");
  } finally {
    if (button) button.disabled = false;
  }
}

async function customerLogin(event) {
  event.preventDefault();

  const form = event.target;
  const status = form.querySelector(".form-status");
  const button = form.querySelector("button[type='submit']");
  const payload = Object.fromEntries(new FormData(form).entries());
  payload.formType = "customerLogin";

  setFormStatus(status, "Logging in...", "success");
  if (button) button.disabled = true;

  try {
    const data = await apiPost(payload);

    if (data.ok) {
      localStorage.setItem("bgpCustomerSession", JSON.stringify(data.customer));
      window.location.href = "customer-dashboard.html";
    } else {
      setFormStatus(status, data.message || "Invalid login.", "error");
    }
  } catch (err) {
    setFormStatus(status, err.message || "Login failed. Check backend deployment.", "error");
  } finally {
    if (button) button.disabled = false;
  }
}

function getCustomerSession() {
  try {
    return JSON.parse(localStorage.getItem("bgpCustomerSession") || "null");
  } catch (err) {
    return null;
  }
}

function initCustomerDashboard() {
  const box = document.getElementById("customerProfileBox");
  if (!box) return;

  const session = getCustomerSession();

  if (!session) {
    box.innerHTML = `
      <p>Please login to access your customer dashboard.</p>
      <a class="btn primary" href="customer-login.html">Login / Signup</a>
    `;
    return;
  }

  const welcome = document.getElementById("customerWelcome");
  if (welcome) welcome.textContent = `Welcome, ${safe(session.name || "Customer")}`;

  box.innerHTML = `
    <div class="profile-line"><strong>Name</strong><span>${safe(session.name || "")}</span></div>
    <div class="profile-line"><strong>Phone</strong><span>${safe(session.phone || "")}</span></div>
    <div class="profile-line"><strong>Email</strong><span>${safe(session.email || "")}</span></div>
    <div class="profile-line"><strong>Country</strong><span>${safe(session.country || "")}</span></div>
    <div class="profile-line"><strong>Location</strong><span>${safe(session.location || "")}</span></div>
    <div class="referral-code-box">Referral Code: ${safe(session.referralCode || "")}</div>
  `;
}

function customerLogout() {
  localStorage.removeItem("bgpCustomerSession");
  window.location.href = "customer-login.html";
}

async function submitCustomerReferral(event) {
  event.preventDefault();

  const form = event.target;
  const status = form.querySelector(".form-status");
  const button = form.querySelector("button[type='submit']");
  const session = getCustomerSession();

  if (!session) {
    setFormStatus(status, "Please login before submitting referral.", "error");
    return;
  }

  const payload = Object.fromEntries(new FormData(form).entries());
  payload.formType = "customerReferral";
  payload.customerId = session.customerId || "";
  payload.referralCode = session.referralCode || "";
  payload.referrerName = session.name || "";
  payload.referrerPhone = session.phone || "";
  payload.referrerEmail = session.email || "";

  setFormStatus(status, "Submitting referral...", "success");
  if (button) button.disabled = true;

  try {
    const data = await apiPost(payload);

    if (data.ok) {
      form.reset();
      loadCountries();
      setFormStatus(status, data.message || "Referral submitted successfully.", "success");
    } else {
      setFormStatus(status, data.message || "Referral submission failed.", "error");
    }
  } catch (err) {
    setFormStatus(status, err.message || "Referral submission failed. Check backend deployment.", "error");
  } finally {
    if (button) button.disabled = false;
  }
}

/* Seller auth and dashboard */
async function sellerLogin(event) {
  event.preventDefault();

  const form = event.target;
  const status = form.querySelector(".form-status");
  const button = form.querySelector("button[type='submit']");
  const payload = Object.fromEntries(new FormData(form).entries());
  payload.formType = "sellerLogin";

  setFormStatus(status, "Logging in...", "success");
  if (button) button.disabled = true;

  try {
    const data = await apiPost(payload);

    if (data.ok) {
      localStorage.setItem("bgpSellerSession", JSON.stringify(data.seller));
      window.location.href = "seller-dashboard.html";
    } else {
      setFormStatus(status, data.message || "Invalid seller login.", "error");
    }
  } catch (err) {
    setFormStatus(status, err.message || "Seller login failed. Check backend deployment.", "error");
  } finally {
    if (button) button.disabled = false;
  }
}

function getSellerSession() {
  try {
    return JSON.parse(localStorage.getItem("bgpSellerSession") || "null");
  } catch (err) {
    return null;
  }
}

async function initSellerDashboard() {
  const profileBox = document.getElementById("sellerProfileBox");
  if (!profileBox) return;

  const session = getSellerSession();

  if (!session) {
    profileBox.innerHTML = `
      <p>Please login to access seller dashboard.</p>
      <a class="btn primary" href="seller-login.html">Seller Login</a>
    `;
    const propBox = document.getElementById("sellerPropertiesBox");
    if (propBox) propBox.innerHTML = "";
    return;
  }

  const welcome = document.getElementById("sellerWelcome");
  if (welcome) welcome.textContent = `Welcome, ${safe(session.name || "Seller")}`;

  profileBox.innerHTML = `
    <div class="profile-line"><strong>Seller ID</strong><span>${safe(session.sellerId || "")}</span></div>
    <div class="profile-line"><strong>Name</strong><span>${safe(session.name || "")}</span></div>
    <div class="profile-line"><strong>Phone</strong><span>${safe(session.phone || "")}</span></div>
    <div class="profile-line"><strong>Email</strong><span>${safe(session.email || "")}</span></div>
  `;

  await loadSellerProperties(session);
}

async function loadSellerProperties(session) {
  const propBox = document.getElementById("sellerPropertiesBox");
  if (!propBox) return;

  if (!isBackendConfigured()) {
    propBox.innerHTML = "Backend URL is missing. Paste the Apps Script Web App URL in js/config.js.";
    return;
  }

  try {
    const data = await apiGet("sellerProperties", {
      sellerId: session.sellerId || "",
      token: session.token || ""
    });

    if (!data.ok) {
      propBox.innerHTML = safe(data.message || "Unable to load seller properties.");
      return;
    }

    const properties = data.properties || [];

    if (!properties.length) {
      propBox.innerHTML = "<p>No properties found for this seller.</p>";
      return;
    }

    propBox.innerHTML = properties.map(p => `
      <div class="seller-property-row">
        <h3>${safe(p.propertyCode)} - ${safe(p.propertyType)}</h3>
        <p>${safe(p.locality || p.area || "")} | ${safe(p.sizeText || "")} | ${safe(p.publicPriceRange || "")}</p>
        <span class="status-pill">${safe(p.verificationStatus || "")}</span>
        <span class="status-pill">${safe(p.publicStatus || "")}</span>
        <span class="status-pill">${safe(p.status || "")}</span>
      </div>
    `).join("");
  } catch (err) {
    propBox.innerHTML = safe(err.message || "Unable to load seller properties. Check backend deployment.");
  }
}

function sellerLogout() {
  localStorage.removeItem("bgpSellerSession");
  window.location.href = "seller-login.html";
}

async function submitSellerDashboardProperty(event) {
  event.preventDefault();

  const form = event.target;
  const status = form.querySelector(".form-status");
  const button = form.querySelector("button[type='submit']");
  const session = getSellerSession();

  if (!session) {
    setFormStatus(status, "Please login as seller before submitting a property.", "error");
    return;
  }

  const payload = Object.fromEntries(new FormData(form).entries());
  payload.formType = "sellerDashboardProperty";
  payload.sellerId = session.sellerId || "";
  payload.token = session.token || "";

  setFormStatus(status, "Submitting property for admin approval...", "success");
  if (button) button.disabled = true;

  try {
    const data = await apiPost(payload);

    if (data.ok) {
      form.reset();
      loadCountries();
      setFormStatus(status, data.message || "Property submitted to admin for approval.", "success");
      await loadSellerProperties(session);
    } else {
      setFormStatus(status, data.message || "Submission failed.", "error");
    }
  } catch (err) {
    setFormStatus(status, err.message || "Property submission failed. Check backend deployment.", "error");
  } finally {
    if (button) button.disabled = false;
  }
}

/* Backend test page */
function initBackendTestPage() {
  const box = document.getElementById("backendTestBox");
  if (!box) return;

  const configured = isBackendConfigured();

  box.innerHTML = `
    <div class="dashboard-card">
      <h2>Backend URL Status</h2>
      <p>${configured ? "Backend URL found in js/config.js." : "Backend URL is missing in js/config.js."}</p>
      <p class="form-note">${configured ? safe(getBackendUrl()) : "Paste your Apps Script Web App URL in js/config.js first."}</p>
      <button class="btn primary" onclick="runBackendTests()">Run Backend Tests</button>
      <div id="backendTestResults" class="test-results"></div>
    </div>
  `;
}

async function runBackendTests() {
  const results = document.getElementById("backendTestResults");
  if (!results) return;

  const tests = [
    ["Ping", () => apiGet("ping")],
    ["Countries", () => apiGet("countries")],
    ["Public Banners", () => apiGet("publicBanners")],
    ["Public Properties", () => apiGet("publicProperties")],
    ["Submit Route", () => apiPost({ formType: "contact", name: "Backend Test", phone: "0000000000", email: "", country: "IN", location: "Test", purpose: "Backend Test", message: "Testing submit route from backend-test page" })],
    ["Debug Counts", () => apiGet("debugCounts")]
  ];

  results.innerHTML = "";

  for (const [name, fn] of tests) {
    try {
      const data = await fn();
      results.innerHTML += `<div class="test-ok">✓ ${safe(name)}: ${safe(JSON.stringify(data).slice(0, 500))}</div>`;
    } catch (err) {
      results.innerHTML += `<div class="test-error">✗ ${safe(name)}: ${safe(err.message)}</div>`;
    }
  }
}

function formatBackendSaveNote(data) {
  if (!data || !data.backend) return "";

  const b = data.backend;
  if (!b.saved) {
    return " Backend connection worked, but no saved row was reported. Check the Apps Script deployment and sheet permissions.";
  }

  return ` Saved to backend: ${b.targetSheet}, row ${b.targetRow}.`;
}


/* Helpers */
function setFormStatus(el, message, type) {
  if (!el) return;
  el.textContent = message;
  el.className = `form-status ${type}`;
}

function safe(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* PWA install option */
let deferredPWAInstallPrompt = null;

function initPWAInstall() {
  registerServiceWorker();
  if (isStandaloneMode()) document.body.classList.add("pwa-standalone");
  const installBtn = document.getElementById("pwaInstallBtn");
  if (installBtn) installBtn.classList.add("visible");

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredPWAInstallPrompt = event;
    showInstallButton();
  });

  window.addEventListener("appinstalled", () => {
    deferredPWAInstallPrompt = null;
    hideInstallButton();
    showPwaMessage("Bdeals Global Properties app installed successfully.");
  });

  // Show button on iOS too because iOS uses Share > Add to Home Screen.
  if (isIosDevice() || isStandaloneMode()) {
    showInstallButton();
  } else {
    setTimeout(() => {
      const btn = document.getElementById("pwaInstallBtn");
      if (btn && !deferredPWAInstallPrompt) btn.classList.add("visible");
    }, 1200);
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .then(reg => console.log("Service worker registered:", reg.scope))
      .catch(err => console.warn("Service worker registration failed:", err));
  });
}

function showInstallButton() {
  const btn = document.getElementById("pwaInstallBtn");
  if (btn) btn.classList.add("visible");
}

function hideInstallButton() {
  const btn = document.getElementById("pwaInstallBtn");
  if (btn) btn.classList.add("visible");
}

async function installPWA() {
  if (isStandaloneMode()) {
    showPwaMessage("The app is already installed.");
    return;
  }

  if (deferredPWAInstallPrompt) {
    deferredPWAInstallPrompt.prompt();
    const result = await deferredPWAInstallPrompt.userChoice;
    deferredPWAInstallPrompt = null;

    if (result.outcome === "accepted") {
      hideInstallButton();
    }
    return;
  }

  if (isIosDevice()) {
    showPwaMessage("To install on iPhone or iPad: tap Share, then choose Add to Home Screen.");
    return;
  }

  showPwaMessage("To install: open the browser menu and choose Install app or Add to Home screen.");
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function showPwaMessage(message) {
  let box = document.getElementById("pwaInstallMessage");

  if (!box) {
    box = document.createElement("div");
    box.id = "pwaInstallMessage";
    box.className = "pwa-install-message";
    document.body.appendChild(box);
  }

  box.innerHTML = `
    <div>
      <strong>Install App</strong>
      <p>${safe(message)}</p>
      <button type="button" onclick="closePwaMessage()">OK</button>
    </div>
  `;
  box.classList.add("show");
}

function closePwaMessage() {
  const box = document.getElementById("pwaInstallMessage");
  if (box) box.classList.remove("show");
}


function verifyCountrySyncState() {
  return {
    savedCountry: localStorage.getItem("bgpSelectedCountry") || "",
    topCountry: document.getElementById("topCountrySelect")?.value || "",
    homeCountry: document.getElementById("homeCountryFilter")?.value || "",
    buyCountry: document.getElementById("countryFilter")?.value || "",
    hasPropertyList: !!document.getElementById("propertyList")
  };
}
