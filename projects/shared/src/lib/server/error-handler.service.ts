/* eslint-disable no-bitwise */
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable } from '@angular/core';
import { EMPTY, Subject } from 'rxjs';
import { catchError, distinct, map, mergeMap } from 'rxjs/operators';
import { Server } from './server.service';

@Injectable()
export class ServerErrorHandler implements ErrorHandler {

    private buffer = new Subject<Error>();

    stringToHash(string) {

        let hash = 0;

        if (!string || string.length === 0) {
            return hash;
        }

        for (let i = 0; i < string.length; i++) {
            const char = string.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        return hash;
    }

    constructor(private server: Server) {
        this.buffer.pipe(
            // Para no postear N veces el mismo error
            map(error => [error, this.stringToHash(error.stack || error.message)]),
            distinct(datos => datos[1]),
            map(datos => datos[0]),
            mergeMap((error: Error) => {
                return this.server.post('/core/log/error', {
                    message: error.message,
                    stack: error.stack
                }, {
                    // El registro de errores no debe generar nuevas ventanas.
                    showError: false,
                    showLoader: false
                }).pipe(
                    // Un error de logging no debe finalizar el manejador global.
                    catchError((logError) => {
                        console.warn('No se pudo registrar el error en el servidor', logError);
                        return EMPTY;
                    })
                );
            })
        ).subscribe();
    }


    handleError(error: unknown) {
        // eslint-disable-next-line no-console
        console.error(error);
        if (error instanceof HttpErrorResponse) {
            return;
        } else if (error instanceof Error) {
            const chunkFailedMessage = /Loading chunk [\d]+ failed/;
            if (chunkFailedMessage.test(error.message)) {
                alert('Hay una nueva versión de la aplicación.');
                window.location.reload();
            } else {
                this.buffer.next(error);
            }
        } else {
            // Normalizamos errores que no son instancias de Error para evitar
            // fallos en la generación del hash y conservar su información.
            let message: string;

            if (typeof error === 'string') {
                message = error;
            } else {
                try {
                    message = JSON.stringify(error) || String(error);
                } catch {
                    message = String(error);
                }
            }

            this.buffer.next({
                message,
                stack: ''
            } as Error);
        }
    }
}
