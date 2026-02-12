import {
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotImplementedException,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { StoreService } from "./store.service";
import { Client } from "src/decorators/client.decorator";
import type { PublicStore, TokenPayload, User } from "@spaceorder/db";
import {
  DocsStoreCreate,
  DocsStoreDelete,
  DocsStoreGetList,
  DocsStoreGetUnique,
} from "src/docs/store.docs";
import { StoreAccessGuard } from "src/utils/guards/store-access.guard";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Jwt } from "src/decorators/jwt.decorator";

@ApiTags("Store")
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @DocsStoreCreate()
  create(): void {
    throw new NotImplementedException("This feature is not yet implemented");
  }

  @Get()
  @DocsStoreGetList()
  async list(
    @Client() user: User,
    @Jwt() jwt: TokenPayload
  ): Promise<PublicStore[]> {
    return await this.storeService.getStoreList({
      where: this.storeService.addOwnerIdIfNotAdmin(user, jwt.role),
      omit: this.storeService.omitPrivate,
    });
  }

  @Get(":storeId")
  @UseGuards(StoreAccessGuard)
  @DocsStoreGetUnique()
  async unique(
    @Client() user: User,
    @Jwt() jwt: TokenPayload,
    @Param("storeId") storeId: string
  ): Promise<PublicStore> {
    return await this.storeService.getStoreUnique({
      where: {
        publicId: storeId,
        ...this.storeService.addOwnerIdIfNotAdmin(user, jwt.role),
      },
      omit: this.storeService.omitPrivate,
    });
  }

  @Delete(":storeId")
  @UseGuards(StoreAccessGuard)
  @DocsStoreDelete()
  delete(): void {
    throw new NotImplementedException("This feature is not yet implemented");
  }
}
