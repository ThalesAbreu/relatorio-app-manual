
import React from 'react';
import './App.css';

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

interface MetaAdsReportProps {
  data: MetricsData;
}

const MetaAdsReport: React.FC<MetaAdsReportProps> = ({ data }) => {
  // Proteção: Garante que 'metrics' existe
  const metrics = data?.metrics || { impressions: 0, clicks: 0, spend: 0, messages: 0 };
  const { impressions = 0, clicks = 0, spend = 0, messages = 0 } = metrics;

  // Cálculos de Performance (com proteção contra divisão por zero)
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const cpc = clicks > 0 ? spend / clicks : 0;
  const costPerMessage = messages > 0 ? spend / messages : 0;

  const lastUpdatedDate = data?.lastUpdated 
    ? new Date(data.lastUpdated).toLocaleString('pt-BR') 
    : 'Data não disponível';

  return (
    <div className="meta-report">
      <div className="report-header">
        <h2>Painel de Métricas Meta Ads</h2>
        <p className="last-updated">
          Atualizado em: {lastUpdatedDate}
        </p>
      </div>

      <div className="metrics-grid">
        {/* Card: Gastos */}
        <div className="metric-card highlight">
          <span className="metric-label">Valor Gasto</span>
          <span className="metric-value">R$ {spend.toFixed(2)}</span>
        </div>

        {/* Card: Mensagens */}
        <div className="metric-card highlight-alt">
          <span className="metric-label">Mensagens</span>
          <span className="metric-value">{messages}</span>
        </div>

        {/* Card: Impressões */}
        <div className="metric-card">
          <span className="metric-label">Impressões</span>
          <span className="metric-value">{impressions.toLocaleString()}</span>
        </div>

        {/* Card: Cliques */}
        <div className="metric-card">
          <span className="metric-label">Cliques no Link</span>
          <span className="metric-value">{clicks.toLocaleString()}</span>
        </div>
      </div>

      <h3 className="section-title">Análise de Performance</h3>
      <div className="metrics-grid secondary">
        {/* Card: CTR */}
        <div className="metric-card mini">
          <span className="metric-label">CTR (Taxa de Clique)</span>
          <span className="metric-value">{ctr.toFixed(2)}%</span>
        </div>

        {/* Card: CPC */}
        <div className="metric-card mini">
          <span className="metric-label">CPC Médio</span>
          <span className="metric-value">R$ {cpc.toFixed(2)}</span>
        </div>

        {/* Card: Custo por Mensagem */}
        <div className="metric-card mini">
          <span className="metric-label">Custo p/ Mensagem</span>
          <span className="metric-value">R$ {costPerMessage.toFixed(2)}</span>
        </div>
      </div>

      {data.metrics.description && (
        <div className="description-box">
          <strong>Observações:</strong>
          <p>{data.metrics.description}</p>
        </div>
      )}

      {/* Debug Visual (pode remover depois) */}
      <details style={{ marginTop: '40px', fontSize: '0.7rem', opacity: 0.4 }}>
        <summary>Ver dados brutos (Debug)</summary>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </details>
    </div>
  );
};

export default MetaAdsReport;
