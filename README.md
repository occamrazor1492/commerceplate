<h1 align=center>Commerceplate | NextJs + Shopify + Tailwind CSS + TypeScript Starter and Boilerplate</h1>

<p align=center>A free, production-ready Next.js template powered by Tailwind CSS and TypeScript, specifically designed for Shopify. Utilizes the Shopify Storefront API through GraphQL and providing everything you need to jumpstart your Next project and save valuable time.</p>

<p align=center>Made with ♥ by <a href="https://zeon.studio/">Zeon Studio</a></p>
<p align=center> If you find this project useful, please give it a ⭐ to show your support. </p>

<h2 align="center"> <a target="_blank" href="https://commerceplate.netlify.app/" rel="nofollow">👀 Demo</a> | <a  target="_blank" href="https://pagespeed.web.dev/analysis/https-commerceplate-netlify-app/c4gacsjy7n?form_factor=desktop">Page Speed (97%)🚀</a>
</h2>

<p align=center>

  <a href="https://github.com/vercel/next.js/releases/tag/v16.0.1" alt="Contributors">
    <img src="https://img.shields.io/static/v1?label=NEXTJS&message=16.0.1&color=000&logo=nextjs" alt="nextjs 16.0.1"/>
  </a>

  <a href="https://github.com/zeon-studio/commerceplate/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/zeon-studio/commerceplate" alt="license"></a>

  <img src="https://img.shields.io/github/languages/code-size/zeon-studio/commerceplate" alt="code size">

  <a href="https://github.com/zeon-studio/commerceplate/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/zeon-studio/commerceplate" alt="contributors"></a>
</p>

## 📌 Key Features

- 🌐 Dynamic Products from Shopify Storefront API
- 💸 Checkout and Payments with Shopify
- 🌞 Automatic Light/Dark Mode
- 🚀 Fetching and Caching Paradigms
- 🔗 Server Actions for Mutations
- 🔐 User Authentication
- 🧩 Similar Products Suggestions
- 🔍 Search, Sort, Different Views Functionality
- 🏷️ Tags & Categories & Vendors & Price Range & Product Variants Functionality
- 🖼️ Single Product Image Zoom, Hover Effect, Slider
- 🛒 Cart & Easy editing options for cart items
- 📝 Product Description on Multiple Tabs
- 🔗 Netlify Setting Pre-configured
- 📞 Support Contact Form
- 📱 Fully Responsive
- 🔄 Dynamic Home Banner Slider
- 📝 Write and Update Content in Markdown / MDX
- ⌛ Infinite Product Load on Scrolling

### 📄 10+ Pre-designed Pages

- 🏠 Homepage
- 👤 About
- 📞 Contact
- 🛍️ Products
- 📦 Product Single
- 💡 Terms of services
- 📄 Privacy Policy
- 🔐 Login
- 🔑 Register
- 🚫 Custom 404

## 🚀 Getting Started

### 📦 Dependencies

- shopify
- next 16.0+
- node v20.10+
- npm v10.2+
- tailwind v4.1+

<!-- get Shopify storefront API access token-->

## 🛒 Retrieve Shopify Token & Add Demo Products

> **Note:** Shopify has transitioned to the new **Headless Sales Channel** authentication system using Public/Private Access Tokens. The old "Private Apps" system is deprecated. Follow the steps below to get your tokens.

### Step 1: Create a Shopify Store

- To get the tokens needed, create a Shopify partner account.
  ![Screenshot_1](https://raw.githubusercontent.com/tfmurad/images-shopify-commerce/refs/heads/main/1.png)

- Now go to 'stores' and select 'Add store.' Create a development store using the option 'Create development store'.
  ![Screenshot_2](https://raw.githubusercontent.com/tfmurad/images-shopify-commerce/refs/heads/main/2.png)

- Click on import products.
  ![Screenshot_3](https://raw.githubusercontent.com/tfmurad/images-shopify-commerce/refs/heads/main/3.png)

- Locate the 'products' CSV file in the public folder of the repository and upload it for demo products.
  ![Screenshot_4](https://raw.githubusercontent.com/tfmurad/images-shopify-commerce/refs/heads/main/4.png)

### Step 2: Create a Headless Sales Channel (New Method)

- On the admin dashboard, click on 'Settings' at the bottom of the left sidebar.
  ![Screenshot_5](https://raw.githubusercontent.com/tfmurad/images-shopify-commerce/refs/heads/main/5.png)

- On the Settings page, click on 'Apps and sales channels' on the left sidebar.
  ![Screenshot_6](https://raw.githubusercontent.com/tfmurad/images-shopify-commerce/refs/heads/main/6.png)

- Click on 'Shopify App Store' to browse apps.

- Search for and install the **"Headless"** sales channel app (official Shopify app).

- Once installed, open the Headless channel and click 'Create storefront'.

- Give your storefront a name (e.g., "Next.js Storefront").

- Navigate to the 'API credentials' or 'Storefront API' tab to get your tokens:
  - **Private Access Token**: Used for server-side API calls (required)
  - **Public Access Token**: Used for client-side/browser queries (optional)
  - **Storefront API endpoint**: Your store domain (e.g., `your-store.myshopify.com`)

### Step 3: Configure Environment Variables

- Copy `.env.example` to `.env` and fill in your credentials:

```bash
SHOPIFY_STORE_DOMAIN="your-store.myshopify.com"
SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN="your-private-access-token"
SHOPIFY_REVALIDATION_SECRET="your-revalidation-secret"  # Optional, for webhooks
```

> **Migration from old system:** If you have existing `SHOPIFY_STOREFRONT_ACCESS_TOKEN` or `SHOPIFY_API_SECRET_KEY` values, they will continue to work. However, we recommend migrating to the new token format for better security.

- When adding your product, use the same alt title for images with the same color. This helps the first image appear as the color variant in the selector.
  ![Screenshot_13](https://raw.githubusercontent.com/tfmurad/images-shopify-commerce/refs/heads/main/13.png)
  ![Screenshot_14](https://raw.githubusercontent.com/tfmurad/images-shopify-commerce/refs/heads/main/14.png)

- We have the option to create additional collections for products.
  ![Screenshot_15](https://raw.githubusercontent.com/tfmurad/images-shopify-commerce/refs/heads/main/15.png)

## 🚀 Setting Up the Hero Slider

1. Go to the file `/src/config/config.json` in your Shopify project and find the 'hero_slider' section. You’ll see something like this:

   ```json
   "shopify": {
     "currencySymbol": "৳",
     "currencyCode": "BDT",
     "collections": {
       "hero_slider": "hidden-homepage-carousel",
       "featured_products": "featured-products"
     }
   }
   ```

2. Change the 'hero_slider' collection name to something of your choice.

3. Then, go to your Shopify Partner Dashboard, navigate to Products > Collections, and create a collection with the same name you set in the config file (e.g., 'hidden-homepage-carousel').

4. Add the products you want to display in the hero slider to this collection.

### 👉 Install Dependencies

```bash
npm install
```

### 👉 Development Command

```bash
npm run dev
```

### 👉 Build Command

```bash
npm run build
```

### 👉 Cloudflare Workers

This project can be built for Cloudflare Workers with OpenNext. The Worker build uses the Next.js Node.js runtime through `@opennextjs/cloudflare`, so do not add `export const runtime = "edge"` to app routes.

```bash
npm run build:cf
npm run preview:cf
```

For local Worker previews, copy `.dev.vars.example` to `.dev.vars` and add the Shopify credentials from `.env.example`. The minimum storefront variables are:

```bash
SHOPIFY_STORE_DOMAIN="your-store.myshopify.com"
SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN="your-private-access-token"
```

Deploying to Cloudflare requires an authenticated Wrangler session:

```bash
npx wrangler whoami
npm run deploy:cf
```

The default `wrangler.jsonc` points to `.open-next/worker.js`, serves static assets from `.open-next/assets`, enables `nodejs_compat`, and includes the Cloudflare Images binding for Next.js image optimization. Cloudflare Images may require account setup and can incur platform charges.

#### Cloudflare Workers（中文）

本项目可以通过 OpenNext 构建并部署到 Cloudflare Workers。当前配置使用 `@opennextjs/cloudflare` 的 Next.js Node.js runtime，因此不要在 app routes 里添加 `export const runtime = "edge"`。

```bash
npm run build:cf
npm run preview:cf
```

本地预览 Worker 时，复制 `.dev.vars.example` 为 `.dev.vars`，然后填入 `.env.example` 中对应的 Shopify 环境变量。最少需要：

```bash
SHOPIFY_STORE_DOMAIN="your-store.myshopify.com"
SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN="your-private-access-token"
```

部署到 Cloudflare 前，需要先登录 Wrangler：

```bash
npx wrangler whoami
npm run deploy:cf
```

默认的 `wrangler.jsonc` 会使用 `.open-next/worker.js` 作为 Worker 入口，从 `.open-next/assets` 提供静态资源，启用 `nodejs_compat`，并为 Next.js 图片优化配置 Cloudflare Images 绑定。Cloudflare Images 可能需要在账号中启用，并可能产生平台费用。

<!-- reporting issue -->

## 🐞 Reporting Issues

We use GitHub Issues as the official bug tracker for this Template. Please Search [existing issues](https://github.com/zeon-studio/commerceplate/issues). It’s possible someone has already reported the same problem.
If your problem or idea has not been addressed yet, feel free to [open a new issue](https://github.com/zeon-studio/commerceplate/issues).

<!-- licence -->

## 📝 License

Copyright (c) 2023 - Present, Designed & Developed by [Zeon Studio](https://zeon.studio/)

**Code License:** Released under the [MIT](https://github.com/zeon-studio/commerceplate/blob/main/LICENSE) license.

**Image license:** The images are only for demonstration purposes. They have their license, we don't have permission to share those images.

## 💻 Need Custom Development Services?

If you need a custom theme, theme customization, or complete website development services from scratch you can [Hire Us](https://zeon.studio/).
