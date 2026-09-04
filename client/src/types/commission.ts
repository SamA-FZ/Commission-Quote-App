export interface CommissionQuoteRequest {
    loanAmount: number;
    loanTermInMonths: number;
    riskBand: number;
}

export interface CommissionQuoteResponse {
  QuoteId: string;
  commissionRate: number;
  totalCommission: number;
}