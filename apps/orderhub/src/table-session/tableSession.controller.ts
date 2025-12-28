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
  Patch,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { TableSessionService } from './tableSession.service';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import {
  storeAndTableParamsSchema,
  updatePaymentSessionSchema,
} from '@spaceorder/auth';
import { ZodValidationGuard } from 'src/utils/guards/zod-validation.guard';
import { responseCookie } from 'src/utils/cookies';
import { COOKIE_TABLE } from '@spaceorder/db';
import { TableSessionResponseDto } from './dto/response-tableSession.dto';

@Controller('stores/:storeId/tables/:tableId/session')
@UseGuards(
  JwtAuthGuard,
  ZodValidationGuard({ params: storeAndTableParamsSchema }),
)
@UseInterceptors(ClassSerializerInterceptor)
export class TableSessionController {
  constructor(private readonly tableSessionService: TableSessionService) {}

  @Post()
  @HttpCode(303)
  async createOrRetrieveActivedTableSession(
    @Param('storeId') storePublicId: string,
    @Param('tableId') tablePublicId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const retrievedOrCreatedSession =
      await this.tableSessionService.createOrRetrieveActivedTableSession(
        storePublicId,
        tablePublicId,
      );

    responseCookie.set(
      response,
      COOKIE_TABLE.TABLE_SESSION,
      retrievedOrCreatedSession.sessionToken,
      {
        expires: retrievedOrCreatedSession.expiresAt,
      },
    );

    /** client에서 replace로 처리하여 뒤로가기 시 세션 재생성 방지 */
    return {
      redirectUrl: `/stores/${storePublicId}/tables/${tablePublicId}/order`,
    };
  }

  @Get()
  @HttpCode(200)
  /** TODO: 전체 세션 정보를 볼 필요가 있을까? (개발 이후에 삭제 고려) */
  async retrieveTableSessionList(@Param('tableId') tablePublicId: string) {
    const retrievedTableSessionList =
      await this.tableSessionService.retrieveTableSessionList(tablePublicId);

    return retrievedTableSessionList.map(
      (session) => new TableSessionResponseDto(session),
    );
  }

  @Patch('activate')
  @HttpCode(200)
  async updateActivateSession(@Param('tableId') tablePublicId: string) {
    return await this.tableSessionService.updateActivateSession(tablePublicId);
  }

  @Patch('deactivate')
  @HttpCode(200)
  async updateDeactivateSession(@Param('tableId') tablePublicId: string) {
    return await this.tableSessionService.updateDeactivateSession(
      tablePublicId,
    );
  }

  @Patch('payments')
  @HttpCode(200)
  @UseGuards(ZodValidationGuard({ body: updatePaymentSessionSchema }))
  async updatePaymentSession(
    @Param('tableId') tablePublicId: string,
    @Body() body: { paidAmount: number; totalAmount: number },
  ) {
    return await this.tableSessionService.txUpdatePaymentSession(
      tablePublicId,
      body.paidAmount,
      body.totalAmount,
    );
  }
}
