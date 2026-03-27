
import { useState, useEffect } from 'react';
import MessageReport from './MessageReport';
import ProfileReport from './ProfileReport';
import MetaAdsReport from './MetaAdsReport';
import './App.css';

type ReportVariant = 'messages' | 'profile' | 'metrics';

// Interface para os dados das métricas
interface MetricsData {
  lastUpdated: string;
  metrics: {
    impressions: number;
    clicks: number;
    spend: number;
    messages?: number;
    description?: string;
  };
}

function App() {
  const [reportVariant, setReportVariant] = useState<ReportVariant>('messages');
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(true);
  const [errorMetrics, setErrorMetrics] = useState<string | null>(null);

  useEffect(() => {
    if (reportVariant === 'metrics') {
      const fetchMetrics = async () => {
        setLoadingMetrics(true);
        setErrorMetrics(null);
        try {
          const response = await fetch('/api/metrics');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data: MetricsData = await response.json();
          setMetricsData(data);
        } catch (error: any) {
          setErrorMetrics(error.message || 'Erro ao buscar métricas.');
        } finally {
          setLoadingMetrics(false);
        }
      };

      fetchMetrics();
    }
  }, [reportVariant]);

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
        <button
          type="button"
          className={`toggle-button ${reportVariant === 'metrics' ? 'active' : ''}`}
          onClick={() => setReportVariant('metrics')}
        >
          Relatório de Métricas
        </button>
      </div>

      {reportVariant === 'messages' && <MessageReport />}
      {reportVariant === 'profile' && <ProfileReport />}
      {reportVariant === 'metrics' && (
        <div className="report-content">
          {loadingMetrics && <p>Carregando métricas...</p>}
          {errorMetrics && <p className="error-message">Erro: {errorMetrics}</p>}
          {metricsData && !loadingMetrics && (
            <MetaAdsReport data={metricsData} />
          )}
          {!metricsData && !loadingMetrics && !errorMetrics && <p>Nenhuma métrica disponível.</p>}
        </div>
      )}
    </div>
  );
}

export default App;
