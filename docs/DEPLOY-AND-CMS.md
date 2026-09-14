# Deploying the site and setting up the CMS

Written for the developer maintaining this repo. Everything below is free.
Both steps need a browser and your own accounts, so they are done by you, not by a script.

```
 owner edits in Pages CMS ──commit──▶ GitHub repo (private) ──webhook──▶ Cloudflare Pages
 (browser, e-mail login)                 source of truth                   builds & hosts
                                                                            https://<name>.pages.dev
```

---

## Part 1 — Hosting on Cloudflare Pages (≈10 minutes)

Why Cloudflare Pages: free with unlimited bandwidth, automatic HTTPS, edge servers in India,
reads `public/_headers` for the security headers, and rebuilds on every commit.

### Why not the others (all checked against their current docs)

| Host                 | Free tier                                                            | Verdict for a business site                                                                                                                      |
| -------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Cloudflare Pages** | Unlimited bandwidth & requests, 500 builds/month, `_headers`         | ✅ Use this. No commercial-use restriction, ~300 edge locations incl. many Indian cities, no cold starts (static files are served from the CDN). |
| Vercel Hobby         | 100 GB/month, fast, excellent DX                                     | ❌ Its own docs: _"the Hobby plan restricts users to non-commercial, personal use only."_ A shop site is commercial — accounts get paused.       |
| Netlify Free         | 100 GB/month, 300 build-min/month, reads `_headers`                  | ⚠️ Acceptable fallback. Commercial use allowed, but bandwidth is capped and the free tier has shrunk over the years.                             |
| GitHub Pages         | Unlimited-ish, but public repos only on the free plan, no `_headers` | ❌ Would expose the repo and drop the security headers.                                                                                          |
| Render Static        | 100 GB/month                                                         | ❌ No advantage; Render's "spin-down" applies to its web services, not static sites, but there is nothing here Cloudflare doesn't do better.     |

Speed: for a static site every host above serves from a CDN, so real-world difference is
small. Cloudflare has the densest network in India (Mumbai, Chennai, Bengaluru, Hyderabad,
Kolkata, Delhi and more), which is where the customers are.

1. Push the repo to GitHub (private is fine).
2. <https://dash.cloudflare.com> → sign up / log in → **Workers & Pages** → **Create** →
   **Pages** → **Connect to Git** → authorise GitHub → choose `Sarathi-Udyog`.
3. Build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variables → add `NODE_VERSION` = `22`
4. **Save and Deploy**. First build takes ~2 minutes. You get `https://sarathi-udyog.pages.dev`
   (Cloudflare lets you pick the project name; pick a clean one, it is the public URL).
5. Open the URL on a phone. Tap a WhatsApp button and confirm the prefilled message arrives.
6. Put the final URL in two files and push once more:
   - `astro.config.mjs` → `site: 'https://<your-name>.pages.dev'`
   - `public/robots.txt` → the `Sitemap:` line
7. Paste the URL into a WhatsApp chat: the yellow logo card (`public/og-image.jpg`) should
   appear as the preview. Then add the URL to the Google Business Profile under _Website_.

From now on **every commit to `main` redeploys automatically** — whether it comes from you
(`git push`) or from the owner through the CMS. Cloudflare keeps every previous deployment;
a bad change can be rolled back from the dashboard in one click.

A custom domain (e.g. `sarathiudyog.in`) can be attached later under _Custom domains_
without changing anything in the repo.

---

## Part 2 — CMS for the owner (Pages CMS)

### What it is

[Pages CMS](https://pagescms.org) is a free, open-source (MIT) web app. It has no database of
its own: it reads and writes the JSON files in this repo through the GitHub API. The forms it
shows are defined in `.pages.yml` (already written — _Products_ and _Site settings_).

The owner never sees GitHub, JSON, or code. They see a list of products with photos, open one,
change the price, press **Save**. Behind the scenes that is one git commit on `main`, which
Cloudflare picks up and publishes in about a minute.

### The owner has no GitHub account — and doesn't need one

Pages CMS has **e-mail invites** ("Invite users via email, no other account needed" — from
pagescms.org). Only _you_ sign in with GitHub, once. The owner signs in with their e-mail.

1. **You**, once: go to <https://app.pagescms.org> → _Sign in with GitHub_ → when GitHub asks
   where to install the Pages CMS app, choose **Only select repositories → `Sarathi-Udyog`**.
2. Open the repo in Pages CMS. Check that _Products_ shows the eight products with photos and
   _Site settings_ shows the phone numbers (both come from `.pages.yml`).
3. In the repo's Pages CMS settings → **Collaborators** → invite the owner's e-mail address
   (any e-mail works: Gmail, the business address, whatever they read on their phone).
4. **The owner** gets an e-mail from Pages CMS. They tap the link, sign in with that e-mail,
   and see only this repository, with only _Products_ and _Site settings_ — a collaborator
   cannot edit `.pages.yml`, manage other collaborators, or see anything else.
5. On the owner's phone, bookmark <https://app.pagescms.org> to the home screen. Next visit
   opens straight into the product list.

Commits made by the owner go through the Pages CMS GitHub App (installed on this one repo);
`.pages.yml` sets `commit.identity: user`, so the owner's name/e-mail is recorded on each
commit and `git log` shows exactly who changed what.

Give the owner the one-page cheat sheet at the bottom of this file.

### Is it safe to give this access?

Yes — nothing about your GitHub account is shared:

| Concern                            | Reality                                                                                                                                                                                   |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Does the owner get a GitHub login? | No. They have an e-mail login to Pages CMS only. They never see GitHub.                                                                                                                   |
| Can the owner break the site?      | A wrong value (text in the price field, a missing photo) makes the **build fail**, and Cloudflare keeps the last good version live. The schema in `src/content.config.ts` enforces types. |
| Can they delete everything?        | No. Collaborators can only create/edit/delete content entries and media in the folders `.pages.yml` names. Every save is a normal commit — anything can be reverted with `git revert`.    |
| Can they reach your other repos?   | No. The Pages CMS GitHub App is installed on this one repository, and collaborators are invited per repository.                                                                           |
| Does Pages CMS see your code?      | Its GitHub App token can read/write the repositories _you_ installed it on — this one only. There are no secrets in the repo (no API keys, no `.env`).                                    |
| Does the owner need to know git?   | No. They never leave the Pages CMS screens.                                                                                                                                               |
| Who pays?                          | Nobody. Pages CMS ("100% free … the online version"), GitHub private repo, Cloudflare Pages free plan.                                                                                    |

What you keep: ownership of the repo and the Cloudflare account, the ability to remove the
collaborator or uninstall the GitHub App at any time, and full history of every change.

If Pages CMS ever changed its terms, the exit is painless: the content is plain JSON in your
repo, and Sveltia CMS (self-hosted, free) reads a near-identical config.

### Alternatives considered

- **Sveltia CMS / Decap CMS** — same idea, self-hosted at `/admin/` in this site, but still
  needs a GitHub login plus a small OAuth worker. More moving parts, same requirement.
- **TinaCMS, Keystatic** — email/password logins exist on their clouds, but they require
  integrating a build step and their free tiers are user-limited; overkill here.
- **Owner messages you the change** — always works as a fallback: edit the JSON, push, done.

---

## Owner cheat sheet (print or WhatsApp this)

**Sarathi Udyog website — how to change prices and products**

1. Open **app.pagescms.org** (bookmark on your phone). If asked, sign in with your e-mail —
   the same one the invitation came to.
2. Tap **Products**. You will see all products with photos.
3. Tap a product. Change the **Price**, **Pack size**, **Ingredients**, or anything else.
   - Leave **Price** empty to show "Ask for price".
   - Switch **Available** off when something is out of stock (it stays listed, marked
     "Currently unavailable").
4. Tap **Save** (top right). Wait 1–2 minutes and refresh the website — the change is live.
5. New product: **Products → + New** → fill the form → upload a photo → Save.
6. Remove a product: open it → **⋯ → Delete**.
7. Phone numbers, address, delivery text: **Site settings**.

If something looks wrong, message the developer — every change can be undone.
