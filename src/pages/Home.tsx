import React from "react";
import { FaSitemap, FaLayerGroup, FaCode, FaCheckCircle } from "react-icons/fa";

const sections = [
  {
    icon: <FaLayerGroup size={38} color="#fff" />,
    title: "Attribute verwalten",
    color: "#b00",
    description:
      "Attribute können erstellt, bearbeitet und gelöscht werden. Zur besseren Organisation lassen sich Klassen anlegen. Ein Attribut besteht aus Synonymen, Beschreibung, Typ, Einheit und Beispielen"

  },
  {
    icon: <FaSitemap size={38} color="#fff" />,
    title: "Schema-Editor",
    color: "#ff8800", 
    description:
      "Schemata können für verschiedene Objekte erstellt und verwaltet werden. Dafür kann der Wertebereich für die Attribute definiert werden. Das jeweilige Schema kann anschließend exportiert und als Vorlage genutzt werden."
  },
  {
    icon: <FaCode size={34} color="#fff" />,
    title: "JSON-LD Generator",
    color: "#1a7f37",
    description:
      "Das erzeugte Schema kann zur generierung von Json-Ld snippets genutzt werden. Dazu werden die Werte entsprechend des Wertebereichs eingetragen. Eine Vorschau und Download Funktion ist ebenfalls vorhanden."
  },
  {
    icon: <FaCheckCircle size={34} color="#fff" />,
    title: "Validator",
    color: "#0077b6",
    description:
      "Der Json-ld code oder die entsprechende Url kann gegen das ausgewählte Schema validiert werden. Der Validator hilft, Fehler und Inkonsistenzen frühzeitig zu erkennen. Anschließend kann die Url indiziert werden."
  }
];

const hints = [
  "Alle Änderungen werden im Local Storage im Browser gespeichert und sind nach einem Neuladen weiterhin verfügbar.",
  "Die Vorlagenfunktion ist ideal, um wiederkehrende Schemata schnell zu erstellen.",
  "Mit dem JSON-LD Generator können die Datenmodelle direkt exportiert werden.",
  "Der Validator hilft dabei, die Einhaltung der Vorgaben zu überprüfen."
];

export default function Home() {
  return (
    <div style={{
      maxWidth: 1400,
      margin: "56px auto 0 auto",
      padding: "0 0 56px 0",
      fontFamily: "inherit"
    }}>
      {/* Überschrift */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: 48
      }}>
        <h1 style={{
          fontSize: "2.3rem",
          fontWeight: 700,
          color: "#b00",
          letterSpacing: "-0.5px",
          margin: 0,
          padding: 0
        }}>
          Katalogisierungssystem
        </h1>
        <div style={{
          fontSize: "1.18rem",
          color: "#444",
          marginTop: 18,
          textAlign: "center",
          maxWidth: 700,
          lineHeight: 1.7
        }}>
          Willkommen! Diese Seite bietet Unterstützung bei der bei der strukturierten Verwaltung, Generierung und Validierung von Attributen und Schemata für verschiedenste Objekttypen.
        </div>
      </div>

      {/* Funktionskarten */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 40,
        margin: "0 auto 56px auto",
        padding: "0 32px",
        maxWidth: 1300
      }}>
        {sections.map(section => (
          <div
            key={section.title}
            style={{
              background: "#fff",
              borderRadius: 20,
              boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
              padding: "44px 32px 38px 32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderTop: `6px solid ${section.color}`,
              minHeight: 320
            }}
          >
            <div style={{
              background: section.color,
              borderRadius: "50%",
              width: 68,
              height: 68,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 22,
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
            }}>
              {section.icon}
            </div>
            <div style={{
              fontWeight: 800,
              fontSize: "1.22rem",
              color: section.color,
              marginBottom: 14,
              letterSpacing: "-0.5px",
              textAlign: "center"
            }}>
              {section.title}
            </div>
            <div style={{
              color: "#444",
              fontSize: "1.07rem",
              lineHeight: 1.7,
              textAlign: "center"
            }}>
              {section.description}
            </div>
          </div>
        ))}
      </div>

      {/* Hinweise */}
      <div style={{
        margin: "0 auto",
        color: "#555",
        fontSize: "1.08rem",
        lineHeight: 1.7,
        background: "#f9f9f9",
        borderRadius: 14,
        padding: "32px 40px",
        maxWidth: 900,
        boxShadow: "0 1px 8px rgba(0,0,0,0.04)"
      }}>
        <b>Hinweise zur Bedienung:</b>
        <ul style={{ marginTop: 12, marginBottom: 0, paddingLeft: 24 }}>
          {hints.map((hint, idx) => (
            <li key={idx}>{hint}</li>
          ))}
        </ul>

      </div>
    </div>
  );
}