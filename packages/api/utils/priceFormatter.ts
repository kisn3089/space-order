export const transCurrencyFormat = (price: number) =>
  new Intl.NumberFormat("ko-KR", {
    currency: "KRW",
  }).format(price);
