const params = new URLSearchParams(location.search);
const state = JSON.parse(atob(params.get("state") ?? ""));
params.set("type", state.type);
localStorage.setItem("goal", state.redirect || "/music");

location.href = `/signin?${params.toString()}`;