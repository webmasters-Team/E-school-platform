export const currencyFormatter = (data) => {
  return ((data.amount * 100) / 100).toLocaleString(data.currency, {
    style: "currency",
    currency: data.currency,
  });
};

// TODO: 하드코딩된 환율 계산 다시하기
export const stripeCurrencyFormatter = (data) => {
  return ((data.amount * 1110) / 100).toLocaleString("krw", {
    style: "currency",
    currency: "krw",
  });
};
