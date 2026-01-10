import type { Response } from 'express';
import {
  Controller,
  Post,
  Param,
  Res,
  Get,
  UseGuards,
  Body,
  Patch,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { TableSessionService } from './tableSession.service';
import { tableParamsSchema, updateSessionSchema } from '@spaceorder/auth';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import { responseCookie } from 'src/utils/cookies';
import { COOKIE_TABLE } from '@spaceorder/db';
import type { PublicTableSession, TableSession } from '@spaceorder/db';
import { SessionAuth } from 'src/utils/guards/table-session-auth.guard';
import { Session } from 'src/decorators/tableSession.decorator';
import type { z } from 'zod';
import { TableSessionResponseDto } from './dto/tableSessionResponse.dto';
import { SessionPermission } from 'src/utils/guards/model-auth/table-session-permission.guard';

export type UpdateTableSessionDto = z.infer<typeof updateSessionSchema>;

@Controller('tables/:tableId/session')
@UseGuards(ZodValidation({ params: tableParamsSchema }))
@UseInterceptors(ClassSerializerInterceptor)
export class TableSessionController {
  constructor(private readonly tableSessionService: TableSessionService) {}

  @Post()
  async findActivatedSessionOrCreate(
    @Param('tableId') tablePublicId: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<TableSessionResponseDto> {
    const findOrCreatedSession =
      await this.tableSessionService.findActivatedSessionOrCreate(
        tablePublicId,
      );

    responseCookie.set(
      response,
      COOKIE_TABLE.TABLE_SESSION,
      findOrCreatedSession.sessionToken,
      { expires: findOrCreatedSession.expiresAt },
    );

    return new TableSessionResponseDto(findOrCreatedSession);
  }

  @Patch()
  @UseGuards(
    SessionAuth,
    ZodValidation({ body: updateSessionSchema }),
    SessionPermission,
  )
  async partialUpdate(
    @Session() tableSession: TableSession,
    @Body() updateSessionDto: UpdateTableSessionDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<PublicTableSession> {
    const updatedSession = await this.tableSessionService.txUpdateSession(
      tableSession,
      updateSessionDto,
    );

    if (updateSessionDto.status === 'EXTEND_EXPIRES_AT') {
      responseCookie.set(
        response,
        COOKIE_TABLE.TABLE_SESSION,
        updatedSession.sessionToken,
        { expires: updatedSession.expiresAt },
      );
    }

    return updatedSession;
  }

  @Get()
  @UseGuards(SessionAuth, SessionPermission)
  /** TODO: 전체 세션 정보를 볼 필요가 있을까? (개발 이후에 삭제 고려) */
  async getSessionList(
    @Param('tableId') tablePublicId: string,
  ): Promise<PublicTableSession[]> {
    return await this.tableSessionService.getSessionList(tablePublicId);
  }

  /** TODO: 테스트를 위한 임시 */
  @Get('get')
  @UseGuards(SessionAuth, SessionPermission)
  async getSessionBySessionToken(
    @Session() tableSession: TableSession,
  ): Promise<TableSessionResponseDto> {
    const findTableSession = await this.tableSessionService.getActiveSession(
      tableSession.sessionToken,
    );

    return new TableSessionResponseDto(findTableSession);
  }
}
