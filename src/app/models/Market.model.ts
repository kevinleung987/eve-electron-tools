export class Price {
  buy = {
    max: Number.NEGATIVE_INFINITY,
    min: Number.POSITIVE_INFINITY,
    avg: 0,
    total: 0,
    quantity: 0
  };
  sell = {
    max: Number.NEGATIVE_INFINITY,
    min: Number.POSITIVE_INFINITY,
    avg: 0,
    total: 0,
    quantity: 0
  };
  total = 0;
}
