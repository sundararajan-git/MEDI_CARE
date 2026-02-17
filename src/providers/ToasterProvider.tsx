"use client";

import { Toaster } from "react-hot-toast";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ToasterProvider = () => {
  // theme hook
  const { theme } = useTheme();
  // prevent hydration error
  const [mounted, setMounted] = useState(false);

  // update after component mount
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
      ) : null}
    </>
  );
};

export default ToasterProvider;
