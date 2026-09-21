# Configurable Website Builder

This local tool generates a responsive static company website from a browser
form. It was designed using the nearby `choseAlignment` website as a visual
reference and does not require third-party Python packages.

## Run

On macOS, double-click `start.command`, or run:

```bash
python3 server.py
```

The builder opens at <http://127.0.0.1:8766>. Complete the form and select
**Create website** to publish it through the configured generation API.
Optional pages are included automatically when their corresponding content is
provided.

Preview is rendered entirely in the browser using the reusable static assets
under `preview/`. It does not call `/api/preview`, so it works from GitHub Pages
and other static hosts as well as from the local builder. The iframe receives
the current configuration through same-origin browser messaging.

Builder-facing text and colors are kept in the small `data/data.json` file.
Change values under `headings`, `taglines`, or `about` to update the matching
builder content. The `colors` section contains only `primary`, `button`, and
`completion`; the completion color controls the Create/Modify success area.
APIs, validation rules, defaults, and image limits remain in code.

The shared GudiSpace pages also read this file. `brand.logoPath` points to the
logo under `data/`, `howItWorks` contains `{ "heading", "description" }`
objects, `faq` contains `{ "question", "answer" }` objects, and `examples`
contains `{ "category", "heading", "description", "url" }` objects. When
`examples` is empty, the Examples navigation item is hidden.

The builder uses nine named steps. The step names at the top are clickable for
quick navigation, while forward navigation still validates required earlier
fields. Template configuration is step 8 and Preview is step 9. The Create or
Modify action is revealed beside Preview only after a preview is generated
successfully. An information popup explains that edit previews may use
compressed thumbnails while the published website uses original images.

The home screen offers three website paths:

- **Create website** opens a clean builder for a new customer.
- **Manage website** accepts the customer email, fetches the website with
  `GET /api/generate?email=<customer-email>`, and loads the response `data`
  object into the same builder for editing. Embedded image thumbnails are used
  in the editor, while image paths are preserved for the generated website.
  The email is locked during editing, and saving sends the payload with `PUT`.
- **Delete website** accepts the account email and, after confirmation, sends
  `DELETE /api/generate?email=<customer-email>`.

After a website is created successfully, the builder returns to the home
screen, displays the hosted website URL, disables the Create action, and changes
the adjacent Manage action to **Edit website**. Edit reloads the just-created
JSON into the same form for continued updates.

The home screen also contains a Contact us form. Its delivery endpoint is kept
in the `builderContactEndpoint` constant in `app.js` so it can be connected to
Web3Forms or another form service later.

On a hosted deployment, the local Python server status is hidden and website
creation continues to call the configured remote API directly. Server-rendered
preview is available only when the builder runs on localhost.

Select **Preview website** to render the current configuration at the bottom of
the builder. The preview can be switched between desktop and mobile widths
without writing any output files.

Choose from three structural layouts before previewing or generating:
**logo-left/content-right**, **content-left/logo-right**, and
**centered/stacked**. All three use the selected brand styling and company
content. The selected layout is stored in the generated website's data folder.
Template selection is placed beside the preview controls at the bottom of the
builder.

The generated design uses three configurable colors: a primary accent color, a
secondary hero/navigation color, and a page background color for About,
Services, Gallery, Reviews, Contact, and Appointment. Readable foreground
colors are selected automatically for each choice, while cards and forms remain
clear content surfaces.

An optional background image can be uploaded on the final design and preview
page. It fills the homepage hero and page-header areas behind a secondary-color
overlay for readability and copies it into the generated website's data folder.

Custom page backgrounds are optional. If the option is not selected, the
original `#fbfaf7` background is used. When enabled, the selected color can be
opaque or use an adjustable 10–100% color strength. Contrast is calculated
against the resulting blended background.

Transparent backgrounds use a frosted-glass surface over a gradient built from
the primary and secondary brand colors. Lower opacity reveals more of that
gradient; increasing opacity makes the selected page color more solid. Default
and opaque backgrounds do not show the gradient.

All color and transparency controls are placed in the bottom Template and Demo
area so users can adjust the visual design immediately before rendering a
preview.

The builder never creates placeholder company claims or customer reviews.
About, Services, Gallery, Reviews, Contact, and Appointment pages are included
automatically when the user provides corresponding content. The footer displays
the configured starting year through the current year.

The generated folder contains reusable `about.html`, `services.html`,
`gallery.html`, `contact.html`, `reviews.html`, and `appointment.html`
templates. Shared styling and behavior remain in `styles.css` and `script.js`.
These files are identical between generated websites; company-specific content,
section visibility, styling choices, and media paths come from `data/`.

The homepage loads the enabled page bodies in sequence, producing one
continuous scrolling experience. Visitors can scroll naturally from About to
Services, Gallery, Contact, Reviews, and Appointment, while every section
remains available as a reusable HTML template.
The fixed navigation uses scroll tracking so its active tab follows the section
currently visible on the homepage. Tracking is based on deterministic section
boundaries rather than viewport intersection percentages, so exactly one tab
remains active even when sections have very different heights.

Frequently edited content is stored separately:

```text
data/
  data.json
  company/company-<stable-id>.jpg
  service/service-<stable-id>.jpg
  gallery/gallery-<stable-id>.jpg
  background/background-<stable-id>.jpg
```

Every generated page loads `data/data.json` at runtime. This single file
contains company details, template settings, enabled sections, services,
reviews, contact and Web3Forms settings, social links, appointment settings,
and paths to extracted images.

```json
{
  "schemaVersion": 1,
  "company": {
    "companyName": "Bright Path Studio",
    "image_path": "data/company/company-<stable-id>.jpg",
    "image_src": "",
    "image_thumbnail": "data:image/webp;base64,..."
  },
  "services": [],
  "gallery": [],
  "reviews": []
}
```

Every image uses matching path, source, and thumbnail fields:

- Both generated and downloaded/API JSON put the intended relative file
  location in `*_path`.
- Generated websites leave `*_src` empty because the image already exists at
  `*_path`.
- Downloaded or API JSON additionally stores the image data URL in `*_src`, so
  the receiver knows both where to save the image and what content to write.
- `*_thumbnail` contains a small embedded preview used by the edit interface.
- Company logos use `company.image_path`, `company.image_src`, and
  `company.image_thumbnail`.
- Background, service, and gallery images use `background_image_*` or
  `image_*` fields.
- Company, background, service, and gallery media have stable image IDs. Their
  filenames use those IDs rather than fixed names or list positions. Replacing
  an image creates a new path, while unchanged images retain their existing
  paths through editing and reordering.

A CMS or REST API can replace `data/data.json` and its referenced image files
without rebuilding the HTML, CSS, or JavaScript. The builder sends this
delivery payload with uploaded images embedded as data URLs:

```json
{
  "branchName": "Bright Path Studio",
  "data": {
    "schemaVersion": 1,
    "company": {}
  }
}
```

`branchName` is the entered company name, and `data` contains the complete
portable `data.json` structure. The generated website still stores the
unwrapped structure directly in `data/data.json`.

The **Create website** action sends the same delivery payload as an
`application/json` POST to
`https://test.logeshgopal0712.workers.dev/api/generate`. When the JSON response
contains `success: true` and a valid `previewUrl`, the builder displays a link
to the hosted website. When any generation API response contains
`success: false`, the builder displays only its `message` value.
`error_message` is written to the browser console for diagnostics and is never
shown in the interface. This is a direct browser request, so the endpoint must
permit it through CORS.

For an API-loaded website, the final action changes to **Modify website** and
sends the same delivery payload with `PUT`. Its success response uses the same
hosted website link and deployment guidance as creation.

The Reviews page can also collect new reviews without publishing them
automatically. Create a Web3Forms account and enter one access key in the
builder to deliver both review and contact submissions to the owner's email.
The form sends the reviewer's name and email,
review text, star count, and a subject such as
`New 5-star customer review for Company`. The owner can approve the submission
and append it to the `reviews` array in `data/data.json`. The form service email provides
the submission timestamp; the owner chooses the date stored with the published
review.

Contact and Review forms include Web3Forms hCaptcha when their endpoint is
`https://api.web3forms.com/submit`. Web3Forms verifies the CAPTCHA token on its
backend before accepting the submission. Each CAPTCHA is rendered and reset
independently, allowing both forms to coexist on the scrolling homepage. Both
forms also include Web3Forms' honeypot field. Create the shared form access key
in Web3Forms using the business owner's destination email, then paste it into
the builder.
Both forms submit in the background and show an on-page success or error popup,
so visitors are not redirected away from the website. A shared access key is
supported: Contact submissions use `New contact request for Company`, while
Review submissions use a subject such as
`New 5-star customer review for Company`.

Published reviews are entered through separate customer name, review, date, and
star-rating fields. Review entries use this format:

```json
{
  "name": "Alex Morgan",
  "review": "Professional and easy to work with.",
  "date": "2026-09-04",
  "stars": 5
}
```

The generated page displays the review text, reviewer name, date, and star
rating. A site may start with no published reviews; the submission form remains
available while approved reviews are collected.
The `gallery` array in `data/data.json` lists every image displayed from the
gallery folder. The builder accepts up to eight PNG, JPG, WebP, GIF, HEIC, or
HEIF gallery images. HEIC and HEIF images are decoded in the browser using the
locally bundled `heic2any` converter, then converted to WebP. Images over 2 MB
or 2560 pixels on their longest side are also resized and compressed to WebP.
Original uploads have a 20 MB safety limit. A CMS should
update this list whenever it adds or removes an image because static web hosts
do not provide browser-readable folder listings.

JSON-backed pages must be opened through HTTP rather than by double-clicking
the HTML files. Double-click the generated website's `start.command`, or deploy
the folder to GitHub Pages or another static host.

Generated websites currently use DM Sans + Manrope.

Services, reviews, and gallery items are displayed as fixed-height horizontal
carousels. Visitors can swipe on phones, use a trackpad, or click the previous
and next arrow buttons instead of scrolling through a long vertical list.
Carousel arrows disable automatically at the first and last item and movement
is clamped to the available content, preventing blank slides. Horizontal
service cards use a wider, fixed-height phone layout so media and details remain
readable.

Offerings use a left-to-right carousel and the fixed section heading
**What we offer**. In the builder, every offering has separate fields for:

```text
Title, Description, Price, Link, Payment link, Local image,
Video link
```

All service fields are optional. Links can point to Amazon, marketplaces,
course platforms, or any other HTTP/HTTPS destination. Videos must first be
uploaded to YouTube, Vimeo, or another hosting service; paste the public link
into the builder. Service images are selected from the local computer and
copied to `data/services/images/`. Exported
The `services` array in `data/data.json` stores each service as a separate JSON
object.

Offering and review editors can be minimized, reordered by dragging, or moved
with the up/down controls. Gallery thumbnails can also be dragged to change
their display order. The visible order is preserved in the submitted JSON.

The payment link is optional and should point to a hosted checkout page such as
Stripe Payment Links, PayPal, Razorpay, Square, Gumroad, or another payment
provider. When present, the service card displays a **Pay now** button. Payment
details and private API keys are never stored in the generated website.

Optional Instagram, Facebook, LinkedIn, Twitter/X, YouTube, Apple Podcasts, and
Spotify actions appear under a **Follow** heading below the home-page hero and
again above the footer. Call and email have explicit visibility controls in the
builder and appear only in the top group. On a phone, Call opens the dialer; on
a desktop it reveals a copyable phone number. Email reveals the owner's address
with both mail and copy actions.

Uploaded logos and gallery thumbnails use responsive, fixed-shape frames with
`object-fit: cover`, so unusual image dimensions cannot widen the page. Clicking
a gallery image opens a viewport-contained preview that uses `object-fit:
contain` to show the complete image. Contact and Review explanatory text is
placed above a centered form on larger screens, with the same single-column
layout retained on phones.

Entering a Calendly event URL automatically adds `appointment.html` with a
responsive embedded scheduler. The appointment section also appears in
continuous homepage scrolling and navigation without changing other pages.

## Contact form

Enter an HTTPS form endpoint from a service that accepts regular HTML form
submissions, such as Formspree or Formspark. The generated website posts the
visitor's name, email, phone, and message to that endpoint.
