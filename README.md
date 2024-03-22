![The logo of BBN One](.github/logo.png?version%253D1698775826612)

# bbn.one

The BBN Website.

## External submissions

We are happy for external submissions, so PRs are welcome!

### Setup

1. Install deno from <https://deno.com>
2. deno task start
3. Set overrides to prod server

   1. `localStorage.setItem("OVERRIDE_BASE_URL", "https://bbn.one/api/@bbn/")`
   2. `localStorage.setItem("OVERRIDE_WS_URL", "wss://bbn.one/ws")`
