import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiPlus, FiChevronDown, FiChevronRight, FiLayers } from "react-icons/fi";
import { allProperties as initialAllProperties } from "../properties";

// Beispiel-Typen für Dropdown
const propertyTypes = ["Number", "Text", "Boolean", "List", "Enum"];

type NewProperty = {
  name: string;
  label: string;
  type: string;
  unit: string;
  description: string;
  synonyms: string;
  canonical: string;
  reason: string;
  example: string;
  class?: string;
};

function getAllClasses() {
  const props = loadCustomProperties();
  const classesFromProps = props.map(a => a.class || "FTF");
  const storedClasses = JSON.parse(localStorage.getItem("customClasses") || "[]");
  const all = Array.from(new Set([...classesFromProps, ...storedClasses, "FTF"]));
  return all.sort((a, b) => a.localeCompare(b));
}

export default function Attribute() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allProperties, setAllProperties] = useState(() => [...loadCustomProperties()]);
  const [showNewPropertyPopup, setShowNewPropertyPopup] = useState(false);
  const [editCustomAttr, setEditCustomAttr] = useState<NewProperty | null>(null);
  const [editCustomAttrName, setEditCustomAttrName] = useState<string | null>(null);
  const [newProperty, setNewProperty] = useState<NewProperty>({
    name: "",
    label: "",
    type: propertyTypes[0],
    unit: "",
    description: "",
    synonyms: "",
    canonical: "",
    reason: "",
    example: "",
    class: "",
  });
  const [collapsedClasses, setCollapsedClasses] = useState<Record<string, boolean>>({});
  const [showClassPopup, setShowClassPopup] = useState(false);
  const [classPopupMode, setClassPopupMode] = useState<"add" | "rename" | "delete" | null>(null);
  const [classPopupValue, setClassPopupValue] = useState("");
  const [classToEdit, setClassToEdit] = useState<string | null>(null);
  const [showLoadFtfPopup, setShowLoadFtfPopup] = useState(false);
  const classList = getAllClasses();

  // Gruppiere Attribute nach Klasse
  const grouped = allProperties.reduce((acc, attr) => {
    const cls = attr.class || "FTF";
    if (!acc[cls]) acc[cls] = [];
    acc[cls].push(attr);
    return acc;
  }, {} as Record<string, NewProperty[]>);

  function handleEditCustomAttribute(attr: NewProperty) {
    setEditCustomAttr(attr);
    setEditCustomAttrName(attr.name);
    setNewProperty({ ...attr });
    setShowNewPropertyPopup(true);
  }

  function handleSaveNewProperty() {
    if (!newProperty.name.trim()) return;
    let updatedCustomProps = loadCustomProperties();
    // Wenn der Name geändert wurde, entferne das alte Attribut
    if (editCustomAttr && editCustomAttrName && editCustomAttrName !== newProperty.name) {
      updatedCustomProps = updatedCustomProps.filter(a => a.name !== editCustomAttrName);
    }
    // Entferne ggf. das Attribut mit dem neuen Namen (falls vorhanden)
    updatedCustomProps = updatedCustomProps.filter(a => a.name !== newProperty.name);
    // Füge das bearbeitete Attribut hinzu
    updatedCustomProps.push(newProperty);
    saveCustomProperties(updatedCustomProps);
    const detailsObj = loadCustomPropertyDetails();
    detailsObj[newProperty.name] = {
      name: newProperty.name,
      label: newProperty.label,
      description: newProperty.description,
      expectedType: newProperty.type,
      expectedUnit: newProperty.unit,
      synonyms: newProperty.synonyms,
      canonical: newProperty.canonical,
      reason: newProperty.reason,
      example: {
        parentType: newProperty.class,
        property: newProperty.name,
        value: newProperty.example,
      },
    };
    // Falls Name geändert wurde: alten Eintrag löschen!
    if (editCustomAttr && editCustomAttrName && editCustomAttrName !== newProperty.name) {
      delete detailsObj[editCustomAttrName];
    }
    saveCustomPropertyDetails(detailsObj);
    setAllProperties([...updatedCustomProps]);
    setShowNewPropertyPopup(false);
    setEditCustomAttr(null);
    setEditCustomAttrName(null);
    setNewProperty({
      name: "",
      label: "",
      type: propertyTypes[0],
      unit: "",
      description: "",
      synonyms: "",
      canonical: "",
      reason: "",
      example: "",
      class: "",
    });
  }

  function handleDeleteCustomAttribute(name: string) {
    const updated = loadCustomProperties().filter((a: NewProperty) => a.name !== name);
    saveCustomProperties(updated);
    setAllProperties([...updated]);
  }

  // Hilfsfunktionen für Klassenverwaltung
  function addClassToStorage(newClass: string) {
    const storedClasses = JSON.parse(localStorage.getItem("customClasses") || "[]");
    if (!storedClasses.includes(newClass)) {
      localStorage.setItem("customClasses", JSON.stringify([...storedClasses, newClass]));
    }
  }
  function removeClassFromStorage(cls: string) {
    const storedClasses = JSON.parse(localStorage.getItem("customClasses") || "[]");
    localStorage.setItem("customClasses", JSON.stringify(storedClasses.filter(c => c !== cls)));
  }
  function renameClassInStorage(oldClass: string, newClass: string) {
    const storedClasses = JSON.parse(localStorage.getItem("customClasses") || "[]");
    const updated = storedClasses.map(c => (c === oldClass ? newClass : c));
    localStorage.setItem("customClasses", JSON.stringify(updated));
  }

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: 20 }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: 18 }}>Attribute verwalten</h1>
      <div style={{ color: "#666", fontSize: "1.1rem", marginBottom: 12 }}>
        In diesem Bereich können Attribute betrachtet, bearbeitet, gelöscht oder einer Klasse zugeordnet werden.<br />
        Es können auch neue Attribute definiert werden.
      </div>
      <div style={{ marginBottom: 18, display: "flex", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Attribut suchen…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            padding: 12,
            fontSize: 17,
            borderRadius: 8,
            border: "1px solid #bbb",
            width: 320,
            marginRight: 20,
            background: "#fff"
          }}
        />
        <button
          style={{
            background: "#b00",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "12px 24px",
            fontWeight: "bold",
            fontSize: 17,
            cursor: "pointer",
            marginRight: 20
          }}
          onClick={() => setShowNewPropertyPopup(true)}
        >
          <FiPlus style={{ marginRight: 0 }} />
        </button>
        <button
          style={{
            background: "#fff",
            color: "#444",
            border: "1px solid #bbb",
            borderRadius: 8,
            padding: "12px 24px",
            fontWeight: "bold",
            fontSize: 17,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            marginRight: 20
          }}
          onClick={() => {
            setShowClassPopup(true);
            setClassPopupMode(null);
            setClassPopupValue("");
            setClassToEdit(null);
          }}
          title="Klassen verwalten"
        >
          <FiLayers style={{ marginRight: 6 }} />
          Klassen
        </button>
        <button
          style={{
            background: "#fff",
            color: "#444",
            border: "1px solid #bbb",
            borderRadius: 8,
            padding: "12px 24px",
            fontWeight: "bold",
            fontSize: 17,
            cursor: "pointer"
          }}
          onClick={() => setShowLoadFtfPopup(true)}
        >
          FTF Schema laden
        </button>
      </div>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
      }}>
        <thead>
          <tr>
            <th style={{ padding: 12, background: "#f5f5f5", borderBottom: "1px solid #ddd", textAlign: "left" }}>Name</th>
            <th style={{ padding: 12, background: "#f5f5f5", borderBottom: "1px solid #ddd", textAlign: "left" }}>Label</th>
            <th style={{ padding: 12, background: "#f5f5f5", borderBottom: "1px solid #ddd", textAlign: "left" }}>Typ</th>
            <th style={{ padding: 12, background: "#f5f5f5", borderBottom: "1px solid #ddd", textAlign: "left" }}>Einheit</th>
            <th style={{ padding: 12, background: "#f5f5f5", borderBottom: "1px solid #ddd", textAlign: "left" }}>Klasse</th>
            <th style={{ padding: 12, background: "#f5f5f5", borderBottom: "1px solid #ddd", textAlign: "center" }}>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([cls, attrs]) => (
            <React.Fragment key={cls}>
              <tr>
                <td colSpan={6}
                  style={{
                    background: "#eee",
                    fontWeight: "bold",
                    cursor: "pointer",
                    fontSize: "1.08rem",
                    padding: "16px 12px"
                  }}
                  onClick={() => setCollapsedClasses(c => ({ ...c, [cls]: !c[cls] }))}
                >
                  {collapsedClasses[cls]
                    ? <FiChevronRight style={{ verticalAlign: "middle" }} />
                    : <FiChevronDown style={{ verticalAlign: "middle" }} />
                  }
                  {" "}
                  {cls} <span style={{ color: "#888", fontWeight: "normal" }}>({attrs.length})</span>
                </td>
              </tr>
              {!collapsedClasses[cls] && attrs
                .filter(attr =>
                  attr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  attr.label.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(attr => (
                  <tr key={attr.name}
                    style={{
                      borderBottom: "1px solid #eee",
                      transition: "background 0.2s"
                    }}
                  >
                    <td style={{ padding: 14, color: "#b00", fontWeight: "bold" }}>{attr.name}</td>
                    <td style={{ padding: 14 }}>{attr.label}</td>
                    <td style={{ padding: 14 }}>{attr.type}</td>
                    <td style={{ padding: 14 }}>{attr.unit}</td>
                    <td style={{ padding: 14 }}>
                      <select
                        value={attr.class || "FTF"}
                        onChange={e => {
                          const updated = loadCustomProperties().map(a =>
                            a.name === attr.name ? { ...a, class: e.target.value } : a
                          );
                          saveCustomProperties(updated);
                          setAllProperties([...updated]);
                        }}
                        style={{ padding: 6, borderRadius: 4, border: "1px solid #bbb", width: 130 }}
                      >
                        {classList.map(clsOption => (
                          <option key={clsOption} value={clsOption}>{clsOption}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: 14, textAlign: "center" }}>
                      <span
                        style={{ cursor: "pointer", marginRight: 18, color: "#444" }}
                        title="Bearbeiten"
                        onClick={() => handleEditCustomAttribute(attr)}
                      >
                        <FiEdit2 size={20} />
                      </span>
                      <span
                        style={{ cursor: "pointer", color: "#b00" }}
                        title="Löschen"
                        onClick={() => handleDeleteCustomAttribute(attr.name)}
                      >
                        <FiTrash2 size={20} />
                      </span>
                    </td>
                  </tr>
                ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      {/* Neues Attribut definieren Popup */}
      {showNewPropertyPopup && (
        <div>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.18)",
              zIndex: 2000,
            }}
            onClick={() => setShowNewPropertyPopup(false)}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 2001,
              background: "#fff",
              border: "1px solid #b00",
              borderRadius: 10,
              boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
              padding: 32,
              maxWidth: 720,
              minWidth: 500,
              textAlign: "left"
            }}
          >
            <h2 style={{ color: "#b00", marginBottom: 18 }}>
              {editCustomAttr ? "Attribut bearbeiten" : "Neues Attribut definieren"}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="text"
                placeholder="Name (z.B. payload)"
                value={newProperty.name}
                onChange={e => setNewProperty({ ...newProperty, name: e.target.value })}
                style={{
                  padding: "12px 14px",
                  fontSize: 17,
                  borderRadius: 8,
                  border: "1px solid #bbb",
                  marginBottom: 8,
                  background: "#fff",
                  outline: "none",
                  minWidth: 340,
                  maxWidth: 600,
                  boxSizing: "border-box"
                }}
                maxLength={40}
              />
              <input
                type="text"
                placeholder="Label (z.B. Nutzlast)"
                value={newProperty.label}
                onChange={e => setNewProperty({ ...newProperty, label: e.target.value })}
                style={{
                  padding: "12px 14px",
                  fontSize: 17,
                  borderRadius: 8,
                  border: "1px solid #bbb",
                  marginBottom: 8,
                  background: "#fff",
                  outline: "none",
                  minWidth: 340,
                  maxWidth: 600,
                  boxSizing: "border-box"
                }}
                maxLength={40}
              />
              <select
                value={newProperty.type}
                onChange={e => setNewProperty({ ...newProperty, type: e.target.value })}
                style={{
                  padding: "12px 14px",
                  fontSize: 17,
                  borderRadius: 8,
                  border: "1px solid #bbb",
                  marginBottom: 8,
                  background: "#fff",
                  outline: "none",
                  minWidth: 340,
                  maxWidth: 600,
                  boxSizing: "border-box"
                }}
              >
                {propertyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Einheit (z.B. kg)"
                value={newProperty.unit}
                onChange={e => setNewProperty({ ...newProperty, unit: e.target.value })}
                style={{
                  padding: "12px 14px",
                  fontSize: 17,
                  borderRadius: 8,
                  border: "1px solid #bbb",
                  marginBottom: 8,
                  background: "#fff",
                  outline: "none",
                  minWidth: 340,
                  maxWidth: 600,
                  boxSizing: "border-box"
                }}
                maxLength={40}
              />
              <select
                value={newProperty.class || ""}
                onChange={e => setNewProperty({ ...newProperty, class: e.target.value })}
                style={{
                  padding: "12px 14px",
                  fontSize: 17,
                  borderRadius: 8,
                  border: "1px solid #bbb",
                  marginBottom: 8,
                  background: "#fff",
                  outline: "none",
                  minWidth: 340,
                  maxWidth: 600,
                  boxSizing: "border-box"
                }}
              >
                <option value="">Klasse wählen…</option>
                {classList.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Andere Herstellerbegriffe (Komma getrennt, optional)"
                value={newProperty.synonyms}
                onChange={e => setNewProperty({ ...newProperty, synonyms: e.target.value })}
                style={{
                  padding: "12px 14px",
                  fontSize: 17,
                  borderRadius: 8,
                  border: "1px solid #bbb",
                  marginBottom: 8,
                  background: "#fff",
                  outline: "none",
                  minWidth: 340,
                  maxWidth: 600,
                  boxSizing: "border-box"
                }}
                maxLength={100}
              />
              <input
                type="text"
                placeholder="Vereinheitlichung (optional)"
                value={newProperty.canonical}
                onChange={e => setNewProperty({ ...newProperty, canonical: e.target.value })}
                style={{
                  padding: "12px 14px",
                  fontSize: 17,
                  borderRadius: 8,
                  border: "1px solid #bbb",
                  marginBottom: 8,
                  background: "#fff",
                  outline: "none",
                  minWidth: 340,
                  maxWidth: 600,
                  boxSizing: "border-box"
                }}
                maxLength={40}
              />
              <input
                type="text"
                placeholder="Kurzbeschreibung"
                value={newProperty.description}
                onChange={e => setNewProperty({ ...newProperty, description: e.target.value })}
                style={{
                  padding: "12px 14px",
                  fontSize: 17,
                  borderRadius: 8,
                  border: "1px solid #bbb",
                  marginBottom: 8,
                  background: "#fff",
                  outline: "none",
                  minWidth: 340,
                  maxWidth: 600,
                  boxSizing: "border-box"
                }}
                maxLength={200}
              />
              <input
                type="text"
                placeholder="Begründung (optional)"
                value={newProperty.reason}
                onChange={e => setNewProperty({ ...newProperty, reason: e.target.value })}
                style={{
                  padding: "12px 14px",
                  fontSize: 17,
                  borderRadius: 8,
                  border: "1px solid #bbb",
                  marginBottom: 8,
                  background: "#fff",
                  outline: "none",
                  minWidth: 340,
                  maxWidth: 600,
                  boxSizing: "border-box"
                }}
                maxLength={200}
              />
              <input
                type="text"
                placeholder="Beispiel (optional)"
                value={newProperty.example}
                onChange={e => setNewProperty({ ...newProperty, example: e.target.value })}
                style={{
                  padding: "12px 14px",
                  fontSize: 17,
                  borderRadius: 8,
                  border: "1px solid #bbb",
                  marginBottom: 8,
                  background: "#fff",
                  outline: "none",
                  minWidth: 340,
                  maxWidth: 600,
                  boxSizing: "border-box"
                }}
                maxLength={200}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
              <button
                style={{
                  background: "#b00",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "12px 24px",
                  fontWeight: "bold",
                  fontSize: 17,
                  cursor: "pointer"
                }}
                onClick={handleSaveNewProperty}
              >
                {editCustomAttr ? "Speichern" : "Anlegen"}
              </button>
              <button
                style={{
                  background: "#fff",
                  color: "#444",
                  border: "1px solid #bbb",
                  borderRadius: 8,
                  padding: "12px 24px",
                  fontWeight: "bold",
                  fontSize: 17,
                  cursor: "pointer"
                }}
                onClick={() => {
                  setShowNewPropertyPopup(false);
                  setEditCustomAttr(null);
                  setEditCustomAttrName(null);
                  setNewProperty({
                    name: "",
                    label: "",
                    type: propertyTypes[0],
                    unit: "",
                    description: "",
                    synonyms: "",
                    canonical: "",
                    reason: "",
                    example: "",
                    class: "",
                  });
                }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
      {/* FTF Schema laden Popup */}
      {showLoadFtfPopup && (
        <div>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.18)",
              zIndex: 3000,
            }}
            onClick={() => setShowLoadFtfPopup(false)}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 3001,
              background: "#fff",
              border: "1px solid #b00",
              borderRadius: 10,
              boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
              padding: 32,
              maxWidth: 420,
              minWidth: 320,
              textAlign: "center"
            }}
          >
            <div style={{ fontWeight: "bold", color: "#b00", fontSize: 18, marginBottom: 12 }}>
              FTF Schema laden
            </div>
            <div style={{ color: "#444", marginBottom: 18 }}>
              Dadurch werden alle vordefinierten FTF Attribute in die FTF Klasse geladen.<br />
              Bereits vorhandene Attribute bleiben erhalten.<br />
            </div>
            <button
              style={{
                background: "#b00",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "10px 28px",
                fontWeight: "bold",
                fontSize: 16,
                marginRight: 10,
                cursor: "pointer"
              }}
              onClick={() => {
                const current = loadCustomProperties();
                const toAdd = initialAllProperties.filter(
                  def => !current.some(attr => attr.name === def.name)
                );
                const updated = [...current, ...toAdd];
                saveCustomProperties(updated);
                setAllProperties(updated);
                setShowLoadFtfPopup(false);
              }}
            >
              Bestätigen
            </button>
            <button
              style={{
                background: "#fff",
                color: "#444",
                border: "1px solid #bbb",
                borderRadius: 6,
                padding: "10px 28px",
                fontWeight: "bold",
                fontSize: 16,
                cursor: "pointer"
              }}
              onClick={() => setShowLoadFtfPopup(false)}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
      {/* Klassenverwaltung Popup */}
      {showClassPopup && (
        <div>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.18)",
              zIndex: 2100,
            }}
            onClick={() => setShowClassPopup(false)}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 2101,
              background: "#fff",
              border: "1px solid #b00",
              borderRadius: 10,
              boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
              padding: 32,
              maxWidth: 420,
              minWidth: 320,
              textAlign: "left"
            }}
          >
            <h2 style={{ marginBottom: 18 }}>Klassen verwalten</h2>
            {classList.map(cls => (
              <div key={cls} style={{ display: "flex", alignItems: "center", marginBottom: 8, justifyContent: "space-between" }}>
                <span style={{ fontWeight: "bold" }}>{cls}</span>
                <div>
                  <span
                    style={{
                      cursor: "pointer",
                      marginRight: 8,
                      color: "#444",
                      verticalAlign: "middle"
                    }}
                    title="Umbenennen"
                    onClick={() => {
                      setClassPopupMode("rename");
                      setClassToEdit(cls);
                      setClassPopupValue(cls);
                    }}
                  >
                    <FiEdit2 size={20} />
                  </span>
                  {cls !== "FTF" && (
                    <span
                      style={{
                        cursor: "pointer",
                        color: "#b00",
                        verticalAlign: "middle"
                      }}
                      title="Löschen"
                      onClick={() => {
                        setClassPopupMode("delete");
                        setClassToEdit(cls);
                      }}
                    >
                      <FiTrash2 size={20} />
                    </span>
                  )}
                </div>
              </div>
            ))}
            <button
              style={{
                background: "#b00",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "6px 18px",
                fontWeight: "bold",
                fontSize: 15,
                cursor: "pointer",
                marginTop: 8,
                width: "100%"
              }}
              onClick={() => {
                setClassPopupMode("add");
                setClassPopupValue("");
                setClassToEdit(null);
              }}
            >
              <FiPlus style={{ marginRight: 6 }} />
              Neue Klasse erstellen
            </button>
            {/* Add/Rename/Delete Popups */}
            {classPopupMode === "add" && (
              <div style={{ marginTop: 24 }}>
                <input
                  type="text"
                  placeholder="Name der Klasse"
                  value={classPopupValue}
                  onChange={e => setClassPopupValue(e.target.value)}
                  style={{ padding: 8, fontSize: 16, borderRadius: 6, border: "1px solid #bbb", width: "100%" }}
                  maxLength={40}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 18 }}>
                  <button
                    style={{
                      background: "#b00",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "8px 22px",
                      fontWeight: "bold",
                      fontSize: 16,
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      if (!classPopupValue.trim() || classList.includes(classPopupValue.trim())) return;
                      addClassToStorage(classPopupValue.trim());
                      setShowClassPopup(false);
                      setClassPopupValue("");
                    }}
                    disabled={!classPopupValue.trim() || classList.includes(classPopupValue.trim())}
                  >
                    Erstellen
                  </button>
                  <button
                    style={{
                      background: "#fff",
                      color: "#444",
                      border: "1px solid #bbb",
                      borderRadius: 6,
                      padding: "8px 22px",
                      fontWeight: "bold",
                      fontSize: 16,
                      cursor: "pointer"
                    }}
                    onClick={() => setClassPopupMode(null)}
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}
            {classPopupMode === "rename" && (
              <div style={{ marginTop: 24 }}>
                <input
                  type="text"
                  placeholder="Neuer Name"
                  value={classPopupValue}
                  onChange={e => setClassPopupValue(e.target.value)}
                  style={{ padding: 8, fontSize: 16, borderRadius: 6, border: "1px solid #bbb", width: "100%" }}
                  maxLength={40}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 18 }}>
                  <button
                    style={{
                      background: "#b00",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "8px 22px",
                      fontWeight: "bold",
                      fontSize: 16,
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      if (!classPopupValue.trim() || classList.includes(classPopupValue.trim())) return;
                      renameClassInStorage(classToEdit!, classPopupValue.trim());
                      // Update alle Attribute mit alter Klasse
                      const updated = loadCustomProperties().map(a =>
                        (a.class || "FTF") === classToEdit ? { ...a, class: classPopupValue.trim() } : a
                      );
                      saveCustomProperties(updated);
                      setAllProperties([...updated]);
                      setShowClassPopup(false);
                      setClassPopupValue("");
                      setClassToEdit(null);
                    }}
                    disabled={!classPopupValue.trim() || classList.includes(classPopupValue.trim())}
                  >
                    Umbenennen
                  </button>
                  <button
                    style={{
                      background: "#fff",
                      color: "#444",
                      border: "1px solid #bbb",
                      borderRadius: 6,
                      padding: "8px 22px",
                      fontWeight: "bold",
                      fontSize: 16,
                      cursor: "pointer"
                    }}
                    onClick={() => setClassPopupMode(null)}
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}
            {classPopupMode === "delete" && (
              <div style={{ marginTop: 24 }}>
                <div style={{ marginBottom: 18 }}>
                  Möchtest du die Klasse <b>{classToEdit}</b> wirklich löschen?<br />
                  Alle zugehörigen Attribute werden zu FTF verschoben.
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                  <button
                    style={{
                      background: "#b00",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "8px 22px",
                      fontWeight: "bold",
                      fontSize: 16,
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      removeClassFromStorage(classToEdit!);
                      // Update alle Attribute mit dieser Klasse
                      const updated = loadCustomProperties().map(a =>
                        (a.class || "FTF") === classToEdit ? { ...a, class: "FTF" } : a
                      );
                      saveCustomProperties(updated);
                      setAllProperties([...updated]);
                      setShowClassPopup(false);
                      setClassToEdit(null);
                    }}
                  >
                    Löschen
                  </button>
                  <button
                    style={{
                      background: "#fff",
                      color: "#444",
                      border: "1px solid #bbb",
                      borderRadius: 6,
                      padding: "8px 22px",
                      fontWeight: "bold",
                      fontSize: 16,
                      cursor: "pointer"
                    }}
                    onClick={() => setClassPopupMode(null)}
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function loadCustomProperties() {
  const stored = localStorage.getItem("customProperties");
  return stored ? JSON.parse(stored) : [];
}

export function saveCustomProperties(props) {
  localStorage.setItem("customProperties", JSON.stringify(props));
}

function saveCustomPropertyDetails(details: Record<string, any>) {
  localStorage.setItem("customPropertyDetails", JSON.stringify(details));
}
function loadCustomPropertyDetails() {
  const raw = localStorage.getItem("customPropertyDetails");
  return raw ? JSON.parse(raw) : {};
}