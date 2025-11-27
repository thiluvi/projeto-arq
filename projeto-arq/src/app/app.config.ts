import { ApplicationConfig, LOCALE_ID } from '@angular/core'; // <--- Importe LOCALE_ID
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { registerLocaleData } from '@angular/common'; // <--- Importe registerLocaleData
import localePt from '@angular/common/locales/pt';    // <--- Importe o locale PT

import { routes } from './app.routes';

// Registra o idioma português
registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    
    // Define o PT-BR como padrão para todo o projeto (Pipes de Data, Moeda, etc)
    { provide: LOCALE_ID, useValue: 'pt-BR' } 
  ]
};