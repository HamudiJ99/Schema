import React from "react";

export default function TypeInfo() {
  const typeHeadingStyle = {
    fontSize: "1.2rem",
    marginTop: 0,
    marginBottom: 8,
    color: "#b00"
  };

  const typeBoxStyle = {
    background: "#f5f5f5",
    borderRadius: 10,
    padding: "24px 24px 16px 24px",
    marginBottom: 32,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
  };

  return (
    <div style={{ maxWidth: 800, padding: "100px 0 40px 120px" }}>
      <h1 style={{ fontSize: "2.2rem", marginBottom: 20 }}>
        Datentypen und ihre Bedeutung
      </h1>
      <div style={{ fontSize: "1.3rem", color: "#444", marginBottom: 24 }}>
        Erklärung der wichtigsten Typen für Eigenschaften im Schema.
      </div>

      <div style={typeBoxStyle}>
        <h2 style={typeHeadingStyle}>Number</h2>
        <div style={{ marginBottom: 16 }}>
          <b>Bedeutung:</b> Ein numerischer Wert, also eine Zahl. Kann ganzzahlig oder mit Kommazahlen sein.<br />
          <b>Beispiele:</b> 24, 1.5, 1200
        </div>
      </div>

      <div style={typeBoxStyle}>
        <h2 style={typeHeadingStyle}>Text</h2>
        <div style={{ marginBottom: 16 }}>
          <b>Bedeutung:</b> Freier Text / Zeichenkette (String).<br />
          <b>Beispiele:</b> "Montage", "elektrisch", "automatisch per Schleifkontakte"
        </div>
      </div>

      <div style={typeBoxStyle}>
        <h2 style={typeHeadingStyle}>Boolean</h2>
        <div style={{ marginBottom: 16 }}>
          <b>Bedeutung:</b> Wahrheitswert – true oder false<br />
          <b>Beispiele:</b>
          <ul>
            <li>availability: <b>true</b> → Fahrzeug ist am Markt</li>
            <li>batteryExchangeable: <b>false</b> → Akku ist fest verbaut</li>
          </ul>
        </div>
      </div>

      <div style={typeBoxStyle}>
        <h2 style={typeHeadingStyle}>Enumeration</h2>
        <div style={{ marginBottom: 16 }}>
          <b>Bedeutung:</b> Aus einer festgelegten Liste von möglichen Werten (eine Art Auswahlfeld)<br />
          <b>Beispiele (für batteryType):</b>
          <ul>
            <li>"Lithium-Ion"</li>
            <li>"Blei-Säure"</li>
            <li>"LiFePO4"</li>
          </ul>
          Hinweis: Diese Werte sind standardisiert oder vorgegeben, z. B. in einem Dropdown-Menü auswählbar.
        </div>
      </div>

      <div style={typeBoxStyle}>
        <h2 style={typeHeadingStyle}>List</h2>
        <div style={{ marginBottom: 16 }}>
          <b>Bedeutung:</b> Eine Liste von Textwerten, z. B. mehrere Einträge<br />
          <b>Beispiele:</b> ["ISO 3691", "PL d", "CE"]
        </div>
        <div style={{ marginBottom: 16 }}>
          <b>Wird verwendet für:</b>
          <ul>
            <li>certifications, da Fahrzeuge oft mehrere Zertifizierungen gleichzeitig haben</li>
          </ul>
        </div>
      </div>
    </div>
  );
}