import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './theme/styles.css';
import './theme/fonts.css';import React from "react";

import {
  MantineProvider,
  ColorSchemeScript,
  mantineHtmlProps,
} from "@mantine/core";
import { theme } from "../theme";
import { Notifications } from '@mantine/notifications';
import { DeckProvider } from './context/DeckContext';
import { shadcnCssVariableResolver } from './theme/cssVariableResolver';
import { shadcnTheme } from './theme/theme';

export const metadata = {
  title: "Mantine Next.js template",
  description: "I am using Mantine with Next.js!",
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        {/* dark mode: */}
        <ColorSchemeScript defaultColorScheme="dark" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
      <DeckProvider>
        <MantineProvider
          // dark mode:
          theme={shadcnTheme} 
          defaultColorScheme="dark"
          cssVariablesResolver={shadcnCssVariableResolver}>
          <Notifications />
            {children}
        </MantineProvider>
      </DeckProvider>
      </body>
    </html>
  );
}
