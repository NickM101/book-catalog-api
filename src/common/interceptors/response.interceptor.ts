import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  
  export interface Response<T> {
    statusCode: number;
    message: string;
    data: T;
    timestamp: string;
  }
  
  @Injectable()
  export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
      return next.handle().pipe(
        map((data) => ({
          ...data,
          timestamp: new Date().toISOString(),
        })),
      );
    }
  }