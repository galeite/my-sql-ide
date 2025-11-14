from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2 import sql
import sqlparse
import os
import sql_formater

app = Flask(__name__)
CORS(app)

# Configuração do banco de dados
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:password@postgres:5432/sql_ide')

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    return conn

@app.route('/api/execute', methods=['POST'])
def execute_query():
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({'error': 'Query não pode estar vazia'}), 400
        
        # Validar query usando sqlparse
        parsed = sqlparse.parse(query)
        if not parsed:
            return jsonify({'error': 'Query inválida'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar se é uma query SELECT
        #first_word = query.split()[0].upper()
        #if first_word != 'SELECT' and first_word != 'WITH':
        #    return jsonify({'error': 'Apenas queries SELECT são permitidas'}), 400
        
        cursor.execute(query)
        
        if cursor.description:
            columns = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()
            result = {
                'columns': columns,
                'rows': [dict(zip(columns, row)) for row in rows],
                'row_count': len(rows)
            }
        else:
            result = {
                'message': 'Query executada com sucesso',
                'row_count': cursor.rowcount
            }
        
        cursor.close()
        conn.close()
        
        return jsonify(result)
        
    except psycopg2.Error as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@app.route('/api/tables', methods=['GET'])
def get_tables():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        
        tables = [row[0] for row in cursor.fetchall()]
        
        cursor.close()
        conn.close()
        
        return jsonify({'tables': tables})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/table/<table_name>', methods=['GET'])
def get_table_structure(table_name):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default
            FROM information_schema.columns
            WHERE table_name = %s
            ORDER BY ordinal_position
        """, (table_name,))
        
        columns = []
        for row in cursor.fetchall():
            columns.append({
                'name': row[0],
                'type': row[1],
                'nullable': row[2],
                'default': row[3]
            })
        
        cursor.close()
        conn.close()
        
        return jsonify({'table': table_name, 'columns': columns})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

@app.route('/api/format_sql', methods=['POST'])
def format_sql():
    data = request.get_json()
    query = data.get('query', '').strip()

    formated = sql_formater.format_sql( query )
    
    return jsonify(formated)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)