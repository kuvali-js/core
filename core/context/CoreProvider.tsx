// @kuvali-js/core/context/CoreProvider.tsx

import React from "react";
import { TranslationProvider } from "../i18n/TranslationContext";

export const CoreProvider = ({ config, children }: any) => {
  return <TranslationProvider>
           {children}
         </TranslationProvider>;
};

//### END #####################################################################
