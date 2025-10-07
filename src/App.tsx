
import { useState, type FormEvent, type ChangeEvent } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import './App.css';
import 'react-datepicker/dist/react-datepicker.css';

// Registra a localidade para o calendário aparecer em português
registerLocale('ptBR', ptBR);

// --- TIPOS E INTERFACES ---
type ReportType = 'semanal' | 'mensal';

interface WeekData {
  investimento: number;
  mensagens: number;
  impressoes: number;
  cliques: number;
}

interface KpiData {
  custoPorMensagem: number;
  cpc: number;
  cpm: number;
}

type DateRange = [Date | null, Date | null];

// --- COMPONENTES ---
const ReportTypeToggle = ({ selectedType, onTypeChange }: { selectedType: ReportType, onTypeChange: (type: ReportType) => void }) => (
  <div className="toggle-container">
    <button 
      type="button"
      className={`toggle-button ${selectedType === 'semanal' ? 'active' : ''}`}
      onClick={() => onTypeChange('semanal')}
    >
      Relatório Semanal
    </button>
    <button 
      type="button"
      className={`toggle-button ${selectedType === 'mensal' ? 'active' : ''}`}
      onClick={() => onTypeChange('mensal')}
    >
      Relatório Mensal
    </button>
  </div>
);


function App() {
  // --- ESTADOS (STATE) ---
  const [reportType, setReportType] = useState<ReportType>('semanal');

  // Período Atual
  const [periodo, setPeriodo] = useState<DateRange>([null, null]);
  const [investimento, setInvestimento] = useState('');
  const [mensagens, setMensagens] = useState('');
  const [impressoes, setImpressoes] = useState('');
  const [cliques, setCliques] = useState('');

  // Período Anterior
  const [periodoAnterior, setPeriodoAnterior] = useState<DateRange>([null, null]);
  const [investimentoAnterior, setInvestimentoAnterior] = useState('');
  const [mensagensAnterior, setMensagensAnterior] = useState('');
  const [impressoesAnterior, setImpressoesAnterior] = useState('');
  const [cliquesAnterior, setCliquesAnterior] = useState('');

  // Observações e Relatório
  const [observacoes, setObservacoes] = useState('');
  const [report, setReport] = useState<string>('');
  const [error, setError] = useState<string>('');

  // --- FUNÇÕES AUXILIARES ---
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getPerformanceCommentary = (current: number, previous: number, metricName: string, lowerIsBetter: boolean = false): string => {
    if (previous === 0) return `- ${metricName}: Não há dados do período anterior para comparar.\n`;
    if (current === previous) return `- ${metricName}: Manteve-se estável.\n`;

    const diff = ((current - previous) / previous) * 100;
    const direction = current > previous ? 'aumentou' : 'diminuiu';
    const performance = (lowerIsBetter ? current < previous : current > previous) ? 'melhorou' : 'piorou';

    return `- ${metricName}: ${performance} (${direction} ${Math.abs(diff).toFixed(2)}%).\n`;
  };

  const formatDateRange = (range: DateRange): string => {
    const [start, end] = range;
    if (start && end) {
      return `${format(start, 'dd/MM')} a ${format(end, 'dd/MM/yyyy')}`;
    }
    return '';
  };

  // --- LÓGICA PRINCIPAL ---
  const handleGenerateReport = (event: FormEvent) => {
    event.preventDefault();
    setError('');

    const currentPeriodLabel = reportType === 'semanal' ? 'Semana' : 'Mês';

    if (!periodo[0] || !periodo[1] || !investimento || !mensagens || !impressoes || !cliques) {
      setError(`Preencha todos os campos do ${currentPeriodLabel} Atual.`);
      return;
    }

    const dataAtual: WeekData = {
      investimento: parseFloat(investimento),
      mensagens: parseInt(mensagens, 10),
      impressoes: parseInt(impressoes, 10),
      cliques: parseInt(cliques, 10),
    };
    
    const hasPreviousData = [investimentoAnterior, mensagensAnterior, impressoesAnterior, cliquesAnterior].some(f => f !== '');
    let dataAnterior: WeekData | null = null;

    if (hasPreviousData) {
        if (!periodoAnterior[0] || !periodoAnterior[1]) {
            setError(`Selecione o período do ${currentPeriodLabel} Anterior para comparar.`);
            return;
        }
        const fieldsAnterior = [investimentoAnterior, mensagensAnterior, impressoesAnterior, cliquesAnterior];
        if (fieldsAnterior.some(f => f === '')) {
            setError(`Para comparar, preencha todos os campos numéricos do ${currentPeriodLabel} Anterior.`);
            return;
        }
        dataAnterior = {
            investimento: parseFloat(investimentoAnterior),
            mensagens: parseInt(mensagensAnterior, 10),
            impressoes: parseInt(impressoesAnterior, 10),
            cliques: parseInt(cliquesAnterior, 10),
        };
    }

    if (Object.values(dataAtual).some(isNaN) || (dataAnterior && Object.values(dataAnterior).some(isNaN))) {
      setError('Valores numéricos inválidos. Use apenas números.');
      return;
    }

    const calculateKpis = (data: WeekData): KpiData => ({
      custoPorMensagem: data.mensagens > 0 ? data.investimento / data.mensagens : 0,
      cpc: data.cliques > 0 ? data.investimento / data.cliques : 0,
      cpm: data.impressoes > 0 ? (data.investimento / data.impressoes) * 1000 : 0,
    });

    const kpiAtual = calculateKpis(dataAtual);
    const periodoStr = formatDateRange(periodo);
    const reportTitle = reportType === 'semanal' ? 'Excelente Semana!🚀🚀🚀' : 'Relatório Mensal 🚀';
    
    const mainReport = [
        reportTitle,
        '',
        `Período: ${periodoStr}`,
        '',
        `Investimento: ${formatCurrency(dataAtual.investimento)}`,
        `Mensagens Computadas: ${dataAtual.mensagens}`,
        `Custo por mensagem: ${formatCurrency(kpiAtual.custoPorMensagem)}`,
        `Impressões: ${dataAtual.impressoes.toLocaleString('pt-BR')}`,
        `Cliques: ${dataAtual.cliques}`,
        `CPC: ${formatCurrency(kpiAtual.cpc)}`,
        `CPM: ${formatCurrency(kpiAtual.cpm)}`,
    ].join('\n');

    let commentaryBlock = '';
    if (dataAnterior) {
        const kpiAnterior = calculateKpis(dataAnterior);
        const periodoAnteriorStr = formatDateRange(periodoAnterior);
        let comments = getPerformanceCommentary(kpiAtual.custoPorMensagem, kpiAnterior.custoPorMensagem, 'Custo por Mensagem', true);
        comments += getPerformanceCommentary(kpiAtual.cpc, kpiAnterior.cpc, 'Custo por Clique (CPC)', true);
        comments += getPerformanceCommentary(kpiAtual.cpm, kpiAnterior.cpm, 'Custo por Mil (CPM)', true);
        comments += getPerformanceCommentary(dataAtual.cliques, dataAnterior.cliques, 'Cliques');

        commentaryBlock = [
            '',
            `--- ANÁLISE COMPARATIVA (vs ${periodoAnteriorStr}) ---`,
            '',
            '*Comentários:*',
            comments.trim(),
        ].join('\n');
    }

    let observationBlock = '';
    if (observacoes) {
        observationBlock = [
            '',
            '--- OBSERVAÇÕES ---',
            observacoes,
        ].join('\n');
    }

    const reportText = [mainReport, commentaryBlock, observationBlock].filter(Boolean).join('\n');

    setReport(reportText);
  };

  const copyToClipboard = () => {
    if (report) {
      navigator.clipboard.writeText(report);
      alert('Relatório copiado para a área de transferência!');
    }
  };

  // --- RENDERIZAÇÃO (JSX) ---
  const currentPeriodLabel = reportType === 'semanal' ? 'Semana' : 'Mês';

  return (
    <div className="container">
      <h1>Gerador de Relatório Comparativo</h1>
      <p>Selecione o tipo de relatório e preencha os campos.</p>
      
      <ReportTypeToggle selectedType={reportType} onTypeChange={setReportType} />

      <form onSubmit={handleGenerateReport}>
        <div className="form-columns">
          <fieldset>
            <legend>{currentPeriodLabel} Atual</legend>
            <DatePicker
              selectsRange={true}
              startDate={periodo[0]}
              endDate={periodo[1]}
              onChange={(update) => setPeriodo(update as DateRange)}
              isClearable={true}
              dateFormat="dd/MM/yyyy"
              locale="ptBR"
              className="form-input"
              placeholderText={`Selecione o período do ${currentPeriodLabel.toLowerCase()}`}
            />
            <input type="number" value={investimento} onChange={(e: ChangeEvent<HTMLInputElement>) => setInvestimento(e.target.value)} placeholder="Valor Investido" className="form-input" step="0.01" />
            <input type="number" value={mensagens} onChange={(e: ChangeEvent<HTMLInputElement>) => setMensagens(e.target.value)} placeholder="Número de Mensagens" className="form-input" />
            <input type="number" value={impressoes} onChange={(e: ChangeEvent<HTMLInputElement>) => setImpressoes(e.target.value)} placeholder="Impressões" className="form-input" />
            <input type="number" value={cliques} onChange={(e: ChangeEvent<HTMLInputElement>) => setCliques(e.target.value)} placeholder="Cliques" className="form-input" />
          </fieldset>

          <fieldset>
            <legend>{currentPeriodLabel} Anterior (Opcional)</legend>
            <DatePicker
              selectsRange={true}
              startDate={periodoAnterior[0]}
              endDate={periodoAnterior[1]}
              onChange={(update) => setPeriodoAnterior(update as DateRange)}
              isClearable={true}
              dateFormat="dd/MM/yyyy"
              locale="ptBR"
              className="form-input"
              placeholderText={`Selecione o período anterior`}
            />
            <input type="number" value={investimentoAnterior} onChange={(e: ChangeEvent<HTMLInputElement>) => setInvestimentoAnterior(e.target.value)} placeholder={`Valor Investido Anterior`} className="form-input" step="0.01" />
            <input type="number" value={mensagensAnterior} onChange={(e: ChangeEvent<HTMLInputElement>) => setMensagensAnterior(e.target.value)} placeholder={`Número de Mensagens Anterior`} className="form-input" />
            <input type="number" value={impressoesAnterior} onChange={(e: ChangeEvent<HTMLInputElement>) => setImpressoesAnterior(e.target.value)} placeholder={`Impressões Anterior`} className="form-input" />
            <input type="number" value={cliquesAnterior} onChange={(e: ChangeEvent<HTMLInputElement>) => setCliquesAnterior(e.target.value)} placeholder={`Cliques Anterior`} className="form-input" />
          </fieldset>
        </div>

        <fieldset>
            <legend>Observações (Opcional)</legend>
            <textarea 
                className="form-textarea" 
                value={observacoes} 
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setObservacoes(e.target.value)}
                placeholder="Escreva aqui qualquer observação adicional para o relatório..."
            />
        </fieldset>

        <button type="submit" className="generate-button">Gerar Relatório</button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {report && (
        <div>
          <div className="report-container">
            {report}
          </div>
          <button onClick={copyToClipboard} className="copy-button">Copiar Relatório</button>
        </div>
      )}
    </div>
  );
}

export default App;
