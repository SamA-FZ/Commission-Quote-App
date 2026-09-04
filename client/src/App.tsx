import { FormEvent, useState } from 'react';
import { Alert, AppBar, Box, Button, Container, CssBaseline, FormControlLabel, InputAdornment, MenuItem, Paper, Stack, Switch, TextField, ThemeProvider, Toolbar, Typography, createTheme } from '@mui/material';
import { CommissionQuoteResponse } from './types/commission';
import { getCommissionQuote } from './util/api.tsx';

const riskBands = [
  { label: 'Low risk', value: 1 },
  { label: 'Medium risk', value: 2 },
  { label: 'High risk', value: 3 },
  { label: 'Critical risk', value: 4 }
];

const DEFAULT_LOAN_AMOUNT = 100000;
const DEFAULT_LOAN_TERM = 60;
const DEFAULT_RISK_BAND = 1;
const MAX_LOAN_AMOUNT = 10_000_000;
const MAX_LOAN_TERM = 480;

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [loanAmount, setLoanAmount] = useState(DEFAULT_LOAN_AMOUNT);
  const [loanTerm, setLoanTerm] = useState(DEFAULT_LOAN_TERM);
  const [riskBand, setRiskBand] = useState(DEFAULT_RISK_BAND);
  const [commissionQuote, setCommissionQuote] = useState<CommissionQuoteResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!Number.isFinite(loanAmount) || loanAmount < 1 || loanAmount > MAX_LOAN_AMOUNT) {
      setCommissionQuote(null);
      setError('Loan amount must be between $1 and $10,000,000.');
      return;
    }

    if (!Number.isInteger(loanTerm) || loanTerm < 1 || loanTerm > MAX_LOAN_TERM) {
      setCommissionQuote(null);
      setError('Loan term must be a whole number between 1 and 480 months.');
      return;
    }

    if (!Number.isInteger(riskBand) || riskBand < 1 || riskBand > 4) {
      setCommissionQuote(null);
      setError('Risk band must be a whole number between 1 and 4.');
      return;
    }

    try {
      setLoading(true);
      setCommissionQuote(await getCommissionQuote(loanAmount, loanTerm, riskBand));
    } catch {
      setCommissionQuote(null);
      setError('Unable to generate a commission quote.');
    } finally {
      setLoading(false);
    }
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#bf1e2e' },
      background: { default: darkMode ? '#1b1b1b' : '#f5f4f2', paper: darkMode ? '#292929' : '#ffffff' }
    },
    typography: { fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif' }
  });

  const hasQuote = commissionQuote?.commissionRate != null && commissionQuote.totalCommission != null;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar color="inherit" elevation={0} position="static" sx={{ bgcolor: '#242424', borderBottom: '4px solid #bf1e2e', color: 'white' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: '68px !important', gap: 1.25 }}>
            <Box aria-hidden="true" sx={{ alignItems: 'center', bgcolor: 'white', borderRadius: '50%', color: '#bf1e2e', display: 'grid', fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 700, height: 30, placeItems: 'center', width: 30 }}>C</Box>
            <Typography component="span" fontWeight={700}>Commission Quote</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <FormControlLabel control={<Switch checked={darkMode} color="default" onChange={(event) => setDarkMode(event.target.checked)} />} label="Dark mode" sx={{ mr: 0 }} />
          </Toolbar>
        </Container>
      </AppBar>
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, sm: 5 } }}>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 620px) minmax(280px, 1fr)' }, alignItems: 'start' }}>
        <Paper component="section" elevation={2} sx={{ border: '1px solid #d5d1cb', borderTop: '5px solid #bf1e2e', p: { xs: 2.5, sm: 3.75 } }}>
          <Stack spacing={0.75}>
            <Typography color="#bf1e2e" fontSize="0.78rem" fontWeight={700} letterSpacing="0.08em" textTransform="uppercase">Loan services</Typography>
            <Typography component="h1" fontFamily="Georgia, serif" fontSize={{ xs: '1.65rem', sm: '2rem' }} fontWeight={400}>Generate a commission quote</Typography>
            <Typography color="text.secondary">Enter the loan details below to calculate the estimated commission.</Typography>
          </Stack>
          <Stack component="form" noValidate onSubmit={handleSubmit} spacing={2} sx={{ mt: 3 }}>
            <TextField disabled={loading} fullWidth inputProps={{ min: 1, max: MAX_LOAN_AMOUNT, step: 1 }} label="Loan amount" onChange={(event) => setLoanAmount(Number(event.target.value))} required slotProps={{ input: { startAdornment: <InputAdornment position="start">$</InputAdornment> } }} type="number" value={loanAmount} />
            <TextField disabled={loading} fullWidth inputProps={{ min: 1, max: MAX_LOAN_TERM, step: 1 }} label="Loan term (months)" onChange={(event) => setLoanTerm(Number(event.target.value))} required type="number" value={loanTerm} />
            <TextField disabled={loading} fullWidth label="Risk band" onChange={(event) => setRiskBand(Number(event.target.value))} required select value={riskBand}>
              {riskBands.map(({ label, value }) => <MenuItem key={value} value={value}>{label}: {value}</MenuItem>)}
            </TextField>
            <Button disabled={loading} sx={{ alignSelf: 'start', bgcolor: '#bf1e2e', borderRadius: 0, minHeight: 48, px: 3, '&:hover': { bgcolor: '#941525' } }} type="submit" variant="contained">{loading ? 'Generating quote...' : 'Generate quote'}</Button>
          </Stack>
         
          {error && <Alert severity="error" sx={{ mt: 2.25 }}>{error}</Alert>}
        </Paper>
          {hasQuote && (
            <Paper component="section" elevation={2} sx={{ border: '1px solid #d5d1cb', borderTop: '5px solid #bf1e2e', p: { xs: 2.5, sm: 3.75 } }}>
              <Typography color="text.secondary" fontSize="0.78rem" fontWeight={700} letterSpacing="0.08em" textTransform="uppercase">Quote result</Typography>
              <Alert icon={false} severity="success" sx={{ mt: 1.5 }}>
                <Stack spacing={1}>
                  <Typography>Commission rate: <strong>{(commissionQuote.commissionRate * 100).toFixed(2)}%</strong></Typography>
                  <Typography>Estimated commission: <strong>${commissionQuote.totalCommission.toLocaleString()}</strong></Typography>
                </Stack>
              </Alert>
            </Paper>
          )}
        </Box>
      </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;