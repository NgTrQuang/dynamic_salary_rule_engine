import React, { createContext, useContext, useState } from "react";
import vi from "./vi";
import en from "./en";

const translations = { vi, en };

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState("vi");
  const t = translations[lang];
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
