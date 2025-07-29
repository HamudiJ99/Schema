import React from "react";
import { useParams } from "react-router-dom";
import { propertyDetails } from "../components/PropertyDetailsData";
import { getPropertyDetail } from "../components/PropertyDetailsData";

export default function PropertyDetail() {
  const { propertyName } = useParams<{ propertyName: string }>();
  const detail = propertyName ? getPropertyDetail(propertyName) : undefined;

  if (!detail) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Eigenschaft nicht gefunden</h1>
        <div>Für diese Eigenschaft sind noch keine Details hinterlegt.</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, padding: "100px 0 40px 120px" }}>
      <h1 style={{ fontSize: "2.2rem", marginBottom: 20 }}>
        {detail.name}
      </h1>
      <div style={{ fontSize: "1.3rem", color: "#444", marginBottom: 24 }}>
        {detail.description}
      </div><br />

      <h2 style={{ fontSize: "1.2rem", marginTop: 30, marginBottom: 8 }}>Erwarteter Type</h2>
      <div style={{ marginBottom: 16 }}>{detail.expectedType}</div>

      <h2 style={{ fontSize: "1.2rem", marginTop: 20, marginBottom: 8 }}>Erwartete Einheit</h2>
      <div style={{ marginBottom: 16 }}>{detail.expectedUnit}</div><br />

      <h2 style={{ fontSize: "1.2rem", marginTop: 20, marginBottom: 8 }}>Andere Herstellerbegriffe</h2>
      <ul style={{ marginBottom: 16 }}>
        {detail.synonyms.map((syn) => (
          <li key={syn}>{syn}</li>
        ))}
      </ul><br />

      <h2 style={{ fontSize: "1.2rem", marginTop: 20, marginBottom: 8 }}>Vereinheitlichung</h2>
      <div style={{ marginBottom: 16 }}>{detail.canonical}</div><br />

      <h2 style={{ fontSize: "1.2rem", marginTop: 20, marginBottom: 8 }}>Begründung</h2>
      <div style={{ marginBottom: 16 }}>{detail.reason}</div><br />

      <h2 style={{ fontSize: "1.2rem", marginTop: 20, marginBottom: 8 }}>Beispiel</h2>
      <pre style={{
        background: "#f8f8f8",
        border: "1px solid #eee",
        padding: 16,
        fontFamily: "monospace",
        fontSize: 15,
        marginBottom: 24,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        maxWidth: "100%",
        overflowWrap: "break-word"
      }}>
{`{
  "@type": "${detail.example.parentType}",
  "${detail.example.property}": ${JSON.stringify(detail.example.value)}
}`}
      </pre>
    </div>
  );
}