# app2it site

The source of [app2it.com](https://app2it.com), built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build). It's static. The only thing it loads from another site is Cloudflare Web Analytics, for cookie-free page counts.

The app2it code isn't public yet. It will be released under Apache-2.0 in [`app2it/app2it`](https://github.com/app2it/app2it).

## Run it

```sh
npm ci
npm run dev
```

## Check it

```sh
npx playwright install chromium   # once
npm run check
```

That runs the build, an internal link check, a scan for private details, and browser tests for accessibility, page width and outside requests.

## Writing for this site

Every claim must be true on the day the page goes live, and trace to code, a test or a recorded result. Say what isn't done yet, and say "builder", not "developer".

## License

[Apache-2.0](LICENSE). To report a vulnerability, see [SECURITY.md](SECURITY.md).
