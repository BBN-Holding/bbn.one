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

export const pages: [ logo: string, perm: Array<Permission>, route: string, login: boolean ][] = [
    [ bbnHolding, [], "/", false ],
    [ bbnMusicLogo, [], "/music", false ],
    [ bbnHostingLogo, [], "/hosting", false ],
    [ bbnWalletLogo, [], "/wallet", true ],
    [ bbnAdminLogo, [ "/bbn/manage", "/hmsys/user" ], "/admin", true ],
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