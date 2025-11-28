import { connection } from "./connection.js";

export async function consultarCredenciais(email, senha) {
  const comando = `
    SELECT id, 
           nome, 
           email, 
           role, 
           telefone,
           foto_perfil
      FROM login
     WHERE email = ?
       AND senha = MD5(?)
  `;

  const [registros] = await connection.query(comando, [email, senha]);
  return registros[0];
}

export async function criarConta(usuario) {
  const comando = `
    INSERT INTO login (nome, email, senha, telefone, role, criacao)
    VALUES (?, ?, MD5(?), ?, 'user', NOW());
  `;
  const [info] = await connection.query(comando, [
    usuario.nome,
    usuario.email,
    usuario.senha,
    usuario.telefone
  ]);
  return info.insertId;
}

export async function atualizarFotoPerfil(idUsuario, caminho) {
  const comando = `
    UPDATE login 
       SET foto_perfil = ?
     WHERE id = ?
  `;
  const [info] = await connection.query(comando, [caminho, idUsuario]);
  return info.affectedRows;
}