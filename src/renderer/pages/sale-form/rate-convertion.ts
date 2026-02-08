// import { CurrencyEnum } from "../../../types/app.logic.types";

// export const currencyConversion = (
//   rate: { RWF: number; CDF: number },
//   from: CurrencyEnum,
//   to: CurrencyEnum | null,
//   amount: number
// ): number => {
//   if (!to || !from) return 0;

//   const { RWF, CDF } = rate;
//   if (from === to) return amount;

//   // USD => CDF
//   if (from === CurrencyEnum.USD && to === CurrencyEnum.CDF) {
//     return amount * CDF; // formula
//   }

//   // USD => RWF
//   if (from === CurrencyEnum.USD && to === CurrencyEnum.RWF) {
//     return amount * RWF; // formula
//   }

//   // CDF => USD
//   if (from === CurrencyEnum.CDF && to === CurrencyEnum.USD) {
//     return amount / CDF; // formula
//   }

//   // CDF => RWF
//   if (from === CurrencyEnum.CDF && to === CurrencyEnum.RWF) {
//     return (amount / CDF) * RWF;
//   }

//   // RWF => USD
//   if (from === CurrencyEnum.RWF && to === CurrencyEnum.USD) {
//     return amount / RWF; // formula
//   }

//   // RWF => CDF
//   if (from === CurrencyEnum.RWF && to === CurrencyEnum.CDF) {
//     return (amount / RWF) * CDF; // formula
//   }

//   return 0;
// };
