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
  mergedStoreAndTableParamsSchema,
  updatePaymentSessionSchema,
} from '@spaceorder/auth';
import { ZodValidationGuard } from 'src/utils/guards/zod-validation.guard';
import { responseCookie } from 'src/utils/cookies';
import { COOKIE_TABLE } from '@spaceorder/db';
import type { TableSession } from '@spaceorder/db';
import { TableSessionResponseDto } from './dto/response-tableSession.dto';
import { TableSessionGuard } from 'src/utils/guards/table-session.guard';
import { Session } from 'src/dacorators/tableSession.decorator';

@Controller('stores/:storeId/tables/:tableId/session')
@UseGuards(
  JwtAuthGuard,
  ZodValidationGuard({ params: mergedStoreAndTableParamsSchema }),
)
@UseInterceptors(ClassSerializerInterceptor)
export class TableSessionController {
  constructor(private readonly tableSessionService: TableSessionService) {}

  @Post()
  @HttpCode(303)
  async createOrRetrieveActivatedTableSession(
    @Param('storeId') storePublicId: string,
    @Param('tableId') tablePublicId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const retrievedOrCreatedSession =
      await this.tableSessionService.createOrRetrieveActivatedTableSession(
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

    // TODO: 새션 생성을 주문할 때 하도록 방안 모색
    response.header(
      'Location',
      `/stores/${storePublicId}/tables/${tablePublicId}/order`,
    );

    /** client에서 replace로 처리하여 뒤로가기 시 세션 재생성 방지 */
    return {
      redirectUrl: `/stores/${storePublicId}/tables/${tablePublicId}/order`,
    };
  }

  @Get()
  @HttpCode(200)
  @UseGuards(TableSessionGuard)
  /** TODO: 전체 세션 정보를 볼 필요가 있을까? (개발 이후에 삭제 고려) */
  async retrieveTableSessionList(@Param('tableId') tablePublicId: string) {
    const retrievedTableSessionList =
      await this.tableSessionService.retrieveTableSessionList(tablePublicId);

    return retrievedTableSessionList.map(
      (session) => new TableSessionResponseDto(session),
    );
  }

  /** TODO: 테스트를 위한 임시 */
  @Get('get')
  @UseGuards(TableSessionGuard)
  async retrieveTableSessionBy(@Session() tableSession: TableSession) {
    const retrievedTableSession =
      await this.tableSessionService.retrieveTableSessionBy(
        tableSession.sessionToken,
      );

    return new TableSessionResponseDto(retrievedTableSession);
  }

  @Patch('activate')
  @HttpCode(200)
  @UseGuards(TableSessionGuard)
  async updateSessionActivate(@Param('tableId') tablePublicId: string) {
    return await this.tableSessionService.updateSessionActivate(tablePublicId);
  }

  @Patch('deactivate')
  @HttpCode(200)
  @UseGuards(TableSessionGuard)
  async updateSessionDeactivate(@Param('tableId') tablePublicId: string) {
    return await this.tableSessionService.updateSessionDeactivate(
      tablePublicId,
    );
  }

  @Patch('payments')
  @HttpCode(200)
  @UseGuards(
    TableSessionGuard,
    ZodValidationGuard({ body: updatePaymentSessionSchema }),
  )
  async updateSessionFinishByPayment(
    @Param('tableId') tablePublicId: string,
    @Body() body: { paidAmount: number; totalAmount: number },
  ) {
    return await this.tableSessionService.txUpdateSessionFinishByPayment(
      tablePublicId,
      body.paidAmount,
      body.totalAmount,
    );
  }
}
