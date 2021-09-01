/* eslint-disable no-bitwise */
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { distinct, map, switchMap } from 'rxjs/operators';
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
            map(error => [error, this.stringToHash(error.stack)]),
            distinct(datos => datos[1]),
            map(datos => datos[0]),
            switchMap((error: Error) => {
                return this.server.post('/core/log/error', {
                    message: error.message,
                    stack: error.stack
                });
            })
        ).subscribe();

    }


    handleError(error: Error | HttpErrorResponse | string) {
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
            this.buffer.next({ message: error, stack: '' } as any);
        }
    }
}
