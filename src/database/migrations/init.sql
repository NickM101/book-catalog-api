CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    publication_year INTEGER NOT NULL CHECK (publication_year > 0 AND publication_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
    isbn VARCHAR(17) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);

CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);

CREATE INDEX IF NOT EXISTS idx_books_publication_year ON books(publication_year);

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

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

INSERT INTO books (title, author, publication_year, isbn) VALUES
    ('The Great Gatsby', 'F. Scott Fitzgerald', 1925, '978-0-7432-7356-5'),
    ('To Kill a Mockingbird', 'Harper Lee', 1960, '978-0-06-112008-4'),
    ('1984', 'George Orwell', 1949, '978-0-452-28423-4'),
    ('Pride and Prejudice', 'Jane Austen', 1813, '978-0-14-143951-8'),
    ('The Catcher in the Rye', 'J.D. Salinger', 1951, '978-0-316-76948-0')
ON CONFLICT (isbn) DO NOTHING;