import { Router } from "express";
import multer from 'multer';
import * as repo from '../repository/loginRepository.js';
import { generateToken, getAuthentication } from '../utils/jwt.js'; // <--- Importe o getAuthentication

const endpoints = Router();
const autenticar = getAuthentication(); // <--- Middleware de segurança
const upload = multer({ dest: 'public/storage' }); // <--- Configuração do Multer

endpoints.post('/entrar', async (req, resp) => {
  try {
    let { email, senha } = req.body;
    let usuario = await repo.consultarCredenciais(email, senha);
    
    if (usuario) {
      let token = generateToken(usuario);
      resp.send({ token, usuario }); // Retorna dados do usuário junto
    } else {
      resp.status(401).send({ erro: 'Credenciais inválidas' });
    }
  } catch (err) {
    resp.status(400).send({ erro: err.message });
  }
});

endpoints.post('/cadastrar', async (req, resp) => {
  try {
    let novoUsuario = req.body;
    let id = await repo.criarConta(novoUsuario);
    resp.send({ novoId: id });
  } catch (err) {
    resp.status(400).send({ erro: err.message });
  }
});

endpoints.put('/usuario/foto', autenticar, upload.single('foto'), async (req, resp) => {
  try {
    if (!req.file) {
      throw new Error('Nenhum arquivo enviado.');
    }

    let idUsuario = req.user.id;
    let caminho = req.file.path;

    await repo.atualizarFotoPerfil(idUsuario, caminho);

    resp.send({ 
      novoCaminho: caminho 
    });

  } catch (err) {
    resp.status(400).send({ erro: err.message });
  }
});

export default endpoints;