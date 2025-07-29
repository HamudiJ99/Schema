import { allProperties } from "./properties";

export type AttributeList = {
  id: string;
  name: string;
  properties: typeof allProperties;
};

// Standard-Vorlage für FTF
export const FTF_TEMPLATE: AttributeList = {
  id: "ftf",
  name: "FTF-Vorlage",
  properties: allProperties,
};

// Hilfsfunktionen für LocalStorage
export function saveAttributeLists(lists: AttributeList[]) {
  localStorage.setItem("attributeLists", JSON.stringify(lists));
}

export function loadAttributeLists(): AttributeList[] {
  const raw = localStorage.getItem("attributeLists");
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}