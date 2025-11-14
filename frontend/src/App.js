import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

// Configurar axios para apontar para o backend CORRETAMENTE
// No browser: localhost:5000, No container: http://backend:5000
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : 'http://backend:5000';

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL
});

const Container = styled.div`
  display: flex;
  height: 100vh;
  font-family: 'Arial', sans-serif;
`;

const Sidebar = styled.div`
  width: 300px;
  background: #2c3e50;
  color: white;
  border-right: 1px solid #34495e;
  padding: 20px;
  overflow-y: auto;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ecf0f1;
`;

const EditorContainer = styled.div`
  padding: 20px;
  background: white;
  margin: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const QueryEditor = styled.textarea`
  width: 100%;
  height: 150px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  padding: 15px;
  border: 2px solid #bdc3c7;
  border-radius: 6px;
  resize: vertical;
  background: #f8f9fa;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Button = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  margin: 10px 5px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
  
  &:hover {
    background: #2980b9;
  }
  
  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background: #95a5a6;
  
  &:hover {
    background: #7f8c8d;
  }
`;

const ResultContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow: auto;
  background: white;
  margin: 0 20px 20px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background: white;
  
  th, td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: left;
  }
  
  th {
    background: #34495e;
    color: white;
    font-weight: bold;
  }
  
  tr:nth-child(even) {
    background: #f8f9fa;
  }
  
  tr:hover {
    background: #e3f2fd;
  }
`;

const ErrorMessage = styled.div`
  background: #e74c3c;
  color: white;
  padding: 15px;
  border-radius: 6px;
  margin: 10px 0;
  border-left: 4px solid #c0392b;
`;

const SuccessMessage = styled.div`
  background: #2ecc71;
  color: white;
  padding: 15px;
  border-radius: 6px;
  margin: 10px 0;
  border-left: 4px solid #27ae60;
`;

const TableList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TableItem = styled.li`
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #34495e;
  transition: background 0.2s;
  border-radius: 4px;
  margin: 4px 0;
  
  &:hover {
    background: #34495e;
  }
  
  ${props => props.active && `
    background: #3498db;
    font-weight: bold;
  `}
`;

const ColumnInfo = styled.div`
  font-size: 11px;
  color: #bdc3c7;
  margin-top: 4px;
  padding: 4px;
  background: #34495e;
  border-radius: 3px;
  border-left: 3px solid #3498db;
`;

const LoadingMessage = styled.div`
  padding: 40px;
  text-align: center;
  color: #7f8c8d;
  font-size: 18px;
`;

const StatusIndicator = styled.div`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
  background: ${props => props.connected ? '#2ecc71' : '#e74c3c'};
`;

function App() {
  const [query, setQuery] = useState('SELECT * FROM users;');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tableStructure, setTableStructure] = useState(null);
  const [loading, setLoading] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);
  const [activeTable, setActiveTable] = useState(null);

  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      console.log('Testando conexão com backend...');
      const response = await api.get('/health');
      console.log('Backend respondeu:', response.data);
      setBackendConnected(true);
      await fetchTables();
      setAppLoading(false);
    } catch (err) {
      console.error('Erro ao conectar com backend:', err);
      setError(`Não foi possível conectar ao backend. Erro: ${err.message}`);
      setBackendConnected(false);
      setAppLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      console.log('Buscando tabelas...');
      const response = await api.get('/api/tables');
      console.log('Tabelas recebidas:', response.data.tables);
      setTables(response.data.tables);
    } catch (err) {
      console.error('Erro ao buscar tabelas:', err);
      setError('Erro ao carregar tabelas: ' + err.message);
    }
  };

  const fetchTableStructure = async (tableName) => {
    try {
      setActiveTable(tableName);
      const response = await api.get(`/api/table/${tableName}`);
      setTableStructure(response.data);
    } catch (err) {
      setError('Erro ao carregar estrutura da tabela: ' + err.message);
    }
  };

  const executeQuery = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log('Executando query:', query);
      const response = await api.post('/api/execute', { query });
      console.log('Resposta recebida:', response.data);
      setResults(response.data);
    } catch (err) {
      console.error('Erro na query:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao executar query';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearEditor = () => {
    setQuery('');
    setResults(null);
    setError(null);
  };

  const formatQuery = async () => {
    setError(null);

    try {
      console.log('Formatando query:', query);
      const response = await api.post('/api/format_sql', { query });
      console.log('Resposta recebida:', response.data);
      setQuery(response.data);
    } catch (err) {
      setError('Erro ao formatar a query: ' + err.message);
    }
  };

  const loadExampleQuery = (example) => {
    setQuery(example);
  };

  if (appLoading) {
    return (
      <Container>
        <LoadingMessage>
          <h2>🚀 SQL IDE PostgreSQL</h2>
          <p>Conectando ao backend...</p>
        </LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Sidebar>
        <h3>📊 Banco de Dados</h3>
        <div style={{ marginBottom: '20px' }}>
          <StatusIndicator connected={backendConnected} />
          {backendConnected ? 'Conectado' : 'Desconectado'}
        </div>

        <h4>🗃️ Tabelas</h4>
        <TableList>
          {tables.map(table => (
            <TableItem 
              key={table} 
              onClick={() => fetchTableStructure(table)}
              active={activeTable === table}
            >
              {table}
            </TableItem>
          ))}
        </TableList>

        {tableStructure && (
          <div style={{ marginTop: '20px' }}>
            <h4>🔍 Estrutura: {tableStructure.table}</h4>
            {tableStructure.columns.map(column => (
              <ColumnInfo key={column.name}>
                <strong>{column.name}</strong> ({column.type})
                {column.nullable === 'NO' && ' 🔒 NOT NULL'}
                {column.default && ` ⚡ DEFAULT ${column.default}`}
              </ColumnInfo>
            ))}
          </div>
        )}

        <div style={{ marginTop: '20px' }}>
          <h4>💡 Exemplos</h4>
          <SecondaryButton onClick={() => loadExampleQuery('SELECT * FROM users;')}>
            Todos os usuários
          </SecondaryButton>
          <SecondaryButton onClick={() => loadExampleQuery('SELECT * FROM products;')}>
            Todos os produtos
          </SecondaryButton>
          <SecondaryButton onClick={() => loadExampleQuery('SELECT u.name, p.name, o.quantity FROM users u JOIN orders o ON u.id = o.user_id JOIN products p ON p.id = o.product_id;')}>
            Pedidos com JOIN
          </SecondaryButton>
        </div>
      </Sidebar>

      <MainContent>
        <EditorContainer>
          <h3>📝 Editor SQL</h3>
          <QueryEditor
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite sua query SQL aqui... (Apenas SELECT permitido)"
          />
          <div>
            <Button onClick={executeQuery} disabled={loading || !backendConnected}>
              {loading ? '⏳ Executando...' : '🚀 Executar Query'}
            </Button>
            <SecondaryButton onClick={formatQuery}>✨ Formatador</SecondaryButton>
            <SecondaryButton onClick={clearEditor}>🗑️ Limpar</SecondaryButton>
          </div>

          {error && (
            <ErrorMessage>
              ❌ Erro: {error}
            </ErrorMessage>
          )}
          
          {results && !results.columns && (
            <SuccessMessage>
              ✅ {results.message || 'Query executada com sucesso!'}
              {results.row_count !== undefined && ` (${results.row_count} linhas afetadas)`}
            </SuccessMessage>
          )}
        </EditorContainer>

        <ResultContainer>
          <h3>📊 Resultados</h3>
          {results && results.columns ? (
            <div>
              <p>📈 {results.row_count} linha(s) retornada(s)</p>
              <Table>
                <thead>
                  <tr>
                    {results.columns.map(column => (
                      <th key={column}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.rows.map((row, index) => (
                    <tr key={index}>
                      {results.columns.map(column => (
                        <td key={column}>{String(row[column] ?? 'NULL')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            !error && (
              <div style={{ textAlign: 'center', color: '#7f8c8d', padding: '40px' }}>
                <p>Execute uma query SELECT para ver os resultados aqui.</p>
                <p>Exemplo: SELECT * FROM users;</p>
              </div>
            )
          )}
        </ResultContainer>
      </MainContent>
    </Container>
  );
}

export default App;