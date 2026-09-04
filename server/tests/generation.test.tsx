import express from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateCommissionQuote } from '../util/service';

const API_KEY = 'test-api-key';

describe('generateCommissionQuote', () => {
	beforeEach(() => {
		vi.spyOn(Math, 'random').mockReturnValue(0.5);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it.each([
		[1, 0.06],
		[2, 0.05],
		[3, 0.04],
		[4, 0.03]
	])('uses a %s risk band rate of %s', (riskBand, expectedRate) => {
		const quote = generateCommissionQuote(100000, 60, riskBand);

		expect(quote).toMatchObject({
			loanAmount: 100000,
			loanTermInMonths: 60,
			riskBand,
			commissionRate: expectedRate,
			totalCommission: 100000 * expectedRate
		});
		expect(quote.QuoteId).toMatch(/^[a-f0-9-]{36}$/);
	});

	it.each([0, 5, -1, 1.5])('rejects invalid risk band %s', (riskBand) => {
		expect(() => generateCommissionQuote(100000, 60, riskBand)).toThrow('Failed to generate commission quote');
	});

	it('fails quote generation when the simulated failure threshold is reached', () => {
		vi.spyOn(Math, 'random').mockReturnValue(0.05);

		expect(() => generateCommissionQuote(100000, 60, 1)).toThrow('Failed to generate commission quote');
	});
});

describe('GET /api/commission/quote', () => {
	beforeEach(() => {
		process.env.COMMISSION_QUOTE_API_KEY = API_KEY;
		vi.resetModules();
	});

	async function createApp() {
		const { default: generationRouter } = await import('../routes/generation');
		const app = express();
		app.use('/api/commission', generationRouter);
		return app;
	}

	it('rejects a request without an API key', async () => {
		const app = await createApp();
		const response = await request(app).get('/api/commission/quote?loanAmount=100000&loanTerm=60&riskBand=1');

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ msg: 'Invalid API key' });
	});

	it('rejects a request with an invalid API key', async () => {
		const app = await createApp();
		const response = await request(app).get('/api/commission/quote?loanAmount=100000&loanTerm=60&riskBand=1').set('X-API-Key', 'wrong-key');

		expect(response.status).toBe(401);
	});

	it('rejects missing, fractional, and out-of-range quote values', async () => {
		const app = await createApp();
		const invalidRequests = [
			'/api/commission/quote?loanAmount=100000&loanTerm=60',
			'/api/commission/quote?loanAmount=-1&loanTerm=60&riskBand=1',
			'/api/commission/quote?loanAmount=100000&loanTerm=60.5&riskBand=1',
			'/api/commission/quote?loanAmount=100000&loanTerm=60&riskBand=5',
			'/api/commission/quote?loanAmount=10000001&loanTerm=60&riskBand=1'
		];

		for (const path of invalidRequests) {
			const response = await request(app).get(path).set('X-API-Key', API_KEY);
			expect(response.status).toBe(400);
		}
	});

	it('returns a complete quote for valid authenticated input', async () => {
		const app = await createApp();
		const response = await request(app)
			.get('/api/commission/quote?loanAmount=100000&loanTerm=60&riskBand=2')
			.set('X-API-Key', API_KEY);

		expect(response.status).toBe(200);
		expect(response.body.quote).toMatchObject({
			loanAmount: 100000,
			loanTermInMonths: 60,
			riskBand: 2,
			commissionRate: 0.05,
			totalCommission: 5000
		});
		expect(response.body.quote.QuoteId).toMatch(/^[a-f0-9-]{36}$/);
	});
});
