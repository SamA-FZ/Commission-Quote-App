// Interface representing a commission quote 
// Loan amount is in dollars, 
// loan term is in months, 
// riskband is a string representing the risk category of the loan,
// QuoteId is a unique identifier for the generated commission quote
// commissionRate is the rate of commission applied to the loan
// totalCommission is the total commission amount calculated based on the loan amount and commission rate
export interface CommissionQuote {
    loanAmount: number;
    loanTermInMonths: number;
    riskBand: number;
    QuoteId: string;
    commissionRate: number;
    totalCommission: number;
}

function commissionRateCalculation(riskband: number): number {
    const commissionRates: Record<number, number> = {
        1: 0.06,
        2: 0.05,
        3: 0.04,
        4: 0.03
    };
    const commissionRate = commissionRates[riskband];

    if (commissionRate === undefined) {
        throw new Error('Invalid risk band');
    }

    return commissionRate;
}

function generateUniqueId(): string {
    // Generates a random uuid
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function generateCommissionQuote(loanAmount: number, loanTerm: number, riskband: number): CommissionQuote {
    const loanGenerationId = generateUniqueId();
    try {

        if (
            !Number.isFinite(loanAmount) || loanAmount <= 0 ||
            !Number.isInteger(loanTerm) || loanTerm <= 0 ||
            !Number.isInteger(riskband) || riskband < 1 || riskband > 4
        ) {
            throw new Error('Invalid input parameters for generating commission quote');
        }

        if (Math.random() < 0.1) {
            throw new Error('Simulated quote generation failure');
        }

        return {
            loanAmount,
            loanTermInMonths: loanTerm,
            riskBand: riskband,
            QuoteId: loanGenerationId,
            commissionRate: commissionRateCalculation(riskband),
            totalCommission: loanAmount * commissionRateCalculation(riskband)
        };
    } catch (error) {
        console.error('Error generating commission quote:', error);
        throw new Error('Failed to generate commission quote');
    }
    }
