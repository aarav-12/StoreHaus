import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';


const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Initialize OpenAI with your key from .env

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
