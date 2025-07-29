import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { loadAttributeLists, saveAttributeLists, type AttributeList } from "../attributeLists";
import { FiChevronDown, FiChevronUp, FiEdit2, FiTrash2, FiDownload } from "react-icons/fi";

function loadCustomProperties() {
  const raw = localStorage.getItem("customProperties");
  if (raw) return JSON.parse(raw);
  // Optional: initialAllProperties importieren, falls du Defaults willst
  // localStorage.setItem("customProperties", JSON.stringify(initialAllProperties));
  // return [...initialAllProperties];
  return [];
}

function saveCustomProperties(props: any[]) {
  localStorage.setItem("customProperties", JSON.stringify(props));
}

// Modernes Input/Select-Design
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

const modernSelectStyle = {
  ...modernInputStyle,
  minWidth: 220,
  maxWidth: 340,
};

export default function Schema() {
  const [lists, setLists] = useState<AttributeList[]>(() => loadAttributeLists());
  const [newListName, setNewListName] = useState("");
  const [templateSelect, setTemplateSelect] = useState("");
  const [openListId, setOpenListId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editProps, setEditProps] = useState<any[]>([]);
  const [editingValueRange, setEditingValueRange] = useState<string | null>(null);
  const [valueRangeDraft, setValueRangeDraft] = useState<any>({});
  const [enumInput, setEnumInput] = useState<string>("");
  const [classFilter, setClassFilter] = useState<string>("");
  const [showRemoveAllWarning, setShowRemoveAllWarning] = useState(false);
  const [showDeleteListWarning, setShowDeleteListWarning] = useState<{ id: string, name: string } | null>(null);

  const allClasses = Array.from(
    new Set(loadCustomProperties().map(p => p.class || ""))
  ).filter(Boolean);

  
  function handleCreateList() {
    if (!newListName.trim()) return;
    const id = Date.now().toString();
    let props: any[] = [];
    if (templateSelect) {
      const tpl = lists.find(l => l.id === templateSelect);
      if (tpl) props = [...tpl.properties];
    }
    props = props.sort((a, b) => a.name.localeCompare(b.name));
    const newList = { id, name: newListName, properties: props };
    const updated = [...lists, newList];
    saveAttributeLists(updated);
    setLists(updated);
    setNewListName("");
    setTemplateSelect("");
  }

  // Liste löschen
  function handleDeleteList(id: string) {
    const updated = lists.filter(l => l.id !== id);
    setLists(updated);
    saveAttributeLists(updated);
    if (openListId === id) setOpenListId(null);
    if (editId === id) setEditId(null);
  }

  // Als Vorlage speichern/entfernen
  function handleSaveAsTemplate(id: string) {
    const updated = lists.map(l => l.id === id ? { ...l, isTemplate: true } : l);
    setLists(updated);
    saveAttributeLists(updated);
  }
  function handleRemoveTemplate(id: string) {
    const updated = lists.map(l => l.id === id ? { ...l, isTemplate: false } : l);
    setLists(updated);
    saveAttributeLists(updated);
  }

  // Bearbeiten starten
  function handleEditList(id: string) {
    const list = lists.find(l => l.id === id);
    if (list) {
      setEditId(id);
      setEditProps([...list.properties]);
      setEditingValueRange(null);
      setValueRangeDraft({});
      setEnumInput("");
    }
  }

  // Attribute hinzufügen/entfernen
  function handleAddPropertyToEdit(name: string) {
    if (!editProps.some(p => p.name === name)) {
      const prop = loadCustomProperties().find(p => p.name === name);
      if (prop) {
        setEditProps([...editProps, { ...prop, valueConstraints: {} }]);
      }
    }
  }
  function handleRemovePropertyFromEdit(name: string) {
    setEditProps(editProps.filter(p => p.name !== name));
  }
  function handleSelectAll() {
    // Alle verfügbaren Attribute, die noch nicht in editProps sind
    const allProps = loadCustomProperties();
    const missingProps = allProps.filter(
      p => !editProps.some(ep => ep.name === p.name)
    );
    setEditProps([...editProps, ...missingProps.map(p => ({ ...p, valueConstraints: {} }))]);
  }
  function handleRemoveAll() {
    setShowRemoveAllWarning(true);
  }
  function confirmRemoveAll() {
    setEditProps([]);
    setShowRemoveAllWarning(false);
  }

  // Wertebereich/Constraints Editor
  function isEditable(prop: any) {
    return prop.type === "Number" || prop.type === "Enum" || prop.type === "Enumeration" || prop.type === "List";
  }
  function handleEditValueRange(prop: any) {
    setEditingValueRange(prop.name);
    setValueRangeDraft({ ...prop.valueConstraints });
    setEnumInput("");
  }
  function handleSaveValueRange(name: string) {
    setEditProps(editProps.map(p =>
      p.name === name ? { ...p, valueConstraints: { ...valueRangeDraft } } : p
    ));
    setEditingValueRange(null);
    setValueRangeDraft({});
    setEnumInput("");
  }
  function handleAddEnumChip() {
    const val = enumInput.trim();
    if (!val) return;
    setValueRangeDraft((d: any) => ({
      ...d,
      enumValues: [...(d.enumValues || []), val]
    }));
    setEnumInput("");
  }
  function handleRemoveEnumChip(idx: number) {
    setValueRangeDraft((d: any) => ({
      ...d,
      enumValues: (d.enumValues || []).filter((_: any, i: number) => i !== idx)
    }));
  }
  function renderValueRangeEditor(prop: any) {
    if (prop.type === "Number") {
      return (
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="number"
            placeholder="min"
            value={valueRangeDraft.min ?? ""}
            onChange={e => setValueRangeDraft((d: any) => ({ ...d, min: e.target.value !== "" ? Number(e.target.value) : undefined }))}
            style={{ ...modernInputStyle, width: 80 }}
          />
          <span>bis</span>
          <input
            type="number"
            placeholder="max"
            value={valueRangeDraft.max ?? ""}
            onChange={e => setValueRangeDraft((d: any) => ({ ...d, max: e.target.value !== "" ? Number(e.target.value) : undefined }))}
            style={{ ...modernInputStyle, width: 80 }}
          />
          <label style={{ marginLeft: 10 }}>
            <input
              type="checkbox"
              checked={!!valueRangeDraft.integer}
              onChange={e => setValueRangeDraft((d: any) => ({ ...d, integer: e.target.checked }))}
              style={{ marginRight: 4 }}
            />
            Ganze Zahl
          </label>
        </div>
      );
    }
    if (prop.type === "Enum" || prop.type === "Enumeration" || prop.type === "List") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 }}>
            {(valueRangeDraft.enumValues || []).map((v: string, idx: number) => (
              <span key={idx} style={{
                background: "#eee",
                borderRadius: 16,
                padding: "4px 12px",
                display: "inline-flex",
                alignItems: "center",
                fontSize: 15
              }}>
                {v}
                <FiTrash2
                  style={{ marginLeft: 6, cursor: "pointer", color: "#b00" }}
                  title="Entfernen"
                  onClick={() => handleRemoveEnumChip(idx)}
                />
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              type="text"
              placeholder="Wert hinzufügen"
              value={enumInput}
              onChange={e => setEnumInput(e.target.value)}
              style={{ ...modernInputStyle, minWidth: 120, maxWidth: 180, marginBottom: 0 }}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddEnumChip();
                }
              }}
            />
            <button
              type="button"
              style={{
                background: "#b00",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "6px 16px",
                fontWeight: "bold",
                fontSize: 15,
                cursor: "pointer"
              }}
              onClick={handleAddEnumChip}
            >
              Hinzufügen
            </button>
          </div>
        </div>
      );
    }
    return null;
  }
  function renderValueRangeSummary(prop: any) {
    const c = prop.valueConstraints || {};
    if (prop.type === "Number") {
      let txt = "";
      if (c.min !== undefined && c.max !== undefined) txt = `${c.min} bis ${c.max}`;
      else if (c.min !== undefined) txt = `≥ ${c.min}`;
      else if (c.max !== undefined) txt = `≤ ${c.max}`;
      if (c.integer) txt += " (ganzzahlig)";
      return txt || <span style={{ color: "#bbb" }}>beliebig</span>;
    }
    if (prop.type === "Boolean") {
      return "true / false";
    }
    if ((prop.type === "Enum" || prop.type === "Enumeration" || prop.type === "List") && c.enumValues && c.enumValues.length > 0) {
      return c.enumValues.join(", ");
    }
    return <span style={{ color: "#bbb" }}>beliebig</span>;
  }

  // Änderungen speichern
  function handleSaveEdit() {
    const updatedList = {
      ...lists.find(l => l.id === editId)!,
      properties: editProps,
    };
    const updated = lists.map(l => l.id === updatedList.id ? updatedList : l);
    setLists(updated);
    saveAttributeLists(updated);
    setEditId(null);
    setEditProps([]);
  }

  // Schema speichern (JSON Download)
  function handleSaveSchema() {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(editProps, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "schema.json");
    dlAnchorElem.click();
  }

  // Vorlagen für Dropdown
  const templates = lists.filter(l => l.isTemplate);

  function syncAttributeListsAfterPropertyChange(prop: any) {
    setLists(lists =>
      lists.map(list => ({
        ...list,
        properties: list.properties.map(p =>
          p.name === prop.name ? { ...p, ...prop } : p
        )
      }))
    );
    saveAttributeLists(
      lists.map(list => ({
        ...list,
        properties: list.properties.map(p =>
          p.name === prop.name ? { ...p, ...prop } : p
        )
      }))
    );
  }

  function syncAllAttributeListsWithCustomProperties() {
    const allProps = loadCustomProperties();
    setLists(lists => {
      const updated = lists.map(list => ({
        ...list,
        properties: list.properties.map(p => {
          const updatedProp = allProps.find(ap => ap.name === p.name);
          return updatedProp ? { ...p, ...updatedProp } : p;
        })
      }));
      saveAttributeLists(updated);
      return updated;
    });
  }

  useEffect(() => {
    syncAllAttributeListsWithCustomProperties();
    // eslint-disable-next-line
  }, [localStorage.getItem("customProperties")]);

  return (
    <div style={{ margin: "40px 32px 40px 0", padding: 20 }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: 10 }}>Schema Editor</h1>
      <div style={{ color: "#666", fontSize: "1.1rem", marginBottom: 32 }}>
        Zur Nutzung des Schema-Editors muss zunächst ein Schema für das jeweilige Objekt angelegt werden.
In diesem Bereich können solche Schemata angelegt, bearbeitet und verwaltet werden.
Zudem besteht die Möglichkeit, Vorlagen zu verwenden etwa für neue Objekte, die ähnliche Eigenschaften
wie bereits bestehende Typen aufweisen.
      </div>

      {/* Neue Schemata anlegen */}
      <div style={{ marginBottom: 60, background: "#f9f9f9", padding: 24, borderRadius: 10 }}>
        <h2 style={{ marginBottom: 10 }}>Neues Schema anlegen</h2>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <input
            type="text"
            value={newListName}
            onChange={e => setNewListName(e.target.value)}
            placeholder="Name des Schemas"
            style={modernInputStyle}
          />
          <select
            value={templateSelect}
            onChange={e => setTemplateSelect(e.target.value)}
            style={modernSelectStyle}
          >
            <option value="">Vorlage (optional)</option>
            {templates.map(tpl => (
              <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
            ))}
          </select>
          <button
            onClick={handleCreateList}
            disabled={!newListName.trim()}
            style={{
              background: "#b00",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 24px",
              fontWeight: "bold",
              fontSize: 17,
              cursor: "pointer",
              marginBottom: 8
            }}
          >
            Anlegen
          </button>
        </div>
      </div>

      {/* Übersicht Schemata */}
      <div style={{ color: "#666", fontSize: "1.05rem", marginBottom: 18 }}>
  In der Übersicht werden alle angelegten Schemata angezeigt. 
  Sie können bestehende Listen einsehen, bearbeiten, löschen oder als Vorlage speichern.
</div>
      <div style={{ marginBottom: 100 }}>
        <h2>Übersicht Schemata</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <thead>
            <tr>
              <th style={{ padding: 10, background: "#f5f5f5", borderBottom: "1px solid #ddd", textAlign: "left" }}>Name</th>
              <th style={{ padding: 10, background: "#f5f5f5", borderBottom: "1px solid #ddd", textAlign: "left" }}># Attribute</th>
              <th style={{ padding: 10, background: "#f5f5f5", borderBottom: "1px solid #ddd" }}></th>
            </tr>
          </thead>
          <tbody>
            {lists.map(list => (
              <React.Fragment key={list.id}>
                <tr>
                  <td
                    style={{
                      padding: 18,
                      borderBottom: "1px solid #eee",
                      color: "#111",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontSize: "1.08rem"
                    }}
                    onClick={() => {
                      setOpenListId(openListId === list.id ? null : list.id);
                      setEditId(null);
                    }}
                    title="Attribute anzeigen"
                  >
                    {list.name}{" "}
                    {openListId === list.id ? <FiChevronUp /> : <FiChevronDown />}
                  </td>
                  <td style={{ padding: 18, borderBottom: "1px solid #eee" }}>{list.properties.length}</td>
                  <td style={{ padding: 18, borderBottom: "1px solid #eee" }}>
                    <span
                      onClick={e => {
                        e.stopPropagation();
                        setShowDeleteListWarning({ id: list.id, name: list.name });
                      }}
                      style={{ cursor: "pointer", color: "#b00" }}
                      title="Löschen"
                    >
                      <FiTrash2 size={20} />
                    </span>
                  </td>
                </tr>
                {/* Anzeige-Modus */}
                {openListId === list.id && !editId && (
                  <tr>
                    <td colSpan={4} style={{ padding: 0 }}>
                      <div style={{
                        background: "#f5f5f5",
                        borderRadius: 10,
                        padding: 24,
                        margin: "20px 0 30px 0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        width: "100%",
                        transition: "all 0.3s"
                      }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 8 }}>
                          <thead>
                            <tr>
                              <th style={{ background: "#f5f5f5", border: "1px solid #ddd", padding: 12 }}>Property</th>
                              <th style={{ background: "#f5f5f5", border: "1px solid #ddd", padding: 12 }}>Label</th>
                              <th style={{ background: "#f5f5f5", border: "1px solid #ddd", padding: 12 }}>Type</th>
                              <th style={{ background: "#f5f5f5", border: "1px solid #ddd", padding: 12 }}>Unit</th>
                              <th style={{ background: "#f5f5f5", border: "1px solid #ddd", padding: 12 }}>Beschreibung</th>
                            </tr>
                          </thead>
                          <tbody>
                            {list.properties.map(prop => (
                              <tr key={prop.name}>
                                <td style={{ border: "1px solid #ddd", padding: 14, whiteSpace: "pre-line", wordBreak: "break-word", maxWidth: 320 }}>
                                  <Link to={`/property/${prop.name}`} style={{ color: "#b00", textDecoration: "none", fontWeight: "bold" }}>
                                    {prop.name}
                                  </Link>
                                </td>
                                <td style={{ border: "1px solid #ddd", padding: 14 }}>{prop.label || ""}</td>
                                <td style={{ border: "1px solid #ddd", padding: 14 }}>
                                  <Link to="/type-info" style={{ color: "#b00", textDecoration: "none", fontWeight: "bold" }}>
                                    {prop.type}
                                  </Link>
                                </td>
                                <td style={{ border: "1px solid #ddd", padding: 14 }}>{prop.unit}</td>
                                <td style={{ border: "1px solid #ddd", padding: 14, whiteSpace: "pre-line", wordBreak: "break-word", maxWidth: 320, minWidth: 120 }}>
                                  {prop.description || ""}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
                          <button
                            onClick={() => {
                              handleEditList(list.id);
                              setOpenListId(list.id);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              background: "#fff",
                              border: "1px solid #b00",
                              color: "#b00",
                              borderRadius: 6,
                              padding: "10px 22px",
                              fontWeight: "bold",
                              fontSize: 17,
                              cursor: "pointer",
                              transition: "background 0.2s"
                            }}
                          >
                            <FiEdit2 style={{ marginRight: 8 }} />
                            Bearbeiten
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                {/* Bearbeitungsmodus */}
                {openListId === list.id && editId === list.id && (
                  <tr>
                    <td colSpan={4} style={{ padding: 0 }}>
                      <div style={{
                        background: "#f5f5f5",
                        borderRadius: 10,
                        padding: 24,
                        margin: "20px 0 30px 0",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        width: "100%",
                        transition: "all 0.3s"
                      }}>
                        <h2>Schema bearbeiten</h2>
                        <div style={{ marginBottom: 18, display: "flex", alignItems: "center" }}>
                          <select
                            onChange={e => handleAddPropertyToEdit(e.target.value)}
                            value=""
                            style={{ marginRight: 10, ...modernSelectStyle }}
                          >
                            <option value="">Attribut hinzufügen…</option>
                            {loadCustomProperties()
                              .filter(p => !editProps.some(ep => ep.name === p.name))
                              .filter(p => !classFilter || (p.class || "") === classFilter)
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map(prop => (
                                <option key={prop.name} value={prop.name}>
                                  {prop.name} ({prop.unit})
                                </option>
                              ))}
                          </select>
                          <select
                            value={classFilter}
                            onChange={e => setClassFilter(e.target.value)}
                            style={{ marginRight: 10, ...modernSelectStyle }}
                          >
                            <option value="">Alle Klassen</option>
                            {allClasses.map(cls => (
                              <option key={cls} value={cls}>{cls}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            style={{
                              marginLeft: 8,
                              background: "#b00",
                              color: "#fff",
                              border: "none",
                              borderRadius: 6,
                              padding: "8px 14px",
                              fontWeight: "bold",
                              fontSize: 15,
                              cursor: "pointer"
                            }}
                            onClick={handleSelectAll}
                            disabled={editProps.length === list.properties.length}
                          >
                            Alle auswählen
                          </button>
                          <button
                            type="button"
                            style={{
                              marginLeft: 8,
                              background: "#444",
                              color: "#fff",
                              border: "none",
                              borderRadius: 6,
                              padding: "8px 14px",
                              fontWeight: "bold",
                              fontSize: 15,
                              cursor: "pointer"
                            }}
                            onClick={handleRemoveAll}
                            disabled={editProps.length === 0}
                          >
                            Alle entfernen
                          </button>
                        </div>
                        <table style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontFamily: "monospace",
                          background: "#fff",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                        }}>
                          <thead>
                            <tr>
                              <th style={{ background: "#f5f5f5", border: "1px solid #ddd", padding: 12 }}>Property</th>
                              <th style={{ background: "#f5f5f5", border: "1px solid #ddd", padding: 12 }}>Label</th>
                              <th style={{ background: "#f5f5f5", border: "1px solid #ddd", padding: 12 }}>Type</th>
                              <th style={{ background: "#f5f5f5", border: "1px solid #ddd", padding: 12 }}>Unit</th>
                              <th style={{ background: "#f5f5f5", border: "1px solid #ddd", padding: 12 }}>Beschreibung</th>
                              <th style={{ background: "#f5f5f5", border: "1px solid #ddd", padding: 12 }}>Wertebereich</th>
                              <th style={{ background: "#f5f5f5", border: "1px solid #ddd", padding: 12 }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {editProps.map(prop => (
                              <tr key={prop.name}>
                                <td style={{ border: "1px solid #ddd", padding: 18 }}>{prop.name}</td>
                                <td style={{ border: "1px solid #ddd", padding: 18 }}>{prop.label || ""}</td>
                                <td style={{ border: "1px solid #ddd", padding: 18 }}>{prop.type}</td>
                                <td style={{ border: "1px solid #ddd", padding: 18 }}>{prop.unit}</td>
                                <td style={{ border: "1px solid #ddd", padding: 18, whiteSpace: "pre-line", wordBreak: "break-word", maxWidth: 320, minWidth: 120 }}>
                                  {prop.description || ""}
                                </td>
                                <td style={{ border: "1px solid #ddd", padding: 18 }}>
                                  {/* Wertebereich-Editor wie gehabt */}
                                  {editingValueRange === prop.name && isEditable(prop) ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      {renderValueRangeEditor(prop)}
                                      <button
                                        style={{
                                          background: "#b00",
                                          color: "#fff",
                                          border: "none",
                                          borderRadius: 6,
                                          padding: "6px 16px",
                                          fontWeight: "bold",
                                          fontSize: 15,
                                          marginLeft: 8,
                                          cursor: "pointer"
                                        }}
                                        onClick={() => handleSaveValueRange(prop.name)}
                                      >
                                        Speichern
                                      </button>
                                      <button
                                        style={{
                                          background: "#fff",
                                          color: "#444",
                                          border: "1px solid #bbb",
                                          borderRadius: 6,
                                          padding: "6px 16px",
                                          fontWeight: "bold",
                                          fontSize: 15,
                                          cursor: "pointer"
                                        }}
                                        onClick={() => setEditingValueRange(null)}
                                      >
                                        Abbrechen
                                      </button>
                                    </div>
                                  ) : (
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      <span>{renderValueRangeSummary(prop)}</span>
                                      {isEditable(prop) && (
                                        <FiEdit2
                                          style={{
                                            cursor: "pointer",
                                            color: "#b00"
                                          }}
                                          title="Wertebereich bearbeiten"
                                          onClick={() => handleEditValueRange(prop)}
                                        />
                                      )}
                                    </div>
                                  )}
                                </td>
                                <td style={{ border: "1px solid #ddd", padding: 18 }}>
                                  <button onClick={() => handleRemovePropertyFromEdit(prop.name)}>Entfernen</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
                          <div>
                            <button
                              style={{
                                background: "#b00",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                padding: "10px 22px",
                                fontWeight: "bold",
                                fontSize: 16,
                                cursor: "pointer",
                                marginRight: 10,
                                boxShadow: "0 2px 8px rgba(176,0,0,0.08)"
                              }}
                              onClick={handleSaveEdit}
                            >
                              Speichern
                            </button>
                            <button
                              style={{
                                background: "#fff",
                                color: "#b00",
                                border: "1.5px solid #b00",
                                borderRadius: 6,
                                padding: "10px 22px",
                                fontWeight: "bold",
                                fontSize: 16,
                                cursor: "pointer",
                                marginRight: 10
                              }}
                              onClick={() => { setEditId(null); setEditProps([]); }}
                            >
                              Abbrechen
                            </button>
                          </div>
                          {list.isTemplate ? (
                            <button
                              style={{
                                background: "#fff",
                                color: "#b00",
                                border: "1.5px solid #b00",
                                borderRadius: 6,
                                padding: "10px 22px",
                                fontWeight: "bold",
                                fontSize: 16,
                                cursor: "pointer",
                                marginRight: 10
                              }}
                              onClick={() => handleRemoveTemplate(list.id)}
                            >
                              Vorlage entfernen
                            </button>
                          ) : (
                            <button
                              style={{
                                background: "#fff",
                                color: "#b00",
                                border: "1.5px solid #b00",
                                borderRadius: 6,
                                padding: "10px 22px",
                                fontWeight: "bold",
                                fontSize: 16,
                                cursor: "pointer",
                                marginRight: 10
                              }}
                              onClick={() => handleSaveAsTemplate(list.id)}
                            >
                              Als Vorlage speichern
                            </button>
                          )}
                          <button
                            style={{
                              background: "#b00",
                              color: "#fff",
                              border: "none",
                              borderRadius: 6,
                              padding: "10px 22px",
                              fontWeight: "bold",
                              fontSize: 16,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 8
                            }}
                            onClick={handleSaveSchema}
                          >
                            <FiDownload size={20} />
                            Schema speichern
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {showRemoveAllWarning && (
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
      onClick={() => setShowRemoveAllWarning(false)}
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
        minWidth: 340,
        textAlign: "center"
      }}
    >
      <div style={{ fontSize: 18, marginBottom: 18 }}>
        <b>Achtung:</b> Es werden alle Attribute entfernt!<br />
        Vorgang fortsetzen?
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 18 }}>
        <button
          style={{
            background: "#b00",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 22px",
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer"
          }}
          onClick={confirmRemoveAll}
        >
          Ja, alle entfernen
        </button>
        <button
          style={{
            background: "#fff",
            color: "#b00",
            border: "1.5px solid #b00",
            borderRadius: 6,
            padding: "10px 22px",
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer"
          }}
          onClick={() => setShowRemoveAllWarning(false)}
        >
          Abbrechen
        </button>
      </div>
    </div>
  </div>
)}

{showDeleteListWarning && (
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
      onClick={() => setShowDeleteListWarning(null)}
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
        minWidth: 340,
        textAlign: "center"
      }}
    >
      <div style={{ fontSize: 18, marginBottom: 18 }}>
        <b>Achtung:</b> Das Schema {showDeleteListWarning.name} wird endgültig gelöscht!<br />
        Vorgang fortsetzen?
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 18 }}>
        <button
          style={{
            background: "#b00",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 22px",
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer"
          }}
          onClick={() => {
            handleDeleteList(showDeleteListWarning.id);
            setShowDeleteListWarning(null);
          }}
        >
          Ja, löschen
        </button>
        <button
          style={{
            background: "#fff",
            color: "#b00",
            border: "1.5px solid #b00",
            borderRadius: 6,
            padding: "10px 22px",
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer"
          }}
          onClick={() => setShowDeleteListWarning(null)}
        >
          Abbrechen
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}