#!/bin/bash

echo "Book Catalog Database"
echo "================================"

DB_NAME="book_catalog"
DB_USER="postgres"
DB_HOST="localhost"

echo "Creating database..."
echo ""
psql -U $DB_USER -h $DB_HOST -c "CREATE DATABASE $DB_NAME;" 2>/dev/null
echo ""

echo "================================"
echo "Database created"
echo "================================"
echo ""
echo "Setting up tables and data"
echo "================================"
echo ""

psql -U $DB_USER -h $DB_HOST -d $DB_NAME << 'EOF'

CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    publication_year INTEGER NOT NULL,
    isbn VARCHAR(17) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);


INSERT INTO books (title, author, publication_year, isbn) VALUES
    ('The Great Gatsby', 'F. Scott Fitzgerald', 1925, '978-0-7432-7356-5'),
    ('To Kill a Mockingbird', 'Harper Lee', 1960, '978-0-06-112008-4'),
    ('1984', 'George Orwell', 1949, '978-0-452-28423-4'),
    ('Animal Farm', 'George Orwell', 1945, '978-0-452-28424-1'),
    ('The Hobbit', 'J.R.R. Tolkien', 1937, '978-0-547-92822-7')
ON CONFLICT (isbn) DO NOTHING;

EOF
echo ""

echo "================================"
echo "Tables and sample data created"
echo "================================"
echo ""

echo "Creating stored procedure"
echo "================================"
echo ""

psql -U $DB_USER -h $DB_HOST -d $DB_NAME << 'EOF'

CREATE OR REPLACE FUNCTION count_books_by_year(year_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
    book_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO book_count
    FROM books
    WHERE publication_year = year_param;
    
    RETURN book_count;
END;
$$ LANGUAGE plpgsql;

EOF
echo ""


echo "================================"
echo "Stored procedure created"
echo "================================"
echo ""

echo "Testing the database"
echo "================================"
echo ""

echo "All books in the database"
psql -U $DB_USER -h $DB_HOST -d $DB_NAME -c "SELECT id, title, author, publication_year FROM books ORDER BY publication_year;"

echo "Using stored procedure"
echo "Books published in 2014"
psql -U $DB_USER -h $DB_HOST -d $DB_NAME -c "SELECT count_books_by_year(2014) as books_in_2014;"

echo ""
echo "Books by Masashi Kishimoto"
psql -U $DB_USER -h $DB_HOST -d $DB_NAME -c "SELECT title, publication_year FROM books WHERE author = 'Masashi Kishimoto';"

echo "================================"
echo "Database setup complete!"
echo "================================"