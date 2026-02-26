# Guia de Finalização e Uso do Projeto de Relatórios Automáticos

Este documento contém todas as instruções necessárias para testar, configurar e usar a automação de relatórios do Meta Ads.

---

## 1. Lembrete de Segurança: Token Secreto

O arquivo da API em `api/metrics.ts` contém um token de segurança para garantir que apenas o n8n possa enviar dados.

```typescript
// em api/metrics.ts
if (req.headers['x-auth-token'] !== 'SEU_TOKEN_SUPER_SECRETO') {
  return res.status(401).json({ message: 'Acesso não autorizado.' });
}
```

**Ação:** Troque a string `'SEU_TOKEN_SUPER_SECRETO'` por uma senha forte e segura de sua preferência. Esta mesma senha será usada na configuração do n8n.

---

## 2. Testando o Projeto Localmente

Para ver as alterações funcionando no seu computador antes de publicar.

1.  **Abra o terminal** na pasta do projeto (`/Users/thalesabreu/Documents/Relatorio/relatorio-app-manual`).
2.  **Execute o comando:**
    ```bash
    npm run dev
    ```
3.  Abra seu navegador no endereço fornecido (geralmente `http://localhost:5173/`).
4.  Clique no novo botão **"Relatório de Métricas"**. Você deverá ver os dados de exemplo que estão no banco de dados.

---

## 3. Configurando o n8n para Enviar Dados

Esta é a parte da automação.

1.  **Abra seu painel do n8n.**
2.  **Crie um novo fluxo de trabalho (Workflow).**
3.  **Adicione o nó "Meta Ads" (ou Facebook Ads):**
    *   Configure-o com suas credenciais do Facebook/Meta.
    *   Selecione as campanhas e as métricas que você deseja (ex: `impressions`, `clicks`, `spend`).
4.  **Adicione o nó "HTTP Request":**
    *   Conecte o nó do Meta Ads a este nó.
    *   **Método (Method):** `POST`
    *   **URL:** Use a URL de desenvolvimento para testar: `http://localhost:5173/api/metrics`
    *   **Headers:**
        *   Clique em "Add Header".
        *   **Name:** `x-auth-token`
        *   **Value:** `SUA_SENHA_FORTE_E_SECRETA` (a mesma que você definiu no passo 1).
    *   **Body Content Type:** `JSON`
    *   **JSON / Body:** Use a expressão do n8n para enviar os dados do nó anterior. Por exemplo: `{{ $json.body }}` ou `{{ $('Meta Ads').item.json }}`. Isso pode variar um pouco dependendo da sua versão do n8n.
5.  **Teste o fluxo no n8n:**
    *   Clique em "Execute Workflow". Se tudo estiver correto, o nó "HTTP Request" deve mostrar um status de sucesso.
    *   Volte para a página do seu projeto no navegador (`http://localhost:5173/`) e atualize. Os novos dados do Meta Ads devem aparecer.

---

## 4. Agendamento e Deploy Final

Para fazer a automação rodar sozinha e publicar o projeto.

1.  **Agende o fluxo no n8n:**
    *   Na tela do workflow no n8n, configure um "Schedule" ou "Trigger" para rodar o fluxo automaticamente (ex: a cada 24 horas).
    *   **Ative o workflow.**
2.  **Atualize a URL no n8n:**
    *   Volte para o nó "HTTP Request" no seu fluxo.
    *   Altere a **URL** para a do seu site publicado na Vercel: `https://[NOME-DO-SEU-PROJETO].vercel.app/api/metrics` (substitua `[NOME-DO-SEU-PROJETO]` pelo nome real).
3.  **Faça o deploy no Vercel:**
    *   O deploy para o Vercel geralmente é automático quando você envia seu código para o repositório Git (GitHub, GitLab, etc.). Certifique-se de que suas alterações foram enviadas (`git push`).

Com estes passos, seu projeto estará 100% funcional e automatizado.
