/*
 * Public API Surface of shared
 */
export * from './lib/server/server.service';
export * from './lib/server/error-handler.service';
export * from './lib/server/resource-base';
export * from './lib/decorator/cache';
export * from './lib/decorator/unsubscribe';
export * from './lib/shared.module';
export * from './lib/decorator/observe';
export * from './lib/operators';
export * from './lib/navigations';
export * from './lib/directives/autosave.directives';
export * from './lib/components/galeria-archivos/galeria-archivos.component';
export * from './lib/pipes/edad.pipe';
export * from './lib/components/notas/notas.component';
export * from './lib/components/popover-audit/popover-audit.component';

// Pipes públicos del SharedModule
export * from './lib/pipes/fecha.pipe';
export * from './lib/pipes/hora.pipe';
export * from './lib/pipes/enumerar.pipe';
export * from './lib/pipes/fromNow.pipe';
export * from './lib/pipes/html.pipe';
export * from './lib/pipes/nombre.pipe';
export * from './lib/pipes/pluralizar.pipe';
export * from './lib/pipes/documento.pipe';
export * from './lib/pipes/capitalizeFirst.pipe';
export * from './lib/pipes/truncate.pipe';