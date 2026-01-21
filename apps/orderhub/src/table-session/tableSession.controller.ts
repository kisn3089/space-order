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
  Query,
} from '@nestjs/common';
import { TableSessionService } from './tableSession.service';
import {
  sessionParamsSchema,
  sessionListQuerySchema,
  tableParamsSchema,
  updateSessionSchema,
  sessionUniqueQuerySchema,
} from '@spaceorder/api/schemas';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import { responseCookie } from 'src/utils/cookies';
import { COOKIE_TABLE } from '@spaceorder/db/constants';
import { type ResponseTableSession, type TableSession } from '@spaceorder/db';
import { SessionAuth } from 'src/utils/guards/table-session-auth.guard';
import { Session } from 'src/decorators/tableSession.decorator';
import type { z } from 'zod';
import { TableSessionResponseDto } from './dto/tableSessionResponse.dto';
import { SessionPermission } from 'src/utils/guards/model-permissions/table-session-permission.guard';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import {
  SESSION_FILTER_RECORD,
  SESSION_INCLUDE_KEY_RECORD,
} from './table-session-query.const';
import { QueryParamsBuilderService } from 'src/utils/query-params/query-builder';

export type UpdateTableSessionDto = z.infer<typeof updateSessionSchema>;
type SessionQueryParams = {
  filter?: keyof typeof SESSION_FILTER_RECORD;
  include?: keyof typeof SESSION_INCLUDE_KEY_RECORD;
};

@Controller('tables/:tableId/sessions')
@UseInterceptors(ClassSerializerInterceptor)
export class TableSessionController {
  constructor(
    private readonly tableSessionService: TableSessionService,
    private readonly queryParamsBuilder: QueryParamsBuilderService,
  ) {}

  @Post()
  @UseGuards(ZodValidation({ params: tableParamsSchema }))
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

  /** 세션 조회는 관리자만 수행한다. */
  @Get()
  @UseGuards(
    JwtAuthGuard,
    ZodValidation({
      params: tableParamsSchema,
      query: sessionListQuerySchema,
    }),
  )
  async getList(
    @Param('tableId') tablePublicId: string,
    @Query() query?: SessionQueryParams,
  ): Promise<ResponseTableSession[]> {
    const { include, filter } = this.queryParamsBuilder.build({
      query,
      includeRecord: SESSION_INCLUDE_KEY_RECORD,
      filterRecord: SESSION_FILTER_RECORD,
    });

    return await this.tableSessionService.getSessionList({
      where: { table: { publicId: tablePublicId }, ...filter },
      ...include,
    });
  }

  @Get(':sessionId')
  @UseGuards(
    JwtAuthGuard,
    ZodValidation({
      params: sessionParamsSchema,
      query: sessionUniqueQuerySchema,
    }),
  )
  async getUnique(
    @Param('sessionId') sessionId: string,
    @Query() query?: SessionQueryParams,
  ): Promise<ResponseTableSession> {
    const { include } = this.queryParamsBuilder.build({
      query,
      includeRecord: SESSION_INCLUDE_KEY_RECORD,
      filterRecord: SESSION_FILTER_RECORD,
    });

    return await this.tableSessionService.getSessionUnique({
      where: { publicId: sessionId },
      ...include,
    });
  }

  @Patch()
  @UseGuards(
    SessionAuth,
    ZodValidation({ params: tableParamsSchema, body: updateSessionSchema }),
    SessionPermission,
  )
  async partialUpdate(
    @Session() tableSession: TableSession,
    @Body() updateSessionDto: UpdateTableSessionDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseTableSession> {
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
}
