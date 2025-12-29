import { Injectable } from '@nestjs/common';
import {
  TableSession,
  Prisma,
  PrismaClient,
  TableSessionStatus,
} from '@spaceorder/db';
import { randomBytes } from 'crypto';
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

    if (retrievedActivedSession) {
      if (
        retrievedActivedSession.expiresAt &&
        retrievedActivedSession.expiresAt >= new Date()
      ) {
        return retrievedActivedSession;
      }
      await this.txableUpdatesTableSession().setSessionDeactivate(
        retrievedActivedSession.publicId,
      );
    }

    const createdTableSession = await this.createSession(
      storePublicId,
      tablePublicId,
    );

    return createdTableSession;
  }

  async validateSessionToken(sessionToken: string): Promise<TableSession> {
    const session = await this.prismaService.tableSession.findUniqueOrThrow({
      where: { sessionToken },
    });

    return session;
  }

  async updateSessionDeactivate(
    tableSessionPublicId: string,
  ): Promise<TableSession> {
    return await this.txableUpdatesTableSession().setSessionDeactivate(
      tableSessionPublicId,
    );
  }

  async updateSessionActivate(
    tableSessionPublicId: string,
  ): Promise<TableSession> {
    const retrievedSession =
      await this.retrieveTableSessionBy(tableSessionPublicId);

    console.log('tableSessionPublicId: ', tableSessionPublicId);
    console.log('retrievedSession: ', retrievedSession);
    // 정상적으로 tableSessionPublicId가 넘어옴

    return await this.prismaService.tableSession.update({
      where: { publicId: tableSessionPublicId },
      data: { status: TableSessionStatus.ACTIVE, closedAt: null },
    });
    // return await this.txableUpdatesTableSession().setSessionActivate(
    //   tableSessionPublicId,
    // );
  }

  private txableUpdatesTableSession(tx?: Tx) {
    const service = tx ?? this.prismaService;

    const setSessionActivate = async (tableSessionPublicId: string) => {
      return await service.tableSession.update({
        where: { publicId: tableSessionPublicId },
        data: { status: TableSessionStatus.ACTIVE, closedAt: null },
      });
    };

    const setSessionDeactivate = async (tableSessionPublicId: string) => {
      return await service.tableSession.update({
        where: { publicId: tableSessionPublicId },
        data: {
          status: TableSessionStatus.CLOSED,
          closedAt: new Date(),
        },
      });
    };

    const setStatusPending = async (tableSessionPublicId: string) => {
      return await service.tableSession.update({
        where: { publicId: tableSessionPublicId },
        data: { status: TableSessionStatus.PAYMENT_PENDING },
      });
    };

    const setSessionFinishByPayment = async (
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
      setSessionActivate,
      setSessionDeactivate,
      setStatusPending,
      setSessionFinishByPayment,
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

        // if (!result) {
        //   throw new Error(
        //     'Transaction Pipe Error: 함수에서 값을 반환하지 않았습니다.',
        //   );
        // }
      }
    });
    return results;
  }

  async txUpdateSessionFinishByPayment(
    tableSessionPublicId: string,
    paidAmount: number,
    totalAmount: number,
  ) {
    const setPendingStatus = async (tx: Tx): Promise<TableSession> => {
      return await this.txableUpdatesTableSession(tx).setStatusPending(
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
      return await this.txableUpdatesTableSession(tx).setSessionFinishByPayment(
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

    return retrievedTableSessionList;
  }

  async retrieveTableSessionBy(sessionToken: string) {
    return await this.prismaService.tableSession.findUniqueOrThrow({
      where: { sessionToken },
    });
  }
}
