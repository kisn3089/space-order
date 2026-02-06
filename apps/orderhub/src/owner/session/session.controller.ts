import {
  Controller,
  Param,
  Get,
  UseGuards,
  Body,
  Patch,
  UseInterceptors,
  ClassSerializerInterceptor,
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
} from '@spaceorder/api/schemas';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import type { PublicSession } from '@spaceorder/db';
import type { z } from 'zod';
import { PublicTableSessionDto } from '../../dto/public/session.dto';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { SessionService } from './session.service';
import { OwnerStoreGuard } from 'src/utils/guards/model-permissions/owner-store.guard';

export type UpdateTableSessionDto = z.infer<typeof updateSessionPayloadSchema>;

@ApiTags('Table Sessions')
@Controller('stores/:storeId/sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OwnerStoreGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  @UseGuards(ZodValidation({ params: storeIdParamsSchema }))
  @ApiOperation({ summary: tableSessionDocs.getList.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiParam(paramsDocs.sessionId)
  @ApiQuery(paramsDocs.query.filter.session)
  @ApiQuery(paramsDocs.query.include.orderItems)
  @ApiResponse({
    ...tableSessionDocs.getList.successResponse,
    type: [PublicTableSessionDto],
  })
  @ApiResponse(tableSessionDocs.unauthorizedResponse)
  async list(@Param('storeId') storeId: string): Promise<PublicSession[]> {
    return await this.sessionService.getSessionList({
      where: { table: { store: { publicId: storeId } } },
      omit: { id: true, tableId: true },
    });
  }

  @Get(':sessionId')
  @UseGuards(JwtAuthGuard, ZodValidation({ params: storeIdAndSessionIdSchema }))
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
  ): Promise<PublicTableSessionDto> {
    return new PublicTableSessionDto(
      await this.sessionService.getSessionUnique({
        where: { publicId: sessionId, table: { store: { publicId: storeId } } },
        omit: { id: true, tableId: true },
      }),
    );
  }

  @Patch(':sessionId')
  @UseGuards(
    ZodValidation({
      params: storeIdAndSessionIdSchema,
      body: updateSessionPayloadSchema,
    }),
  )
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
}
