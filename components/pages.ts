// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import bbnHolding from '../assets/img/bbnHolding.svg';
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import bbnMusicLogo from '../assets/img/bbnMusic.svg';
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import bbnHostingLogo from '../assets/img/bbnHosting.svg';
// @deno-types="https://raw.githubusercontent.com/lucsoft-DevTeam/lucsoft.de/master/custom.d.ts"
import bbnAdminLogo from '../assets/img/bbnAdmin.svg';

import { Permission } from "shared";

export const pages: [ logo: any, perm: Permission[], route: string ][] = [
    [ bbnHolding, [], "/" ],
    [ bbnMusicLogo, [], "/music" ],
    [ bbnHostingLogo, [], "/hosting" ],
    [ bbnAdminLogo, [ "/bbn/manage", "/hmsys/user" ], "/admin" ],
];

// Moved this to the up array when we use the hmsys permission system
export const loginRequired = [
    "/music",
    "/hosting",
    "/admin",
    "/oauth"
];

export function activeLogo(type: string) {
    if (type == "Music")
        return bbnMusicLogo;
    if (type == "Hosting")
        return bbnHostingLogo;
    if (type == "Admin")
        return bbnAdminLogo;
    return bbnHolding;
}