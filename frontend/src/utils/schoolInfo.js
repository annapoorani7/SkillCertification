// ─── School Identity ─────────────────────────────────────────
// Single source of truth for all school branding across the platform.
// Update these values to rebrand for a different institution.

import schoolLogo from "../assets/school_logo.png";

export const SCHOOL = {
    name: "Saru Matric Hr Sec School",
    shortName: "Saru School",
    location: "Sathyamangalam",
    tagline: "Be The Best",
    estYear: "1990",
    logo: schoolLogo,
    // Used in certificate footers and PDF "Issued By" field
    fullTitle: "Saru Matric Hr Sec School, Sathyamangalam",
    // Used in browser tab title
    platformName: "SkillCert — Saru Matric Hr Sec School",
};

export default SCHOOL;
