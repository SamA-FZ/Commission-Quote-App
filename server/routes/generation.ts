import express from 'express';
import { z } from 'zod';
import { generateCommissionQuote } from '../util/service';
import { ensureAuthenticated } from '../util/authentication';

const router = express.Router();
const quoteQuerySchema = z.object({
    loanAmount: z.coerce.number().finite().positive().max(10_000_000),
    loanTerm: z.coerce.number().int().min(1).max(480),
    riskBand: z.coerce.number().int().min(1).max(4)
});

router.get('/quote', ensureAuthenticated, (req, res) => {
    const validation = quoteQuerySchema.safeParse(req.query);
    if (!validation.success) {
        return res.status(400).send({
            error: 'Invalid quote parameters. Loan amount must be between $1 and $10,000,000; term between 1 and 480 months; risk band between 1 and 4.'
        });
    }

    try {
        const { loanAmount, loanTerm, riskBand } = validation.data;
        const quote = generateCommissionQuote(loanAmount, loanTerm, riskBand);
        return res.status(200).send({quote: quote});
    } catch (error) {
        return res.status(400).send({ error: 'Unable to generate a commission quote.' });
    }
});


export default router;