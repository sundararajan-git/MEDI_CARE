"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { ReactNode } from "react";
import AuthProvider from "@/components/providers/AuthProvider";

export function ReduxProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>{children}</AuthProvider>
    </Provider>
  );
}
