import { Module } from '@nestjs/common';

import { BooksModule } from './books/books.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [BooksModule, DatabaseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
