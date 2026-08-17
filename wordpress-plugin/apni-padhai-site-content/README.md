# Apni Padhai Site Content

WordPress plugin that lets you manage the Apni Padhai website content **directly from wp-admin** — no developer needed:

| Menu (wp-admin)   | What you manage                                          |
| ----------------- | -------------------------------------------------------- |
| **Hero Slides**   | Homepage title, gold highlight word, subtitle            |
| **Testimonials**  | Student name, exam, rank, city, rating, quote, photo     |
| **FAQs**          | Question, answer, category                               |
| **Courses**       | Title, description, enroll URL, tagline, badge, type, image, feature tags |
| **Books**       | Already managed in WordPress via **WooCommerce → Products** |
| **Apni Padhai Store** | Delivery charges (₹40) and the site-wide discount (percentage or flat ₹) |

Every item supports **create, edit, reorder and delete**. Images are picked from the WordPress **Media Library** — upload from the WordPress dashboard or your phone, then just click to attach.

## Store settings (shipping + discount)

Open **Apni Padhai Store** in the wp-admin sidebar:

- **Delivery Charges** — set the shipping amount (default ₹40) and its label. Set the amount to `0` for free delivery.
- **Discount** — enable a discount applied to every order. Choose **Percentage** (e.g. `10` = 10% off) or **Flat amount** (e.g. `50` = ₹50 off), and set its label.

These are fetched by the website and applied automatically at checkout and to the actual order total.

## Installation

1. Zip this `apni-padhai-site-content` folder → `apni-padhai-site-content.zip`
2. WordPress Admin → **Plugins → Add New → Upload Plugin** → choose the zip → **Install Now**
3. **Activate** the plugin. That's it.

## How to use

- Add/Edit items under the **Hero Slides / Testimonials / FAQs / Courses** menus in the sidebar.
- The **title** box and **main editor** are the main content (e.g. the testimonial quote, the FAQ answer, the course description).
- Extra fields live in the **Content Details** box.
- Use the **Order** number in the Publish box to sort — lower numbers appear first.
- The website picks up changes automatically (usually within a minute).

## How the website reads it

The plugin exposes each item as a public REST endpoint that the Apni Padhai site reads:

- `/wp-json/wp/v2/ap_hero`
- `/wp-json/wp/v2/ap_testimonial`
- `/wp-json/wp/v2/ap_faq`
- `/wp-json/wp/v2/ap_course`

Example: `https://apnipadhaipublication.com/wp-json/wp/v2/ap_testimonial?per_page=100&orderby=menu_order&order=asc`

If the plugin is not installed, the website falls back to reading the old WordPress pages, so nothing breaks.

## Requirements

- WordPress 5.5+
- WordPress REST API enabled (default)
- No WooCommerce/extra plugins required for this plugin to work
