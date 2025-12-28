import type { Response } from 'express';
import { HttpException, Injectable } from '@nestjs/common';
import { TableSession, COOKIE_TABLE } from '@spaceorder/db';
import { responseMessage } from 'src/common/constants/response-message';
import { responseCookie } from 'src/utils/cookies';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TableSessionService {
  constructor(private readonly prismaService: PrismaService) {}

  private async findActiveSession(tablePublicId: string) {
    return await this.prismaService.tableSession.findFirst({
      where: {
        table: { publicId: tablePublicId },
        status: 'ACTIVE',
      },
    });
  }

  private async createNewSession(storePublicId: string, tablePublicId: string) {
    return await this.prismaService.tableSession.create({
      data: {
        store: { connect: { publicId: storePublicId } },
        table: { connect: { publicId: tablePublicId } },
        status: 'ACTIVE',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2시간 후 만료
      },
    });
  }

  async getOrCreateSession(
    storePublicId: string,
    tablePublicId: string,
    response: Response,
  ) {
    const activeSession = await this.findActiveSession(tablePublicId);

    if (activeSession) {
      // 만료 시간 확인
      if (activeSession.expiresAt && activeSession.expiresAt >= new Date()) {
        // 활성화된 세션으로 쿠키 설정하여 이미 활성화된 세션 반환
        responseCookie.set(
          response,
          COOKIE_TABLE.TABLE_SESSION,
          activeSession.sessionToken,
          {
            expires: activeSession.expiresAt,
          },
        );
        return activeSession;
      }
      // 만료된 세션은 종료 처리
      await this.closeSession(activeSession.publicId);
      return activeSession;
    }

    const createdTableSession = await this.createNewSession(
      storePublicId,
      tablePublicId,
    );
    // 새로 생성된 세션으로 쿠키 설정
    responseCookie.set(
      response,
      COOKIE_TABLE.TABLE_SESSION,
      createdTableSession.sessionToken,
      {
        expires: createdTableSession.expiresAt,
      },
    );
    return createdTableSession;
  }

  /**
   * 쿠키의 세션 토큰을 검증하고 오류를 반환
   */
  async validateSession(sessionToken: string): Promise<TableSession> {
    const session = await this.prismaService.tableSession.findUnique({
      where: { sessionToken },
    });

    if (!session) {
      throw new HttpException(responseMessage('invalidTableSession'), 401);
    }

    if (
      !session.expiresAt ||
      session.expiresAt < new Date() ||
      session.status !== 'ACTIVE'
    ) {
      // 세션 만료 처리
      await this.closeSession(session.publicId);
      throw new HttpException(responseMessage('expiredTableSession'), 440);
    }

    return session;
  }

  async closeSession(tableSessionPublicId: string, totalAmount?: number) {
    return await this.prismaService.tableSession.update({
      where: { publicId: tableSessionPublicId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        ...(totalAmount && { totalAmount }),
      },
    });
  }

  async completeSessionWithPayment(
    tableSessionPublicId: string,
    paidAmount: number,
    totalAmount: number,
  ) {
    return await this.prismaService.$transaction(async (tx) => {
      // 1. paidAmount 업데이트
      await tx.tableSession.update({
        where: { publicId: tableSessionPublicId },
        data: { paidAmount },
      });
      /**
       * TODO: 향후 결제 관련 로직 추가
       */
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 2. 세션 종료
      return await tx.tableSession.update({
        where: { publicId: tableSessionPublicId },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
          totalAmount,
        },
      });
    });
  }

  async findBySession(sessionToken: string) {
    return await this.prismaService.tableSession.findUnique({
      where: { sessionToken },
    });
  }

  /** TODO: 전체 세션 정보를 볼 필요가 있을까? */
  async findAll(tablePublicId: string) {
    const foundTableSessions = await this.prismaService.tableSession.findMany({
      where: { table: { publicId: tablePublicId } },
    });

    if (!foundTableSessions) {
      console.warn('Failed to find table sessions');
      throw new HttpException(responseMessage('notFoundThat'), 404);
    }

    return foundTableSessions;
  }
}
