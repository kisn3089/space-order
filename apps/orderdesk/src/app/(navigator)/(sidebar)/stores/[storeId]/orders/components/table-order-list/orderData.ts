export type TTableOrder = {
  id: number;
  tableNum: number;
  totalPrice: number;
  memo?: string;
  orderItem: TTableOrderItem[];
};

export type TTableOrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  requiredOptions?: Record<string, string>;
  customOptions?: Record<string, string>;
};

export const orderData: TTableOrder[] = [
  {
    id: 111111,
    tableNum: 1,
    totalPrice: 14300,
    orderItem: [
      {
        id: "ice_americano",
        name: "아이스 아메리카노",
        price: 4500,
        quantity: 1,
        requiredOptions: {
          사이즈: "라지",
        },
        customOptions: {
          얼음: "적게",
          // 카페인: "연하게",
        },
      },
      {
        id: "ice_americano",
        name: "아이스 아메리카노",
        price: 4500,
        quantity: 2,
        requiredOptions: {
          사이즈: "라지",
        },
      },
      {
        id: "latte",
        name: "아이스 카페라떼",
        price: 5300,
        quantity: 1,
      },
      {
        id: "hot_americano",
        name: "핫 아메리카노",
        price: 4500,
        quantity: 2,
        // customOptions: {
        //   카페인: "연하게",
        // },
      },
      {
        id: "4444444",
        name: "바닐라 라떼",
        price: 4200,
        quantity: 2,
      },
    ],
  },
  {
    id: 222222,
    tableNum: 2,
    totalPrice: 14300,
    memo: "덜 맵게 해주세요.",
    orderItem: [
      {
        id: "5555555",
        name: "해산물 토마토 파스타",
        price: 15000,
        quantity: 1,
      },
      {
        id: "6666666",
        name: "크림 파스타",
        price: 13000,
        quantity: 1,
      },
      {
        id: "7777777",
        name: "봉골레 파스타",
        price: 14000,
        quantity: 1,
      },
    ],
  },
  {
    id: 333333,
    tableNum: 3,
    totalPrice: 14300,
    memo: "반찬 조금만 주세요.\n양념 많이 주세요.",
    orderItem: [
      {
        id: "8888888",
        name: "보리밥 정식",
        price: 15000,
        quantity: 2,
      },
      {
        id: "9999999",
        name: "암꽃게 정식",
        price: 32000,
        quantity: 1,
      },
    ],
  },
  {
    id: 4,
    tableNum: 4,
    totalPrice: 14300,
    memo: "하나는 맵게 해주세요.",
    orderItem: [
      {
        id: "10101010",
        name: "회 덮밥",
        price: 18000,
        quantity: 2,
      },
      {
        id: "11111111",
        name: "차슈 라멘",
        price: 11000,
        quantity: 3,
      },
      {
        id: "12121212",
        name: "야키토리 꼬치 세트",
        price: 24000,
        quantity: 1,
      },
    ],
  },
];
