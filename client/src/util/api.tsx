
import axios from 'axios';
import { CommissionQuoteResponse } from '../types/commission';

const baseUrl = process.env.REACT_APP_COMMISSION_QUOTE_BACKEND || 'http://localhost:4000';
const apiKey = process.env.REACT_APP_COMMISSION_QUOTE_API_KEY;
const api = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getCommissionQuote = async (loanAmount: number, loanTerm: number, riskBand: number): Promise<CommissionQuoteResponse> => {
    try {
        console.log('Fetching commission quote with params:', { loanAmount, loanTerm, riskBand });
        const response = await api.get<{ quote: CommissionQuoteResponse }>(`/api/commission/quote`, {
            params: {
                loanAmount,
                loanTerm,
                riskBand,
            },
            headers: apiKey ? { 'X-API-Key': apiKey } : undefined,
        });

        return response.data.quote;
    } catch (error) {
        console.error('Error fetching commission quote:', error);
        throw error;
    }
};