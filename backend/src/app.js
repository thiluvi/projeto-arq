import 'dotenv/config'; // Caso use variáveis de ambiente
import express from 'express';
import cors from 'cors';
import { adicionarRotas } from './rotas.js';

const servidor = express();

servidor.use(cors());
servidor.use(express.json());

adicionarRotas(servidor);

const PORTA = process.env.PORT || 5010;
servidor.listen(PORTA, () => console.log(`--> API subiu na porta ${PORTA}`));