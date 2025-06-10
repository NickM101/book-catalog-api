DROP TABLE IF EXISTS books CASCADE;

CREATE TABLE books (
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

DROP TRIGGER IF EXISTS update_books_updated_at ON books;

CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

INSERT INTO books (title, author, publication_year, isbn) VALUES
    ('Naruto Vol. 1', 'Masashi Kishimoto', 1999, '978-1-4215-0085-8'),
    ('One Piece Vol. 1', 'Eiichiro Oda', 1997, '978-1-4215-0901-1'),
    ('Attack on Titan Vol. 1', 'Hajime Isayama', 2009, '978-1-61262-024-4'),
    ('Death Note Vol. 1', 'Tsugumi Ohba', 2003, '978-1-4215-0168-8'),
    ('Dragon Ball Vol. 1', 'Akira Toriyama', 1984, '978-1-4215-0187-9'),
    ('My Hero Academia Vol. 1', 'Kohei Horikoshi', 2014, '978-1-4215-7180-6'),
    ('Demon Slayer Vol. 1', 'Koyoharu Gotouge', 2016, '978-1-9747-0870-4'),
    ('Tokyo Ghoul Vol. 1', 'Sui Ishida', 2011, '978-1-4215-7077-9')
ON CONFLICT (isbn) DO NOTHING;