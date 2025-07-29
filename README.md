# 🧠 Katalogisierungssystem für Expertensysteme 🌐

## Ein semantisches Katalogisierungssystem für variantenreiche Produkte mit JSON-LD Generierung

---

### 📄 INHALTSVERZEICHNIS

- Motivation
- Installation
- Technologien

---

## 🔍 Motivation

In der heutigen Produktwelt verwenden Hersteller oft unterschiedliche Begriffe, Strukturen und Modelle zur Beschreibung ähnlicher Produkte, wie z. B. fahrerlose Transportsysteme (FTF). Diese Heterogenität erschwert die automatische Verarbeitung in Expertensystemen, die strukturierte, semantisch einheitliche Daten benötigen.

Das Ziel dieses Projekts ist die **Entwicklung eines Katalogisierungssystems**, mit dem:

- Ontologien für variantenreiche Produkte erstellt werden können 🧩
- Experten eigene Schemas auf Basis dieser Ontologie definieren können 📐
- Hersteller diese Schemas nutzen können, um strukturierte Produktdaten zu pflegen 🏷️
- JSON-LD-Dateien generiert werden können, die für semantische Daten in Websiten eingesetzt werden können 🌐
- ein Webcrawler diese Daten ausliest und zur Erzeugung von RDF/TTL-Dateien 📦

Dieses Tool ist Teil einer Masterarbeit an der Universität Bremen, in Kooperation mit dem Biba Institut.

---

## 🛠️ Installation

Installiere das Projekt lokal:

```bash
git clone <REPO-URL>
cd <projektordner>
npm install
npm run dev
http://localhost:5173/

```

## 🧰 Technologien

<b>Frontend</b><br />
<a href="https://reactjs.org/" target="_blank"><img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original-wordmark.svg" width="40" height="40" /></a>
<a href="https://www.typescriptlang.org/" target="_blank"><img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" width="40" height="40" /></a>
<a href="https://vitejs.dev/" target="_blank"><img src="https://vitejs.dev/logo-with-shadow.png" width="40" height="40" /></a>

<br /><br />

<b>Semantik & Datenformate</b><br />
<img src="https://www.vectorlogo.zone/logos/w3c/w3c-ar21.svg" width="80" alt="w3c" />


<!-- 

<img src="https://upload.wikimedia.org/wikipedia/commons/9/96/JSON-LD_Logo.svg" alt="JSON-LD" width="60"/>
<img src="https://upload.wikimedia.org/wikipedia/commons/4/4c/RDF_logo.svg" alt="RDF" width="60"/>

 -->


