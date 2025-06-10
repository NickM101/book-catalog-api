import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);
  
    catch(exception: unknown, host: ArgumentsHost): void {
      console.log("unknown exception", exception)
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
  
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Internal server error';
  
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        message = typeof exceptionResponse === 'string' 
          ? exceptionResponse 
          : (exceptionResponse as any).message || exception.message;
      }
  
      const errorResponse = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message: Array.isArray(message) ? message : [message],
      };
  
      this.logger.error(
        `${request.method} ${request.url}`,
        JSON.stringify(errorResponse),
        exception instanceof Error ? exception.stack : 'Unknown error',
      );
  
      response.status(status).json(errorResponse);
    }
  }