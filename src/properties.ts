export const categories = [
  {
    properties: [
      { name: "name", label: "Name", type: "Text", unit: "–", description: "Modellbezeichnung des Fahrzeugs" },
      { name: "manufacturer", label: "Hersteller", type: "Text", unit: "–", description: "Herstellername" },
      { name: "vehicleType", label: "Fahrzeugtyp", type: "Enumeration", unit: "–", description: "Typ: FTF, AMR, Gegengewichtsstapler, Schlepper, Plattform, etc." },
      { name: "application", label: "Einsatzgebiet", type: "Text", unit: "–", description: "Einsatzgebiet: z. B. Lagerlogistik, Montage, Mischverkehr etc." },
      { name: "navigationType", label: "Navigationsart", type: "Enumeration", unit: "–", description: "Art der Navigation: Laser, SLAM, Optisch, QR, Kontrastlinie, Magnet, Umgebungsnavigation, etc." },
      { name: "drivingMode", label: "Betriebsmodus", type: "Text", unit: "–", description: "Betriebsmodi (autonom, manuell, remote)" },
      { name: "availability", label: "Verfügbarkeit", type: "Boolean", unit: "–", description: "Ist das Fahrzeug derzeit am Markt verfügbar?" },
      { name: "firstReleaseYear", label: "Markteinführung", type: "Number", unit: "Jahr", description: "Markteinführung (Jahreszahl)" },
    ],
  },
  {
    properties: [
      { name: "length", label: "Länge", type: "Number", unit: "mm", description: "Gesamtlänge des Fahrzeugs" },
      { name: "width", label: "Breite", type: "Number", unit: "mm", description: "Gesamtbreite" },
      { name: "height", label: "Höhe", type: "Number", unit: "mm", description: "Höhe (z. B. mit Mast oder gesenkt)" },
      { name: "turningRadius", label: "Wenderadius", type: "Number", unit: "mm", description: "Wenderadius" },
      { name: "aisleWidthMin", label: "Minimale Gangbreite", type: "Number", unit: "mm", description: "Minimale Gangbreite (AST)" },
      { name: "passageWidthMin", label: "Minimale Durchfahrtsbreite", type: "Number", unit: "mm", description: "Minimale Durchfahrtsbreite" },
      { name: "underclearance", label: "Unterfahrhöhe", type: "Number", unit: "mm", description: "Unterfahrhöhe (falls Plattform)" },
      { name: "weightEmpty", label: "Eigengewicht", type: "Number", unit: "kg", description: "Eigengewicht inkl. Batterie" },
      { name: "groundClearance", label: "Bodenfreiheit", type: "Number", unit: "mm", description: "Bodenfreiheit" },
      { name: "wheelBase", label: "Radstand", type: "Number", unit: "mm", description: "Radstand" },
    ],
  },
  {
    properties: [
      { name: "payload", label: "Nutzlast", type: "Number", unit: "kg", description: "Maximale Nutzlast" },
      { name: "towingCapacity", label: "Schlepp-/Anhänge­last", type: "Number", unit: "kg", description: "Maximale Schlepp- oder Anhängelast" },
      { name: "maxSpeedLoaded", label: "Max. Geschwindigkeit (beladen)", type: "Number", unit: "m/s / km/h", description: "Höchstgeschwindigkeit mit Last" },
      { name: "maxSpeedUnloaded", label: "Max. Geschwindigkeit (unbeladen)", type: "Number", unit: "m/s / km/h", description: "Höchstgeschwindigkeit ohne Last" },
      { name: "maxGradient", label: "Maximale Steigfähigkeit", type: "Number", unit: "%", description: "Maximale Steigfähigkeit" },
      { name: "positioningAccuracy", label: "Positioniergenauigkeit", type: "Number", unit: "mm", description: "Genauigkeit der Positionierung" },
      { name: "angularAccuracy", label: "Drehwinkelgenauigkeit", type: "Number", unit: "°", description: "Drehwinkelgenauigkeit (falls spezifiziert)" },
      { name: "acceleration", label: "Beschleunigung", type: "Number", unit: "m/s²", description: "Beschleunigung" },
      { name: "deceleration", label: "Verzögerung", type: "Number", unit: "m/s²", description: "Verzögerung" },
    ],
  },
  {
    properties: [
      { name: "batteryType", label: "Batterietyp", type: "Enumeration", unit: "–", description: "z. B. Lithium-Ion, Blei-Säure, LiFePO4, etc." },
      { name: "batteryVoltage", label: "Batteriespannung", type: "Number", unit: "V", description: "Spannung" },
      { name: "batteryCapacity", label: "Batteriekapazität", type: "Number", unit: "Ah", description: "Kapazität" },
      { name: "chargingType", label: "Ladeart", type: "Enumeration", unit: "–", description: "Manuell, Automatisch, Induktiv, Austauschbar" },
      { name: "chargingMethod", label: "Lademethode", type: "Text", unit: "–", description: "Ladeverfahren (z. B. manuell über Stecker / automatisch per Schleifkontakte)" },
      { name: "chargingTime", label: "Ladezeit", type: "Number", unit: "min", description: "Ladezeit" },
      { name: "runtime", label: "Betriebsdauer", type: "Number", unit: "h", description: "Betriebsdauer mit einer Ladung" },
      { name: "batteryExchangeable", label: "Akku austauschbar", type: "Boolean", unit: "–", description: "Ist der Akku austauschbar?" },
    ],
  },
  {
    properties: [
      { name: "driveType", label: "Antriebsart", type: "Text", unit: "–", description: "Art des Antriebs: DC, AC, Mecanum, Omnidirektional" },
      { name: "motorPower", label: "Motorleistung", type: "Number", unit: "W", description: "Antriebsleistung" },
      { name: "brakingSystem", label: "Bremssystem", type: "Text", unit: "–", description: "Art des Bremssystems (elektrisch, mechanisch, elektromagnetisch)" },
      { name: "safetyScanner", label: "Sicherheitslaserscanner", type: "Boolean", unit: "–", description: "Ob Sicherheitslaserscanner verbaut sind" },
      { name: "lidarType", label: "Lidar-Typ", type: "Text", unit: "–", description: "Lidar-Marken / Typen" },
      { name: "sensors", label: "Sensorik", type: "List", unit: "–", description: "Eingebaute Sensorik (z. B. Lidar, Kamera)" },
      { name: "protectionClass", label: "Schutzart", type: "Text", unit: "IP-Code", description: "Schutzart gemäß IP-Norm" },
      { name: "safetyStandard", label: "Sicherheitsstandard", type: "Text", unit: "–", description: "z. B. DIN EN ISO 13849-1, PLd" },
      { name: "certifications", label: "Zertifikate", type: "List", unit: "–", description: "Sicherheitszertifikate (z. B. ISO, PL-Level)" },
      { name: "safetyFeatures", label: "Sicherheitsfunktionen", type: "Text", unit: "–", description: "Sicherheitsfunktionen (z. B. Scanner, Not-Aus)" },
      { name: "redundantSafetySystems", label: "Redundante Sicherheitssysteme", type: "Boolean", unit: "–", description: "Sind sicherheitsrelevante Systeme redundant ausgelegt?" },
    ],
  },
  {
    properties: [
      { name: "interfaces", label: "Schnittstellen", type: "List", unit: "–", description: "z. B. ROS, USB, Ethernet, HDMI" },
      { name: "communicationProtocols", label: "Kommunikationsprotokolle", type: "List", unit: "–", description: "WLAN, Bluetooth, LTE, 5G" },
      { name: "flottensteuerungCompatible", label: "Flottensteuerung kompatibel", type: "Boolean", unit: "–", description: "Unterstützt Flottenmanager (z. B. VDA 5050)?" },
      { name: "remoteMonitoring", label: "Fernüberwachung", type: "Boolean", unit: "–", description: "Fernüberwachung und -diagnose möglich?" },
      { name: "softwareUpdatesOTA", label: "OTA-Updates", type: "Boolean", unit: "–", description: "Over-the-Air-Updates unterstützt?" },
    ],
  },
  {
    properties: [
      { name: "localizationSystem", label: "Lokalisierungssystem", type: "Text", unit: "–", description: "SLAM, Markerless, Laser, etc." },
      { name: "hmiAvailable", label: "HMI verfügbar", type: "Boolean", unit: "–", description: "Hat ein Human Machine Interface (Display)?" },
      { name: "displaySize", label: "Displaygröße", type: "Number", unit: "inch", description: "Diagonale des Displays" },
      { name: "manualOverride", label: "Manuelle Übersteuerung", type: "Boolean", unit: "–", description: "Kann manuell gesteuert / übersteuert werden" },
      { name: "softwarePlatform", label: "Softwareplattform", type: "Text", unit: "–", description: "Unterstützte Software/Interfaces (z. B. ROS)" },
      { name: "multiVehicleCoordination", label: "Mehrfahrzeug-Koordination", type: "Boolean", unit: "–", description: "Koordination mit anderen Fahrzeugen möglich?" },
    ],
  },
  {
    properties: [
      { name: "loadHandlingDevice", label: "Lastaufnahmemittel", type: "Text", unit: "–", description: "Plattform, Gabeln, Schleppkupplung etc." },
      { name: "liftHeightMax", label: "Maximale Hubhöhe", type: "Number", unit: "mm", description: "Maximale Hubhöhe" },
      { name: "liftSystemType", label: "Hubsystemtyp", type: "Text", unit: "–", description: "Elektromechanisch, Hydraulisch etc." },
      { name: "noiseLevel", label: "Geräuschpegel", type: "Number", unit: "dB", description: "Geräuschentwicklung im Betrieb" },
      { name: "operatingTemperatureMin", label: "Min. Betriebstemperatur", type: "Number", unit: "°C", description: "Minimale zulässige Umgebungstemperatur" },
      { name: "operatingTemperatureMax", label: "Max. Betriebstemperatur", type: "Number", unit: "°C", description: "Maximale zulässige Umgebungstemperatur" },
      { name: "humidityRange", label: "Luftfeuchtigkeitsbereich", type: "Text", unit: "%", description: "Zulässiger Luftfeuchtigkeitsbereich" },
    ],
  },
];

export const allProperties = categories
  .flatMap((cat) => cat.properties)
  .sort((a, b) => a.name.localeCompare(b.name));