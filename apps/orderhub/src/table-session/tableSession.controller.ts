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
import {
  mergedStoreAndTableParamsSchema,
  updateSessionSchema,
} from '@spaceorder/auth';
import { ZodValidationGuard } from 'src/utils/guards/zod-validation.guard';
import { responseCookie } from 'src/utils/cookies';
import { COOKIE_TABLE } from '@spaceorder/db';
import type { TableSession } from '@spaceorder/db';
import { TableSessionResponseDto } from './dto/response-tableSession.dto';
import { TableSessionGuard } from 'src/utils/guards/table-session.guard';
import { Session } from 'src/dacorators/tableSession.decorator';
import type { z } from 'zod';

export type UpdateTableSessionDto = z.infer<typeof updateSessionSchema>;

@Controller('stores/:storeId/tables/:tableId/session')
@UseGuards(ZodValidationGuard({ params: mergedStoreAndTableParamsSchema }))
@UseInterceptors(ClassSerializerInterceptor)
export class TableSessionController {
  constructor(private readonly tableSessionService: TableSessionService) {}
  @Post()
  @HttpCode(201)
  async createOrRetrieveActivatedSession(
    @Param('storeId') storePublicId: string,
    @Param('tableId') tablePublicId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const retrievedOrCreatedSession =
      await this.tableSessionService.createOrRetrieveActivatedSession(
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

    return new TableSessionResponseDto(retrievedOrCreatedSession);
  }

  @Patch()
  @HttpCode(200)
  @UseGuards(
    TableSessionGuard,
    ZodValidationGuard({ body: updateSessionSchema }),
  )
  async partialUpdate(
    @Session() tableSession: TableSession,
    @Body() updateSessionDto: UpdateTableSessionDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const updatedSession = await this.tableSessionService.updateSession(
      tableSession,
      updateSessionDto,
      response,
    );

    return new TableSessionResponseDto(updatedSession);
  }

  @Get()
  @HttpCode(200)
  // @UseGuards(TableSessionGuard)
  /** TODO: 전체 세션 정보를 볼 필요가 있을까? (개발 이후에 삭제 고려) */
  async retrieveTableSessionList(@Param('tableId') tablePublicId: string) {
    const retrievedTableSessionList =
      await this.tableSessionService.retrieveSessionList(tablePublicId);

    return retrievedTableSessionList.map(
      (session) => new TableSessionResponseDto(session),
    );
  }

  /** TODO: 테스트를 위한 임시 */
  @Get('get')
  // @UseGuards(TableSessionGuard)
  async retrieveTableSessionBySessionToken(
    @Session() tableSession: TableSession,
  ) {
    const retrievedTableSession =
      await this.tableSessionService.retrieveSessionBySessionToken(
        tableSession.sessionToken,
      );

    return new TableSessionResponseDto(retrievedTableSession);
  }
}
