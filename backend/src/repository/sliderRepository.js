import { connection } from "./connection.js";

export async function salvarImagem(titulo, caminho) {
    const comando = `INSERT INTO slider (titulo, caminho_imagem, ativo) VALUES (?, ?, true)`;
    const [info] = await connection.query(comando, [titulo, caminho]);
    return info.insertId;
}

export async function listarImagens() {
    const comando = `SELECT * FROM slider WHERE ativo = true`;
    const [linhas] = await connection.query(comando);
    return linhas;
}

export async function deletarImagem(id) {
    const comando = `DELETE FROM slider WHERE id = ?`;
    await connection.query(comando, [id]);
}