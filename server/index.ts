import 'dotenv/config';
import cors from 'cors';
import express, { Request, Response } from 'express';
import generationRouter from './routes/generation';

export default function startServer() {
  const app = express();
  const port = process.env.PORT || 4000;

  app.use(cors());
  app.use(express.json());
  app.use((req, res, next) => {
    const startedAt = Date.now();

    res.on('finish', () => {
      console.info(`[http] ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms`);
    });

    next();
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));
  }

  app.get('/api' , (req: Request, res: Response) => {
    res.json({ message: 'Server is running!' });
  });

  app.use('/api/commission', generationRouter);

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

startServer();