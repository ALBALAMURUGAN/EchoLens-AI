import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnalysisProvider } from "./lib/analysisContext";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Analyzer from "./pages/Analyzer";
import Library from "./pages/Library";
import Report from "./pages/Report";
import Methodology from "./pages/Methodology";
import About from "./pages/About";

export default function App() {
  return (
    <AnalysisProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Landing />} />
            <Route path="analyzer" element={<Analyzer />} />
            <Route path="library" element={<Library />} />
            <Route path="report" element={<Report />} />
            <Route path="methodology" element={<Methodology />} />
            <Route path="about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </AnalysisProvider>
  );
}
