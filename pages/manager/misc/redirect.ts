import '../../../polyfills.ts';
const params = new URLSearchParams(location.search);
params.set("type", "google");

location.href = "/signin?" + params.toString();