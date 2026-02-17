"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { ReactNode } from "react";
import AuthProvider from "@/components/providers/AuthProvider";

export const ReduxProvider = ({ children }: { children: ReactNode }) => {
  return (
    <Provider store={store}>
      {/* wrapped auth provider for get session based access */}
      <AuthProvider>{children}</AuthProvider>
    </Provider>
  );
};
