import React, { useRef, useState, useEffect } from "react";

type Property = {
  name: string;
  unit: string;
  type: string;
  valueRange?: string;
  enumValues?: string[];
  valueConstraints?: any;
};

const modernInputStyle = {
  padding: "12px 14px",
  fontSize: 17,
  borderRadius: 8,
  border: "1px solid #bbb",
  marginRight: 10,
  marginBottom: 8,
  background: "#fff",
  outline: "none",
  minWidth: 220,
  maxWidth: 340,
  boxSizing: "border-box"
};

const modernButtonStyle = {
  background: "#b00",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 20px",
  fontWeight: "bold",
  fontSize: 16,
  cursor: "pointer",
  marginRight: 8
};

const LOCAL_STORAGE_SCHEMA_KEY = "jsonldGenerator.schema";
const LOCAL_STORAGE_VALUES_KEY = "jsonldGenerator.values";
const LOCAL_STORAGE_FILENAME_KEY = "jsonldGenerator.fileName";
const LOCAL_STORAGE_UPLOADED_FILENAME_KEY = "jsonldGenerator.uploadedFileName";

function getNumberPlaceholder(prop: Property): string {
  const c = prop.valueConstraints || {};
  let txt = "";
  if (c.min !== undefined && c.max !== undefined) txt = `${c.min} bis ${c.max}`;
  else if (c.min !== undefined) txt = `≥ ${c.min}`;
  else if (c.max !== undefined) txt = `≤ ${c.max}`;
  if (c.integer) txt += (txt ? ", " : "") + "ganzzahlig";
  return txt;
}

export default function JsonLdGenerator() {
  // Initialisierung aus localStorage
  const [schema, setSchema] = useState<Property[]>(() => {
    const raw = localStorage.getItem(LOCAL_STORAGE_SCHEMA_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });
  const [values, setValues] = useState<Record<string, string | string[]>>(() => {
    const raw = localStorage.getItem(LOCAL_STORAGE_VALUES_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return {};
  });
  const [fileName, setFileName] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_FILENAME_KEY) || "ftf.jsonld";
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_UPLOADED_FILENAME_KEY) || "";
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Schema und Werte persistent speichern
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_SCHEMA_KEY, JSON.stringify(schema));
  }, [schema]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_VALUES_KEY, JSON.stringify(values));
  }, [values]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_FILENAME_KEY, fileName);
  }, [fileName]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_UPLOADED_FILENAME_KEY, uploadedFileName);
  }, [uploadedFileName]);

  // (Schema laden)
  function handleSchemaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const loaded = JSON.parse(evt.target?.result as string);
        if (Array.isArray(loaded)) {
          setSchema(loaded);
          setValues({});
          setValidationErrors([]);
        }
      } catch (err) {
        alert("Fehler beim Laden des Schemas!");
      }
    };
    reader.readAsText(file);
  }

  // Um den Wert ändern zu können
  function handleValueChange(name: string, value: string | string[]) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  // Für Checkbox-Listen
  function handleListCheckboxChange(propName: string, val: string, checked: boolean) {
    setValues((prev) => {
      const arr = Array.isArray(prev[propName]) ? prev[propName] as string[] : [];
      if (checked) {
        return { ...prev, [propName]: [...arr, val] };
      } else {
        return { ...prev, [propName]: arr.filter((v) => v !== val) };
      }
    });
  }

  // Validierung für einzelne Werte
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
      if (!Array.isArray(value)) return `Wert für "${prop.name}" muss eine Liste sein.`;
      for (const v of value) {
        if (!c.enumValues.includes(v)) return `Wert "${v}" für "${prop.name}" ist nicht erlaubt.`;
      }
    }
    // Text: keine Einschränkung
    return null;
  }

  // Validierung für das gesamte JSON-LD
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

  // JSON-LD generieren
  function generateJsonLd() {
    const props: Record<string, any> = {};
    schema.forEach((prop) => {
      let val: any = values[prop.name];
      if (prop.type === "Number") val = val !== undefined && val !== "" ? Number(val) : undefined;
      if (prop.type === "Boolean") val = val === "true" ? true : val === "false" ? false : undefined;
      if (prop.type === "List" && Array.isArray(val)) val = val;
      if (val !== undefined && val !== "") props[prop.name] = val;
    });
    return {
      "@context": "https://example.org/ftf-context",
      "@type": "FTF",
      ...props,
    };
  }

  function handleDownload() {
    const jsonld = generateJsonLd();
    const errors = validateJsonLdAgainstSchema(schema, jsonld);
    setValidationErrors(errors);
    if (errors.length > 0) return;
    const dataStr =
      "data:application/ld+json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(jsonld, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", fileName);
    dlAnchorElem.click();
  }

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: 20, display: "flex", gap: 40 }}>
      {/* Linke Seite: Formular */}
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: "2rem" }}>JSON-LD Generator</h1>
        <div style={{ margin: "20px 0", display: "flex", alignItems: "center", gap: 12 }}>
          {/* Moderner Datei-Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleSchemaUpload}
            style={{ display: "none" }}
          />
          <button
            type="button"
            style={{
              ...modernButtonStyle,
              marginRight: 0,
              padding: "10px 24px"
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            Datei auswählen
          </button>
          <span style={{ color: "#444", fontSize: 15, marginLeft: 8 }}>
            {uploadedFileName ? uploadedFileName : "Kein Schema geladen"}
          </span>
        </div>
        {schema.length === 0 && (
          <div style={{ color: "#888" }}>
            Lade ein Schema, um loszulegen.
          </div>
        )}
        {schema.length > 0 && (
          <form
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              marginTop: 10,
            }}
            onSubmit={(e) => e.preventDefault()}
          >
            {schema.map((prop) => (
              <div key={prop.name} style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <label style={{ minWidth: 160, fontWeight: "bold" }}>
                    {prop.name}
                    {prop.unit && prop.unit !== "–" && (
                      <span style={{ color: "#888", marginLeft: 6 }}>({prop.unit})</span>
                    )}
                  </label>
                  {prop.type === "Boolean" ? (
                    <select
                      value={values[prop.name] ?? ""}
                      onChange={(e) => handleValueChange(prop.name, e.target.value)}
                      style={modernInputStyle}
                    >
                      <option value="">-</option>
                      <option value="true">Ja</option>
                      <option value="false">Nein</option>
                    </select>
                  ) : (prop.type === "Enum" || prop.type === "Enumeration") && prop.valueConstraints?.enumValues ? (
                    <select
                      value={values[prop.name] ?? ""}
                      onChange={(e) => handleValueChange(prop.name, e.target.value)}
                      style={modernInputStyle}
                    >
                      <option value="">Bitte wählen…</option>
                      {prop.valueConstraints.enumValues.map((v: string) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  ) : prop.type === "List" && prop.valueConstraints?.enumValues ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {prop.valueConstraints.enumValues.map((v: string) => (
                        <label key={v} style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400 }}>
                          <input
                            type="checkbox"
                            checked={Array.isArray(values[prop.name]) ? values[prop.name].includes(v) : false}
                            onChange={e => handleListCheckboxChange(prop.name, v, e.target.checked)}
                            style={{ marginRight: 6, accentColor: "#b00", width: 18, height: 18 }}
                          />
                          {v}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type={prop.type === "Number" ? "number" : "text"}
                      value={values[prop.name] ?? ""}
                      onChange={(e) => handleValueChange(prop.name, e.target.value)}
                      placeholder={
                        prop.type === "Number"
                          ? getNumberPlaceholder(prop)
                          : prop.valueConstraints?.enumValues
                          ? `Erlaubte Werte: ${prop.valueConstraints.enumValues.join(", ")}`
                          : prop.valueRange || ""
                      }
                      style={{ ...modernInputStyle, flex: 1 }}
                    />
                  )}
                </div>
                {/* Infozeile entfernt */}
              </div>
            ))}
            {validationErrors.length > 0 && (
              <div style={{
                background: "#ffeaea",
                color: "#b00",
                border: "1px solid #b00",
                borderRadius: 8,
                padding: "12px 18px",
                marginBottom: 8,
                fontWeight: "bold"
              }}>
                {validationErrors.map((err, idx) => (
                  <div key={idx}>{err}</div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 20 }}>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                style={{ ...modernInputStyle, width: 220, marginRight: 10 }}
                placeholder="Dateiname"
              />
              <button type="button" onClick={handleDownload} style={modernButtonStyle}>
                JSON-LD herunterladen
              </button>
            </div>
          </form>
        )}
      </div>
      {/* Rechte Seite: Vorschau */}
      <div style={{
        flex: 1,
        background: "#fafafa",
        border: "1px solid #eee",
        padding: 20,
        fontFamily: "monospace",
        fontSize: 15,
        overflowX: "auto",
        minHeight: 300,
      }}>
        <div style={{ color: "#888", marginBottom: 10 }}>JSON-LD Vorschau:</div>
        <pre>
          {JSON.stringify(generateJsonLd(), null, 2)}
        </pre>
      </div>
    </div>
  );
}