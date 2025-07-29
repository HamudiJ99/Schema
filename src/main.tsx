import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import SchemaEditor from "./pages/Schema";
import JsonLdGenerator from "./pages/JsonLdGenerator";
import PropertyDetail from "./pages/PropertyDetails"; 
import Validator from "./pages/Validator";
import TypeInfo from "./pages/TypeInfo"; 
import Schema from "./pages/Schema";
import Attribute from "./pages/Attribute"; 

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="schema-editor" element={<SchemaEditor />} />
          <Route path="validator" element={<Validator />} />
          <Route path="schema-editor/:propertyName" element={<PropertyDetail />} /> 
          <Route path="schema-editor/type-info" element={<TypeInfo />} /> 
          <Route path="jsonld-generator" element={<JsonLdGenerator />} />
          <Route path="property/:propertyName" element={<PropertyDetail />} />
          <Route path="type-info" element={<TypeInfo />} />
          <Route path="/schema" element={<Schema />} />
          <Route path="/attribute" element={<Attribute />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);