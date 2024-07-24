import defaultTheme from 'tailwindcss/defaultTheme';
import typographyPlugin from '@tailwindcss/typography';

module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,json,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--aw-color-primary)',
        secondary: 'var(--aw-color-secondary)',
        accent: 'var(--aw-color-accent)',
        default: 'var(--aw-color-text-default)',
        muted: 'var(--aw-color-text-muted)',
      },
      fontFamily: {
        sans: ['var(--aw-font-sans, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
        serif: ['var(--aw-font-serif, ui-serif)', ...defaultTheme.fontFamily.serif],
        heading: ['var(--aw-font-heading, ui-sans-serif)', ...defaultTheme.fontFamily.sans],
      },
      backgroundImage: (theme) => ({
        'image-default': "url('~/assets/images/brand/ICON_TRANSPARENT_BLACK.png')",
        'image-dark': "url('~/assets/images/brand/ICON_TRANSPARENT_WHITE.png')",
        'image-hover': "url('~/assets/images/brand/ICON_TRANSPARENT_GOLD.png')",
      }),
    },
  },
  variants: {
    extend: {
      backgroundImage: ['dark', 'hover'],
    },
  },
  plugins: [typographyPlugin],
  darkMode: 'class',
};
