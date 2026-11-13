# Digital Loukoum

Static portfolio built with Bun and hosted on Cloudflare Workers Static Assets.

```sh
bun install
bun run dev
```

To build and deploy:

```sh
cf auth whoami
bun run deploy
```

`cloudflare.config.ts` selects the **Matthieu Gindre** Cloudflare account and the
`loukoum-digital` Worker, serving `loukoum.digital` and `www.loukoum.digital`.
The deployment uploads only the bundled files in `dist/`, including the two CVs.

Cloudflare manages DNS using `kanye.ns.cloudflare.com` and
`sandra.ns.cloudflare.com`. The domain registration remains at Porkbun, together
with email forwarding; its MX and SPF records are preserved in Cloudflare DNS.

Deployments are manual via `bun run deploy`.
