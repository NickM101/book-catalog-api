import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  async create(@Body(new ValidationPipe()) createBookDto: CreateBookDto) {
    const book = await this.booksService.create(createBookDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Book created successfully',
      data: book,
    };
  }

  @Get()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    const result = await this.booksService.findAll(page, Math.min(limit, 100));
    return {
      statusCode: HttpStatus.OK,
      message: 'Books retrieved successfully',
      data: result,
    };
  }

  @Get('search')
  async searchByTitle(@Query('title') title: string) {
    if (!title) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Title query parameter is required',
        data: [],
      };
    }
    
    const books = await this.booksService.searchByTitle(title);
    return {
      statusCode: HttpStatus.OK,
      message: 'Books search completed',
      data: books,
    };
  }

  @Get('count-by-year/:year')
  async countBooksByYear(@Param('year', ParseIntPipe) year: number) {
    const count = await this.booksService.countBooksByYear(year);
    return {
      statusCode: HttpStatus.OK,
      message: `Books count for year ${year} retrieved successfully`,
      data: { year, count },
    };
  }

  @Get('year-range')
  async getBooksByYearRange(
    @Query('startYear', ParseIntPipe) startYear: number,
    @Query('endYear', ParseIntPipe) endYear: number,
  ) {
    const books = await this.booksService.getBooksByYearRange(startYear, endYear);
    return {
      statusCode: HttpStatus.OK,
      message: `Books from ${startYear} to ${endYear} retrieved successfully`,
      data: books,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const book = await this.booksService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Book retrieved successfully',
      data: book,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) updateBookDto: UpdateBookDto,
  ) {
    const book = await this.booksService.update(id, updateBookDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Book updated successfully',
      data: book,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.booksService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Book deleted successfully',
    };
  }
}