import type { Response } from 'express';
import {
  Controller,
  Post,
  Param,
  Res,
  Get,
  UseGuards,
  HttpCode,
  Body,
} from '@nestjs/common';
import { TableSessionService } from './tableSession.service';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { storeAndTableParamsSchema } from '@spaceorder/auth';
import { ZodValidationGuard } from 'src/utils/guards/zod-validation.guard';

@Controller('stores/:storeId/tables/:tableId/session')
@UseGuards(
  JwtAuthGuard,
  ZodValidationGuard({ params: storeAndTableParamsSchema }),
)
export class TableSessionController {
  constructor(private readonly tableSessionService: TableSessionService) {}

  @Post()
  @HttpCode(201)
  async createOrGetTableSession(
    @Param('storeId') storePublicId: string,
    @Param('tableId') tablePublicId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.tableSessionService.getOrCreateSession(
      storePublicId,
      tablePublicId,
      response,
    );

    /** 쿠키와 함께 redirect to order link */
    return response.redirect(
      `/stores/${storePublicId}/tables/${tablePublicId}/order`,
    );
  }

  @Get()
  async findTableSession(@Param('tableId') tablePublicId: string) {
    return await this.tableSessionService.findAll(tablePublicId);
  }

  /** TODO: RESTful 원칙에 맞게 수정 필요 */
  @Post('close')
  async closeSession(@Param('tableId') tablePublicId: string) {
    return await this.tableSessionService.closeSession(tablePublicId);
  }

  @Post('complete')
  async completeSessionWithPayment(
    @Param('tableId') tablePublicId: string,
    @Body() body: { paidAmount: number; totalAmount: number },
  ) {
    return await this.tableSessionService.completeSessionWithPayment(
      tablePublicId,
      body.paidAmount,
      body.totalAmount,
    );
  }
}
