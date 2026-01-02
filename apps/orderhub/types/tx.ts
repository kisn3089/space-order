import type { Prisma, PrismaClient } from '@spaceorder/db';

export type Tx = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never>,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>;
