import React, { useRef, useState } from "react";

const modernInputStyle = {
  padding: "12px 14px",
  fontSize: 17,
  borderRadius: 8,
  border: "1px solid #bbb",
  marginRight: 10,
  marginBottom: 12,
  background: "#fff",
  outline: "none",
  minWidth: 220,
  maxWidth: 340,
  boxSizing: "border-box"
};

const neutralButtonStyle = {
  background: "#fff",
  color: "#b00",
  border: "2px solid #b00",
  borderRadius: 8,
  padding: "10px 20px",
  fontWeight: "bold",
  fontSize: 16,
  cursor: "pointer",
  marginRight: 12,
  marginBottom: 0,
  transition: "background 0.2s, color 0.2s"
};

const neutralButtonActiveStyle = {
  ...neutralButtonStyle,
  background: "#b00",
  color: "#fff"
};

const actionButtonStyle = {
  background: "#b00",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 20px",
  fontWeight: "bold",
  fontSize: 16,
  cursor: "pointer",
  marginRight: 12,
  marginBottom: 0,
  transition: "background 0.2s, color 0.2s"
};

const secondaryButtonStyle = {
  background: "#444",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 20px",
  fontWeight: "bold",
  fontSize: 16,
  cursor: "pointer",
  marginRight: 12,
  marginBottom: 0,
  transition: "background 0.2s, color 0.2s"
};

type Property = {
  name: string;
  unit: string;
  type: string;
  valueRange?: string;
  enumValues?: string[];
  valueConstraints?: any;
};

function getNumberPlaceholder(prop: Property): string {
  const c = prop.valueConstraints || {};
  let txt = "";
  if (c.min !== undefined && c.max !== undefined) txt = `${c.min} bis ${c.max}`;
  else if (c.min !== undefined) txt = `≥ ${c.min}`;
  else if (c.max !== undefined) txt = `≤ ${c.max}`;
  if (c.integer) txt += (txt ? ", " : "") + "ganzzahlig";
  return txt;
}

function validateValue(prop: any, value: any): string | null {
  const c = prop.valueConstraints || {};
  if (prop.type === "Number") {
    const num = typeof value === "number" ? value : Number(value);
    if (value === "" || value === undefined || value === null) return null;
    if (typeof num !== "number" || isNaN(num)) return `Wert für "${prop.name}" muss eine Zahl sein.`;
    if (c.min !== undefined && num < c.min) return `Wert für "${prop.name}" muss ≥ ${c.min} sein.`;
    if (c.max !== undefined && num > c.max) return `Wert für "${prop.name}" muss ≤ ${c.max} sein.`;
    if (c.integer && !Number.isInteger(num)) return `Wert für "${prop.name}" muss eine ganze Zahl sein.`;
  }
  if (prop.type === "Boolean") {
    if (value === "" || value === undefined || value === null) return null;
    if (!(value === true || value === false || value === "true" || value === "false"))
      return `Wert für "${prop.name}" muss true oder false sein.`;
  }
  if (prop.type === "Enum" || prop.type === "Enumeration") {
    if (!c.enumValues || !Array.isArray(c.enumValues) || c.enumValues.length === 0) return null;
    if (value === "" || value === undefined || value === null) return null;
    if (!c.enumValues.includes(value)) return `Wert für "${prop.name}" muss einer der erlaubten Werte sein: ${c.enumValues.join(", ")}`;
  }
  if (prop.type === "List") {
    if (!c.enumValues || !Array.isArray(c.enumValues) || c.enumValues.length === 0) return null;
    if (value === undefined || value === null) return null;
    if (!Array.isArray(value)) return `Wert für "${prop.name}" muss eine Liste sein.`;
    for (const v of value) {
      if (!c.enumValues.includes(v)) return `Wert "${v}" für "${prop.name}" ist nicht erlaubt.`;
    }
  }
  // Text: keine Einschränkung
  return null;
}

function validateJsonLdAgainstSchema(schema: any[], jsonLd: Record<string, any>): string[] {
  const errors: string[] = [];
  for (const prop of schema) {
    const value = jsonLd[prop.name];
    // Optional: nur prüfen, wenn Wert gesetzt
    if (value !== undefined) {
      const err = validateValue(prop, value);
      if (err) errors.push(err);
    }
  }
  return errors;
}

export default function Validator() {
  const [inputType, setInputType] = useState<"url" | "code">("code");
  const [inputValue, setInputValue] = useState("");
  const [jsonld, setJsonld] = useState<any>(null);
  const [schema, setSchema] = useState<Property[]>(() => {
    const raw = localStorage.getItem("jsonldGenerator.schema");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });
  const [schemaFileName, setSchemaFileName] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [indexedUrls, setIndexedUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lade Schema aus Datei
  function handleSchemaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSchemaFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const loaded = JSON.parse(evt.target?.result as string);
        if (Array.isArray(loaded)) {
          setSchema(loaded);
        } else {
          setLoadError("Ungültiges Schema-Format.");
        }
      } catch (err) {
        setLoadError("Fehler beim Laden des Schemas!");
      }
    };
    reader.readAsText(file);
  }

  // Lade JSON-LD von URL
  async function handleLoadFromUrl() {
    setLoadError(null);
    setValidationErrors([]);
    setJsonld(null);
    try {
      const resp = await fetch(inputValue);
      if (!resp.ok) throw new Error("Fehler beim Laden der URL");
      const text = await resp.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        // Versuche, JSON-LD aus <script type="application/ld+json"> zu extrahieren
        const match = text.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
        if (match) {
          data = JSON.parse(match[1]);
        } else {
          throw new Error("Kein JSON-LD gefunden.");
        }
      }
      setJsonld(data);
      // Nur erlaubte Felder aus dem Schema übernehmen
      let filteredJsonLd;
      const allowedFields = schema.map(s => s.name);

      function isValidValue(prop, value) {
        const c = prop.valueConstraints || {};
        if (prop.type === "Number") {
          if (typeof value !== "number") return false;
          if (c.min !== undefined && value < c.min) return false;
          if (c.max !== undefined && value > c.max) return false;
          if (c.integer && !Number.isInteger(value)) return false;
        }
        if (prop.type === "Boolean") {
          if (typeof value !== "boolean") return false;
        }
        if ((prop.type === "Enum" || prop.type === "Enumeration") && c.enumValues) {
          if (!c.enumValues.includes(value)) return false;
        }
        if (prop.type === "List" && c.enumValues) {
          if (!Array.isArray(value)) return false;
          for (const v of value) {
            if (!c.enumValues.includes(v)) return false;
          }
        }
        // Text: keine Einschränkung
        return true;
      }

      function filterAndValidate(obj) {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
          if (allowedFields.includes(key) || key.startsWith('@')) {
            if (key.startsWith('@')) {
              result[key] = value;
            } else {
              const prop = schema.find(s => s.name === key);
              if (prop && isValidValue(prop, value)) {
                result[key] = value;
              }
            }
          }
        }
        return result;
      }

      if (Array.isArray(data)) {
        filteredJsonLd = data.map(filterAndValidate);
      } else {
        filteredJsonLd = filterAndValidate(data);
      }
      setJsonld(filteredJsonLd);

      // Fehler sammeln
      let errors: string[] = [];
      if (schema.length > 0) {
        if (Array.isArray(data)) {
          data.forEach((obj, idx) => {
            schema.forEach(prop => {
              const value = obj[prop.name];
              const err = validateValue(prop, value);
              if (err) errors.push(`Objekt ${idx + 1}: ${err}`);
            });
          });
        } else {
          schema.forEach(prop => {
            const value = data[prop.name];
            const err = validateValue(prop, value);
            if (err) errors.push(err);
          });
        }
        setValidationErrors(errors);
      }
    } catch (err: any) {
      setLoadError("Fehler beim Laden oder Parsen: " + err.message);
    }
  }

  // Lade JSON-LD aus Code
  function handleLoadFromCode() {
    setLoadError(null);
    setValidationErrors([]);
    setJsonld(null);
    try {
      let data;
      // Prüfe, ob HTML enthalten ist
      if (inputValue.trim().startsWith("<")) {
        // Suche nach JSON-LD im HTML
        const match = inputValue.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
        if (match) {
          data = JSON.parse(match[1]);
        } else {
          throw new Error("Kein JSON-LD-Block im HTML gefunden.");
        }
      } else {
        // Normales JSON
        data = JSON.parse(inputValue);
      }
      setJsonld(data);
      // Nur erlaubte Felder aus dem Schema übernehmen
      let filteredJsonLd;
      const allowedFields = schema.map(s => s.name);

      function isValidValue(prop, value) {
        const c = prop.valueConstraints || {};
        if (prop.type === "Number") {
          if (typeof value !== "number") return false;
          if (c.min !== undefined && value < c.min) return false;
          if (c.max !== undefined && value > c.max) return false;
          if (c.integer && !Number.isInteger(value)) return false;
        }
        if (prop.type === "Boolean") {
          if (typeof value !== "boolean") return false;
        }
        if ((prop.type === "Enum" || prop.type === "Enumeration") && c.enumValues) {
          if (!c.enumValues.includes(value)) return false;
        }
        if (prop.type === "List" && c.enumValues) {
          if (!Array.isArray(value)) return false;
          for (const v of value) {
            if (!c.enumValues.includes(v)) return false;
          }
        }
        // Text: keine Einschränkung
        return true;
      }

      function filterAndValidate(obj) {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
          if (allowedFields.includes(key) || key.startsWith('@')) {
            if (key.startsWith('@')) {
              result[key] = value;
            } else {
              const prop = schema.find(s => s.name === key);
              if (prop && isValidValue(prop, value)) {
                result[key] = value;
              }
            }
          }
        }
        return result;
      }

      if (Array.isArray(data)) {
        filteredJsonLd = data.map(filterAndValidate);
      } else {
        filteredJsonLd = filterAndValidate(data);
      }
      setJsonld(filteredJsonLd);

      // Fehler sammeln
      let errors: string[] = [];
      if (schema.length > 0) {
        if (Array.isArray(data)) {
          data.forEach((obj, idx) => {
            schema.forEach(prop => {
              const value = obj[prop.name];
              const err = validateValue(prop, value);
              if (err) errors.push(`Objekt ${idx + 1}: ${err}`);
            });
          });
        } else {
          schema.forEach(prop => {
            const value = data[prop.name];
            const err = validateValue(prop, value);
            if (err) errors.push(err);
          });
        }
        setValidationErrors(errors);
      }
    } catch (err: any) {
      setLoadError("Fehler beim Parsen des Codes: " + err.message);
    }
  }

  // Validierung erneut ausführen (z.B. nach Schema-Wechsel)
  function handleRevalidate() {
    if (jsonld && schema.length > 0) {
      setValidationErrors(validateJsonLdAgainstSchema(schema, jsonld));
    }
  }

  // Copy-to-Clipboard für JSON-LD
  function handleCopyJsonLd() {
    if (jsonld) {
      navigator.clipboard.writeText(JSON.stringify(jsonld, null, 2));
    }
  }

  // Funktion zum Indizieren (hinzufügen)
  function handleIndexUrl() {
    if (inputType === "url" && inputValue.trim() && validationErrors.length === 0) {
      fetch("https://url-backend-production-132c.up.railway.app/api/indizieren", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputValue.trim() })
      })
      .then(() => alert("URL erfolgreich indiziert!"))
      .catch(() => alert("Fehler beim Indizieren!"));
    }
  }

  // Funktion zum Download als CSV
  function handleDownloadIndexedUrls() {
    if (indexedUrls.length === 0) return;
    const csvContent = "data:text/csv;charset=utf-8," + indexedUrls.map(u => `"${u}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "indizierte_urls.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: 20, display: "flex", gap: 56 }}>
      {/* Linke Seite: Eingabe */}
      <div style={{
        flex: 1,
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        padding: 40,
        minWidth: 380,
        marginRight: 0
      }}>
        <h1 style={{ fontSize: "2rem", marginBottom: 36 }}>Validator für JSON-LD</h1>
        <div style={{ marginBottom: 38 }}>
          <b>1. Schema laden</b>
          <div style={{ margin: "18px 0 0 0", display: "flex", alignItems: "center", gap: 16 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleSchemaUpload}
              style={{ display: "none" }}
            />
            <button
              type="button"
              style={neutralButtonStyle}
              onClick={() => fileInputRef.current?.click()}
              onMouseOver={e => (e.currentTarget.style.background = "#f5f5f5")}
              onMouseOut={e => (e.currentTarget.style.background = "#fff")}
            >
              Schema auswählen
            </button>
            <span style={{ color: "#444", fontSize: 15, marginLeft: 8 }}>
              {schemaFileName
                ? schemaFileName
                : schema.length > 0
                ? "Schema geladen"
                : "Kein Schema geladen"}
            </span>
          </div>
        </div>
        <div style={{ marginBottom: 48 }}>
          <b>2. JSON-LD eingeben oder URL angeben</b>
          <div style={{ display: "flex", gap: 32, margin: "28px 0 32px 0" }}>
            <button
              type="button"
              style={inputType === "code" ? neutralButtonActiveStyle : neutralButtonStyle}
              onClick={() => setInputType("code")}
              onMouseOver={e => (e.currentTarget.style.background = inputType === "code" ? "#b00" : "#f5f5f5")}
              onMouseOut={e => (e.currentTarget.style.background = inputType === "code" ? "#b00" : "#fff")}
            >
              Code eingeben
            </button>
            <button
              type="button"
              style={inputType === "url" ? neutralButtonActiveStyle : neutralButtonStyle}
              onClick={() => setInputType("url")}
              onMouseOver={e => (e.currentTarget.style.background = inputType === "url" ? "#b00" : "#f5f5f5")}
              onMouseOut={e => (e.currentTarget.style.background = inputType === "url" ? "#b00" : "#fff")}
            >
              URL prüfen
            </button>
          </div>
          {inputType === "code" ? (
            <div
              style={{
                background: "#fafafa",
                border: "1px solid #eee",
                borderRadius: 8,
                width: "100%",
                maxWidth: 600,
                marginBottom: 16,
                minHeight: 140,
                paddingRight: 16,
                boxSizing: "border-box"
              }}
            >
              <textarea
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder='Füge hier deinen JSON-LD-Code ein...'
                style={{
                  ...modernInputStyle,
                  fontFamily: "monospace",
                  minHeight: 140,
                  maxHeight: 340,
                  minWidth: 220,
                  maxWidth: "100%",
                  width: "100%",
                  border: "none",
                  outline: "none",
                  resize: "both",
                  background: "transparent",
                  margin: 0,
                  boxShadow: "none",
                  paddingLeft: 12,
                  lineHeight: "22px",
                  overflow: "auto"
                }}
              />
            </div>
          ) : (
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Gib eine URL ein (z.B. https://...)"
              style={{ ...modernInputStyle, width: 400, marginBottom: 16 }}
            />
          )}
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            <button
              type="button"
              style={actionButtonStyle}
              onClick={inputType === "code" ? handleLoadFromCode : handleLoadFromUrl}
              disabled={!inputValue.trim() || schema.length === 0}
            >
              Validieren
            </button>
            {jsonld && schema.length > 0 && (
              <button
                type="button"
                style={secondaryButtonStyle}
                onClick={handleRevalidate}
                onMouseOver={e => (e.currentTarget.style.background = "#222")}
                onMouseOut={e => (e.currentTarget.style.background = "#444")}
              >
                Erneut prüfen
              </button>
            )}
          </div>
        </div>
        {loadError && (
          <div style={{
            background: "#ffeaea",
            color: "#b00",
            border: "1px solid #b00",
            borderRadius: 8,
            padding: "12px 18px",
            marginBottom: 22,
            fontWeight: "bold"
          }}>
            {loadError}
          </div>
        )}
        {validationErrors.length > 0 && (
          <div style={{
            background: "#ffeaea",
            color: "#b00",
            border: "1px solid #b00",
            borderRadius: 8,
            padding: "12px 18px",
            marginBottom: 22,
            fontWeight: "bold"
          }}>
            <div style={{ marginBottom: 6 }}>Fehler gefunden:</div>
            {validationErrors.map((err, idx) => (
              <div key={idx}>{err}</div>
            ))}
          </div>
        )}
        {jsonld && validationErrors.length === 0 && (
          <div style={{
            background: "#eaffea",
            color: "#1a7f1a",
            border: "1px solid #1a7f1a",
            borderRadius: 8,
            padding: "12px 18px",
            marginBottom: 22,
            fontWeight: "bold"
          }}>
            Keine Fehler gefunden. JSON-LD ist gültig für das geladene Schema.
          </div>
        )}
        {/* Indizierte URLs */}
        <div style={{ marginTop: 32 }}>
          <b>3. Indizierte URLs</b>
          <div style={{ margin: "18px 0 0 0", display: "flex", alignItems: "center", gap: 16 }}>
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Gib eine URL ein (z.B. https://...)"
              style={{ ...modernInputStyle, width: 400, marginBottom: 16 }}
            />
            <button
              type="button"
              style={actionButtonStyle}
              onClick={handleIndexUrl}
              disabled={validationErrors.length > 0}
            >
              URL indizieren
            </button>
          </div>
          {indexedUrls.length > 0 && (
            <div style={{
              background: "#f0f8ff",
              border: "1px solid #bbdfff",
              borderRadius: 8,
              padding: 12,
              marginTop: 16,
              fontSize: 15
            }}>
              <div style={{ marginBottom: 8, fontWeight: "bold", color: "#007acc" }}>
                Indizierte URLs:
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, listStyleType: "disc" }}>
                {indexedUrls.map((url, idx) => (
                  <li key={idx} style={{ marginBottom: 4 }}>
                    {url}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                style={{
                  ...neutralButtonStyle,
                  marginTop: 12,
                  padding: "8px 16px",
                  fontSize: 15,
                  width: "100%",
                  maxWidth: 240,
                  border: "1px solid #bbb",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  minWidth: 0
                }}
                onClick={handleDownloadIndexedUrls}
                disabled={indexedUrls.length === 0}
              >
                Download als CSV
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Rechte Seite: Vorschau */}
      <div style={{
        flex: 1,
        background: "#fafafa",
        border: "1px solid #eee",
        borderRadius: 14,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        padding: 32,
        fontFamily: "monospace",
        fontSize: 15,
        overflowX: "auto",
        minHeight: 340,
        position: "relative",
        marginLeft: 0
      }}>
        <div style={{ color: "#888", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>JSON-LD Vorschau:</span>
          {jsonld && (
            <button
              type="button"
              style={{
                ...neutralButtonStyle,
                padding: "6px 12px",
                fontSize: 16,
                marginRight: 0,
                border: "1px solid #bbb",
                display: "flex",
                alignItems: "center",
                gap: 4,
                minWidth: 0
              }}
              onClick={handleCopyJsonLd}
              title="In Zwischenablage kopieren"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="5" y="5" width="10" height="12" rx="2" stroke="#888" strokeWidth="2" fill="none"/>
                <rect x="3" y="3" width="10" height="12" rx="2" stroke="#888" strokeWidth="1" fill="none" opacity="0.5"/>
              </svg>
            </button>
          )}
        </div>
        <pre style={{ margin: 0 }}>
          {jsonld ? JSON.stringify(jsonld, null, 2) : "// Noch kein JSON-LD geladen"}
        </pre>
      </div>

    </div>
  );
}
