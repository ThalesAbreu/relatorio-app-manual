
import { useState } from 'react';
import MessageReport from './MessageReport';
import ProfileReport from './ProfileReport';
import './App.css';

type ReportVariant = 'messages' | 'profile';

function App() {
  const [reportVariant, setReportVariant] = useState<ReportVariant>('messages');

  return (
    <div className="container">
      <div className="toggle-container">
        <button
          type="button"
          className={`toggle-button ${reportVariant === 'messages' ? 'active' : ''}`}
          onClick={() => setReportVariant('messages')}
        >
          Relatório de Mensagens
        </button>
        <button
          type="button"
          className={`toggle-button ${reportVariant === 'profile' ? 'active' : ''}`}
          onClick={() => setReportVariant('profile')}
        >
          Relatório de Visitas ao Perfil
        </button>
      </div>

      {reportVariant === 'messages' ? <MessageReport /> : <ProfileReport />}
    </div>
  );
}

export default App;
