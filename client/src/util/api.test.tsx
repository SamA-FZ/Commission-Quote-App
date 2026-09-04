import axios from 'axios';
import { getCommissionQuote } from './api';

var mockAxiosConfiguration: unknown;

jest.mock('axios', () => ({
  __esModule: true,
  default: { create: jest.fn((configuration) => {
    mockAxiosConfiguration = configuration;
    return { get: jest.fn() };
  }) }
}));

const mockGet = (axios.create as jest.Mock).mock.results[0].value.get as jest.Mock;

describe('getCommissionQuote', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockGet.mockReset();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('requests the quote endpoint with the supplied parameters and returns its quote', async () => {
    const quote = { QuoteId: 'quote-1', commissionRate: 0.05, totalCommission: 5000 };
    mockGet.mockResolvedValue({ data: { quote } });

    await expect(getCommissionQuote(100000, 60, 5)).resolves.toEqual(quote);
    expect(mockGet).toHaveBeenCalledWith('/api/commission/quote', expect.objectContaining({
      params: { loanAmount: 100000, loanTerm: 60, riskBand: 5 }
    }));
  });

  it('propagates a failed API request to the caller', async () => {
    const failure = new Error('Unauthorized');
    mockGet.mockRejectedValue(failure);

    await expect(getCommissionQuote(100000, 60, 5)).rejects.toThrow('Unauthorized');
    expect(console.error).toHaveBeenCalled();
  });

  it('creates one Axios client with JSON request headers', () => {
    expect(mockAxiosConfiguration).toEqual(expect.objectContaining({
      headers: { 'Content-Type': 'application/json' }
    }));
  });
});