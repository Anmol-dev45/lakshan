
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Splash from './pages/Splash';
import Home from './pages/Home';
import Hospital from './pages/Hospital';
import Emergency from './pages/Emergency';
import History from './pages/History';
import Settings from './pages/Settings';
import SymptomChat from './pages/SymptomChat';
import DiagnosisResult from './pages/DiagnosisResult';
import MedicalReportScan from './pages/MedicalReportScan';
import MedicineIdentifier from './pages/MedicineIdentifier';
import DiseaseAlertMap from './pages/DiseaseAlertMap';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        
        {/* Main App Routes wrapped in Bottom Navigation */}
        <Route element={<AppLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/hospital" element={<Hospital />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Full-screen feature routes (No Bottom Nav) */}
        <Route path="/chat" element={<SymptomChat />} />
        <Route path="/diagnosis" element={<DiagnosisResult />} />
        <Route path="/report-scan" element={<MedicalReportScan />} />
        <Route path="/medicine" element={<MedicineIdentifier />} />
        <Route path="/disease-map" element={<DiseaseAlertMap />} />
        <Route path="/login" element={<Login />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
