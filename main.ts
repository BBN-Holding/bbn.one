import { isLeap } from "https://deno.land/std@0.218.2/datetime/is_leap.ts";

document.body.innerHTML += isLeap(new Date());