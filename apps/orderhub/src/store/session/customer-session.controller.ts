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
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  DocsSessionFindOrCreate,
  DocsSessionGetAlive,
  DocsSessionGetStoreContext,
  DocsSessionUpdateByCustomer,
} from "src/docs/tableSession.docs";
import {
  updateSessionPayloadSchema,
  updateCustomerSessionPayloadSchema,
  createSessionSchema,
} from "@spaceorder/api/schemas";
import { ZodValidation } from "src/utils/guards/zod-validation.guard";
import type { PublicSession, TableSession } from "@spaceorder/db";
import type { z } from "zod";
import { SessionService } from "./session.service";
import {
  PublicTableSessionDto,
  TableWithStoreContextDto,
} from "src/dto/public/table.dto";
import { SessionTokenDto } from "src/dto/public/session.dto";
import { CreateSessionPayloadDto } from "src/dto/session.dto";
import { Session } from "src/decorators/session.decorator";
import { SessionAuth } from "src/utils/guards/table-session-auth.guard";
import { plainToInstance } from "class-transformer";

export type UpdateTableSessionDto = z.infer<typeof updateSessionPayloadSchema>;
export type UpdateCustomerTableSessionDto = z.infer<
  typeof updateCustomerSessionPayloadSchema
>;

@ApiTags("Customer Session")
@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class CustomerSessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post("sessions")
  @UseGuards(ZodValidation({ body: createSessionSchema }))
  @DocsSessionFindOrCreate()
  async findActivatedSessionOrCreate(
    @Body() createSessionPayload: CreateSessionPayloadDto
  ): Promise<SessionTokenDto> {
    const findOrCreatedSession =
      await this.sessionService.findActivatedSessionOrCreate(
        createSessionPayload
      );

    return plainToInstance(SessionTokenDto, findOrCreatedSession, {
      excludeExtraneousValues: true,
    });
  }

  @Get("sessions/:sessionToken")
  @UseGuards(SessionAuth)
  @DocsSessionGetAlive()
  getAliveSession(
    @Session() tableSession: TableSession
  ): PublicTableSessionDto {
    const cachedSession = tableSession;
    return new PublicTableSessionDto(cachedSession);
  }

  @Patch("sessions/:sessionToken")
  @UseGuards(
    SessionAuth,
    ZodValidation({ body: updateCustomerSessionPayloadSchema })
  )
  @DocsSessionUpdateByCustomer()
  async partialUpdateByCustomer(
    @Session() tableSession: TableSession,
    @Body() updateSessionPayload: UpdateCustomerTableSessionDto
  ): Promise<PublicSession> {
    return await this.sessionService.txableUpdateSession(
      tableSession,
      updateSessionPayload
    );
  }

  @Get("sessions/:sessionToken/store-context")
  @UseGuards(SessionAuth)
  @DocsSessionGetStoreContext()
  async getStoreContext(
    @Param("sessionToken") sessionToken: string
  ): Promise<TableWithStoreContextDto> {
    const storeUntilMenus =
      await this.sessionService.getStoreContext(sessionToken);

    return new TableWithStoreContextDto(storeUntilMenus);
  }
}
