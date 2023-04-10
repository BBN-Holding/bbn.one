const params = new URLSearchParams(location.search);
if (location.pathname.includes("google")) {
    params.set("type", "google");
} else if (location.pathname.includes("discord")) {
    params.set("type", "discord");
}

location.href = "/signin?" + params.toString();