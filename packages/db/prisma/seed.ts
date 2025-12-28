import { PrismaClient, AdminRole } from "@prisma/client";
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
  console.log("✅ Owners created:", { owner1: owner1.email });
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
      tableCount: 10,
      isOpen: true,
    },
  });
  console.log("✅ Stores created:", { store1: store1.name });
  // ==================== Menu 데이터 ====================
  console.log("📝 Creating menus...");
  // Store1 메뉴 (카페)
  await prisma.menu.createMany({
    data: [
      {
        storeId: store1.id,
        name: "아메리카노",
        price: 4500,
        description: "신선한 원두로 내린 아메리카노",
        category: "커피",
        isAvailable: true,
        sortOrder: 1,
        imageUrl:
          "https://images.unsplash.com/photo-1531835207745-506a1bc035d8?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        requiredOptions: { 사이즈: ["톨", "그란데", "벤티"] },
        customOptions: { 얼음: ["없음", "적게", "많이"] },
        // 추후 커스텀 컬럼 필요함 예) 얼음 적게, 많이, 없음 등
      },
      {
        storeId: store1.id,
        name: "카페라떼",
        price: 5000,
        description: "부드러운 우유와 에스프레소의 조화",
        category: "커피",
        isAvailable: true,
        sortOrder: 2,
        imageUrl:
          "https://images.unsplash.com/photo-1729364983489-d4d569978fd7?q=80&w=1296&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        storeId: store1.id,
        name: "카푸치노",
        price: 5000,
        description: "풍부한 거품의 카푸치노",
        category: "커피",
        isAvailable: true,
        sortOrder: 3,
        imageUrl:
          "https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        storeId: store1.id,
        name: "크로와상",
        price: 3500,
        description: "버터 풍미 가득한 크로와상",
        category: "베이커리",
        isAvailable: true,
        sortOrder: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1681218079567-35aef7c8e7e4?q=80&w=2148&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        storeId: store1.id,
        name: "치즈케이크",
        price: 6500,
        description: "부드러운 뉴욕 스타일 치즈케이크",
        category: "디저트",
        isAvailable: true,
        sortOrder: 5,
        imageUrl:
          "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    ],
    skipDuplicates: true, // 중복 무시
  });
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
