# JAHIM TRADER — Bot only

The site opens straight into the Deriv Bot template (`/t/bot/`), shown full-screen by `index.html` + `shell.js`.

## Go-live
1. Push this folder as-is to your GitHub Pages repo (keep `.nojekyll` and `CNAME`).
2. Deriv dashboard → your app → **Redirect URLs** → add exactly `https://jahim.crabdance.com` (no trailing slash).
3. Open the site → **Log in**.

## Login flow
Deriv's login page can't be framed, so the Bot's Log in / Sign up navigate the top window. Deriv returns to
`/?code=…&state=…`; `shell.js` forwards that query string to the Bot iframe, which finishes the login itself.
