import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { getCommissionQuote } from './util/api';

jest.mock('./util/api', () => ({
  getCommissionQuote: jest.fn()
}));

const mockedGetCommissionQuote = getCommissionQuote as jest.MockedFunction<typeof getCommissionQuote>;
const getLoanAmountInput = () => screen.getAllByRole('spinbutton')[0];
const getLoanTermInput = () => screen.getAllByRole('spinbutton')[1];

describe('App', () => {
  beforeEach(() => {
    mockedGetCommissionQuote.mockReset();
  });

  it('renders the quote form with its default values and four risk levels', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Generate a commission quote' })).toBeInTheDocument();
    expect(getLoanAmountInput()).toHaveValue(100000);
    expect(getLoanTermInput()).toHaveValue(60);
    expect(screen.getByText('Low risk: 1')).toBeInTheDocument();
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByText('Critical risk: 4')).toBeInTheDocument();
    expect(screen.queryByText('Medium risk: 5')).not.toBeInTheDocument();
    expect(screen.queryByText('Quote result')).not.toBeInTheDocument();
  });

  it('switches dark mode on and off', async () => {
    const user = userEvent.setup();
    render(<App />);
    const toggle = screen.getByRole('checkbox', { name: 'Dark mode' });

    expect(toggle).not.toBeChecked();
    await user.click(toggle);
    expect(toggle).toBeChecked();
    await user.click(toggle);
    expect(toggle).not.toBeChecked();
  });

  it('blocks invalid loan amounts without calling the API', async () => {
    const user = userEvent.setup();
    render(<App />);
    fireEvent.change(getLoanAmountInput(), { target: { value: '0' } });

    await user.click(screen.getByRole('button', { name: 'Generate quote' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Loan amount must be between $1 and $10,000,000.');
    expect(mockedGetCommissionQuote).not.toHaveBeenCalled();
  });

  it('blocks non-whole loan terms without calling the API', async () => {
    const user = userEvent.setup();
    render(<App />);
    fireEvent.change(getLoanTermInput(), { target: { value: '60.5' } });

    await user.click(screen.getByRole('button', { name: 'Generate quote' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Loan term must be a whole number between 1 and 480 months.');
    expect(mockedGetCommissionQuote).not.toHaveBeenCalled();
  });

  it('submits valid values and displays both returned quote fields', async () => {
    const user = userEvent.setup();
    mockedGetCommissionQuote.mockResolvedValue({ QuoteId: 'quote-1', commissionRate: 0.05, totalCommission: 5000 });
    render(<App />);
    fireEvent.change(getLoanAmountInput(), { target: { value: '100000' } });
    fireEvent.change(getLoanTermInput(), { target: { value: '60' } });

    await user.click(screen.getByRole('button', { name: 'Generate quote' }));

    await waitFor(() => expect(mockedGetCommissionQuote).toHaveBeenCalledWith(100000, 60, 1));
    expect(screen.getByText('Quote result')).toBeInTheDocument();
    expect(screen.getByText('Commission rate:', { exact: false })).toHaveTextContent('5.00%');
    expect(screen.getByText('Estimated commission:', { exact: false })).toHaveTextContent('$5,000');
  });

  it('shows a loading state while the quote request is in progress', async () => {
    let resolveQuote: (quote: { QuoteId: string; commissionRate: number; totalCommission: number }) => void;
    mockedGetCommissionQuote.mockReturnValue(new Promise((resolve) => { resolveQuote = resolve; }));
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Generate quote' }));
    expect(screen.getByRole('button', { name: 'Generating quote...' })).toBeDisabled();

    resolveQuote!({ QuoteId: 'quote-2', commissionRate: 0.04, totalCommission: 4000 });
    await waitFor(() => expect(screen.getByText('Quote result')).toBeInTheDocument());
  });

  it('hides old results and shows an error when the API request fails', async () => {
    const user = userEvent.setup();
    mockedGetCommissionQuote.mockRejectedValue(new Error('Request failed'));
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Generate quote' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unable to generate a commission quote.'));
    expect(screen.queryByText('Quote result')).not.toBeInTheDocument();
  });
});