
import { useState, useEffect, useCallback } from 'react';
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
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(false);
  const [errorMetrics, setErrorMetrics] = useState<string | null>(null);

  // Função para buscar as métricas (agora separada para ser reutilizada)
  const fetchMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    setErrorMetrics(null);
    try {
      // Adicionamos um timestamp para evitar cache do navegador no GET
      const response = await fetch(`/api/metrics?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }
      const data: MetricsData = await response.json();
      setMetricsData(data);
    } catch (error: any) {
      setErrorMetrics(error.message || 'Erro ao buscar métricas.');
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  // Busca automática ao trocar para a aba de métricas
  useEffect(() => {
    if (reportVariant === 'metrics') {
      fetchMetrics();
    }
  }, [reportVariant, fetchMetrics]);

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
          <div className="metrics-controls">
            <button 
              className="refresh-button" 
              onClick={fetchMetrics} 
              disabled={loadingMetrics}
            >
              {loadingMetrics ? 'Atualizando...' : '🔄 Atualizar Dados'}
            </button>
          </div>

          {loadingMetrics && !metricsData && <p>Carregando métricas...</p>}
          {errorMetrics && <p className="error-message">Erro: {errorMetrics}</p>}
          
          {metricsData && (
            <div style={{ opacity: loadingMetrics ? 0.6 : 1, transition: 'opacity 0.2s' }}>
              <MetaAdsReport data={metricsData} />
            </div>
          )}
          
          {!metricsData && !loadingMetrics && !errorMetrics && <p>Nenhuma métrica disponível.</p>}
        </div>
      )}
    </div>
  );
}

export default App;
