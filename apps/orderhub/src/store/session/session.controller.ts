import {
  Controller,
  Param,
  Get,
  UseGuards,
  Body,
  Patch,
  UseInterceptors,
  ClassSerializerInterceptor,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  DocsSessionGetList,
  DocsSessionGetUnique,
  DocsSessionUpdate,
} from "src/docs/tableSession.docs";
import {
  updateSessionPayloadSchema,
  storeIdParamsSchema,
  storeIdAndSessionIdSchema,
  updateCustomerSessionPayloadSchema,
} from "@spaceorder/api/schemas";
import { ZodValidation } from "src/utils/guards/zod-validation.guard";
import type { PublicSession, PublicSessionWithTable } from "@spaceorder/db";
import type { z } from "zod";
import { SessionService } from "./session.service";
import { StoreAccessGuard } from "src/utils/guards/store-access.guard";
import {
  ORDER_WITH_ITEMS_RECORD,
  SESSION_OMIT,
} from "src/common/query/session-query.const";
import { TABLE_OMIT } from "src/common/query/table-query.const";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

export type UpdateTableSessionDto = z.infer<typeof updateSessionPayloadSchema>;
export type UpdateCustomerTableSessionDto = z.infer<
  typeof updateCustomerSessionPayloadSchema
>;

@ApiTags("Table Session")
@Controller()
@UseGuards(JwtAuthGuard, StoreAccessGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get(":storeId/sessions")
  @UseGuards(ZodValidation({ params: storeIdParamsSchema }))
  @DocsSessionGetList()
  async list(
    @Param("storeId") storeId: string
  ): Promise<PublicSessionWithTable<"Wide">[]> {
    return await this.sessionService.getSessionList({
      where: { table: { store: { publicId: storeId } } },
      omit: SESSION_OMIT,
      include: {
        table: { omit: TABLE_OMIT },
        orders: ORDER_WITH_ITEMS_RECORD,
      },
    });
  }

  @Get(":storeId/sessions/:sessionId")
  @UseGuards(ZodValidation({ params: storeIdAndSessionIdSchema }))
  @DocsSessionGetUnique()
  async unique(
    @Param("storeId") storeId: string,
    @Param("sessionId") sessionId: string
  ): Promise<PublicSessionWithTable<"Wide">> {
    return await this.sessionService.getSessionUnique({
      where: { publicId: sessionId, table: { store: { publicId: storeId } } },
      omit: SESSION_OMIT,
      include: {
        table: { omit: TABLE_OMIT },
        orders: ORDER_WITH_ITEMS_RECORD,
      },
    });
  }

  @Patch(":storeId/sessions/:sessionId")
  @UseGuards(
    ZodValidation({
      params: storeIdAndSessionIdSchema,
      body: updateSessionPayloadSchema,
    })
  )
  @DocsSessionUpdate()
  async partialUpdate(
    @Param("storeId") storeId: string,
    @Param("sessionId") sessionId: string,
    @Body() updateSessionPayload: UpdateTableSessionDto
  ): Promise<PublicSession> {
    return await this.sessionService.getSessionAndPartialUpdate(
      { storeId, sessionId },
      updateSessionPayload
    );
  }
}
