// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import bbnHolding from '../assets/img/bbnHolding.svg';
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import bbnMusicLogo from '../assets/img/bbnMusic.svg';
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import bbnHostingLogo from '../assets/img/bbnHosting.svg';
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import bbnAdminLogo from '../assets/img/bbnAdmin.svg';
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import bbnWalletLogo from '../assets/img/bbnWallet.svg';

import { Permission } from "shared/mod.ts";

// 0: no login required, 1: show only when logged in, 2: show only when logged out
export const pages: [ logo: string, perm: Array<Permission>, route: string, login: 0|1|2 ][] = [
    [ bbnHolding, [], "/", 0 ],
    [ bbnMusicLogo, [], "/c/music", 1 ],
    [ bbnMusicLogo, [], "/music", 2 ],
    [ bbnHostingLogo, [], "/hosting", 0 ],
    [ bbnWalletLogo, [], "/wallet", 1 ],
    [ bbnAdminLogo, [ "/bbn/manage", "/hmsys/user" ], "/admin", 1 ],
];

// Moved this to the up array when we use the hmsys permission system
export const loginRequired = [
    "/c/music",
    "/hosting",
    "/admin",
    "/oauth",
    "/wallet"
];

export function activeLogo(type: string) {
    if (type == "Music")
        return bbnMusicLogo;
    if (type == "Hosting")
        return bbnHostingLogo;
    if (type == "Wallet")
        return bbnWalletLogo;
    if (type == "Admin")
        return bbnAdminLogo;
    return bbnHolding;
}


export function activeTitle(type: string) {
    if (type == "Music")
        return "BBN Music";
    if (type == "Hosting")
        return "BBN Hosting";
    if (type == "Wallet")
        return "BBN Wallet";
    if (type == "Admin")
        return "BBN Admin";
    return "BBN Holding";
}