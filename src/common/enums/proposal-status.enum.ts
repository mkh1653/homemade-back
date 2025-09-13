export enum ProposalStatus {
  PENDING = 'PENDING', // پیشنهاد ارسال شده و منتظر بررسی
  ACCEPTED = 'ACCEPTED', // پیشنهاد پذیرفته شده توسط مشتری
  REJECTED = 'REJECTED', // پیشنهاد رد شده توسط مشتری
  WITHDRAWN = 'WITHDRAWN', // پیشنهاد پس گرفته شده توسط فریلنسر
}
