import psycopg2
import os

def init_db():
    conn = psycopg2.connect(
        host='postgres',
        database='sql_ide',
        user='postgres',
        password='password'
    )
    
    cursor = conn.cursor()
    
    # Criar algumas tabelas de exemplo
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            category VARCHAR(50)
        )
    ''')
    
    # Inserir dados de exemplo
    cursor.execute('''
        INSERT INTO users (name, email) 
        VALUES 
            ('João Silva', 'joao@email.com'),
            ('Maria Santos', 'maria@email.com'),
            ('Pedro Oliveira', 'pedro@email.com')
        ON CONFLICT (email) DO NOTHING
    ''')
    
    cursor.execute('''
        INSERT INTO products (name, price, category) 
        VALUES 
            ('Notebook', 2500.00, 'Eletrônicos'),
            ('Mouse', 89.90, 'Eletrônicos'),
            ('Teclado', 150.00, 'Eletrônicos')
        ON CONFLICT (id) DO NOTHING
    ''')
    
    conn.commit()
    cursor.close()
    conn.close()

if __name__ == '__main__':
    init_db()