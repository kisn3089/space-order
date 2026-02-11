export const transCurrencyFormat = (price: number) =>
  new Intl.NumberFormat("ko-KR", {
    currency: "KRW",
  }).format(price);

export const sumFromObjects = <TArray extends object>(
  objects: TArray[],
  extractFromObject: (object: TArray) => number
) => objects.reduce((sum, object) => sum + extractFromObject(object), 0);
