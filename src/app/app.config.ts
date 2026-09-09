import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { proveedoresTiempo } from './infrastructure/di/providers';
import { ManejadorErrorGlobal } from './ui/core/error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    ...proveedoresTiempo,
    { provide: ManejadorErrorGlobal, useClass: ManejadorErrorGlobal },
    { provide: ErrorHandler, useExisting: ManejadorErrorGlobal },
  ],
};
