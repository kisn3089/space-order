import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    switch (exception.code) {
      case 'P2002': {
        // Unique constraint violation
        const targetFields = exception.meta?.target as string;
        const fieldName = targetFields;

        const fieldNameKorean = this.translateFieldName(fieldName);
        response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: `이미 사용 중인 ${fieldNameKorean}입니다.`,
          error: 'Conflict',
          field: targetFields,
        });
        break;
      }

      case 'P2025': {
        // Record not found
        const modelName = this.extractModelName(exception.meta);
        const idFromUrl = this.extractIdFromUrl(request.url);
        response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: idFromUrl
            ? `${modelName} ID ${idFromUrl}를 찾을 수 없습니다.`
            : `해당 ${modelName}를 찾을 수 없습니다.`,
          error: 'Not Found',
        });
        break;
      }

      case 'P2003': {
        // Foreign key constraint failed
        const field = exception.meta?.field_name as string;
        response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: field
            ? `유효하지 않은 ${field} 값입니다.`
            : '유효하지 않은 데이터입니다.',
          error: 'Bad Request',
          field,
        });
        break;
      }

      default: {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          error: 'Internal Server Error',
        });
      }
    }
  }

  private extractModelName(meta: any): string {
    // Prisma meta에서 모델 이름 추출 (예: "Admin", "Owner" 등)
    const modelName = meta?.modelName || meta?.cause || '데이터';
    return modelName;
  }

  private extractIdFromUrl(url: string): string | null {
    // URL에서 ID 추출 (예: /admin/123 -> 123)
    const match = url.match(/\/(\d+)$/);
    return match ? match[1] : null;
  }

  private translateFieldName(fieldName: string | undefined): string {
    // 필드명을 한국어로 번역
    const translations: Record<string, string> = {
      admin_email_key: '이메일',
    };
    return translations[fieldName || ''] || fieldName || '데이터';
  }
}
