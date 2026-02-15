"use client";

import { Toaster } from "react-hot-toast";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ToasterProvider() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {mounted ? (
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: theme === "dark" ? "#09090b" : "#fff",
              color: theme === "dark" ? "#fff" : "#000",
              padding: "10px 20px",
              borderRadius: "8px",
              boxShadow:
                theme === "dark"
                  ? "0 2px 5px rgba(0, 0, 0, 0.4)"
                  : "0 2px 5px rgba(0, 0, 0, 0.1)",
            },
          }}
        />
      ) : (
        <></>
      )}
    </>
  );
}
