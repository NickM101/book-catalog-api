import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;

  constructor(private configService: ConfigService) {
    console.log('DB_HOST:', this.configService.get<string>('DB_HOST'));
    console.log('DB_PORT:', this.configService.get<number>('DB_PORT'));
    console.log('DB_USERNAME:', this.configService.get<string>('DB_USERNAME'));
    console.log('DB_PASSWORD:', this.configService.get<string>('DB_PASSWORD'));
    console.log('DB_NAME:', this.configService.get<string>('DB_NAME'));
    this.pool = new Pool({
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      user: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_NAME'),
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async onModuleInit() {
    try {
      await this.pool.query('SELECT NOW()');
      this.logger.log('Database connection established successfully');
      
      await this.runMigrations();
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('Database connection pool closed');
  }

  getPool(): Pool {
    return this.pool;
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async query(text: string, params?: any[]) {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      this.logger.debug(`Query executed in ${duration}ms: ${text}`);
      return res;
    } catch (error) {
      this.logger.error(`Query failed: ${text}`, error);
      throw error;
    }
  }

  private async runMigrations() {
    try {
      const migrationPath = path.join(process.cwd(), 'src', 'database', 'migrations', 'init.sql');
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      await this.pool.query(migrationSQL);
      this.logger.log('Database migrations completed successfully');
    } catch (error) {
      this.logger.error('Migration failed:', error);
      throw error;
    }
  }
}