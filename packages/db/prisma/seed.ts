import { PrismaClient, AdminRole } from "@prisma/client";
import type { Store } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function encryptPassword(value: string): Promise<string> {
  return await bcrypt.hash(value, 10);
}

async function main() {
  console.log("🌱 Starting database seeding...");
  // ==================== Admin 데이터 ====================
  console.log("📝 Creating admins...");
  const adminPassword = await encryptPassword("qwer1234!");
  const superAdmin = await prisma.admin.upsert({
    where: { email: "super@test.com" },
    update: {}, // 이미 있으면 변경하지 않음
    create: {
      email: "super@test.com",
      password: adminPassword,
      name: "super",
      role: AdminRole.SUPER,
      isActive: true,
    },
  });
  const supportAdmin = await prisma.admin.upsert({
    where: { email: "support@test.com" },
    update: {},
    create: {
      email: "support@test.com",
      password: adminPassword,
      name: "support",
      role: AdminRole.SUPPORT,
      isActive: true,
    },
  });
  const viewerAdmin = await prisma.admin.upsert({
    where: { email: "viewer@test.com" },
    update: {},
    create: {
      email: "viewer@test.com",
      password: adminPassword,
      name: "viewer",
      role: AdminRole.VIEWER,
      isActive: true,
    },
  });
  console.log("✅ Admins created:", {
    super: superAdmin.email,
    support: supportAdmin.email,
    viewer: viewerAdmin.email,
  });
  // ==================== Owner 데이터 ====================
  console.log("📝 Creating owners...");
  const ownerPassword = await encryptPassword("qwer1234!");
  const owner1 = await prisma.owner.upsert({
    where: { email: "owner@test.com" },
    update: {},
    create: {
      email: "owner@test.com",
      password: ownerPassword,
      name: "홍길동",
      phone: "010-1234-5678",
      businessNumber: "123-45-67890",
    },
  });
  const owner2 = await prisma.owner.upsert({
    where: { email: "test@test.com" },
    update: {},
    create: {
      email: "test@test.com",
      password: ownerPassword,
      name: "테스트",
      phone: "010-1234-5678",
      businessNumber: "123-45-67891",
    },
  });
  console.log("✅ Owners created:", {
    owner1: owner1.email,
    owner2: owner2.email,
  });
  // ==================== Store 데이터 ====================
  console.log("📝 Creating stores...");
  const store1 = await prisma.store.upsert({
    where: { publicId: "ytwmuk763jytydobq32yq06e" },
    update: {},
    create: {
      publicId: "ytwmuk763jytydobq32yq06e",
      ownerId: owner1.id,
      name: "스페이스 카페",
      address: "서울시 강남구 테헤란로 123",
      addressDetail: "2층",
      phone: "02-1234-5678",
      businessHours: "월-금: 09:00-22:00, 주말: 10:00-20:00",
      description: "개발용 테스트 카페입니다.",
      isOpen: true,
    },
  });
  const store2 = await prisma.store.upsert({
    where: { publicId: "w5o48ydoexledyv5sosd4kcw" },
    update: {},
    create: {
      publicId: "w5o48ydoexledyv5sosd4kcw",
      ownerId: owner2.id,
      name: "테스트 카페",
      address: "서울시 용산구 212",
      addressDetail: "1층",
      phone: "02-1111-5678",
      businessHours: "월-금: 09:00-22:00, 주말: 10:00-20:00",
      description: "테스트 카페입니다.",
      isOpen: true,
    },
  });
  console.log("✅ Stores created:", {
    store1: store1.name,
    store2: store2.name,
  });
  // ==================== Menu 데이터 ====================
  console.log("📝 Creating menus...");
  // Store1 메뉴 (카페)
  const createMenus = [
    {
      publicId: "rbay46e0wjrj7n1h1q2ain8",
      name: "아메리카노",
      price: 4500,
      description: "신선한 원두로 내린 아메리카노",
      category: "커피",
      isAvailable: true,
      sortOrder: 1,
      imageUrl:
        "https://images.unsplash.com/photo-1531835207745-506a1bc035d8?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      requiredOptions: {
        원두: {
          options: [
            { key: "케냐", price: 1000 },
            { key: "코스타리코", price: 500 },
          ],
          defaultKey: "케냐",
        },
        종류: {
          options: [
            { key: "아이스", price: 0 },
            { key: "핫", price: 0 },
          ],
          defaultKey: "아이스",
        },
      },
      customOptions: {
        카페인: {
          options: [
            { key: "진하게", price: 1000 },
            { key: "연하게", price: 0 },
          ],
          trigger: [{ group: "원두", in: ["케냐", "코스타리코"] }],
          defaultKey: "연하게",
        },
        얼음: {
          options: [
            { key: "많이", price: 0 },
            { key: "적게", price: 0 },
          ],
          trigger: [{ group: "종류", in: ["아이스"] }],
          defaultKey: "많이",
        },
      },
    },
    {
      publicId: "ohovsqjy5mavzgk1xu187xw",
      name: "카페라떼",
      price: 5000,
      description: "부드러운 우유와 에스프레소의 조화",
      category: "커피",
      isAvailable: true,
      sortOrder: 3,
      imageUrl:
        "https://images.unsplash.com/photo-1729364983489-d4d569978fd7?q=80&w=1296&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      publicId: "hjpomrh123401gpnvrdl0zi",
      name: "카푸치노",
      price: 5000,
      description: "풍부한 거품의 카푸치노",
      category: "커피",
      isAvailable: true,
      sortOrder: 4,
      imageUrl:
        "https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      publicId: "lwhdq1qwcmckm3k4nni89b1",
      name: "크로와상",
      price: 3500,
      description: "버터 풍미 가득한 크로와상",
      category: "디저트",
      isAvailable: true,
      sortOrder: 1,
      imageUrl:
        "https://images.unsplash.com/photo-1681218079567-35aef7c8e7e4?q=80&w=2148&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      publicId: "d5ghdt3wai43i3jhf3dyk7p",
      name: "치즈케이크",
      price: 6500,
      description: "부드러운 뉴욕 스타일 치즈케이크",
      category: "디저트",
      isAvailable: true,
      sortOrder: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      publicId: "tq2qu2n7aayzxzf837cto4a",
      name: "드립 커피",
      price: 4600,
      description: "최고급 원두로 내린 드립 커피",
      category: "커피",
      isAvailable: true,
      sortOrder: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1531835207745-506a1bc035d8?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      customOptions: {
        얼음: {
          options: [
            { key: "많이", price: 500 },
            { key: "적게", price: 500 },
          ],
          defaultKey: "많이",
        },
      },
    },
  ];

  const [menu1, menu2] = [store1, store2].map((store, index) =>
    createMenus.map((menu) => ({
      ...menu,
      publicId: `${menu.publicId}${index}`,
      storeId: store.id,
    }))
  );
  await prisma.menu.createMany({
    data: [...menu1, ...menu2],
    skipDuplicates: true, // 중복 무시
  });

  const tables = (store: Store) => {
    return [
      {
        publicId: "ue14s3rhgdrci9lnua1eqd58",
        storeId: store.id,
        tableNumber: 1,
        qrCode: "m66dsn0yfgdm08gugosx0j8k",
        name: "문 뒤",
        seats: 2,
        floor: 1,
        section: "창가",
        isActive: true,
        description: null,
      },
      {
        publicId: "oa5zcc6kl8du8g9z7zvqjrkg",
        storeId: store.id,
        tableNumber: 2,
        qrCode: "n7gfe6am4s8zvz2g1rsnl61o",
        name: "문 앞",
        seats: 2,
        floor: 1,
        section: "입구",
        isActive: true,
        description: null,
      },
      {
        publicId: "bpfvgpx5ch1qnm6i5d8fa75y",
        storeId: store.id,
        tableNumber: 3,
        qrCode: "jrdprt65xh6kiqrlpireptei",
        name: "중앙",
        seats: 4,
        floor: 2,
        section: "중앙",
        isActive: true,
        description: null,
      },
      {
        publicId: "lhc7159zorfjk1ojs4g77yzr",
        storeId: store.id,
        tableNumber: 4,
        qrCode: "lhc7159zorfjk1ojs4g77yzr",
        name: "메인 테이블",
        seats: 4,
        floor: 2,
        section: "메인",
        isActive: true,
        description: null,
      },
      {
        publicId: "n0e72gbtnstf9d96bur1im92",
        storeId: store.id,
        tableNumber: 5,
        qrCode: "fwbs5gh9anqct151lbqb8z7e",
        name: "대형 테이블",
        seats: 6,
        floor: 1,
        section: "대형",
        isActive: false,
        description: null,
      },
    ];
  };

  await prisma.table.createMany({
    data: tables(store1),
    skipDuplicates: true,
  });

  // 생성된 테이블 조회 (tableNumber 기준)
  const createdTables = await prisma.table.findMany({
    where: { storeId: store1.id },
    orderBy: { tableNumber: "asc" },
  });

  const table1 = createdTables.find((t) => t.tableNumber === 1)!;
  const table2 = createdTables.find((t) => t.tableNumber === 2)!;
  const table4 = createdTables.find((t) => t.tableNumber === 4)!;

  // 생성된 메뉴 조회
  const createdMenus = await prisma.menu.findMany({
    where: { storeId: store1.id },
  });

  const findMenu = (name: string) => createdMenus.find((m) => m.name === name)!;
  const americano = findMenu("아메리카노");
  const latte = findMenu("카페라떼");
  const cappuccino = findMenu("카푸치노");
  const croissant = findMenu("크로와상");
  const cheesecake = findMenu("치즈케이크");
  const dripCoffee = findMenu("드립 커피");

  // ==================== TableSession 데이터 ====================
  console.log("📝 Creating table sessions...");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2시간 후

  const session1 = await prisma.tableSession.upsert({
    where: { publicId: "m91i4aceil90dukgd22senv5" },
    update: {},
    create: {
      publicId: "m91i4aceil90dukgd22senv5",
      tableId: table1.id,
      status: "ACTIVE",
      sessionToken: "ZdveYAJITM92Np-2Cd4jv0RrHw6KRkAwOZyGHPStsWs",
      activatedAt: now,
      expiresAt,
      paidAmount: 0,
    },
  });

  const session2 = await prisma.tableSession.upsert({
    where: { publicId: "o11om68intan0v0ko3x9nlb3" },
    update: {},
    create: {
      publicId: "o11om68intan0v0ko3x9nlb3",
      tableId: table2.id,
      status: "ACTIVE",
      sessionToken: "PQ-mjU8nlFbRVhpS5HvQcL-qlw_-q02VMEhm_i_aaFM",
      activatedAt: now,
      expiresAt,
      paidAmount: 0,
    },
  });

  const session4 = await prisma.tableSession.upsert({
    where: { publicId: "x14mlnrh7jqdgziucr2vw1eh" },
    update: {},
    create: {
      publicId: "x14mlnrh7jqdgziucr2vw1eh",
      tableId: table4.id,
      status: "ACTIVE",
      sessionToken: "wVecI3NAYcoAZn5Khbq5CLp9P7Qat1yCChSJj8qCJmY",
      activatedAt: now,
      expiresAt,
      paidAmount: 0,
    },
  });

  console.log("✅ Table sessions created");

  // ==================== Order 데이터 ====================
  console.log("📝 Creating orders...");

  // 테이블 1 주문: 아메리카노 2잔 + 크로와상 (COMPLETED)
  const order1 = await prisma.order.upsert({
    where: { publicId: "iz8e7twkcpn232ircc9eyd4q" },
    update: {},
    create: {
      publicId: "iz8e7twkcpn232ircc9eyd4q",
      storeId: store1.id,
      tableId: table1.id,
      tableSessionId: session1.id,
      status: "COMPLETED",
      memo: "얼음 많이 넣어주세요",
      acceptedAt: new Date(now.getTime() - 30 * 60 * 1000),
      completedAt: new Date(now.getTime() - 15 * 60 * 1000),
    },
  });

  // 테이블 1 주문 2: 카페라떼 1잔 (PENDING)
  const order2 = await prisma.order.upsert({
    where: { publicId: "k8hg56a7jhojhmbmvytdra4w" },
    update: {},
    create: {
      publicId: "k8hg56a7jhojhmbmvytdra4w",
      storeId: store1.id,
      tableId: table1.id,
      tableSessionId: session1.id,
      status: "PENDING",
    },
  });

  // 테이블 2 주문: 카푸치노 + 치즈케이크 (PREPARING)
  const order3 = await prisma.order.upsert({
    where: { publicId: "d3gz3p6xmdby60896v2fosui" },
    update: {},
    create: {
      publicId: "d3gz3p6xmdby60896v2fosui",
      storeId: store1.id,
      tableId: table2.id,
      tableSessionId: session2.id,
      status: "PREPARING",
      memo: "케이크 포크 2개 부탁드려요",
      acceptedAt: new Date(now.getTime() - 10 * 60 * 1000),
    },
  });

  // 테이블 4 주문: 드립커피 2잔 + 아메리카노 + 크로와상 + 치즈케이크 (ACCEPTED)
  const order4 = await prisma.order.upsert({
    where: { publicId: "y4yg7t7svyoucz9hl9cd2zur" },
    update: {},
    create: {
      publicId: "y4yg7t7svyoucz9hl9cd2zur",
      storeId: store1.id,
      tableId: table4.id,
      tableSessionId: session4.id,
      status: "ACCEPTED",
      memo: null,
      acceptedAt: new Date(now.getTime() - 5 * 60 * 1000),
    },
  });

  // 테이블 4 주문 2: 카페라떼 (CANCELLED)
  const order5 = await prisma.order.upsert({
    where: { publicId: "m93yqrg1qna04pxi95d0qi5g" },
    update: {},
    create: {
      publicId: "m93yqrg1qna04pxi95d0qi5g",
      storeId: store1.id,
      tableId: table4.id,
      tableSessionId: session4.id,
      status: "CANCELLED",
      cancelledReason: "메뉴 변경",
    },
  });

  // ==================== OrderItem 데이터 ====================
  console.log("📝 Creating order items...");

  await prisma.orderItem.createMany({
    data: [
      // Order 1 (테이블 1 - COMPLETED): 아메리카노 2잔 + 크로와상
      {
        publicId: "zootdtfjvajoivq0x9dlf80j",
        orderId: order1.id,
        menuId: americano.id,
        menuName: "아메리카노",
        basePrice: 4500,
        optionsPrice: 2000,
        unitPrice: 6500,
        quantity: 2,
        optionsSnapshot: {
          requiredOptions: {
            원두: { key: "케냐", price: 1000 },
            종류: { key: "아이스", price: 0 },
          },
          customOptions: {
            카페인: { key: "진하게", price: 1000 },
            얼음: { key: "많이", price: 0 },
          },
        },
      },
      {
        publicId: "cyw8f52pazpolcp3nthvae1w",
        orderId: order1.id,
        menuId: croissant.id,
        menuName: "크로와상",
        basePrice: 3500,
        optionsPrice: 0,
        unitPrice: 3500,
        quantity: 1,
      },
      // Order 2 (테이블 1 - PENDING): 카페라떼 1잔
      {
        publicId: "d6dmaaniichb00uirp98wcmu",
        orderId: order2.id,
        menuId: latte.id,
        menuName: "카페라떼",
        basePrice: 5000,
        optionsPrice: 0,
        unitPrice: 5000,
        quantity: 1,
      },
      // Order 3 (테이블 2 - PREPARING): 카푸치노 + 치즈케이크
      {
        publicId: "zfknocuq7f3jf5mye1svzxry",
        orderId: order3.id,
        menuId: cappuccino.id,
        menuName: "카푸치노",
        basePrice: 5000,
        optionsPrice: 0,
        unitPrice: 5000,
        quantity: 1,
      },
      {
        publicId: "ob8xkpnlc9l0z322r6abmzab",
        orderId: order3.id,
        menuId: cheesecake.id,
        menuName: "치즈케이크",
        basePrice: 6500,
        optionsPrice: 0,
        unitPrice: 6500,
        quantity: 1,
      },
      // Order 4 (테이블 4 - ACCEPTED): 드립커피 2잔 + 아메리카노 + 크로와상 + 치즈케이크
      {
        publicId: "qnavcav7tiaao582qomf5asr",
        orderId: order4.id,
        menuId: dripCoffee.id,
        menuName: "드립 커피",
        basePrice: 4600,
        optionsPrice: 500,
        unitPrice: 5100,
        quantity: 2,
        optionsSnapshot: {
          customOptions: { 얼음: { key: "적게", price: 0 } },
        },
      },
      {
        publicId: "i0vsjtnf5hqmz7acfp55oblp",
        orderId: order4.id,
        menuId: americano.id,
        menuName: "아메리카노",
        basePrice: 4500,
        optionsPrice: 500,
        unitPrice: 5000,
        quantity: 1,
        optionsSnapshot: {
          requiredOptions: {
            원두: { key: "코스타리코", price: 500 },
            종류: { key: "핫", price: 0 },
          },
          customOptions: { 카페인: { key: "연하게", price: 0 } },
        },
      },
      {
        publicId: "kzotggj34fp2sicjxm5378mf",
        orderId: order4.id,
        menuId: croissant.id,
        menuName: "크로와상",
        basePrice: 3500,
        optionsPrice: 0,
        unitPrice: 3500,
        quantity: 1,
      },
      {
        publicId: "dwcxu6otu2dt5h8ehfbh7njn",
        orderId: order4.id,
        menuId: cheesecake.id,
        menuName: "치즈케이크",
        basePrice: 6500,
        optionsPrice: 0,
        unitPrice: 6500,
        quantity: 1,
      },
      // Order 5 (테이블 4 - CANCELLED): 카페라떼
      {
        publicId: "r0are9ygvbtsvotuu91763hx",
        orderId: order5.id,
        menuId: latte.id,
        menuName: "카페라떼",
        basePrice: 5000,
        optionsPrice: 0,
        unitPrice: 5000,
        quantity: 1,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Orders and order items created");
  console.log("✅ Menus created");
  console.log("\n🎉 Seeding completed successfully!");
  console.log("\n📋 Test Accounts:");
  console.log("┌─────────────────────────────────────────────────────┐");
  console.log("│ Admin Accounts                                       │");
  console.log("├─────────────────────────────────────────────────────┤");
  console.log("│ Super Admin: super@test.com / qwer1234!       │");
  console.log("│ Support:     support@test.com / qwer1234!     │");
  console.log("│ Viewer:      viewer@test.com / qwer1234!      │");
  console.log("├─────────────────────────────────────────────────────┤");
  console.log("│ Owner Accounts                                       │");
  console.log("├─────────────────────────────────────────────────────┤");
  console.log("│ Owner 1:     owner1@example.com / qwer1234!         │");
  console.log("│ Owner 2:     owner2@example.com / qwer1234!         │");
  console.log("└─────────────────────────────────────────────────────┘");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:");
    console.error(e);
    // process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
