import { Admin, AdminRole } from "@spaceorder/db";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

export class PublicAdminDto {
  @ApiProperty({ description: "관리자 고유 ID" })
  @Expose()
  publicId: string;

  @ApiProperty({ description: "관리자 이메일" })
  @Expose()
  email: string;

  @ApiProperty({ description: "관리자 이름" })
  @Expose()
  name: string;

  @ApiProperty({ description: "관리자 권한", enum: AdminRole })
  @Expose()
  role: AdminRole;

  @ApiProperty({ description: "활성화 여부" })
  @Expose()
  isActive: boolean;

  @ApiProperty({ description: "마지막 로그인 시각" })
  @Expose()
  lastLoginAt: Date;

  @ApiProperty({ description: "생성 시각" })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: "수정 시각" })
  @Expose()
  updatedAt: Date;

  @Exclude()
  id: number;

  @Exclude()
  password: string;

  @Exclude()
  refreshToken: string;

  constructor(partial: Partial<Admin>) {
    Object.assign(this, partial);
  }
}
