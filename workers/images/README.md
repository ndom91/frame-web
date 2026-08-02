# frame-images

Serves frame photos from the `domino-display` R2 bucket at
`img.frame.domino.photos`, gated on a signed cookie the Next app mints.

The bucket has **no public read path**. Previously `images.frame.ndo.dev` was an
R2 custom domain, which meant anyone with a key could `curl` a photo — key
prefixes are frame IDs and filenames look like `IMG_5314.jpeg`, so they were
guessable. Access control only covered the *listing*, not the objects.

## How a request is authorised

1. The Next app signs a cookie on `/api/media` and `/api/frames/overview` —
   endpoints the gallery already calls before rendering any image, so there's no
   extra round trip. Payload is the set of frame prefixes the session may read,
   plus an expiry, HMAC-SHA256 signed.
2. The cookie is scoped `Domain=domino.photos`, so the browser sends it to this
   Worker as well as the app.
3. The Worker verifies the signature and expiry, then checks the requested key's
   `<frameId>/` prefix is in the cookie. A valid cookie for one frame does not
   grant another.

`src/cookie.ts` is the verification half of a format shared with
`app/lib/image-cookie.ts` in the Next app. The two are separate copies because
this Worker deploys independently — **changes to the wire format have to land in
both**.

## Resizing

`?w=400`, `?w=800`, `?w=1600` return a WebP of that width via the Images
binding. Any other value serves the original untouched.

The width list is closed on purpose: transformations bill per *unique*
(image, parameters) pair per month against a 5,000/month allowance, so an open
`?w=` would let a single caller exhaust it.

## Caching

Auth is checked before the cache is consulted, and the cache key includes a
digest of the caller's entitlements — so a cached object can only ever be served
to someone allowed the same frames. Responses are stored `public` (so the edge
keeps them) but returned `private` (so nothing between here and the browser
caches them without the check).

## Deploying

```sh
cd workers/images
pnpm install
pnpm exec wrangler secret put IMAGE_COOKIE_SECRET   # same value as the app's env
pnpm deploy
```

`img.frame.domino.photos` is configured as a **Workers custom domain** (see
`wrangler.toml`), which provisions an Advanced Certificate for that exact
hostname. A plain route does not work: the hostname is two labels deep and
Universal SSL only covers the apex plus one level of subdomain, so TLS fails
before a request is ever made.

Wrangler creates the DNS record itself, so there must be no pre-existing record
for the hostname — delete any placeholder first or the deploy conflicts.

It must not be an **R2** custom domain; that is what made the bucket public.

## Local development

```sh
pnpm dev   # wrangler dev --remote
```

`--remote` is needed: transformations beyond width/height/rotate/format don't run
in the local emulator, and the R2 binding needs the real bucket.

Point the Next app at it with `NEXT_PUBLIC_IMAGE_HOSTNAME=localhost:8787`.
Cookies ignore ports, so the cookie set by `localhost:3000` is sent to
`localhost:8787` without needing a `Domain` attribute.
