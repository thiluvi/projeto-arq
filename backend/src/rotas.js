import express from 'express';
import loginController from './controller/loginController.js';
import consultaController from './controller/consultaController.js';
import sliderController from './controller/sliderController.js';
import mensagemController from './controller/mensagemController.js';

export function adicionarRotas(api) {
  api.use(loginController);
  api.use(consultaController);
  api.use(sliderController);
  api.use(mensagemController);
  
  // Libera o acesso às fotos salvas para o Angular conseguir mostrar
  api.use('/public/storage', express.static('public/storage'));
}