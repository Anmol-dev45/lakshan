import { useEffect } from 'react';
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
import LiveConsultation from './pages/LiveConsultation';
import { useAppDispatch } from './hooks/useStore';
import { setUser } from './store/slices/authSlice';
import { loadRecordsFromSupabase } from './store/slices/historySlice';
import { onAuthStateChange } from './services/authService';

function AuthListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Subscribe to Supabase auth events
    const subscription = onAuthStateChange((user) => {
      dispatch(setUser(user));
      if (user) {
        // User just signed in — pull their health records from Supabase
        dispatch(loadRecordsFromSupabase() as never);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthListener />
      <Routes>
        <Route path="/" element={<Splash />} />

        {/* Main App Routes (Bottom Navigation) */}
        <Route element={<AppLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/hospital" element={<Hospital />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Full-screen feature routes */}
        <Route path="/chat" element={<SymptomChat />} />
        <Route path="/diagnosis" element={<DiagnosisResult />} />
        <Route path="/report-scan" element={<MedicalReportScan />} />
        <Route path="/medicine" element={<MedicineIdentifier />} />
        <Route path="/disease-map" element={<DiseaseAlertMap />} />
        <Route path="/live" element={<LiveConsultation />} />
        <Route path="/login" element={<Login />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
