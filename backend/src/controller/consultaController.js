import { Router } from 'express';
import * as repo from '../repository/consultaRepository.js';
import { getAuthentication } from '../utils/jwt.js';

const endpoints = Router();
const autenticar = getAuthentication();

// 1. CLIENTE: Agendar nova consulta
endpoints.post('/consulta', autenticar, async (req, resp) => {
    try {
        let consulta = req.body;
        consulta.idUsuario = req.user.id; 
        
        // Tratamento de Data (Tira o T e garante segundos)
        if (consulta.data && consulta.data.includes('T')) {
            consulta.data = consulta.data.replace('T', ' ');
        }
        if (consulta.data && consulta.data.length === 16) {
             consulta.data += ':00';
        }

        let id = await repo.agendarConsulta(consulta);
        resp.send({ novoId: id });
    } catch (err) {
        resp.status(400).send({ erro: err.message });
    }
});

// 2. LISTAGEM (Inteligente: Admin vê tudo, User vê só o dele)
endpoints.get('/consulta', autenticar, async (req, resp) => {
    try {
        if (req.user.role === 'admin') {
            let todas = await repo.listarTodasConsultas();
            resp.send(todas);
        } else {
            let minhas = await repo.listarConsultasUsuario(req.user.id);
            resp.send(minhas);
        }
    } catch (err) {
        resp.status(400).send({ erro: err.message });
    }
});

// 3. CLIENTE: Editar sua própria consulta (Data/Observação)
endpoints.put('/consulta/:id', autenticar, async (req, resp) => {
    try {
        // Se for admin tentando usar essa rota, bloqueamos ou redirecionamos,
        // mas aqui vamos focar no Usuário Comum alterando seus dados.
        
        let id = req.params.id;
        let idUsuario = req.user.id;
        let dados = req.body;

        // Tratamento de Data
        if (dados.data && dados.data.includes('T')) {
            dados.data = dados.data.replace('T', ' ');
        }
        if (dados.data && dados.data.length === 16) {
             dados.data += ':00';
        }

        let linhasAfetadas = await repo.atualizarConsulta(id, idUsuario, dados);
        
        // Se não afetou nada, é porque a consulta não é desse usuário
        if (linhasAfetadas === 0) {
            return resp.status(403).send({ erro: 'Você não tem permissão para alterar esta consulta.' });
        }

        resp.send();
    } catch (err) {
        resp.status(400).send({ erro: err.message });
    }
});

// 4. ADMIN: Alterar Status (Aprovar/Recusar) -> Rota Específica
endpoints.put('/consulta/:id/status', autenticar, async (req, resp) => {
    try {
        // Trava de segurança: Só admin passa
        if (req.user.role !== 'admin') 
            return resp.status(403).send({ erro: 'Não autorizado' });

        await repo.atualizarStatus(req.params.id, req.body.status);
        resp.send();
    } catch (err) {
        resp.status(400).send({ erro: err.message });
    }
});

// 5. CLIENTE: Excluir consulta
endpoints.delete('/consulta/:id', autenticar, async (req, resp) => {
    try {
        let id = req.params.id;
        let idUsuario = req.user.id;

        await repo.excluirConsulta(id, idUsuario);
        resp.send();
    } catch (err) {
        resp.status(400).send({ erro: err.message });
    }
});

export default endpoints;