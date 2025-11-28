import { connection } from "./connection.js";

export async function agendarConsulta(consulta) {
    const comando = `
        INSERT INTO consulta (id_usuario, data_consulta, status, observacao)
        VALUES (?, ?, 'Pendente', ?)
    `;
    const [info] = await connection.query(comando, [consulta.idUsuario, consulta.data, consulta.observacao]);
    return info.insertId;
}

export async function listarTodasConsultas() { // Para o Admin
    const comando = `
        SELECT c.id, c.data_consulta, c.status, c.observacao, l.nome, l.email, l.telefone
          FROM consulta c
          JOIN login l ON c.id_usuario = l.id
         ORDER BY c.data_consulta DESC
    `;
    const [linhas] = await connection.query(comando);
    return linhas;
}

export async function listarConsultasUsuario(idUsuario) { // Para o Cliente
    const comando = `
        SELECT id, data_consulta, status, observacao
          FROM consulta
         WHERE id_usuario = ?
         ORDER BY data_consulta DESC
    `;
    const [linhas] = await connection.query(comando, [idUsuario]);
    return linhas;
}

export async function atualizarStatus(id, status) {
    const comando = `UPDATE consulta SET status = ? WHERE id = ?`;
    const [info] = await connection.query(comando, [status, id]);
    return info.affectedRows;
}

export async function atualizarConsulta(id, idUsuario, dados) {
    const comando = `
        UPDATE consulta 
           SET data_consulta = ?, 
               observacao = ?,
               status = 'Pendente'
         WHERE id = ? 
           AND id_usuario = ?
    `;
    
    // O array de parâmetros continua o mesmo, o 'Pendente' é fixo no SQL
    const [info] = await connection.query(comando, [
        dados.data, 
        dados.observacao, 
        id, 
        idUsuario
    ]);
    
    return info.affectedRows;
}

export async function excluirConsulta(id, idUsuario) {
    const comando = `
        DELETE FROM consulta 
         WHERE id = ? 
           AND id_usuario = ? -- Garante que só o dono pode excluir
    `;
    const [info] = await connection.query(comando, [id, idUsuario]);
    return info.affectedRows;
}