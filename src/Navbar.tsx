import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaSitemap, FaCode, FaCheckCircle, FaLayerGroup } from "react-icons/fa"; // FaLayerGroup für Attribute

const NAV_ITEMS = [
  { to: "/", label: "Menu", icon: <FaHome /> }, // Startseite heißt jetzt "Menu"
  { to: "/attribute", label: "Attribute", icon: <FaLayerGroup /> }, // NEU: Attribute
  { to: "/schema", label: "Schema", icon: <FaSitemap /> }, // "Schema Editor" heißt jetzt "Schema"
  { to: "/jsonld-generator", label: "JSON-LD Generator", icon: <FaCode /> },
  { to: "/validator", label: "Validator", icon: <FaCheckCircle /> },
];

const styles = {
  nav: {
    minWidth: 340,
    height: "auto",
    minHeight: "100vh",
    padding: "40px 20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "rgb(245, 245, 245)",
  },
  header: {
    marginBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 6,
    display: "flex",
    alignItems: "center",
    gap: 14,
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    color: "rgb(102, 102, 102)",
  },
  linkContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 30,
  },
};

export default function Navbar() {
  return (
    <nav style={styles.nav as React.CSSProperties}>
      <div>
        <div style={styles.header}>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `nav-link${isActive ? " active" : ""}`
            }
            style={styles.title}
          >
            <span className="ftf-icon"><FaHome /></span>
            <span className="ftf-title">Menu</span>
          </NavLink>
          <div style={styles.subtitle}>Schema Katalogisierungssystem</div>
        </div>

        <div style={styles.linkContainer as React.CSSProperties}>
          {NAV_ITEMS.slice(1).map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </div>
      </div>
      <style>
        {`
          .ftf-title, .ftf-icon {
            color: inherit;
            transition: color 0.2s;
            font-weight: bold;
          }
          .ftf-title {
            margin-left: 6px;
          }
          .nav-link.active .ftf-title,
          .nav-link.active .ftf-icon {
            color: #b00;
          }
        `}
      </style>
    </nav>
  );
}