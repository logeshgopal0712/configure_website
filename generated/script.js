const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.querySelector("#mobile-menu");

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) {
      return;
    }
    event.preventDefault();
    document.body.dataset.navigationTarget = target.id;
    window.clearTimeout(window.navigationTargetTimer);
    window.navigationTargetTimer = window.setTimeout(() => {
      if (document.body.dataset.navigationTarget === target.id) {
        delete document.body.dataset.navigationTarget;
        window.dispatchEvent(new Event("scroll"));
      }
    }, 1500);
    document
      .querySelectorAll(".desktop-nav a, .mobile-nav a")
      .forEach((item) => {
        item.classList.toggle(
          "active",
          item.getAttribute("href") === link.getAttribute("href"),
        );
      });
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

function updateCarouselControls(carousel) {
  const track = carousel.querySelector("[data-carousel-track]");
  const previous = carousel.querySelector('[data-carousel-direction="-1"]');
  const next = carousel.querySelector('[data-carousel-direction="1"]');
  if (!track || !previous || !next) return;
  const maximumScroll = Math.max(0, track.scrollWidth - track.clientWidth);
  previous.disabled = track.scrollLeft <= 2;
  next.disabled = track.scrollLeft >= maximumScroll - 2;
}

function initializeCarousels() {
  document.querySelectorAll("[data-carousel]").forEach(updateCarouselControls);
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-carousel-direction]");
  if (button && !button.disabled) {
    const carousel = button.closest("[data-carousel]");
    const track = carousel.querySelector("[data-carousel-track]");
    const firstItem = track.firstElementChild;
    const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
    const distance = (firstItem?.getBoundingClientRect().width || track.clientWidth) + gap;
    const maximumScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const target = Math.max(
      0,
      Math.min(
        maximumScroll,
        track.scrollLeft +
          distance * Number(button.dataset.carouselDirection),
      ),
    );
    track.scrollTo({
      left: target,
      behavior: "smooth",
    });
    window.setTimeout(() => updateCarouselControls(carousel), 350);
  }
});

document.addEventListener(
  "scroll",
  (event) => {
    if (event.target.matches?.("[data-carousel-track]")) {
      updateCarouselControls(event.target.closest("[data-carousel]"));
    }
  },
  true,
);

window.addEventListener("resize", initializeCarousels);

function closeGalleryLightbox() {
  document.querySelector("#gallery-lightbox")?.remove();
  document.body.classList.remove("lightbox-open");
}

function openGalleryLightbox(source, alt) {
  const imageUrl = String(source || "").trim();
  if (!imageUrl) return;
  closeGalleryLightbox();
  const lightbox = document.createElement("div");
  lightbox.id = "gallery-lightbox";
  lightbox.className = "gallery-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Gallery image preview");

  const closeButton = document.createElement("button");
  closeButton.className = "gallery-lightbox-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close image preview");
  closeButton.textContent = "×";

  const image = document.createElement("img");
  image.src = imageUrl;
  image.alt = alt || "Gallery image";
  lightbox.append(closeButton, image);
  document.body.append(lightbox);
  document.body.classList.add("lightbox-open");
  closeButton.focus();
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-gallery-open]");
  if (trigger) {
    const image = trigger.querySelector("img");
    openGalleryLightbox(trigger.dataset.gallerySrc || image?.src, image?.alt);
    return;
  }
  if (
    event.target.matches("#gallery-lightbox, .gallery-lightbox-close")
  ) {
    closeGalleryLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeGalleryLightbox();
});

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-contact-action]");
  if (button) {
    if (
      button.dataset.contactAction === "call" &&
      window.matchMedia("(hover: none) and (pointer: coarse)").matches
    ) {
      window.location.href = button.dataset.contactHref;
      return;
    }

    const details = document.querySelector(
      `#${button.getAttribute("aria-controls")}`,
    );
    const willOpen = details.hidden;
    document.querySelectorAll(".contact-action-details").forEach((item) => {
      item.hidden = true;
    });
    document.querySelectorAll("[data-contact-action]").forEach((item) => {
      item.setAttribute("aria-expanded", "false");
    });
    details.hidden = !willOpen;
    button.setAttribute("aria-expanded", String(willOpen));
    return;
  }

  const copyButton = event.target.closest("[data-copy-value]");
  if (copyButton) {
    const value = copyButton.dataset.copyValue;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const field = document.createElement("textarea");
      field.value = value;
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    const originalText = copyButton.textContent;
    copyButton.textContent = "Copied";
    window.setTimeout(() => {
      copyButton.textContent = originalText;
    }, 1400);
  }
});

if (menuButton && mobileMenu) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    mobileMenu.hidden = isOpen;
  });

  mobileMenu.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      menuButton.setAttribute("aria-expanded", "false");
      mobileMenu.hidden = true;
    }
  });
}

function initializeReviewForms() {
  document.querySelectorAll("[data-review-form]").forEach((form) => {
    if (form.dataset.reviewReady === "true") return;
    form.dataset.reviewReady = "true";
    const subjectFields = form.querySelectorAll("[data-review-subject]");
    form.querySelectorAll('input[name="stars"]').forEach((field) => {
      field.addEventListener("change", () => {
        const subject = `New ${field.value}-star customer review for ${form.dataset.company}`;
        subjectFields.forEach((subjectField) => {
          subjectField.value = subject;
        });
      });
    });
  });
}

const web3FormsCaptchaSiteKey = "50b2fe65-b00b-4b9e-ad62-3ba471098be2";
const captchaWidgetIds = new WeakMap();

function loadWeb3FormsCaptcha() {
  if (!document.querySelector(".h-captcha")) return Promise.resolve();
  const existing = document.querySelector(
    'script[src*="js.hcaptcha.com/1/api.js"]',
  );
  if (existing) {
    return existing.dataset.loaded === "true"
      ? Promise.resolve()
      : new Promise((resolve, reject) => {
          existing.addEventListener("load", resolve, { once: true });
          existing.addEventListener("error", reject, { once: true });
        });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://js.hcaptcha.com/1/api.js?recaptchacompat=off&render=explicit";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });
    script.addEventListener("error", () => {
      reject(new Error("Could not load the CAPTCHA service."));
    });
    document.head.append(script);
  });
}

function initializeCaptchaForms() {
  document.querySelectorAll(".h-captcha").forEach((captcha) => {
    const form = captcha.closest("form");
    if (!form || form.dataset.captchaReady === "true") return;
    const widgetId = window.hcaptcha.render(captcha, {
      sitekey: web3FormsCaptchaSiteKey,
    });
    captchaWidgetIds.set(captcha, widgetId);
    form.dataset.captchaReady = "true";
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (
        form.dataset.formKind === "review" &&
        !form.querySelector('input[name="stars"]:checked')
      ) {
        showFormToast("Please select a star rating before submitting.", true);
        return;
      }
      const response = form.querySelector(
        'textarea[name="h-captcha-response"]',
      );
      if (!response?.value) {
        showFormToast("Please complete the CAPTCHA before submitting.", true);
        return;
      }
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton?.textContent;
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Submitting…";
      }
      let submissionAttempted = false;
      try {
        submissionAttempted = true;
        const result = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        const responseText = await result.text();
        let responseData = {};
        if (responseText) {
          try {
            responseData = JSON.parse(responseText);
          } catch {
            responseData = {};
          }
        }
        if (!result.ok || responseData.success === false) {
          throw new Error(
            responseData.message || "The form could not be submitted.",
          );
        }
        form.reset();
        showFormToast("Thank you. Your submission was sent successfully.");
      } catch (error) {
        showFormToast(error.message || "The form could not be submitted.", true);
      } finally {
        if (submissionAttempted) {
          try {
            window.hcaptcha.reset(captchaWidgetIds.get(captcha));
          } catch (resetError) {
            console.error("Could not reset CAPTCHA.", resetError);
          }
        }
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        }
      }
    });
  });
}

function showFormToast(message, isError = false) {
  let toast = document.querySelector("#form-status-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "form-status-toast";
    toast.className = "form-status-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.append(toast);
  }
  toast.textContent = message;
  toast.classList.toggle("error", isError);
  toast.classList.add("visible");
  window.clearTimeout(window.formToastTimer);
  window.formToastTimer = window.setTimeout(() => {
    toast.classList.remove("visible");
  }, 4200);
}

async function initializeWeb3FormsCaptcha() {
  try {
    await loadWeb3FormsCaptcha();
    initializeCaptchaForms();
  } catch (error) {
    document.querySelectorAll(".captcha-field").forEach((field) => {
      field.textContent = error.message;
      field.classList.add("data-status", "error");
    });
  }
}

function updateCopyrightYears() {
  const copyrightYears = document.querySelector("#copyright-years");
  if (!copyrightYears) return;
  const currentYear = new Date().getFullYear();
  const startYear = Number(copyrightYears.dataset.startYear);
  copyrightYears.textContent =
    startYear < currentYear ? `${startYear}–${currentYear}` : String(currentYear);
}

updateCopyrightYears();
initializeCarousels();
initializeReviewForms();
initializeWeb3FormsCaptcha();


function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character],
  );
}

async function loadJson(path) {
  if (window.location.protocol === "file:") {
    throw new Error(
      "Open this website through start.command or a web host to load JSON data.",
    );
  }
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not load ${path} (${response.status}).`);
  }
  return response.json();
}

function safeHttpUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function safeAssetUrl(value) {
  if (!value) return "";
  if (
    typeof value === "string" &&
    /^data:image\/(?:png|jpeg|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(value)
  ) {
    return value;
  }
  try {
    const url = new URL(value, window.location.href);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

let currentCompanyData = null;
let currentSiteData = null;

function companyInitials(companyName) {
  return String(companyName)
    .match(/[A-Za-z0-9]+/g)
    ?.slice(0, 3)
    .map((word) => word[0].toUpperCase())
    .join("") || "CO";
}

function applyCompanyData(company) {
  if (!company || typeof company !== "object" || Array.isArray(company)) {
    throw new Error("company.json must contain a company object.");
  }
  const companyName = String(company.companyName || "").trim();
  if (!companyName) {
    throw new Error("company.json must include companyName.");
  }
  currentCompanyData = company;

  document.querySelectorAll("[data-company-name]").forEach((element) => {
    element.textContent = companyName;
  });
  document.querySelectorAll("[data-company-tagline]").forEach((element) => {
    element.textContent = String(company.tagline || "");
  });
  document.querySelectorAll("[data-company-description]").forEach((element) => {
    element.textContent = String(company.description || "");
  });
  document.querySelectorAll("[data-company-about]").forEach((element) => {
    element.textContent = String(company.about || "");
  });

  const logoUrl = safeAssetUrl(company.image_src || company.image_path);
  document.body.dataset.logoDisplay = logoUrl ? "image" : "text";
  const initials = companyInitials(companyName);
  document.querySelectorAll("[data-company-logo-slot]").forEach((slot) => {
    const variant = slot.dataset.logoVariant;
    slot.replaceChildren();
    if (logoUrl) {
      const image = document.createElement("img");
      image.src = logoUrl;
      image.alt = `${companyName} logo`;
      if (variant === "hero") {
        const wrapper = document.createElement("div");
        wrapper.className = "hero-image-wrap";
        wrapper.append(image);
        slot.append(wrapper);
      } else {
        slot.append(image);
      }
      return;
    }
    if (variant === "hero") {
      const monogram = document.createElement("div");
      monogram.className = "hero-monogram";
      monogram.setAttribute("aria-hidden", "true");
      const text = document.createElement("span");
      text.textContent = initials;
      monogram.append(text);
      slot.append(monogram);
    } else {
      const mark = document.createElement("span");
      mark.className = "brand-mark";
      mark.setAttribute("aria-hidden", "true");
      mark.textContent = initials;
      slot.append(mark);
    }
  });

  document.querySelectorAll(".brand").forEach((brand) => {
    brand.setAttribute("aria-label", `${companyName} home`);
  });
  document.querySelectorAll("[data-review-form]").forEach((form) => {
    form.dataset.company = companyName;
  });
  document.querySelectorAll('[data-company-subject="contact"]').forEach((field) => {
    field.value = `New contact request for ${companyName}`;
  });
  document.querySelectorAll('[data-company-subject="review"]').forEach((field) => {
    const form = field.closest("form");
    const rating = form?.querySelector('input[name="stars"]:checked')?.value;
    field.value = rating
      ? `New ${rating}-star customer review for ${companyName}`
      : `New customer review for ${companyName}`;
  });
  document
    .querySelectorAll("[data-company-appointment-title]")
    .forEach((frame) => {
      frame.title = `Schedule an appointment with ${companyName}`;
    });

  const startYear = Number(company.yearStarted);
  const copyrightYears = document.querySelector("#copyright-years");
  if (copyrightYears && Number.isInteger(startYear)) {
    copyrightYears.dataset.startYear = String(startYear);
    updateCopyrightYears();
  }
  const pageTitle = document.body.dataset.pageTitle;
  document.title =
    document.body.dataset.page === "index"
      ? companyName
      : `${pageTitle} | ${companyName}`;
  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.content = String(company.description || "");
  }
}

function normalizeHexColor(value) {
  const color = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : "";
}

function mixHexColor(color, target, amount) {
  const sourceValue = Number.parseInt(color.slice(1), 16);
  const targetValue = Number.parseInt(target.slice(1), 16);
  const channels = [16, 8, 0].map((shift) => {
    const source = (sourceValue >> shift) & 255;
    const destination = (targetValue >> shift) & 255;
    return Math.round(source + (destination - source) * amount);
  });
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function contrastHexColor(color) {
  const value = Number.parseInt(color.slice(1), 16);
  const channels = [16, 8, 0].map((shift) => {
    const channel = ((value >> shift) & 255) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance =
    channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  return luminance > 0.48 ? "#172238" : "#ffffff";
}

function rgbaHexColor(color, percentage) {
  const alpha = Math.max(0, Math.min(100, percentage)) / 100;
  const value = Number.parseInt(color.slice(1), 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function blendHexColors(color, background, percentage) {
  return mixHexColor(background, color, Math.max(0, Math.min(100, percentage)) / 100);
}

const templateFonts = {
  modern: {
    url: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@700;800&display=swap",
    body: '"DM Sans", sans-serif',
    heading: '"Manrope", sans-serif',
  },
  clean: {
    url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
    body: '"Inter", sans-serif',
    heading: '"Inter", sans-serif',
  },
  classic: {
    url: "https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap",
    body: '"Source Sans 3", sans-serif',
    heading: '"Lora", serif',
  },
};

function applyTemplateData(template) {
  if (!template || typeof template !== "object" || Array.isArray(template)) {
    throw new Error("template.json must contain a template object.");
  }
  const templateId = String(template.templateId || "");
  if (["logo-left", "logo-right", "centered"].includes(templateId)) {
    document.body.dataset.template = templateId;
  }
  const primary = normalizeHexColor(template.primaryColor);
  const secondary = normalizeHexColor(template.secondaryColor);
  const headerTextColor =
    template.headerTextColor === "dark" ? "dark" : "light";
  const root = document.documentElement.style;
  document.body.dataset.headerText = headerTextColor;
  if (primary) {
    root.setProperty("--brand", primary);
    root.setProperty("--brand-dark", mixHexColor(primary, "#000000", 0.22));
    root.setProperty("--brand-light", mixHexColor(primary, "#ffffff", 0.38));
    root.setProperty("--on-brand", contrastHexColor(primary));
  }
  if (secondary) {
    root.setProperty("--secondary", secondary);
    root.setProperty(
      "--secondary-dark",
      mixHexColor(secondary, "#000000", 0.24),
    );
    root.setProperty(
      "--secondary-light",
      mixHexColor(secondary, "#ffffff", 0.36),
    );
    root.setProperty("--on-secondary", contrastHexColor(secondary));
  }

  const usePageBackground = template.usePageColor === true;
  const pageColor =
    normalizeHexColor(template.pageColor) || "#fbfaf7";
  const transparent = template.transparentPageColor === true;
  const opacityValue = Number(template.pageColorOpacity);
  const opacity = Number.isFinite(opacityValue)
    ? Math.max(10, Math.min(100, opacityValue))
    : 70;
  const paper = usePageBackground
    ? transparent
      ? rgbaHexColor(pageColor, opacity)
      : pageColor
    : "#fbfaf7";
  const contrastBackground =
    usePageBackground && transparent
      ? blendHexColors(pageColor, secondary || "#172238", opacity)
      : usePageBackground
        ? pageColor
        : "#fbfaf7";
  root.setProperty("--paper", paper);
  root.setProperty("--on-page", contrastHexColor(contrastBackground));
  root.setProperty(
    "--page-blur",
    usePageBackground && transparent ? "18px" : "0px",
  );
  document.body.style.background =
    usePageBackground && transparent
      ? `radial-gradient(circle at 12% 28%, color-mix(in srgb, var(--brand) 48%, transparent), transparent 30rem), radial-gradient(circle at 88% 72%, color-mix(in srgb, var(--secondary-light) 45%, transparent), transparent 34rem), linear-gradient(135deg, var(--secondary-dark), var(--secondary), var(--brand-dark))`
      : paper;

  const backgroundImage = safeAssetUrl(
    template.background_image_src || template.background_image_path,
  );
  document.body.dataset.headerImage = String(Boolean(backgroundImage));
  if (backgroundImage) {
    root.setProperty(
      "--on-secondary",
      headerTextColor === "dark" ? "#111827" : "#ffffff",
    );
  }
  const heroBackground = backgroundImage
    ? `url("${backgroundImage.replaceAll('"', '\\"')}") center center / cover no-repeat`
    : "radial-gradient(circle at 82% 42%, color-mix(in srgb, var(--brand) 28%, transparent), transparent 26rem), linear-gradient(135deg, var(--secondary-dark), var(--secondary) 58%, var(--secondary-dark))";
  root.setProperty("--hero-background", heroBackground);

  const sectionOrder = [
    "about",
    "services",
    "gallery",
    "contact",
    "reviews",
    "appointment",
  ];
  const enabledSections =
    template.sections && typeof template.sections === "object"
      ? template.sections
      : {};
  document.querySelectorAll("[data-section-link]").forEach((link) => {
    const sectionName = link.dataset.sectionLink;
    link.hidden =
      sectionName !== "index" && enabledSections[sectionName] === false;
  });
  const homeSections = document.querySelector("#home-sections");
  if (homeSections) {
    homeSections.dataset.pages = sectionOrder
      .filter((sectionName) => enabledSections[sectionName] !== false)
      .map((sectionName) => `${sectionName}.html`)
      .join(",");
  }
  document.querySelectorAll("[data-services-heading]").forEach((heading) => {
    heading.textContent = String(template.servicesHeading || "What we offer");
  });
  document.querySelectorAll("#service-list").forEach((list) => {
    const horizontal = template.servicesLayout === "horizontal";
    list.classList.toggle("horizontal-services", horizontal);
    list.classList.toggle("vertical-services", !horizontal);
  });
  const appointmentUrl = safeHttpUrl(template.appointmentUrl);
  document
    .querySelectorAll("[data-company-appointment-title]")
    .forEach((frame) => {
      frame.src = appointmentUrl || "about:blank";
    });

  const font = templateFonts[String(template.font || "")];
  if (font) {
    let fontLink = document.querySelector("[data-runtime-font]");
    if (!fontLink) {
      fontLink = document.createElement("link");
      fontLink.rel = "stylesheet";
      fontLink.dataset.runtimeFont = "";
      document.head.append(fontLink);
    }
    fontLink.href = font.url;
    document.body.style.fontFamily = font.body;
    root.setProperty("--heading-font", font.heading);
  }
}

function updateFormSettings(kind, settings) {
  const endpoint = safeHttpUrl(settings?.formEndpoint);
  const accessKey = String(settings?.accessKey || "").trim();
  const isWeb3Forms =
    endpoint &&
    new URL(endpoint).hostname.toLowerCase().replace(/^www\./, "") ===
      "api.web3forms.com";
  const configured = Boolean(endpoint && (!isWeb3Forms || accessKey));
  document
    .querySelectorAll(`[data-form-kind="${kind}"]`)
    .forEach((form) => {
      form.hidden = !configured;
      const container = form.closest("[data-form-container]");
      if (container) container.hidden = !configured;
      if (endpoint) form.action = endpoint;
      let accessKeyField = form.querySelector("[data-form-access-key]");
      if (!accessKeyField && accessKey) {
        accessKeyField = document.createElement("input");
        accessKeyField.type = "hidden";
        accessKeyField.name = "access_key";
        accessKeyField.dataset.formAccessKey = "";
        form.prepend(accessKeyField);
      }
      if (accessKeyField) accessKeyField.value = accessKey;
    });
  return configured;
}

function safeEmail(value) {
  const email = String(value || "").trim();
  return email && !/[\r\n]/.test(email) ? email : "";
}

function applyContactData(contact) {
  if (!contact || typeof contact !== "object" || Array.isArray(contact)) {
    throw new Error("contact.json must contain a contact object.");
  }
  const formEnabled = updateFormSettings("contact", contact);
  const email = safeEmail(contact.email);
  const phone = String(contact.phone || "").trim();
  const phoneHref = phone.replace(/[^+\d]/g, "");
  const address = String(contact.address || "").trim();
  document.querySelectorAll("[data-contact-heading]").forEach((heading) => {
    heading.textContent = formEnabled ? "Send us a message" : "Contact us";
  });
  document.querySelectorAll("[data-contact-copy]").forEach((copy) => {
    copy.textContent = formEnabled
      ? "Tell us what you need and we will get back to you with the next steps."
      : "Use the contact details below to get in touch.";
  });

  document.querySelectorAll("[data-contact-details]").forEach((list) => {
    list.replaceChildren();
    if (email) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = `mailto:${email}`;
      link.textContent = email;
      item.append(link);
      list.append(item);
    }
    if (phone && phoneHref) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = `tel:${phoneHref}`;
      link.textContent = phone;
      item.append(link);
      list.append(item);
    }
    if (address) {
      const item = document.createElement("li");
      item.textContent = address;
      list.append(item);
    }
    list.hidden = list.childElementCount === 0;
  });

  document
    .querySelectorAll('[data-contact-action-container="call"]')
    .forEach((container) => {
      const visible = Boolean(contact.showCall && phone && phoneHref);
      container.hidden = !visible;
      const button = container.querySelector("[data-contact-action]");
      const link = container.querySelector(".contact-action-details a");
      const copy = container.querySelector("[data-copy-value]");
      if (button) {
        button.dataset.contactValue = phone;
        button.dataset.contactHref = `tel:${phoneHref}`;
      }
      if (link) {
        link.href = `tel:${phoneHref}`;
        link.textContent = phone;
      }
      if (copy) copy.dataset.copyValue = phone;
    });

  document
    .querySelectorAll('[data-contact-action-container="email"]')
    .forEach((container) => {
      const visible = Boolean(contact.showEmail && email);
      container.hidden = !visible;
      const link = container.querySelector(".contact-action-details a");
      const copy = container.querySelector("[data-copy-value]");
      if (link) {
        link.href = `mailto:${email}`;
        link.textContent = email;
      }
      if (copy) copy.dataset.copyValue = email;
    });
}

function applySocialMediaData(social) {
  if (!social || typeof social !== "object" || Array.isArray(social)) {
    throw new Error("socialMedia.json must contain a social media object.");
  }
  document.querySelectorAll("[data-social-platform]").forEach((link) => {
    const url = safeHttpUrl(social[link.dataset.socialPlatform]);
    link.hidden = !url;
    if (url) link.href = url;
  });
}

function updateSocialStripVisibility() {
  document.querySelectorAll("[data-social-location]").forEach((strip) => {
    const actions = strip.querySelector(".social-strip-track");
    strip.hidden = ![...actions.children].some((item) => !item.hidden);
  });
}

function applyRuntimeSettings(siteData) {
  const social = siteData.socialMedia || {};
  const contact = siteData.contact || {};
  const review = siteData.reviewSettings || {};
  const template = {
    ...(siteData.template || {}),
    appointmentUrl: siteData.appointment?.url || "",
  };
  applySocialMediaData(social);
  applyContactData(contact);
  updateFormSettings("review", review);
  applyTemplateData(template);
  updateSocialStripVisibility();
}

function youtubeEmbedUrl(value) {
  const safeUrl = safeHttpUrl(value);
  if (!safeUrl) return "";
  const url = new URL(safeUrl);
  const host = url.hostname.replace(/^www\./, "");
  let videoId = "";
  if (host === "youtu.be") {
    videoId = url.pathname.split("/").filter(Boolean)[0] || "";
  } else if (["youtube.com", "m.youtube.com"].includes(host)) {
    if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v") || "";
    } else if (
      url.pathname.startsWith("/embed/") ||
      url.pathname.startsWith("/shorts/")
    ) {
      videoId = url.pathname.split("/").filter(Boolean)[1] || "";
    }
  }
  return /^[A-Za-z0-9_-]{6,20}$/.test(videoId)
    ? `https://www.youtube-nocookie.com/embed/${videoId}`
    : "";
}

function renderServiceMedia(service) {
  const video = safeHttpUrl(service.video);
  const youtube = youtubeEmbedUrl(video);
  if (youtube) {
    return `<div class="service-media service-video"><iframe src="${escapeHtml(youtube)}" title="${escapeHtml(service.title)} video" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
  }
  const host = video ? new URL(video).hostname : "";
  if (video && (host.endsWith("facebook.com") || host.endsWith("fb.watch"))) {
    const embed = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(video)}&show_text=false`;
    return `<div class="service-media service-video"><iframe src="${escapeHtml(embed)}" title="${escapeHtml(service.title)} video" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`;
  }
  if (video) {
    const path = new URL(video).pathname.toLowerCase();
    if ([".mp4", ".webm", ".ogg", ".mov", ".m4v"].some((extension) => path.endsWith(extension))) {
      return `<div class="service-media service-video"><video src="${escapeHtml(video)}" controls preload="metadata" playsinline title="${escapeHtml(service.title)} video"></video></div>`;
    }
    return `<div class="service-media service-video"><iframe src="${escapeHtml(video)}" title="${escapeHtml(service.title)} video" loading="lazy" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
  }
  const image = safeAssetUrl(service.image_src || service.image_path);
  return image
    ? `<div class="service-media"><img src="${escapeHtml(image)}" alt="${escapeHtml(service.title)}" loading="lazy" /></div>`
    : "";
}

async function renderServices(services = currentSiteData?.services) {
  const list = document.querySelector("#service-list");
  const status = document.querySelector("#services-status");
  if (!list) return;
  try {
    if (!Array.isArray(services)) throw new Error("services.json must contain a list.");
    list.innerHTML = services
      .map((service, index) => {
        const titleOnly =
          Boolean(String(service.title || "").trim()) &&
          ![
            service.description,
            service.price,
            service.link,
            service.paymentLink,
            service.image_src,
            service.image_path,
            service.video,
          ].some(Boolean);
        const hasFooter =
          Boolean(service.price) ||
          Boolean(safeHttpUrl(service.link)) ||
          Boolean(safeHttpUrl(service.paymentLink));
        return `
          <article class="service-card${titleOnly ? " compact-service-card" : ""}">
            ${renderServiceMedia(service)}
            <div class="service-card-content">
              <span class="service-number">${String(index + 1).padStart(2, "0")}</span>
              <h3>${escapeHtml(service.title)}</h3>
              ${service.description ? `<p>${escapeHtml(service.description)}</p>` : ""}
              ${hasFooter ? `<div class="service-card-footer">
                ${service.price ? `<strong class="service-price">${escapeHtml(service.price)}</strong>` : ""}
                ${
                  safeHttpUrl(service.link)
                    ? `<a class="service-link" href="${escapeHtml(safeHttpUrl(service.link))}" target="_blank" rel="noopener noreferrer">View offering <span aria-hidden="true">↗</span></a>`
                    : ""
                }
                ${
                  safeHttpUrl(service.paymentLink)
                    ? `<a class="service-payment-link" href="${escapeHtml(safeHttpUrl(service.paymentLink))}" target="_blank" rel="noopener noreferrer">Pay now <span aria-hidden="true">↗</span></a>`
                    : ""
                }
              </div>` : ""}
            </div>
          </article>`;
      })
      .join("");
    status.hidden = true;
  } catch (error) {
    status.textContent = error.message;
    status.classList.add("error");
  }
}

async function renderReviews(reviews = currentSiteData?.reviews) {
  const list = document.querySelector("#review-list");
  const status = document.querySelector("#reviews-status");
  if (!list) return;
  try {
    if (!Array.isArray(reviews)) throw new Error("reviews.json must contain a list.");
    if (reviews.length === 0) {
      status.textContent = "No reviews.";
      list.closest("[data-carousel]")?.setAttribute("hidden", "");
      return;
    }
    list.innerHTML = reviews
      .map(
        (item) => `
          <blockquote>
            ${
              Number.isInteger(Number(item.stars)) &&
              Number(item.stars) >= 1 &&
              Number(item.stars) <= 5
                ? `<div class="review-stars" aria-label="${Number(item.stars)} out of 5 stars">${"★".repeat(Number(item.stars))}<span aria-hidden="true">${"★".repeat(5 - Number(item.stars))}</span></div>`
                : ""
            }
            <span class="quote-mark">“</span>
            <p>${escapeHtml(item.review)}</p>
            <footer>
              <strong>${escapeHtml(item.name)}</strong>
              ${item.date ? `<time datetime="${escapeHtml(item.date)}">${escapeHtml(formatReviewDate(item.date))}</time>` : ""}
            </footer>
          </blockquote>`,
      )
      .join("");
    status.hidden = true;
  } catch (error) {
    status.textContent = error.message;
    status.classList.add("error");
  }
}

function formatReviewDate(value) {
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return value;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

async function renderGallery(images = currentSiteData?.gallery) {
  const list = document.querySelector("#gallery-list");
  const status = document.querySelector("#gallery-status");
  if (!list) return;
  try {
    if (!Array.isArray(images)) throw new Error("gallery.json must contain a list.");
    list.innerHTML = images
      .map((image) => {
        const imageUrl = safeAssetUrl(image.image_src || image.image_path);
        return `
          <figure>
            <button class="gallery-lightbox-trigger" type="button" data-gallery-open data-gallery-src="${escapeHtml(imageUrl)}" aria-label="View full image">
              <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(image.alt || `${currentCompanyData?.companyName || "Company"} gallery image`)}" loading="lazy" />
            </button>
          </figure>`;
      })
      .join("");
    status.hidden = true;
  } catch (error) {
    status.textContent = error.message;
    status.classList.add("error");
  }
}

async function loadHomeSections() {
  const container = document.querySelector("#home-sections");
  if (!container) return;
  const status = document.querySelector("#home-sections-status");
  const pages = (container.dataset.pages || "").split(",").filter(Boolean);
  try {
    const pageDocuments = await Promise.all(
      pages.map(async (page) => {
        const response = await fetch(page, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Could not load ${page} (${response.status}).`);
        }
        const source = await response.text();
        const parsed = new DOMParser().parseFromString(source, "text/html");
        const main = parsed.querySelector("main");
        if (!main) throw new Error(`${page} does not contain a main section.`);
        return { page, content: main.innerHTML };
      }),
    );

    status.remove();
    pageDocuments.forEach(({ page, content }) => {
      const section = document.createElement("section");
      section.className = "home-page-section";
      section.id = page.replace(/\.html$/, "");
      section.innerHTML = content;
      container.append(section);
    });
  } catch (error) {
    status.textContent = error.message;
    status.classList.add("error");
  }
}

function initializeHomeNavigation() {
  const container = document.querySelector("#home-sections");
  if (!container) return;
  const targets = [
    document.querySelector("#top"),
    ...container.querySelectorAll(".home-page-section"),
  ].filter(Boolean);
  let currentId = "";
  let frameRequested = false;

  function updateActiveNavigation() {
    frameRequested = false;
    const requestedId = document.body.dataset.navigationTarget;
    let activeTarget = requestedId
      ? targets.find((target) => target.id === requestedId)
      : null;
    if (!activeTarget) {
      const viewportTop = 80;
      const viewportBottom = window.innerHeight;
      let largestVisibleArea = -1;
      for (const target of targets) {
        const bounds = target.getBoundingClientRect();
        const visibleArea = Math.max(
          0,
          Math.min(bounds.bottom, viewportBottom) -
            Math.max(bounds.top, viewportTop),
        );
        if (visibleArea > largestVisibleArea) {
          largestVisibleArea = visibleArea;
          activeTarget = target;
        }
      }
    }

    if (
      !requestedId &&
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 4
    ) {
      activeTarget = targets[targets.length - 1];
    }

    if (!activeTarget || activeTarget.id === currentId) return;
    currentId = activeTarget.id;
    const href = `#${currentId}`;
    document.body.dataset.currentSection = currentId;
    document
      .querySelectorAll(".desktop-nav a, .mobile-nav a")
      .forEach((link) => {
        const isActive = link.getAttribute("href") === href;
        link.classList.toggle("active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
  }

  function requestNavigationUpdate() {
    const requestedId = document.body.dataset.navigationTarget;
    if (requestedId) {
      window.clearTimeout(window.navigationTargetTimer);
      window.navigationTargetTimer = window.setTimeout(() => {
        if (document.body.dataset.navigationTarget === requestedId) {
          delete document.body.dataset.navigationTarget;
          requestNavigationUpdate();
        }
      }, 180);
    }
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(updateActiveNavigation);
  }

  window.addEventListener("scroll", requestNavigationUpdate, { passive: true });
  window.addEventListener("resize", requestNavigationUpdate);
  updateActiveNavigation();
}

async function initializeDataPages() {
  try {
    const siteData = await loadJson("data/data.json");
    if (!siteData || typeof siteData !== "object" || Array.isArray(siteData)) {
      throw new Error("data.json must contain a website data object.");
    }
    currentSiteData = siteData;
    applyCompanyData(siteData.company);
    applyRuntimeSettings(siteData);
    await loadHomeSections();
    applyCompanyData(siteData.company);
    applyRuntimeSettings(siteData);
    await Promise.all([
      renderServices(siteData.services),
      renderReviews(siteData.reviews),
      renderGallery(siteData.gallery),
    ]);
  } catch (error) {
    showFormToast(error.message, true);
  }
  await initializeWeb3FormsCaptcha();
  initializeReviewForms();
  initializeCarousels();
  initializeHomeNavigation();
  if (window.location.hash) {
    document.querySelector(window.location.hash)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

initializeDataPages();
