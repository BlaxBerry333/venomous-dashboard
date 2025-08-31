// cSpell:disable

import { Alkatra, Ma_Shan_Zheng, New_Tegomin } from "next/font/google";

// latin
const alkatra = Alkatra({
  variable: "--font-alkatra",
  subsets: ["latin"],
  weight: "400",
});

// chinese
const maShanZheng = Ma_Shan_Zheng({
  variable: "--font-ma-shan-zheng",
  subsets: ["latin"],
  weight: "400",
});

// japanese
const newTegomin = New_Tegomin({
  variable: "--font-new-tegomin",
  subsets: ["latin"],
  weight: "400",
});

const Fonts = {
  alkatra,
  maShanZheng,
  newTegomin,
} as const;

/**
 * The font family variable names.
 * Passed to className attribute of the `<body>` element in the `RootLayout` component.
 * @example
 * ```css
 * font-family: var(--font-alkatra), var(--font-ma-shan-zheng), var(--font-new-tegomin);
 * ```
 */
export const FontFamilyVariableNames: string = `
  ${Fonts.alkatra.variable} 
  ${Fonts.maShanZheng.variable} 
  ${Fonts.newTegomin.variable}
`;

/**
 * The font family style.
 * Used as value of style attribute of the element.
 * @example
 * ```tsx
 * <div style={{ fontFamily: FontFamilyStyle }} />
 * ```
 */
export const FontFamilyStyle: string = `
  ${Fonts.alkatra.style.fontFamily},
  ${Fonts.maShanZheng.style.fontFamily},
  ${Fonts.newTegomin.style.fontFamily}
`;
