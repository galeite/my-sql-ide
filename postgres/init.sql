-- Script de inicialização do banco de dados
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir dados de exemplo
INSERT INTO users (name, email) VALUES 
    ('João Silva', 'joao@email.com'),
    ('Maria Santos', 'maria@email.com'),
    ('Pedro Oliveira', 'pedro@email.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO products (name, price, category) VALUES 
    ('Notebook', 2500.00, 'Eletrônicos'),
    ('Mouse', 89.90, 'Eletrônicos'),
    ('Teclado', 150.00, 'Eletrônicos'),
    ('Monitor', 800.00, 'Eletrônicos')
ON CONFLICT (id) DO NOTHING;

INSERT INTO orders (user_id, product_id, quantity) VALUES 
    (1, 1, 1),
    (1, 2, 2),
    (2, 3, 1),
    (3, 4, 1)
ON CONFLICT (id) DO NOTHING;