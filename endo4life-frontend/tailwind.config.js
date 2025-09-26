const { join } = require('path');
const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

delete colors['lightBlue'];
delete colors['warmGray'];
delete colors['trueGray'];
delete colors['coolGray'];
delete colors['blueGray'];

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    join(
      __dirname,
      '{src,app,pages,components}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
  ],
  theme: {
    extend: {
      boxShadow: {
        custom:
          '0px 2.3px 2px rgba(0, 0, 0, 0.03), 0px 0.8px 6px rgba(0, 0, 0, 0.04)',
      },
      aspectRatio: {
        '4/3': '4 / 3',
        '2/1': '2 / 1',
        '3/4': '3 / 4',
        '1/2': '1 / 2',
        '1/3': '1 / 3',
        '1/4': '1 / 4',
      },
      width: {
        'date-time-field': '400px',
      },
    },
    colors: {
      ...colors,
      accent: {
        DEFAULT: `var(--color-accent-500)`,
        50: `var(--color-accent-50)`,
        100: `var(--color-accent-100)`,
        200: `var(--color-accent-200)`,
        300: `var(--color-accent-300)`,
        400: `var(--color-accent-400)`,
        500: `var(--color-accent-500)`,
        600: `var(--color-accent-600)`,
        700: `var(--color-accent-700)`,
        800: `var(--color-accent-800)`,
        900: `var(--color-accent-900)`,
      },
      background: {
        DEFAULT: `var(--color-background-500)`,
        50: `var(--color-background-50)`,
        100: `var(--color-background-100)`,
        200: `var(--color-background-200)`,
        300: `var(--color-background-300)`,
        400: `var(--color-background-400)`,
        500: `var(--color-background-500)`,
        600: `var(--color-background-600)`,
        700: `var(--color-background-700)`,
        800: `var(--color-background-800)`,
        900: `var(--color-background-900)`,
      },
      error: {
        DEFAULT: `var(--color-error-500)`,
        50: `var(--color-error-50)`,
        100: `var(--color-error-100)`,
        200: `var(--color-error-200)`,
        300: `var(--color-error-300)`,
        400: `var(--color-error-400)`,
        500: `var(--color-error-500)`,
        600: `var(--color-error-600)`,
        700: `var(--color-error-700)`,
        800: `var(--color-error-800)`,
        900: `var(--color-error-900)`,
      },
      primary: {
        DEFAULT: `var(--color-primary-500)`,
        50: `var(--color-primary-50)`,
        100: `var(--color-primary-100)`,
        200: `var(--color-primary-200)`,
        300: `var(--color-primary-300)`,
        400: `var(--color-primary-400)`,
        500: `var(--color-primary-500)`,
        600: `var(--color-primary-600)`,
        700: `var(--color-primary-700)`,
        800: `var(--color-primary-800)`,
        900: `var(--color-primary-900)`,
      },
      secondary: {
        DEFAULT: `var(--color-secondary-500)`,
        50: `var(--color-secondary-50)`,
        100: `var(--color-secondary-100)`,
        200: `var(--color-secondary-200)`,
        300: `var(--color-secondary-300)`,
        400: `var(--color-secondary-400)`,
        500: `var(--color-secondary-500)`,
        600: `var(--color-secondary-600)`,
        700: `var(--color-secondary-700)`,
        800: `var(--color-secondary-800)`,
        900: `var(--color-secondary-900)`,
      },
      tertiary: {
        DEFAULT: `var(--color-tertiary-500)`,
        50: `var(--color-tertiary-50)`,
        100: `var(--color-tertiary-100)`,
        200: `var(--color-tertiary-200)`,
        300: `var(--color-tertiary-300)`,
        400: `var(--color-tertiary-400)`,
        500: `var(--color-tertiary-500)`,
        600: `var(--color-tertiary-600)`,
        700: `var(--color-tertiary-700)`,
        800: `var(--color-tertiary-800)`,
        900: `var(--color-tertiary-900)`,
      },
      success: {
        DEFAULT: `var(--color-success-500)`,
        50: `var(--color-success-50)`,
        100: `var(--color-success-100)`,
        200: `var(--color-success-200)`,
        300: `var(--color-success-300)`,
        400: `var(--color-success-400)`,
        500: `var(--color-success-500)`,
        600: `var(--color-success-600)`,
        700: `var(--color-success-700)`,
        800: `var(--color-success-800)`,
        900: `var(--color-success-900)`,
      },
      warning: {
        DEFAULT: `var(--color-warning-500)`,
        50: `var(--color-warning-50)`,
        100: `var(--color-warning-100)`,
        200: `var(--color-warning-200)`,
        300: `var(--color-warning-300)`,
        400: `var(--color-warning-400)`,
        500: `var(--color-warning-500)`,
        600: `var(--color-warning-600)`,
        700: `var(--color-warning-700)`,
        800: `var(--color-warning-800)`,
        900: `var(--color-warning-900)`,
      },

      black: '#000',
      white: '#fff',
    },
    fontSize: {
      ...defaultTheme.fontSize,
      display1: ['60px', '75px'],
      display2: ['48px', '60px'],
      heading1: ['48px', '60px'],
      heading1s: ['36px', '45px'],
      heading2: ['32px', '40px'],
      heading2s: ['28px', '35px'],
      heading3: ['24px', '30px'],
      heading3s: ['20px', '25px'],
      heading4: ['20px', '25px'],
      heading4s: ['18px', '22.5px'],
      heading5: ['18px', '22.5px'],
      heading5s: ['16px', '20px'],
      'sub-heading-large': ['18px', '24px'],
      'sub-heading': ['16px', '20px'],
      'body-large': ['18px', '24px'],
      'body-small': ['14px', '16px'],
      'caption-large': ['12px', '15px'],
      'caption-small': ['11px', '13.5px'],
    },
    fontFamily: {
      form: ['Times New Roman'],
      sans: ['Inter', ...defaultTheme.fontFamily.sans],
    },
  },
};
