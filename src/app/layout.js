'use client'
/* eslint-disable perfectionist/sort-imports */
import 'src/global.css';
// i18n
import 'src/locales/i18n';
// ----------------------------------------------------------------------
import PropTypes from 'prop-types';
import { LocalizationProvider } from 'src/locales';
import ThemeProvider from 'src/theme';
import { primaryFont } from 'src/theme/typography';
import ProgressBar from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import SnackbarProvider from 'src/components/snackbar/snackbar-provider';
import { SettingsDrawer, SettingsProvider } from 'src/components/settings';
import { AuthProvider } from 'src/auth/context/jwt';
import { PermissionProvider } from 'src/components/Permissions';
import { CheckoutProvider } from 'src/sections/checkout/context';
// import { AuthProvider } from 'src/auth/context/auth0';
// import { AuthProvider } from 'src/auth/context/amplify';
// import { AuthProvider } from 'src/auth/context/firebase';
// import { AuthProvider } from 'src/auth/context/supabase';

// ----------------------------------------------------------------------

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

// export const metadata = {
//   title: 'Allurance',
//   description:
//     'Allurance',
//   manifest: '/manifest.json',
//   icons: [
//     { rel: 'icon', url: '/favicon/favicon.ico' },
//     { rel: 'icon', type: 'image/png', sizes: '16x16', url: '/favicon/favicon-16x16.png' },
//     { rel: 'icon', type: 'image/png', sizes: '32x32', url: '/favicon/favicon-32x32.png' },
//     { rel: 'apple-touch-icon', sizes: '180x180', url: '/favicon/apple-touch-icon.png' },
//   ],
// };

export default function RootLayout({ children, session }) {
  return (
    <>
      <html lang="en" className={primaryFont.className}>
        <head>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
          />
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick-theme.min.css"
            integrity="sha512-17EgCFERpgZKcm0j0fEq1YCJuyAWdz9KUtv1EjVuaOz8pDnh/0nZxmU6BBXwaaxqoi9PQXnRWqlcDB027hgv9A=="
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.css"
            integrity="sha512-yHknP1/AwR+yx26cB1y0cjvQUMvEa2PFzt1c9LlS4pRQ5NOTZFWbhBig+X9G9eYW/8m0/4OXNx8pxJ6z57x0dw=="
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />

          <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.4/dist/umd/popper.min.js"></script>

          <link
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
            rel="stylesheet"
          />
          <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.1.3/css/bootstrap.min.css"
          />

          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
            integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />

          <link rel="stylesheet" href="/css/style.css" />
          <link rel="stylesheet" href="/css/responsive.css" />

          <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.4/dist/umd/popper.min.js"></script>
        </head>
        <body>
          <AuthProvider>
            {/* PERMISSION PROVIDER ADDED EXTERNALLY FOR LISTING PURPOSE BY ROLES  */}
            <PermissionProvider defaultSettings={{ permissions: [] }}>
              <LocalizationProvider>
                <SettingsProvider
                  defaultSettings={{
                    themeMode: 'light', // 'light' | 'dark'
                    themeDirection: 'ltr', //  'rtl' | 'ltr'
                    themeContrast: 'default', // 'default' | 'bold'
                    themeLayout: 'vertical', // 'vertical' | 'horizontal' | 'mini'
                    themeColorPresets: 'default', // 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red'
                    themeStretch: false,
                  }}
                >
                  <ThemeProvider>
                    <MotionLazy>
                      <SnackbarProvider>
                        <CheckoutProvider>
                          <SettingsDrawer />
                          <ProgressBar />
                          {children}
                        </CheckoutProvider>
                      </SnackbarProvider>
                    </MotionLazy>
                  </ThemeProvider>
                </SettingsProvider>
              </LocalizationProvider>
            </PermissionProvider>
          </AuthProvider>
        </body>
      </html>
    </>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node,
};
