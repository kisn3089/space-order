export const transCurrencyFormat = (price: number) =>
  new Intl.NumberFormat("ko-KR", {
    currency: "KRW",
  }).format(price);

export const reduceTotalPrice = <TArray extends {}>(
  entries: TArray[],
  getPriceFromItem: (item: TArray) => number
) => entries.reduce((sum, item) => sum + getPriceFromItem(item), 0);
