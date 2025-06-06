import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './interfaces/book.interfaces';


@Injectable()
export class BooksService {
  constructor(private databaseService: DatabaseService) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const { title, author, publication_year, isbn } = createBookDto;
    
    try {
      const query = `
        INSERT INTO books (title, author, publication_year, isbn)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const result = await this.databaseService.query(query, [
        title,
        author,
        publication_year,
        isbn
      ]);
      
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('A book with this ISBN already exists');
      }
      throw new BadRequestException('Failed to create book');
    }
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ books: Book[]; total: number; page: number; totalPages: number }> {
    try {
      const offset = (page - 1) * limit;
      
      const countQuery = 'SELECT COUNT(*) FROM books';
      const countResult = await this.databaseService.query(countQuery);
      const total = parseInt(countResult.rows[0].count);
      
      const query = `
        SELECT * FROM books
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `;
      
      const result = await this.databaseService.query(query, [limit, offset]);
      
      return {
        books: result.rows,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new BadRequestException('Failed to retrieve books');
    }
  }

  async findOne(id: number): Promise<Book> {
    try {
      const query = 'SELECT * FROM books WHERE id = $1';
      const result = await this.databaseService.query(query, [id]);
      
      if (result.rows.length === 0) {
        throw new NotFoundException(`Book with ID ${id} not found`);
      }
      
      return result.rows[0];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve book');
    }
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    await this.findOne(id);
    
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updateBookDto).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    try {
      const query = `
        UPDATE books 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;
      
      values.push(id);
      const result = await this.databaseService.query(query, values);
      
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('A book with this ISBN already exists');
      }
      throw new BadRequestException('Failed to update book');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const query = 'DELETE FROM books WHERE id = $1 RETURNING id';
      const result = await this.databaseService.query(query, [id]);
      
      if (result.rows.length === 0) {
        throw new NotFoundException(`Book with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete book');
    }
  }

  async searchByTitle(title: string): Promise<Book[]> {
    try {
      const query = `
        SELECT * FROM books 
        WHERE title ILIKE $1 
        ORDER BY title
      `;
      
      const result = await this.databaseService.query(query, [`%${title}%`]);
      return result.rows;
    } catch (error) {
      throw new BadRequestException('Failed to search books');
    }
  }

  async countBooksByYear(year: number): Promise<number> {
    try {
      const query = 'SELECT count_books_by_year($1) as count';
      const result = await this.databaseService.query(query, [year]);
      
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw new BadRequestException('Failed to count books by year');
    }
  }

  async getBooksByYearRange(startYear: number, endYear: number): Promise<Book[]> {
    try {
      const query = `
        SELECT * FROM books 
        WHERE publication_year BETWEEN $1 AND $2 
        ORDER BY publication_year DESC, title ASC
      `;
      
      const result = await this.databaseService.query(query, [startYear, endYear]);
      return result.rows;
    } catch (error) {
      throw new BadRequestException('Failed to get books by year range');
    }
  }
}