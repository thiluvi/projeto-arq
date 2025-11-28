import { Router } from 'express';
import * as repo from '../repository/mensagemRepository.js';
import { getAuthentication } from '../utils/jwt.js';

const endpoints = Router();
const autenticar = getAuthentication();

// USUÁRIO: Envia mensagem para o Admin
endpoints.post('/chat/usuario', autenticar, async (req, resp) => {
  try {
    let idUsuario = req.user.id; // Pega do token
    let { texto } = req.body;
    await repo.enviarMensagem(idUsuario, 'user', texto);
    resp.send();
  } catch (err) { resp.status(400).send({ erro: err.message }); }
});

// USUÁRIO: Pega suas mensagens
endpoints.get('/chat/usuario', autenticar, async (req, resp) => {
  try {
    let msgs = await repo.listarMensagens(req.user.id);
    resp.send(msgs);
  } catch (err) { resp.status(400).send({ erro: err.message }); }
});

// ADMIN: Lista conversas
endpoints.get('/chat/admin/conversas', autenticar, async (req, resp) => {
  try {
    if (req.user.role !== 'admin') return resp.status(403).send({ erro: 'Sem permissão' });
    let conversas = await repo.listarConversas();
    resp.send(conversas);
  } catch (err) { resp.status(400).send({ erro: err.message }); }
});

// ADMIN: Pega mensagens de um cliente específico
endpoints.get('/chat/admin/:idUsuario', autenticar, async (req, resp) => {
  try {
    if (req.user.role !== 'admin') return resp.status(403).send({ erro: 'Sem permissão' });
    let msgs = await repo.listarMensagens(req.params.idUsuario);
    resp.send(msgs);
  } catch (err) { resp.status(400).send({ erro: err.message }); }
});

// ADMIN: Responde um cliente
endpoints.post('/chat/admin/:idUsuario', autenticar, async (req, resp) => {
  try {
    if (req.user.role !== 'admin') return resp.status(403).send({ erro: 'Sem permissão' });
    let { texto } = req.body;
    await repo.enviarMensagem(req.params.idUsuario, 'admin', texto);
    resp.send();
  } catch (err) { resp.status(400).send({ erro: err.message }); }
});

export default endpoints;