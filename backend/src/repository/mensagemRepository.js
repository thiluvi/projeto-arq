import { connection } from "./connection.js";

// Salva uma mensagem (seja do user ou do admin)
export async function enviarMensagem(idUsuario, remetente, texto) {
  const comando = `
    INSERT INTO mensagem (id_usuario, remetente, texto, data_envio)
    VALUES (?, ?, ?, NOW())
  `;
  const [info] = await connection.query(comando, [idUsuario, remetente, texto]);
  return info.insertId;
}

// Lista as mensagens de um usuário específico (para o chat)
export async function listarMensagens(idUsuario) {
  const comando = `
    SELECT * FROM mensagem 
     WHERE id_usuario = ? 
     ORDER BY data_envio ASC
  `;
  const [linhas] = await connection.query(comando, [idUsuario]);
  return linhas;
}

// ADMIN: Lista todos os usuários que têm mensagens (para montar a lista de conversas)
export async function listarConversas() {
  const comando = `
    SELECT u.id, u.nome, u.foto_perfil,
           (SELECT texto FROM mensagem WHERE id_usuario = u.id ORDER BY data_envio DESC LIMIT 1) as ultima_msg,
           (SELECT data_envio FROM mensagem WHERE id_usuario = u.id ORDER BY data_envio DESC LIMIT 1) as data_ultima
      FROM login u
      JOIN mensagem m ON u.id = m.id_usuario
     WHERE u.role != 'admin'
     GROUP BY u.id
     ORDER BY data_ultima DESC
  `;
  const [linhas] = await connection.query(comando);
  return linhas;
}