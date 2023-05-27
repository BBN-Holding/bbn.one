const params = new URLSearchParams(location.search);
if (location.pathname.includes("google")) {
    params.set("type", "google");
    localStorage.setItem("goal", atob(params.get("state") ?? "")?.replace('https://bbn.one', '') || "/music");
} else if (location.pathname.includes("discord")) {
    params.set("type", "discord");
    localStorage.setItem("goal", atob(params.get("state") ?? "")?.replace('https://bbn.one', '') || "/music");
}

location.href = "/signin?" + params.toString();