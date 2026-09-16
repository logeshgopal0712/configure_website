const builderConfig = window.builderConfig;
if (!builderConfig || typeof builderConfig !== "object") {
  throw new Error("Builder configuration was not loaded.");
}

const builderTheme = builderConfig.theme || {};
const builderApi = builderConfig.api || {};
const builderConstraints = builderConfig.constraints || {};
const builderDefaults = builderConfig.defaults || {};
const builderMessages = builderConfig.messages || {};
const builderCopy = builderConfig.copy || {};

Object.entries(builderTheme.cssVariables || {}).forEach(([name, value]) => {
  document.documentElement.style.setProperty(name, value);
});
document.querySelectorAll("[data-config-text]").forEach((element) => {
  const value = builderCopy[element.dataset.configText];
  if (typeof value === "string") element.textContent = value;
});

const form = document.querySelector("#website-form");
const homeScreen = document.querySelector("#home-screen");
const builderWorkspace = document.querySelector("#builder-workspace");
const startCreateWebsiteButton = document.querySelector(
  "#start-create-website",
);
const createWebsiteCard = document.querySelector("#create-website-card");
const showManageWebsiteButton = document.querySelector(
  "#show-manage-website",
);
const manageWebsiteTitle = document.querySelector("#manage-website-title");
const manageWebsiteDescription = document.querySelector(
  "#manage-website-description",
);
const createdWebsiteResult = document.querySelector(
  "#created-website-result",
);
const publishedWebsiteLabel = document.querySelector(
  "#published-website-label",
);
const createdWebsiteLink = document.querySelector("#created-website-link");
const managePanel = document.querySelector("#manage-panel");
const manageEmail = document.querySelector("#manage-email");
const loadWebsiteButton = document.querySelector("#load-website");
const manageStatus = document.querySelector("#manage-status");
const showDeleteWebsiteButton = document.querySelector(
  "#show-delete-website",
);
const deletePanel = document.querySelector("#delete-panel");
const deleteEmail = document.querySelector("#delete-email");
const deleteWebsiteButton = document.querySelector("#delete-website");
const deleteStatus = document.querySelector("#delete-status");
const backToHomeButton = document.querySelector("#back-to-home");
const headerHomeLogo = document.querySelector("#header-home-logo");
const builderContactForm = document.querySelector("#builder-contact-form");
const contactUsStatus = document.querySelector("#contact-us-status");
const statusMessage = document.querySelector("#status");
const serverWarning = document.querySelector("#server-warning");
const serverStatus = document.querySelector("#server-status");
const previewButton = document.querySelector("#preview-website");
const previewSection = document.querySelector("#website-preview");
const previewFrame = document.querySelector("#preview-frame");
const previewFrameShell = document.querySelector("#preview-frame-shell");
const previewPlaceholder = document.querySelector("#preview-placeholder");
const serviceEditorList = document.querySelector("#service-editor-list");
const servicesValidationError = document.querySelector(
  "#services-validation-error",
);
const addServiceButton = document.querySelector("#add-service");
const reviewEditorList = document.querySelector("#review-editor-list");
const addReviewButton = document.querySelector("#add-review");
const logoInput = form.elements.namedItem("logo");
const logoPreview = document.querySelector("#logo-preview");
const logoPreviewImage = document.querySelector("#logo-preview-image");
const removeLogoButton = document.querySelector("#remove-logo");
const galleryInput = form.elements.namedItem("gallery");
const galleryPreviews = document.querySelector("#gallery-previews");
const galleryValidationError = document.querySelector(
  "#gallery-validation-error",
);
const createWebsiteButton = document.querySelector("#create-website-api");
const finalGeneration = document.querySelector("#final-generation");
const contactEmailField = document.querySelector("#contact-email");
const modifyEmailMessage = document.querySelector("#modify-email-message");
const dataDeliveryStatus = document.querySelector("#data-delivery-status");
const maxImageSizeMb = Number(builderConstraints.maxImageSizeMb);
const maxImageSize = maxImageSizeMb * 1024 * 1024;
const maxGalleryImages = Number(builderConstraints.maxGalleryImages);
const expectedServerVersion = Number(builderConfig.version);
const web3FormsEndpoint = builderApi.web3FormsEndpoint;
const websiteGenerationEndpoint = builderApi.websiteGenerationEndpoint;
const builderContactEndpoint = builderApi.builderContactEndpoint;
const supportedImageTypes = new Set(
  Object.keys(builderConstraints.supportedImages || {}),
);
const supportedImageExtensions =
  builderConstraints.supportedImageFileExtensions || [];
const supportedImagePattern = new RegExp(
  `(${supportedImageExtensions
    .map((extension) => extension.replace(".", "\\."))
    .join("|")})$`,
  "i",
);
const isOpenedDirectly = window.location.protocol === "file:";
const isLocalBuilder = ["127.0.0.1", "localhost"].includes(
  window.location.hostname,
);
let serverConnected = false;
let serverOutdated = false;
let importedLogo = null;
let importedGallery = [];
let importedBackgroundImage = null;
let serviceEditorSequence = 0;
let websiteOperation = "create";
let lockedWebsiteEmail = "";
const yearStartedField = form.elements.namedItem("yearStarted");
const brandColorField = form.elements.namedItem("brandColor");
const secondaryColorField = form.elements.namedItem("secondaryColor");
const pageColorField = form.elements.namedItem("pageColor");
const usePageColorField = form.elements.namedItem("usePageColor");
const transparentPageColorField = form.elements.namedItem(
  "transparentPageColor",
);
const pageColorOpacityField = form.elements.namedItem("pageColorOpacity");
const pageColorOptions = document.querySelector("#page-color-options");
const pageColorOpacityOutput = document.querySelector(
  "#page-color-opacity-output",
);
const backgroundImageField = form.elements.namedItem("backgroundImage");
const backgroundImagePreview = document.querySelector(
  "#background-image-preview",
);
const backgroundImagePreviewElement = document.querySelector(
  "#background-image-preview-image",
);
const clearBackgroundImageButton = document.querySelector(
  "#clear-background-image",
);
const wizardSteps = [...form.querySelectorAll(":scope > .form-card")];
const wizardStepCount = document.querySelector("#wizard-step-count");
const wizardStepTitle = document.querySelector("#wizard-step-title");
const wizardProgressBar = document.querySelector("#wizard-progress-bar");
const wizardStepLinks = document.querySelector("#wizard-step-links");
const previousPageButton = document.querySelector("#previous-page");
const nextPageButton = document.querySelector("#next-page");
let currentWizardStep = 0;
let wizardInitialized = false;

function applyBuilderConfiguration() {
  const wizardConfiguration = builderConfig.wizard?.steps || [];
  wizardSteps.forEach((step, index) => {
    const configuration = wizardConfiguration[index];
    if (!configuration) return;
    step.dataset.stepTitle = configuration.shortTitle;
    const heading = step.querySelector(
      ".section-heading h2, .preview-heading h2",
    );
    if (heading && configuration.heading) {
      heading.textContent = configuration.heading;
    }
  });

  const companyName = form.elements.namedItem("companyName");
  const tagline = form.elements.namedItem("tagline");
  const description = form.elements.namedItem("description");
  const about = form.elements.namedItem("about");
  companyName.maxLength = Number(builderConstraints.companyNameMaxLength);
  tagline.maxLength = Number(builderConstraints.taglineMaxLength);
  description.maxLength = Number(builderConstraints.descriptionMaxLength);
  about.maxLength = Number(builderConstraints.aboutMaxLength);
  yearStartedField.min = String(builderConstraints.yearStartedMin);
  pageColorOpacityField.min = String(builderConstraints.pageOpacityMin);
  pageColorOpacityField.max = String(builderConstraints.pageOpacityMax);

  document.querySelectorAll('input[type="file"][accept]').forEach((input) => {
    input.accept = supportedImageExtensions.join(",");
  });

  brandColorField.value = builderDefaults.primaryColor;
  brandColorField.defaultValue = builderDefaults.primaryColor;
  secondaryColorField.value = builderDefaults.secondaryColor;
  secondaryColorField.defaultValue = builderDefaults.secondaryColor;
  pageColorField.value = builderDefaults.pageColor;
  pageColorField.defaultValue = builderDefaults.pageColor;
  pageColorOpacityField.value = String(builderDefaults.pageColorOpacity);
  pageColorOpacityField.defaultValue = String(builderDefaults.pageColorOpacity);
  const defaultTemplate = form.querySelector(
    `input[name="template"][value="${builderDefaults.template}"]`,
  );
  if (defaultTemplate) defaultTemplate.checked = true;
}

applyBuilderConfiguration();

function getVisibleWizardSteps() {
  return wizardSteps.filter((step) => !step.hidden);
}

function wizardStepName(step) {
  return (
    step.dataset.stepTitle ||
    step.querySelector(".section-heading h2, .preview-heading h2")?.textContent ||
    "Details"
  );
}

function updateWizardStepLinks(visibleSteps) {
  wizardStepLinks.replaceChildren();
  visibleSteps.forEach((step, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${index + 1}. ${wizardStepName(step)}`;
    button.classList.toggle("active", index === currentWizardStep);
    button.setAttribute(
      "aria-current",
      index === currentWizardStep ? "step" : "false",
    );
    button.addEventListener("click", () => {
      if (index < currentWizardStep || validateStepsBefore(index)) {
        showWizardStep(index, true);
      }
    });
    wizardStepLinks.append(button);
  });
}

function showHomeScreen() {
  builderWorkspace.hidden = true;
  homeScreen.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showBuilderWorkspace() {
  homeScreen.hidden = true;
  builderWorkspace.hidden = false;
  showWizardStep(0);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function portableImageValue(image) {
  if (image && typeof image === "object") {
    return (
      image.dataUrl ||
      image.image_src ||
      image.image_path ||
      ""
    );
  }
  return "";
}

function portableImageSource(image) {
  if (!image || typeof image !== "object") return "";
  return image.dataUrl?.startsWith("data:") ? image.dataUrl : image.image_src || "";
}

function createMediaId(prefix = "image") {
  const randomId =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${randomId}`.toLowerCase();
}

function portableImageId(image, prefix = "image") {
  if (!image || typeof image !== "object") return "";
  const existingId = image.id || image.image_id;
  if (existingId) return existingId;
  image.id = createMediaId(prefix);
  return image.id;
}

function portableImageThumbnail(image) {
  if (!image || typeof image !== "object") return "";
  return image.thumbnail || image.image_thumbnail || "";
}

function imagePreviewValue(image) {
  return portableImageThumbnail(image) || portableImageValue(image);
}

function normalizeStoredImage(image, prefix = "media") {
  if (!image || typeof image !== "object") return null;
  const dataUrl =
    image.dataUrl ||
    image.image_src ||
    image.image_path ||
    "";
  const thumbnail = image.thumbnail || image.image_thumbnail || "";
  if (!dataUrl && !thumbnail) return null;
  return {
    id: image.id || image.image_id || createMediaId(prefix),
    name: image.name || "",
    type: image.type || "",
    dataUrl,
    thumbnail,
  };
}

function portableImageExtension(image) {
  if (!image || typeof image !== "object") return "";
  const mimeType = image.type || "";
  const mimeExtensions = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };
  if (mimeExtensions[mimeType]) return mimeExtensions[mimeType];

  const fileName = image.name || portableImageValue(image);
  const extension = fileName.match(/\.(png|jpe?g|webp|gif)(?:$|[?#])/i)?.[1];
  return extension ? `.${extension.toLowerCase().replace("jpeg", "jpg")}` : "";
}

function portableImagePath(image, folder, fileName) {
  const extension = portableImageExtension(image);
  return extension ? `data/${folder}/${fileName}${extension}` : "";
}

function createPortableData(config) {
  const companyImageId = portableImageId(config.logo, "company");
  const backgroundImageId = portableImageId(
    config.backgroundImage,
    "background",
  );
  return {
    schemaVersion: 1,
    company: {
      companyName: config.companyName,
      yearStarted: config.yearStarted ? Number(config.yearStarted) : "",
      tagline: config.tagline,
      description: config.description,
      about: config.about,
      image_id: companyImageId,
      image_path: portableImagePath(
        config.logo,
        "company",
        companyImageId,
      ),
      image_src: portableImageSource(config.logo),
      image_thumbnail: portableImageThumbnail(config.logo),
    },
    template: {
      templateId: config.template,
      primaryColor: config.brandColor,
      secondaryColor: config.secondaryColor,
      usePageColor: config.usePageColor,
      pageColor: config.pageColor,
      transparentPageColor: config.transparentPageColor,
      pageColorOpacity: config.pageColorOpacity,
      font: config.font,
      background_image_id: backgroundImageId,
      background_image_path: portableImagePath(
        config.backgroundImage,
        "background",
        backgroundImageId,
      ),
      background_image_src: portableImageSource(config.backgroundImage),
      background_image_thumbnail: portableImageThumbnail(
        config.backgroundImage,
      ),
      servicesHeading: config.servicesHeading,
      servicesLayout: config.servicesLayout,
      sections: config.sections,
    },
    services: config.services.map(({ image, ...service }) => {
      const imageId = portableImageId(image, "service");
      return {
        ...service,
        image_id: imageId,
        image_path: portableImagePath(image, "service", imageId),
        image_src: portableImageSource(image),
        image_thumbnail: portableImageThumbnail(image),
      };
    }),
    gallery: config.gallery.map((image) => {
      const imageId = portableImageId(image, "gallery");
      return {
        image_id: imageId,
        image_path: portableImagePath(image, "gallery", imageId),
        image_src: portableImageSource(image),
        image_thumbnail: portableImageThumbnail(image),
        alt: "",
      };
    }),
    reviews: config.reviews,
    contact: {
      formEndpoint: config.formEndpoint,
      accessKey: config.contactAccessKey,
      email: config.email,
      phone: config.phone,
      address: config.address,
      showCall: config.showCall,
      showEmail: config.showEmail,
    },
    reviewSettings: {
      formEndpoint: config.reviewFormEndpoint,
      accessKey: config.reviewAccessKey,
    },
    socialMedia: {
      instagram: config.instagram,
      facebook: config.facebook,
      linkedin: config.linkedin,
      twitter: config.twitter,
      youtube: config.youtube,
      applePodcast: config.applePodcast,
      spotify: config.spotify,
    },
    appointment: {
      url: config.appointmentUrl,
    },
  };
}

function createDataDeliveryPayload(config) {
  return {
    branchName: config.companyName,
    data: createPortableData(config),
  };
}

function setDataDeliveryStatus(message, type = "") {
  dataDeliveryStatus.textContent = message;
  dataDeliveryStatus.className = type;
}

async function readGenerationApiResponse(response) {
  let responseData;
  try {
    responseData = await response.json();
  } catch (error) {
    console.error("Generation API returned invalid JSON.", error);
    throw new Error("The server returned an invalid response.");
  }

  if (responseData.success === false) {
    console.error("Generation API error:", responseData);
    throw new Error(
      typeof responseData.message === "string" && responseData.message.trim()
        ? responseData.message.trim()
        : "The request could not be completed.",
    );
  }

  if (responseData.success !== true) {
    console.error("Generation API response is missing success status.", responseData);
    throw new Error("The server returned an invalid response.");
  }

  return responseData;
}

function setWebsiteOperation(operation, email = "") {
  websiteOperation = operation;
  lockedWebsiteEmail = operation === "modify" ? email.trim() : "";
  contactEmailField.readOnly = operation === "modify";
  modifyEmailMessage.hidden = operation !== "modify";
  createWebsiteButton.textContent =
    operation === "modify"
      ? builderMessages.modifyAction
      : builderMessages.createAction;
}

function showPublishedWebsite(previewUrl, payload) {
  const wasModified = websiteOperation === "modify";
  dataDeliveryStatus.replaceChildren();
  dataDeliveryStatus.className = "success";
  createdWebsiteLink.href = previewUrl;
  publishedWebsiteLabel.textContent = wasModified
    ? builderMessages.modifiedLabel
    : builderMessages.createdLabel;
  createdWebsiteResult.hidden = false;

  startCreateWebsiteButton.disabled = true;
  startCreateWebsiteButton.textContent = wasModified
    ? builderMessages.modifiedLabel
    : builderMessages.createdLabel;
  createWebsiteCard.classList.add("website-created");

  manageWebsiteTitle.textContent = "Edit website";
  manageWebsiteDescription.textContent =
    "Update your website using the same form.";
  showManageWebsiteButton.innerHTML =
    'Edit website <span aria-hidden="true">→</span>';
  manageEmail.value = payload.data?.contact?.email || "";

  showHomeScreen();
}

async function publishWebsite() {
  const config = await collectConfiguration();
  const payload = createDataDeliveryPayload(config);
  const action = websiteOperation === "modify" ? "modify" : "create";
  const response = await fetch(websiteGenerationEndpoint, {
    method: websiteOperation === "modify" ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const responseData = await readGenerationApiResponse(response);

  if (
    typeof responseData.previewUrl === "string" &&
    /^https?:\/\//i.test(responseData.previewUrl)
  ) {
    showPublishedWebsite(responseData.previewUrl, payload);
    return;
  }

  console.error(`Generation API returned invalid ${action} data.`, responseData);
  throw new Error("The server returned an invalid response.");
}

createWebsiteButton.addEventListener("click", async () => {
  if (!validateEntireForm()) return;

  createWebsiteButton.disabled = true;
  const action = websiteOperation === "modify" ? "Modifying" : "Creating";
  setDataDeliveryStatus(
    websiteOperation === "modify"
      ? builderMessages.modifying
      : builderMessages.creating,
  );
  try {
    await publishWebsite();
  } catch (error) {
    setDataDeliveryStatus(error.message, "error");
  } finally {
    createWebsiteButton.disabled = false;
  }
});

function showWizardStep(index, shouldScroll = false) {
  const visibleSteps = getVisibleWizardSteps();
  if (!visibleSteps.length) return;

  currentWizardStep = Math.max(0, Math.min(index, visibleSteps.length - 1));
  const activeStep = visibleSteps[currentWizardStep];

  wizardSteps.forEach((step) => {
    const isActive = step === activeStep;
    step.classList.toggle("wizard-hidden", !isActive);
    step.setAttribute("aria-hidden", String(!isActive));
  });

  const title = wizardStepName(activeStep);
  wizardStepCount.textContent =
    `Step ${currentWizardStep + 1} of ${visibleSteps.length}`;
  wizardStepTitle.textContent = title;
  wizardProgressBar.style.width =
    `${((currentWizardStep + 1) / visibleSteps.length) * 100}%`;
  previousPageButton.disabled = currentWizardStep === 0;
  nextPageButton.hidden = currentWizardStep === visibleSteps.length - 1;
  updateWizardStepLinks(visibleSteps);

  if (shouldScroll) {
    activeStep.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function refreshWizard() {
  if (!wizardInitialized) return;
  showWizardStep(currentWizardStep);
}

function findInvalidField(fields) {
  return [...fields].find(
    (field) =>
      !field.disabled &&
      typeof field.checkValidity === "function" &&
      !field.checkValidity(),
  );
}

function hasOfferingContent() {
  return [...serviceEditorList.querySelectorAll(".service-editor")].some(
    (editor) =>
      [
        ".service-title",
        ".service-price-input",
        ".service-description",
        ".service-link-input",
        ".service-payment-link-input",
        ".service-video-input",
      ].some((selector) => editor.querySelector(selector).value.trim()) ||
      editor.querySelector(".service-image-input").files.length > 0 ||
      Boolean(editor._importedImage),
  );
}

function validateOfferings() {
  const valid = hasOfferingContent();
  servicesValidationError.hidden = valid;
  if (!valid) {
    serviceEditorList.querySelector(".service-title")?.focus();
  }
  return valid;
}

function validateWizardStep(step) {
  const invalidField = findInvalidField(
    step.querySelectorAll("input, textarea, select"),
  );
  if (invalidField) {
    invalidField.reportValidity();
    return false;
  }

  if (step.dataset.fieldsFor === "services") {
    return validateOfferings();
  }

  return true;
}

function validateCurrentWizardStep() {
  return validateWizardStep(getVisibleWizardSteps()[currentWizardStep]);
}

function validateStepsBefore(targetIndex) {
  const visibleSteps = getVisibleWizardSteps();
  for (let index = 0; index < targetIndex; index += 1) {
    if (!validateWizardStep(visibleSteps[index])) {
      showWizardStep(index, true);
      return false;
    }
  }
  return true;
}

function validateEntireForm() {
  const invalidField = findInvalidField(form.elements);
  if (invalidField) {
    const invalidStep = invalidField.closest(".form-card");
    const stepIndex = getVisibleWizardSteps().indexOf(invalidStep);
    if (stepIndex >= 0) {
      showWizardStep(stepIndex, true);
    }
    invalidField.reportValidity();
    return false;
  }

  if (!validateOfferings()) {
    const servicesStep = serviceEditorList.closest(".form-card");
    const stepIndex = getVisibleWizardSteps().indexOf(servicesStep);
    if (stepIndex >= 0) {
      showWizardStep(stepIndex, true);
    }
    return false;
  }

  return true;
}

previousPageButton.addEventListener("click", () => {
  showWizardStep(currentWizardStep - 1, true);
});

nextPageButton.addEventListener("click", () => {
  if (validateCurrentWizardStep()) {
    showWizardStep(currentWizardStep + 1, true);
  }
});

yearStartedField.max = String(new Date().getFullYear());
yearStartedField.value = String(new Date().getFullYear());

function updateTemplateColors() {
  document.documentElement.style.setProperty(
    "--selected-primary",
    brandColorField.value,
  );
  document.documentElement.style.setProperty(
    "--selected-secondary",
    secondaryColorField.value,
  );
  const pageColor = usePageColorField.checked
    ? transparentPageColorField.checked
      ? `${pageColorField.value}${Math.round(
          (Number(pageColorOpacityField.value) / 100) * 255,
        )
          .toString(16)
          .padStart(2, "0")}`
      : pageColorField.value
    : "#fbfaf7";
  document.documentElement.style.setProperty("--selected-page", pageColor);
}

function updatePageColorControls() {
  const enabled = usePageColorField.checked;
  pageColorOptions.classList.toggle("disabled", !enabled);
  pageColorField.disabled = !enabled;
  transparentPageColorField.disabled = !enabled;
  pageColorOpacityField.disabled =
    !enabled || !transparentPageColorField.checked;
  pageColorOpacityOutput.textContent = `${pageColorOpacityField.value}%`;
  updateTemplateColors();
}

brandColorField.addEventListener("input", updateTemplateColors);
secondaryColorField.addEventListener("input", updateTemplateColors);
pageColorField.addEventListener("input", updateTemplateColors);
usePageColorField.addEventListener("change", updatePageColorControls);
transparentPageColorField.addEventListener("change", updatePageColorControls);
pageColorOpacityField.addEventListener("input", updatePageColorControls);
updateTemplateColors();
updatePageColorControls();

function renderBackgroundImagePreview() {
  const imageSource = imagePreviewValue(importedBackgroundImage);
  if (!imageSource) {
    backgroundImagePreviewElement.removeAttribute("src");
    backgroundImagePreview.hidden = true;
    return;
  }
  backgroundImagePreviewElement.src = imageSource;
  backgroundImagePreview.hidden = false;
}

backgroundImageField.addEventListener("change", async () => {
  const [file] = backgroundImageField.files;
  if (!file) return;
  try {
    importedBackgroundImage = await readImage(file);
    backgroundImageField.value = "";
    renderBackgroundImagePreview();
  } catch (error) {
    backgroundImageField.value = "";
    backgroundImageField.setCustomValidity(error.message);
    backgroundImageField.reportValidity();
    backgroundImageField.setCustomValidity("");
  }
});

clearBackgroundImageButton.addEventListener("click", () => {
  backgroundImageField.value = "";
  importedBackgroundImage = null;
  renderBackgroundImagePreview();
});

renderBackgroundImagePreview();

function closeInformationPopovers(exceptButton = null) {
  document.querySelectorAll(".field-info").forEach((button) => {
    if (button === exceptButton) return;
    button.setAttribute("aria-expanded", "false");
    const popover = document.querySelector(
      `#${button.getAttribute("aria-controls")}`,
    );
    if (popover) popover.hidden = true;
  });
}

document.addEventListener("click", (event) => {
  const button = event.target.closest(".field-info");
  if (!button) {
    closeInformationPopovers();
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  const popover = document.querySelector(
    `#${button.getAttribute("aria-controls")}`,
  );
  const willOpen = button.getAttribute("aria-expanded") !== "true";
  closeInformationPopovers(button);
  button.setAttribute("aria-expanded", String(willOpen));
  if (popover) popover.hidden = !willOpen;
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeInformationPopovers();
});

if (isOpenedDirectly) {
  serverWarning.hidden = false;
  serverStatus.hidden = false;
  serverStatus.textContent = "Server unavailable: this page was opened directly.";
  serverStatus.className = "server-status disconnected";
  previewButton.disabled = true;
} else if (!isLocalBuilder) {
  serverStatus.hidden = true;
  previewButton.disabled = true;
  previewButton.title = "Preview is available when the builder runs locally.";
}

function setStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = type;
}

async function checkServer() {
  if (isOpenedDirectly || !isLocalBuilder) {
    return false;
  }

  serverStatus.hidden = false;
  try {
    const response = await fetch(`/api/health?time=${Date.now()}`, {
      cache: "no-store",
    });
    const health = await response.json();
    serverOutdated =
      response.ok && Number(health.version) < expectedServerVersion;
    serverConnected = response.ok && !serverOutdated;
  } catch {
    serverConnected = false;
    serverOutdated = false;
  }

  serverStatus.textContent = serverConnected
    ? "Website Builder server connected."
    : serverOutdated
      ? "Website Builder server is outdated. Close its Terminal window and run start.command again."
      : "Website Builder server is not responding. Restart start.command.";
  serverStatus.className = `server-status ${
    serverConnected ? "connected" : "disconnected"
  }`;
  serverStatus.hidden = serverConnected;
  previewButton.disabled = !serverConnected;
  return serverConnected;
}

wizardInitialized = true;
showWizardStep(0);

function createImageThumbnail(dataUrl) {
  return new Promise((resolve) => {
    const image = new Image();
    image.addEventListener("load", () => {
      const maxSize = 240;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/webp", 0.78));
    });
    image.addEventListener("error", () => resolve(""));
    image.src = dataUrl;
  });
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    const supportedExtension = supportedImagePattern.test(file.name);
    if (!supportedImageTypes.has(file.type) && !supportedExtension) {
      reject(
        new Error(
          `${file.name} is not supported. Choose a PNG, JPG, WebP, or GIF image.`,
        ),
      );
      return;
    }

    if (file.size > maxImageSize) {
      reject(
        new Error(
          builderMessages.imageTooLarge
            .replace("{name}", file.name)
            .replace("{maxMb}", String(maxImageSizeMb)),
        ),
      );
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", async () => {
      const dataUrl = reader.result;
      resolve({
        id: createMediaId("media"),
        name: file.name,
        type: file.type,
        dataUrl,
        thumbnail: await createImageThumbnail(dataUrl),
      });
    });
    reader.addEventListener("error", () => {
      reject(new Error(`Could not read ${file.name}.`));
    });
    reader.readAsDataURL(file);
  });
}

function clearLogo() {
  logoInput.value = "";
  importedLogo = null;
  renderLogoPreview();
}

function renderLogoPreview() {
  const imageSource = imagePreviewValue(importedLogo);
  if (imageSource) {
    logoPreviewImage.src = imageSource;
    logoPreview.hidden = false;
    return;
  }
  logoPreviewImage.removeAttribute("src");
  logoPreview.hidden = true;
}

logoInput.addEventListener("change", async () => {
  const [file] = logoInput.files;
  if (!file) {
    clearLogo();
    return;
  }

  try {
    const logo = await readImage(file);
    importedLogo = logo;
    logoInput.value = "";
    renderLogoPreview();
  } catch (error) {
    clearLogo();
    logoInput.setCustomValidity(error.message);
    logoInput.reportValidity();
    logoInput.setCustomValidity("");
  }
});

removeLogoButton.addEventListener("click", clearLogo);

function renderGalleryPreviews() {
  galleryPreviews.replaceChildren();
  importedGallery.forEach((image, index) => {
    const preview = document.createElement("span");
    preview.className = "image-preview";
    preview.draggable = true;
    preview.dataset.mediaId = portableImageId(image, "gallery");
    preview.title = "Drag to reorder";

    const previewImage = document.createElement("img");
    previewImage.src = imagePreviewValue(image);
    previewImage.alt = `Selected gallery image ${index + 1}`;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.setAttribute(
      "aria-label",
      `Remove gallery image ${index + 1}`,
    );
    removeButton.textContent = "×";
    removeButton.addEventListener("click", () => {
      importedGallery.splice(index, 1);
      galleryValidationError.hidden = true;
      galleryValidationError.textContent = "";
      renderGalleryPreviews();
    });

    preview.append(previewImage, removeButton);
    galleryPreviews.append(preview);
  });
}

function syncGalleryOrder() {
  const imagesById = new Map(
    importedGallery.map((image) => [portableImageId(image, "gallery"), image]),
  );
  importedGallery = [...galleryPreviews.querySelectorAll(".image-preview")]
    .map((preview) => imagesById.get(preview.dataset.mediaId))
    .filter(Boolean);
}

galleryInput.addEventListener("change", async () => {
  const files = [...galleryInput.files];
  if (!files.length) return;
  galleryValidationError.hidden = true;
  galleryValidationError.textContent = "";

  if (importedGallery.length + files.length > maxGalleryImages) {
    galleryInput.value = "";
    galleryValidationError.textContent =
      builderMessages.galleryLimit
        .replace("{max}", String(maxGalleryImages))
        .replace("{selected}", String(files.length))
        .replace("{existing}", String(importedGallery.length));
    galleryValidationError.hidden = false;
    return;
  }

  try {
    const images = await Promise.all(files.map(readImage));
    importedGallery.push(...images);
    galleryInput.value = "";
    renderGalleryPreviews();
  } catch (error) {
    galleryInput.value = "";
    galleryValidationError.textContent = error.message;
    galleryValidationError.hidden = false;
  }
});

function updateServiceEditorLabels() {
  const editors = [...serviceEditorList.querySelectorAll(".service-editor")];
  editors.forEach((editor, index) => {
    const title = editor.querySelector(".service-title")?.value.trim();
    editor.querySelector("[data-service-number]").textContent = title
      ? `Offering ${index + 1} — ${title}`
      : `Offering ${index + 1}`;
    editor.querySelector(".remove-service-button").disabled =
      editors.length === 1;
    editor.querySelector(".move-item-up").disabled = index === 0;
    editor.querySelector(".move-item-down").disabled =
      index === editors.length - 1;
  });
}

function createServiceEditor(service = {}) {
  serviceEditorSequence += 1;
  const infoIdPrefix = `offering-${serviceEditorSequence}`;
  const editor = document.createElement("article");
  editor.className = "service-editor";
  editor.innerHTML = `
    <div class="service-editor-header">
      <button class="drag-handle" type="button" draggable="true" aria-label="Drag offering to reorder" title="Drag to reorder">⋮⋮</button>
      <strong data-service-number>Offering</strong>
      <div class="editor-header-actions">
        <button class="move-item-up" type="button" aria-label="Move offering up">↑</button>
        <button class="move-item-down" type="button" aria-label="Move offering down">↓</button>
        <button class="collapse-editor-button" type="button" aria-expanded="true">Minimize</button>
        <button class="remove-service-button" type="button">Remove</button>
      </div>
    </div>
    <div class="service-editor-fields">
      <label>
        <span class="label-with-info">
          Title
          <button class="field-info" type="button" aria-expanded="false" aria-controls="${infoIdPrefix}-title-info" aria-label="Offering title information">i</button>
          <span class="info-popover" id="${infoIdPrefix}-title-info" role="tooltip" hidden>Name of what you're offering</span>
        </span>
        <input class="service-title" placeholder="e.g. Website Design" />
      </label>
      <label>
        <span class="label-with-info">
          Price
          <button class="field-info" type="button" aria-expanded="false" aria-controls="${infoIdPrefix}-price-info" aria-label="Offering price information">i</button>
          <span class="info-popover" id="${infoIdPrefix}-price-info" role="tooltip" hidden>Cost for this offering</span>
        </span>
        <input class="service-price-input" placeholder="e.g. $999 or Contact us" />
      </label>
      <label class="service-description-field">
        <span class="label-with-info">
          Description
          <button class="field-info" type="button" aria-expanded="false" aria-controls="${infoIdPrefix}-description-info" aria-label="Offering description information">i</button>
          <span class="info-popover" id="${infoIdPrefix}-description-info" role="tooltip" hidden>A short information about this offering.</span>
        </span>
        <textarea class="service-description" rows="3" placeholder="e.g. Describe this offering."></textarea>
      </label>
      <label>
        <span class="label-with-info">
          Purchase link
          <button class="field-info" type="button" aria-expanded="false" aria-controls="${infoIdPrefix}-purchase-info" aria-label="Purchase link information">i</button>
          <span class="info-popover" id="${infoIdPrefix}-purchase-info" role="tooltip" hidden>Where customers go to buy or book this. Paste the full URL.</span>
        </span>
        <input class="service-link-input" type="url" placeholder="e.g. amazon, flipkart links" />
      </label>
      <label>
        <span class="label-with-info">
          Payment link
          <button class="field-info" type="button" aria-expanded="false" aria-controls="${infoIdPrefix}-payment-info" aria-label="Payment link information">i</button>
          <span class="info-popover" id="${infoIdPrefix}-payment-info" role="tooltip" hidden>Adds a Pay now button. Direct payment link for this offering, if you have one (e.g. from Stripe or PayPal).</span>
        </span>
        <input class="service-payment-link-input" type="url" placeholder="e.g. https://buy.stripe.com/..." />
      </label>
      <div class="service-image-field">
        <span class="label-with-info">
          Offering image
          <button class="field-info" type="button" aria-expanded="false" aria-controls="${infoIdPrefix}-image-info" aria-label="Offering image information">i</button>
          <span class="info-popover" id="${infoIdPrefix}-image-info" role="tooltip" hidden>A photo for this offering. Ignored if you add a video link below.</span>
        </span>
        <div class="image-upload-row">
          <label class="image-file-button">
            Choose file
            <input class="service-image-input image-file-input" type="file" accept=".png,.jpg,.jpeg,.webp,.gif" />
          </label>
          <span class="service-image-preview image-preview" hidden>
            <img alt="Selected offering image preview" />
            <button class="remove-service-image" type="button" aria-label="Remove selected offering image">×</button>
          </span>
        </div>
      </div>
      <label>
        <span class="label-with-info">
          Video link
          <button class="field-info" type="button" aria-expanded="false" aria-controls="${infoIdPrefix}-video-info" aria-label="Video link information">i</button>
          <span class="info-popover" id="${infoIdPrefix}-video-info" role="tooltip" hidden>Link to a video for this offering (e.g. YouTube). If added, this replaces the image.</span>
        </span>
        <input class="service-video-input" type="url" placeholder="e.g. https://youtube.com/watch?v=..." />
      </label>
    </div>
  `;

  editor.querySelector(".service-title").value = service.title || "";
  editor.querySelector(".service-description").value =
    service.description || "";
  editor.querySelector(".service-price-input").value = service.price || "";
  editor.querySelector(".service-link-input").value = service.link || "";
  editor.querySelector(".service-payment-link-input").value =
    service.paymentLink || "";
  editor._importedImage = service.image || null;
  editor.querySelector(".service-video-input").value = service.video || "";

  const serviceImageInput = editor.querySelector(".service-image-input");
  const serviceImagePreview = editor.querySelector(".service-image-preview");
  const serviceImagePreviewElement = serviceImagePreview.querySelector("img");
  const renderServiceImage = () => {
    const imageSource = imagePreviewValue(editor._importedImage);
    if (!imageSource) {
      serviceImagePreviewElement.removeAttribute("src");
      serviceImagePreview.hidden = true;
      return;
    }
    serviceImagePreviewElement.src = imageSource;
    serviceImagePreview.hidden = false;
  };

  serviceImageInput.addEventListener("change", async (event) => {
    const [file] = event.target.files;
    if (!file) return;
    try {
      editor._importedImage = await readImage(file);
      serviceImageInput.value = "";
      renderServiceImage();
    } catch (error) {
      serviceImageInput.value = "";
      serviceImageInput.setCustomValidity(error.message);
      serviceImageInput.reportValidity();
      serviceImageInput.setCustomValidity("");
    }
  });
  editor.querySelector(".remove-service-image").addEventListener("click", () => {
    serviceImageInput.value = "";
    editor._importedImage = null;
    renderServiceImage();
  });
  editor.querySelector(".remove-service-button").addEventListener("click", () => {
    editor.remove();
    updateServiceEditorLabels();
  });
  editor.querySelector(".collapse-editor-button").addEventListener("click", (event) => {
    const collapsed = editor.classList.toggle("editor-collapsed");
    event.currentTarget.textContent = collapsed ? "Expand" : "Minimize";
    event.currentTarget.setAttribute("aria-expanded", String(!collapsed));
  });
  serviceEditorList.append(editor);

  renderServiceImage();
  updateServiceEditorLabels();
}

function normalizeServices(services) {
  if (Array.isArray(services)) {
    return services.filter(
      (service) => service && typeof service === "object",
    );
  }
  if (typeof services === "string") {
    return services
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("|").map((part) => part.trim());
        return {
          title: parts[0] || "",
          description: parts[1] || "",
          price: parts[2] || "",
          link: parts[3] || "",
          paymentLink: "",
          image: "",
          video: parts[4] || "",
        };
      });
  }
  return [];
}

function loadServices(services) {
  serviceEditorList.replaceChildren();
  const entries = normalizeServices(services);
  (entries.length ? entries : [{}]).forEach(createServiceEditor);
}

async function collectServices() {
  const services = await Promise.all(
    [...serviceEditorList.querySelectorAll(".service-editor")].map(
      async (editor) => {
        const imageFile = editor.querySelector(".service-image-input").files[0];
        return {
      title: editor.querySelector(".service-title").value.trim(),
      description: editor.querySelector(".service-description").value.trim(),
      price: editor.querySelector(".service-price-input").value.trim(),
      link: editor.querySelector(".service-link-input").value.trim(),
      paymentLink: editor
        .querySelector(".service-payment-link-input")
        .value.trim(),
          image: imageFile
            ? await readImage(imageFile)
            : editor._importedImage,
          video: editor.querySelector(".service-video-input").value.trim(),
        };
      },
    ),
  );
  return services.filter((service) =>
    Object.values(service).some((value) => Boolean(value)),
  );
}

addServiceButton.addEventListener("click", () => createServiceEditor());
serviceEditorList.addEventListener("input", () => {
  if (hasOfferingContent()) servicesValidationError.hidden = true;
  updateServiceEditorLabels();
});
serviceEditorList.addEventListener("change", () => {
  if (hasOfferingContent()) servicesValidationError.hidden = true;
});
loadServices([]);

function updateReviewEditorLabels() {
  const editors = [...reviewEditorList.querySelectorAll(".review-editor")];
  editors.forEach((editor, index) => {
    const name = editor.querySelector(".review-name")?.value.trim();
    editor.querySelector("[data-review-number]").textContent = name
      ? `Review ${index + 1} — ${name}`
      : `Review ${index + 1}`;
    editor.querySelector(".remove-review-button").disabled =
      editors.length === 1;
    editor.querySelector(".move-item-up").disabled = index === 0;
    editor.querySelector(".move-item-down").disabled =
      index === editors.length - 1;
  });
}

function createReviewEditor(review = {}) {
  const editor = document.createElement("article");
  editor.className = "review-editor";
  editor.innerHTML = `
    <div class="service-editor-header">
      <button class="drag-handle" type="button" draggable="true" aria-label="Drag review to reorder" title="Drag to reorder">⋮⋮</button>
      <strong data-review-number>Review</strong>
      <div class="editor-header-actions">
        <button class="move-item-up" type="button" aria-label="Move review up">↑</button>
        <button class="move-item-down" type="button" aria-label="Move review down">↓</button>
        <button class="collapse-editor-button" type="button" aria-expanded="true">Minimize</button>
        <button class="remove-review-button" type="button">Remove</button>
      </div>
    </div>
    <div class="review-editor-fields">
      <label>
        Customer name
        <input class="review-name" maxlength="180" placeholder="e.g. Alex Morgan" />
      </label>
      <label>
        Date
        <input class="review-date" type="date" />
      </label>
      <label class="review-text-field">
        Review
        <textarea class="review-text" maxlength="3000" rows="3" placeholder="e.g. Professional and easy to work with."></textarea>
      </label>
      <label>
        Stars
        <select class="review-stars">
          <option value="">Select rating</option>
          <option value="5">5 stars</option>
          <option value="4">4 stars</option>
          <option value="3">3 stars</option>
          <option value="2">2 stars</option>
          <option value="1">1 star</option>
        </select>
      </label>
    </div>
  `;
  editor.querySelector(".review-name").value = review.name || "";
  editor.querySelector(".review-date").value = review.date || "";
  editor.querySelector(".review-text").value = review.review || "";
  editor.querySelector(".review-stars").value = review.stars || "";
  editor.querySelector(".remove-review-button").addEventListener("click", () => {
    editor.remove();
    updateReviewEditorLabels();
  });
  editor.querySelector(".collapse-editor-button").addEventListener("click", (event) => {
    const collapsed = editor.classList.toggle("editor-collapsed");
    event.currentTarget.textContent = collapsed ? "Expand" : "Minimize";
    event.currentTarget.setAttribute("aria-expanded", String(!collapsed));
  });
  reviewEditorList.append(editor);
  updateReviewEditorLabels();
}

function loadReviews(reviews) {
  reviewEditorList.replaceChildren();
  const entries = Array.isArray(reviews) ? reviews : [];
  (entries.length ? entries : [{}]).forEach(createReviewEditor);
}

function collectReviews() {
  return [...reviewEditorList.querySelectorAll(".review-editor")]
    .map((editor) => {
      const stars = Number(editor.querySelector(".review-stars").value);
      return {
        name: editor.querySelector(".review-name").value.trim() || "Customer",
        review: editor.querySelector(".review-text").value.trim(),
        date: editor.querySelector(".review-date").value,
        stars: Number.isInteger(stars) && stars >= 1 && stars <= 5 ? stars : null,
      };
    })
    .filter((review) => review.review);
}

addReviewButton.addEventListener("click", () => createReviewEditor());
reviewEditorList.addEventListener("input", updateReviewEditorLabels);
loadReviews([]);

function setupSortableList(container, itemSelector, onReorder) {
  let draggedItem = null;

  container.addEventListener("dragstart", (event) => {
    const handle = event.target.closest(".drag-handle");
    const item = handle?.closest(itemSelector) || event.target.closest(itemSelector);
    if (!item || (!handle && container !== galleryPreviews)) {
      event.preventDefault();
      return;
    }
    draggedItem = item;
    item.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
  });

  container.addEventListener("dragover", (event) => {
    if (!draggedItem) return;
    event.preventDefault();
    const target = event.target.closest(itemSelector);
    if (!target || target === draggedItem) return;
    const bounds = target.getBoundingClientRect();
    const after =
      container === galleryPreviews
        ? event.clientX > bounds.left + bounds.width / 2
        : event.clientY > bounds.top + bounds.height / 2;
    target[after ? "after" : "before"](draggedItem);
  });

  container.addEventListener("dragend", () => {
    if (!draggedItem) return;
    draggedItem.classList.remove("dragging");
    draggedItem = null;
    onReorder();
  });

  container.addEventListener("click", (event) => {
    const moveButton = event.target.closest(".move-item-up, .move-item-down");
    if (!moveButton) return;
    const item = moveButton.closest(itemSelector);
    if (moveButton.classList.contains("move-item-up") && item.previousElementSibling) {
      item.previousElementSibling.before(item);
    } else if (
      moveButton.classList.contains("move-item-down") &&
      item.nextElementSibling
    ) {
      item.nextElementSibling.after(item);
    }
    onReorder();
  });
}

setupSortableList(galleryPreviews, ".image-preview", syncGalleryOrder);
setupSortableList(serviceEditorList, ".service-editor", updateServiceEditorLabels);
setupSortableList(reviewEditorList, ".review-editor", updateReviewEditorLabels);

function setFormValue(name, value) {
  const field = form.elements.namedItem(name);
  if (!field) return;
  if (field instanceof RadioNodeList) {
    field.value = value ?? "";
    return;
  }
  if (field.type === "checkbox") {
    field.checked = Boolean(value);
    return;
  }
  field.value = value ?? "";
}

function resetBuilderForm() {
  form.reset();
  setWebsiteOperation("create");
  yearStartedField.value = String(new Date().getFullYear());
  importedLogo = null;
  importedGallery = [];
  importedBackgroundImage = null;
  renderLogoPreview();
  renderGalleryPreviews();
  renderBackgroundImagePreview();
  loadServices([]);
  loadReviews([]);
  servicesValidationError.hidden = true;
  setStatus("");
  setDataDeliveryStatus("");
  finalGeneration.hidden = true;
  previewFrame.removeAttribute("srcdoc");
  previewFrameShell.hidden = true;
  previewPlaceholder.hidden = false;
  updatePageColorControls();
}

function loadWebsiteData(payload, accountEmail = "") {
  const data = payload;
  if (!data || typeof data !== "object") {
    throw new Error("The API response does not contain website data.");
  }

  const company = data.company || {};
  const template = data.template || {};
  const contact = data.contact || {};
  const reviewSettings = data.reviewSettings || {};
  const social = data.socialMedia || {};
  const appointment = data.appointment || {};

  setFormValue("companyName", company.companyName);
  setFormValue("yearStarted", company.yearStarted);
  setFormValue("tagline", company.tagline);
  setFormValue("description", company.description);
  setFormValue("about", company.about);
  setFormValue("template", template.templateId || builderDefaults.template);
  setFormValue(
    "brandColor",
    template.primaryColor || builderDefaults.primaryColor,
  );
  setFormValue(
    "secondaryColor",
    template.secondaryColor || builderDefaults.secondaryColor,
  );
  setFormValue("usePageColor", template.usePageColor);
  setFormValue("pageColor", template.pageColor || builderDefaults.pageColor);
  setFormValue("transparentPageColor", template.transparentPageColor);
  setFormValue(
    "pageColorOpacity",
    template.pageColorOpacity || builderDefaults.pageColorOpacity,
  );
  setFormValue("contactAccessKey", contact.accessKey || reviewSettings.accessKey);
  setFormValue("email", accountEmail || contact.email);
  setFormValue("phone", contact.phone);
  setFormValue("address", contact.address);
  setFormValue("showCall", contact.showCall);
  setFormValue("showEmail", contact.showEmail);
  setFormValue("instagram", social.instagram);
  setFormValue("facebook", social.facebook);
  setFormValue("linkedin", social.linkedin);
  setFormValue("twitter", social.twitter);
  setFormValue("youtube", social.youtube);
  setFormValue("applePodcast", social.applePodcast);
  setFormValue("spotify", social.spotify);
  setFormValue("appointmentUrl", appointment.url);

  importedLogo = normalizeStoredImage(
    {
      image_id: company.image_id,
      image_src: company.image_src,
      image_path: company.image_path,
      image_thumbnail: company.image_thumbnail || "",
    },
    "company",
  );
  importedBackgroundImage = normalizeStoredImage(
    {
      image_id: template.background_image_id,
      image_src: template.background_image_src,
      image_path: template.background_image_path,
      image_thumbnail: template.background_image_thumbnail || "",
    },
    "background",
  );
  importedGallery = Array.isArray(data.gallery)
    ? data.gallery
        .map((image) => normalizeStoredImage(image, "gallery"))
        .filter(Boolean)
        .slice(0, maxGalleryImages)
    : [];
  const services = Array.isArray(data.services)
    ? data.services.map((service) => ({
        ...service,
        image: normalizeStoredImage(
          {
            image_id: service.image_id,
            image_src: service.image_src,
            image_path: service.image_path,
            image_thumbnail: service.image_thumbnail || "",
          },
          "service",
        ),
      }))
    : [];

  renderLogoPreview();
  renderGalleryPreviews();
  renderBackgroundImagePreview();
  loadServices(services);
  loadReviews(data.reviews);
  updatePageColorControls();
  setWebsiteOperation("modify", accountEmail || contact.email || "");
  finalGeneration.hidden = true;
  previewFrame.removeAttribute("srcdoc");
  previewFrameShell.hidden = true;
  previewPlaceholder.hidden = false;
  setStatus("");
  showBuilderWorkspace();
}

startCreateWebsiteButton.addEventListener("click", () => {
  resetBuilderForm();
  showBuilderWorkspace();
});

showManageWebsiteButton.addEventListener("click", () => {
  managePanel.hidden = false;
  manageEmail.focus();
  managePanel.scrollIntoView({ behavior: "smooth", block: "center" });
});

showDeleteWebsiteButton.addEventListener("click", () => {
  deletePanel.hidden = false;
  deleteEmail.focus();
  deletePanel.scrollIntoView({ behavior: "smooth", block: "center" });
});

document.querySelectorAll("[data-close-panel]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(`#${button.dataset.closePanel}`).hidden = true;
  });
});

loadWebsiteButton.addEventListener("click", async () => {
  manageStatus.textContent = "";
  manageStatus.className = "home-panel-status";
  if (!manageEmail.value.trim() || !manageEmail.checkValidity()) {
    manageEmail.reportValidity();
    return;
  }

  const email = manageEmail.value.trim();
  const requestUrl = new URL(websiteGenerationEndpoint);
  requestUrl.searchParams.set("email", email);
  loadWebsiteButton.disabled = true;
  loadWebsiteButton.textContent = "Loading website...";

  try {
    const response = await fetch(requestUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    const responseData = await readGenerationApiResponse(response);
    if (
      !responseData.data ||
      typeof responseData.data !== "object" ||
      Array.isArray(responseData.data)
    ) {
      console.error("Generation API returned invalid website data.", responseData);
      throw new Error("The server returned an invalid response.");
    }
    loadWebsiteData(responseData.data, email);
  } catch (error) {
    manageStatus.textContent = error.message;
    manageStatus.className = "home-panel-status error";
  } finally {
    loadWebsiteButton.disabled = false;
    loadWebsiteButton.innerHTML =
      'Load website for editing <span aria-hidden="true">→</span>';
  }
});

deleteWebsiteButton.addEventListener("click", async () => {
  deleteStatus.textContent = "";
  deleteStatus.className = "home-panel-status";
  if (!deleteEmail.value.trim() || !deleteEmail.checkValidity()) {
    deleteEmail.reportValidity();
    return;
  }

  const email = deleteEmail.value.trim();
  if (
    !window.confirm(
      `Delete the website for ${email}? This action cannot be undone.`,
    )
  ) {
    return;
  }

  const requestUrl = new URL(websiteGenerationEndpoint);
  requestUrl.searchParams.set("email", email);
  deleteWebsiteButton.disabled = true;
  deleteWebsiteButton.textContent = "Deleting website...";
  try {
    const response = await fetch(requestUrl, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });
    await readGenerationApiResponse(response);
    deleteStatus.textContent = "Website deleted successfully.";
    deleteStatus.className = "home-panel-status success";
    deleteEmail.value = "";
    if (lockedWebsiteEmail.toLowerCase() === email.toLowerCase()) {
      resetBuilderForm();
      startCreateWebsiteButton.disabled = false;
      startCreateWebsiteButton.innerHTML =
        'Create website <span aria-hidden="true">→</span>';
      createWebsiteCard.classList.remove("website-created");
      createdWebsiteResult.hidden = true;
    }
  } catch (error) {
    deleteStatus.textContent = error.message;
    deleteStatus.className = "home-panel-status error";
  } finally {
    deleteWebsiteButton.disabled = false;
    deleteWebsiteButton.textContent = "Delete website";
  }
});

backToHomeButton.addEventListener("click", showHomeScreen);
headerHomeLogo.addEventListener("click", showHomeScreen);

builderContactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!builderContactForm.reportValidity()) return;
  if (!builderContactEndpoint) {
    contactUsStatus.textContent =
      "Contact form delivery will be available after the form endpoint is connected.";
    contactUsStatus.className = "home-panel-status";
    return;
  }

  contactUsStatus.textContent = "Sending message...";
  try {
    const response = await fetch(builderContactEndpoint, {
      method: "POST",
      body: new FormData(builderContactForm),
    });
    if (!response.ok) throw new Error(`Form returned ${response.status}.`);
    builderContactForm.reset();
    contactUsStatus.textContent = "Message sent successfully.";
    contactUsStatus.className = "home-panel-status success";
  } catch (error) {
    contactUsStatus.textContent = `Could not send message: ${error.message}`;
    contactUsStatus.className = "home-panel-status error";
  }
});

async function collectConfiguration() {
  const fieldValue = (name) => form.elements.namedItem(name)?.value || "";
  const logoField = form.elements.namedItem("logo");
  const logoFile = logoField?.files?.[0];

  const logo =
    logoFile instanceof File && logoFile.size > 0
      ? await readImage(logoFile)
      : importedLogo;
  const gallery = importedGallery;
  const backgroundImage = importedBackgroundImage;
  const services = await collectServices();
  const about = fieldValue("about");
  const reviews = collectReviews();
  const contactAccessKey = fieldValue("contactAccessKey");
  const email =
    websiteOperation === "modify" ? lockedWebsiteEmail : fieldValue("email");
  const phone = fieldValue("phone");
  const address = fieldValue("address");
  const appointmentUrl = fieldValue("appointmentUrl");
  const showCall = form.elements.namedItem("showCall")?.checked === true;
  const showEmail = form.elements.namedItem("showEmail")?.checked === true;

  return {
    companyName: fieldValue("companyName"),
    template: fieldValue("template"),
    yearStarted: fieldValue("yearStarted"),
    tagline: fieldValue("tagline"),
    description: fieldValue("description"),
    brandColor: fieldValue("brandColor"),
    secondaryColor: fieldValue("secondaryColor"),
    usePageColor: usePageColorField.checked,
    pageColor: pageColorField.value,
    transparentPageColor: transparentPageColorField.checked,
    pageColorOpacity: Number(pageColorOpacityField.value),
    font: fieldValue("font") || builderDefaults.font,
    about,
    services,
    servicesHeading: builderDefaults.servicesHeading,
    servicesLayout: builderDefaults.servicesLayout,
    reviews,
    reviewFormEndpoint: web3FormsEndpoint,
    reviewAccessKey: contactAccessKey,
    formEndpoint: web3FormsEndpoint,
    contactAccessKey,
    email,
    phone,
    showCall,
    showEmail,
    address,
    instagram: fieldValue("instagram"),
    facebook: fieldValue("facebook"),
    linkedin: fieldValue("linkedin"),
    twitter: fieldValue("twitter"),
    youtube: fieldValue("youtube"),
    applePodcast: fieldValue("applePodcast"),
    spotify: fieldValue("spotify"),
    appointmentUrl,
    sections: {
      about: Boolean(about),
      services: services.length > 0,
      gallery: gallery.length > 0,
      reviews: reviews.length > 0 || Boolean(contactAccessKey),
      contact: Boolean(
        contactAccessKey || email || phone || address || showCall || showEmail,
      ),
      appointment: Boolean(appointmentUrl),
    },
    logo,
    gallery,
    backgroundImage,
  };
}

async function renderPreview() {
  if (!isLocalBuilder) {
    setStatus(
      "Preview is available when the Website Builder runs locally.",
      "error",
    );
    return;
  }

  if (!(await checkServer())) {
    setStatus(
      "Cannot preview because the Website Builder server is disconnected.",
      "error",
    );
    return;
  }

  previewButton.disabled = true;
  setStatus("Building preview...");
  try {
    const payload = await collectConfiguration();
    const response = await fetch(`/api/preview?time=${Date.now()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "The website preview could not be created.");
    }

    previewFrame.srcdoc = result.html;
    previewFrameShell.hidden = false;
    previewPlaceholder.hidden = true;
    finalGeneration.hidden = false;
    setStatus("Website preview updated.", "success");
    previewSection.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    const message =
      error instanceof TypeError
        ? "The Website Builder server stopped responding. Restart start.command."
        : error.message;
    setStatus(message, "error");
  } finally {
    previewButton.disabled = !serverConnected;
  }
}

previewButton.addEventListener("click", renderPreview);

document.querySelectorAll("[data-preview-size]").forEach((button) => {
  button.addEventListener("click", () => {
    const mobile = button.dataset.previewSize === "mobile";
    previewFrameShell.classList.toggle("mobile", mobile);
    document.querySelectorAll("[data-preview-size]").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
  });
});

form.addEventListener("submit", (event) => event.preventDefault());

checkServer();
