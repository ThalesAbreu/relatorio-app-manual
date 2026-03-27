import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

// Configura a conexão com o banco de dados Redis (Upstash)
// As variáveis de ambiente são lidas automaticamente pela Vercel.
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // Rota para o n8n enviar os dados.
  if (req.method === 'POST') {
    // MEDIDA DE SEGURANÇA: Verificação do token secreto.
    const authToken = process.env.N8N_AUTH_TOKEN || 'SEU_TOKEN_PADRAO_LOCAL';
    const receivedToken = req.headers['x-auth-token'];

    console.log('--- Debug de Autenticação ---');
    console.log('Método:', req.method);
    console.log('Token configurado no Vercel (está definido?):', !!process.env.N8N_AUTH_TOKEN);
    console.log('Token recebido no header (está presente?):', !!receivedToken);
    
    if (receivedToken !== authToken) {
      console.error('ERRO: Tokens não coincidem!');
      return res.status(401).json({ 
        message: 'Acesso não autorizado.',
        debug: {
          header_presente: !!receivedToken,
          env_presente: !!process.env.N8N_AUTH_TOKEN
        }
      });
    }
    console.log('Autenticação bem-sucedida!');

    try {
      const dataToStore = {
        lastUpdated: new Date().toISOString(),
        metrics: req.body,
      };

      // Salva os dados no banco de dados Redis na chave 'metrics'.
      // O Upstash Redis armazena objetos JSON diretamente.
      await redis.set('metrics', dataToStore);

      return res.status(200).json({ message: 'Dados recebidos e salvos com sucesso!' });
    } catch (error) {
      console.error('Erro ao salvar no Redis:', error);
      return res.status(500).json({ message: 'Erro interno ao salvar os dados.' });
    }
  }

  // Rota para o seu frontend (React) buscar os dados.
  if (req.method === 'GET') {
    try {
      // Busca os dados da chave 'metrics' no banco de dados.
      const metricsData = await redis.get('metrics');

      if (!metricsData) {
        return res.status(404).json({ message: 'Nenhum dado de métrica encontrado.' });
      }

      res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
      return res.status(200).json(metricsData);
    } catch (error) {
      console.error('Erro ao buscar dados do Redis:', error);
      return res.status(500).json({ message: 'Erro interno ao buscar os dados.' });
    }
  }

  // Se o método não for GET ou POST, retorna um erro.
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ message: `Método ${req.method} não permitido.` });
}
