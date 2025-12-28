import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import {
  TableSession,
  Prisma,
  PrismaClient,
  TableSessionStatus,
} from '@spaceorder/db';
import { randomBytes } from 'crypto';
import { responseMessage } from 'src/common/constants/response-message';
import { PrismaService } from 'src/prisma/prisma.service';

type Tx = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never>,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>;

type TransactionPipe<T> = (tx?: Tx) => Promise<T | void>;

@Injectable()
export class TableSessionService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Generate cryptographically secure session token
   * Uses 32 bytes (256 bits) of random data, encoded as base64url
   * This provides sufficient entropy to prevent brute force attacks
   */
  private generateSecureSessionToken(): string {
    // Generate 32 bytes of cryptographically secure random data
    const buffer = randomBytes(32);
    // Convert to base64url encoding (URL-safe, no padding)
    return buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private async retrieveActivedSessionById(tablePublicId: string) {
    return await this.prismaService.tableSession.findFirst({
      where: {
        table: { publicId: tablePublicId },
        status: TableSessionStatus.ACTIVE,
      },
    });
  }

  private async createSession(
    storePublicId: string,
    tablePublicId: string,
  ): Promise<TableSession> {
    const sessionToken = this.generateSecureSessionToken();
    return await this.prismaService.tableSession.create({
      data: {
        store: { connect: { publicId: storePublicId } },
        table: { connect: { publicId: tablePublicId } },
        status: TableSessionStatus.ACTIVE,
        sessionToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2시간 후 만료
      },
    });
  }

  async createOrRetrieveActivedTableSession(
    storePublicId: string,
    tablePublicId: string,
  ): Promise<TableSession> {
    const retrievedActivedSession =
      await this.retrieveActivedSessionById(tablePublicId);

    // 만료 시간이 지나지 않았다면 활성화된 세션 반환
    if (retrievedActivedSession) {
      if (
        retrievedActivedSession.expiresAt &&
        retrievedActivedSession.expiresAt >= new Date()
      ) {
        return retrievedActivedSession;
      }
      // 만료된 세션은 종료 처리
      await this.txableUpdatesTableSession().setDeactivateSession(
        retrievedActivedSession.publicId,
      );
    }

    const createdTableSession = await this.createSession(
      storePublicId,
      tablePublicId,
    );

    if (!createdTableSession) {
      console.warn('Failed to create table session');
      throw new BadRequestException(responseMessage('invalidBody'));
    }

    return createdTableSession;
  }

  async validateSessionToken(sessionToken: string): Promise<TableSession> {
    const session = await this.prismaService.tableSession.findUnique({
      where: { sessionToken },
    });

    if (!session) {
      throw new HttpException(responseMessage('invalidTableSession'), 401);
    }

    if (
      session.expiresAt < new Date() ||
      session.status !== TableSessionStatus.ACTIVE
    ) {
      // 세션 만료 처리
      await this.txableUpdatesTableSession().setDeactivateSession(
        session.publicId,
      );
      throw new HttpException(responseMessage('expiredTableSession'), 440);
    }

    return session;
  }

  async updateDeactivateSession(
    tableSessionPublicId: string,
  ): Promise<TableSession> {
    return await this.txableUpdatesTableSession().setDeactivateSession(
      tableSessionPublicId,
    );
  }

  async updateActivateSession(
    tableSessionPublicId: string,
  ): Promise<TableSession> {
    return await this.txableUpdatesTableSession().setActivateSession(
      tableSessionPublicId,
    );
  }

  private txableUpdatesTableSession(tx?: Tx) {
    const service = tx ?? this.prismaService;

    const setActivateSession = async (tableSessionPublicId: string) => {
      return await service.tableSession.update({
        where: { publicId: tableSessionPublicId },
        data: { status: TableSessionStatus.ACTIVE, closedAt: null },
      });
    };

    const setDeactivateSession = async (tableSessionPublicId: string) => {
      return await service.tableSession.update({
        where: { publicId: tableSessionPublicId },
        data: {
          status: TableSessionStatus.CLOSED,
          closedAt: new Date(),
        },
      });
    };

    const setPendingStatus = async (tableSessionPublicId: string) => {
      return await service.tableSession.update({
        where: { publicId: tableSessionPublicId },
        data: { status: TableSessionStatus.PAYMENT_PENDING },
      });
    };

    const setFinishSessionByPayment = async (
      tableSessionPublicId: string,
      paidAmount: number,
      totalAmount: number,
    ) => {
      return await service.tableSession.update({
        where: { publicId: tableSessionPublicId },
        data: {
          paidAmount,
          totalAmount,
          status: TableSessionStatus.CLOSED,
          closedAt: new Date(),
        },
      });
    };

    return {
      setActivateSession,
      setDeactivateSession,
      setPendingStatus,
      setFinishSessionByPayment,
    };
  }

  /** TODO: OrderItem & Order API 구현 후 테스트 필요 */
  private async transactionPipe<T>(
    ...args: TransactionPipe<T>[]
  ): Promise<Awaited<T | void>[]> {
    const results: Awaited<T | void>[] = [];
    await this.prismaService.$transaction(async (tx) => {
      for (const func of args) {
        const result: Awaited<ReturnType<typeof func>> = await func(tx);
        results.push(result);

        if (!result) {
          throw new Error(
            'Transaction Pipe Error: 함수에서 값을 반환하지 않았습니다.',
          );
        }
      }
    });
    return results;
  }

  async txUpdatePaymentSession(
    tableSessionPublicId: string,
    paidAmount: number,
    totalAmount: number,
  ) {
    const setPendingStatus = async (tx: Tx): Promise<TableSession> => {
      return await this.txableUpdatesTableSession(tx).setPendingStatus(
        tableSessionPublicId,
      );
    };

    const wait = async (): Promise<void> => {
      return await new Promise((resolve) =>
        setTimeout(() => {
          console.log('외부 결제 완료');
          resolve();
        }, 2000),
      );
    };

    const setFinishSessionByPayment = async (tx: Tx): Promise<TableSession> => {
      return await this.txableUpdatesTableSession(tx).setFinishSessionByPayment(
        tableSessionPublicId,
        paidAmount,
        totalAmount,
      );
    };

    const resultTransaction = await this.transactionPipe(
      setPendingStatus,
      wait,
      setFinishSessionByPayment,
    );

    return resultTransaction;
  }

  async retrieveTableSessionBySessionToken(sessionToken: string) {
    return await this.prismaService.tableSession.findUnique({
      where: { sessionToken },
    });
  }

  async retrieveTableSessionList(tablePublicId: string) {
    const retrievedTableSessionList =
      await this.prismaService.tableSession.findMany({
        where: { table: { publicId: tablePublicId } },
      });

    if (!retrievedTableSessionList) {
      console.warn('Failed to find table sessions');
      throw new HttpException(responseMessage('notFoundThat'), 404);
    }

    return retrievedTableSessionList;
  }
}
