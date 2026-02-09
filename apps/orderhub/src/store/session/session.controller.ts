import {
  Controller,
  Param,
  Get,
  UseGuards,
  Body,
  Patch,
  UseInterceptors,
  ClassSerializerInterceptor,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { tableSessionDocs } from 'src/docs/tableSession.docs';
import { paramsDocs } from 'src/docs/params.docs';
import {
  updateSessionPayloadSchema,
  storeIdParamsSchema,
  storeIdAndSessionIdSchema,
  updateCustomerSessionPayloadSchema,
  createSessionSchema,
} from '@spaceorder/api/schemas';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import type {
  PublicSession,
  PublicSessionWithTable,
  TableSession,
} from '@spaceorder/db';
import type { z } from 'zod';
import { SessionService } from './session.service';
import { StoreAccessGuard } from 'src/utils/guards/store-access.guard';
import {
  PublicTableSessionDto,
  TableWithStoreContextDto,
} from 'src/dto/public/table.dto';
import {
  ORDER_WITH_ITEMS_RECORD,
  SESSION_OMIT,
} from 'src/common/query/session-query.const';
import { TABLE_OMIT } from 'src/common/query/table-query.const';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SessionTokenDto } from 'src/dto/public/session.dto';
import { CreateSessionPayloadDto } from 'src/dto/session.dto';
import { Session } from 'src/decorators/session.decorator';
import { SessionAuth } from 'src/utils/guards/table-session-auth.guard';
import { plainToInstance } from 'class-transformer';

export type UpdateTableSessionDto = z.infer<typeof updateSessionPayloadSchema>;
export type UpdateCustomerTableSessionDto = z.infer<
  typeof updateCustomerSessionPayloadSchema
>;

@ApiTags('Table Sessions')
@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get(':storeId/sessions')
  @UseGuards(
    JwtAuthGuard,
    StoreAccessGuard,
    ZodValidation({ params: storeIdParamsSchema }),
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: tableSessionDocs.getList.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiQuery(paramsDocs.query.filter.session)
  @ApiQuery(paramsDocs.query.include.orderItems)
  @ApiResponse({
    ...tableSessionDocs.getList.successResponse,
    type: [PublicTableSessionDto],
  })
  @ApiResponse(tableSessionDocs.unauthorizedResponse)
  async list(
    @Param('storeId') storeId: string,
  ): Promise<PublicSessionWithTable<'Wide'>[]> {
    return await this.sessionService.getSessionList({
      where: { table: { store: { publicId: storeId } } },
      omit: SESSION_OMIT,
      include: {
        table: { omit: TABLE_OMIT },
        orders: ORDER_WITH_ITEMS_RECORD,
      },
    });
  }

  @Get(':storeId/sessions/:sessionId')
  @UseGuards(
    JwtAuthGuard,
    StoreAccessGuard,
    ZodValidation({ params: storeIdAndSessionIdSchema }),
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: tableSessionDocs.getUnique.summary })
  @ApiParam(paramsDocs.sessionId)
  @ApiQuery(paramsDocs.query.include.orderItems)
  @ApiResponse({
    ...tableSessionDocs.getUnique.successResponse,
    type: PublicTableSessionDto,
  })
  @ApiResponse(tableSessionDocs.unauthorizedResponse)
  @ApiResponse(tableSessionDocs.notFoundResponse)
  async unique(
    @Param('storeId') storeId: string,
    @Param('sessionId') sessionId: string,
  ): Promise<PublicSessionWithTable<'Wide'>> {
    return await this.sessionService.getSessionUnique({
      where: { publicId: sessionId, table: { store: { publicId: storeId } } },
      omit: SESSION_OMIT,
      include: {
        table: { omit: TABLE_OMIT },
        orders: ORDER_WITH_ITEMS_RECORD,
      },
    });
  }

  @Patch(':storeId/sessions/:sessionId')
  @UseGuards(
    JwtAuthGuard,
    StoreAccessGuard,
    ZodValidation({
      params: storeIdAndSessionIdSchema,
      body: updateSessionPayloadSchema,
    }),
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: tableSessionDocs.update.summary })
  @ApiParam(paramsDocs.sessionId)
  @ApiResponse({
    ...tableSessionDocs.update.successResponse,
    type: PublicTableSessionDto,
  })
  @ApiResponse(tableSessionDocs.sessionUnauthorizedResponse)
  async partialUpdate(
    @Param('storeId') storeId: string,
    @Param('sessionId') sessionId: string,
    @Body() updateSessionPayload: UpdateTableSessionDto,
  ): Promise<PublicSession> {
    return await this.sessionService.getSessionAndPartialUpdate(
      { storeId, sessionId },
      updateSessionPayload,
    );
  }

  /**
   * ============================================================
   * Customer Sessions Endpoints
   * /stores/v1
   * ============================================================
   */
  @Post('sessions')
  @UseGuards(ZodValidation({ body: createSessionSchema }))
  @ApiOperation({ summary: tableSessionDocs.findOrCreate.summary })
  @ApiResponse({
    ...tableSessionDocs.findOrCreate.successResponse,
    type: SessionTokenDto,
  })
  async findActivatedSessionOrCreate(
    @Body() createSessionPayload: CreateSessionPayloadDto,
  ): Promise<SessionTokenDto> {
    const findOrCreatedSession =
      await this.sessionService.findActivatedSessionOrCreate(
        createSessionPayload,
      );

    return plainToInstance(SessionTokenDto, findOrCreatedSession, {
      excludeExtraneousValues: true,
    });
  }

  @Get('sessions/:sessionToken')
  @UseGuards(SessionAuth)
  getAliveSession(
    @Session() tableSession: TableSession,
  ): PublicTableSessionDto {
    const cachedSession = tableSession;
    return new PublicTableSessionDto(cachedSession);
  }

  @Patch('sessions/:sessionToken')
  @UseGuards(
    SessionAuth,
    ZodValidation({ body: updateCustomerSessionPayloadSchema }),
  )
  @ApiOperation({ summary: tableSessionDocs.update.summary })
  @ApiParam(paramsDocs.tableId)
  @ApiResponse({
    ...tableSessionDocs.update.successResponse,
    type: PublicTableSessionDto,
  })
  @ApiResponse(tableSessionDocs.sessionUnauthorizedResponse)
  async partialUpdateByCustomer(
    @Session() tableSession: TableSession,
    @Body() updateSessionPayload: UpdateCustomerTableSessionDto,
  ): Promise<PublicSession> {
    return await this.sessionService.txableUpdateSession(
      tableSession,
      updateSessionPayload,
    );
  }

  @Get('sessions/:sessionToken/store-context')
  @UseGuards(SessionAuth)
  async getStoreContext(
    @Param('sessionToken') sessionToken: string,
  ): Promise<TableWithStoreContextDto> {
    const storeUntilMenus =
      await this.sessionService.getStoreContext(sessionToken);

    return new TableWithStoreContextDto(storeUntilMenus);
  }
}
