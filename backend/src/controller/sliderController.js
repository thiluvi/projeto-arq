import { Router } from 'express';
import multer from 'multer';
import * as repo from '../repository/sliderRepository.js';

const endpoints = Router();
// Configura o Multer para salvar na pasta public/storage
const upload = multer({ dest: 'public/storage' });

endpoints.post('/slider', upload.single('imagem'), async (req, resp) => {
    try {
        let caminho = req.file.path; // Caminho salvo pelo Multer
        let titulo = req.body.titulo;
        
        let id = await repo.salvarImagem(titulo, caminho);
        resp.send({ novoId: id });
    } catch (err) {
        resp.status(400).send({ erro: err.message });
    }
});

endpoints.get('/slider', async (req, resp) => {
    try {
        let imagens = await repo.listarImagens();
        resp.send(imagens);
    } catch (err) {
        resp.status(400).send({ erro: err.message });
    }
});

endpoints.delete('/slider/:id', async (req, resp) => {
    try {
        await repo.deletarImagem(req.params.id);
        resp.send();
    } catch (err) {
        resp.status(400).send({ erro: err.message });
    }
});

export default endpoints;