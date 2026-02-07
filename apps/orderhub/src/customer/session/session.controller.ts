import {
  Controller,
  Post,
  UseGuards,
  Body,
  Patch,
  UseInterceptors,
  ClassSerializerInterceptor,
  Get,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { tableSessionDocs } from 'src/docs/tableSession.docs';
import { paramsDocs } from 'src/docs/params.docs';
import { updateCustomerSessionPayloadSchema } from '@spaceorder/api/schemas';
import { type PublicSession, type TableSession } from '@spaceorder/db';
import { SessionAuth } from 'src/utils/guards/table-session-auth.guard';
import { Session } from 'src/decorators/session.decorator';
import type { z } from 'zod';
import { SessionTokenDto } from '../../dto/public/session.dto';
import { SessionService } from './session.service';
import { CreateSessionPayloadDto } from 'src/dto/session.dto';
import {
  PublicTableSessionDto,
  TableWithStoreContextDto,
} from 'src/dto/public/table.dto';
import { plainToInstance } from 'class-transformer';

export type UpdateCustomerTableSessionDto = z.infer<
  typeof updateCustomerSessionPayloadSchema
>;

@ApiTags('Customer Sessions')
@Controller('sessions')
@UseInterceptors(ClassSerializerInterceptor)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
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

  @Get(':sessionToken')
  @UseGuards(SessionAuth)
  getAliveSession(
    @Session() tableSession: TableSession,
  ): PublicTableSessionDto {
    const cachedSession = tableSession;
    return new PublicTableSessionDto(cachedSession);
  }

  @Patch(':sessionToken')
  @UseGuards(SessionAuth)
  @ApiOperation({ summary: tableSessionDocs.update.summary })
  @ApiParam(paramsDocs.tableId)
  @ApiResponse({
    ...tableSessionDocs.update.successResponse,
    type: PublicTableSessionDto,
  })
  @ApiResponse(tableSessionDocs.sessionUnauthorizedResponse)
  async partialUpdate(
    @Session() tableSession: TableSession,
    @Body() updateSessionPayload: UpdateCustomerTableSessionDto,
  ): Promise<PublicSession> {
    return await this.sessionService.txUpdateSession(
      tableSession,
      updateSessionPayload,
    );
  }

  @Get(':sessionToken/store-context')
  @UseGuards(SessionAuth)
  async getStoreUntilMenusBySession(
    @Param('sessionToken') sessionToken: string,
  ): Promise<TableWithStoreContextDto> {
    const storeUntilMenus =
      await this.sessionService.getStoreUntilMenusBySession(sessionToken);

    return new TableWithStoreContextDto(storeUntilMenus);
  }
}
