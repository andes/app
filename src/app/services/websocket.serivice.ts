import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

@Injectable()
export class WebSocketService {
    public socket;
    public token = null;
    public events: Observable<any>;

    public messages = [];

    constructor () {
        this.socket = io(environment.WS);
        this.events = new Observable(observer => {

            this.messages.forEach((event) => {
                this.socket.on(event, (data) => {
                    observer.next({event, data});
                });
            });

            return () => {
                this.socket.disconnect();
            };
        });
        this.socket.on('connect', () => {
            if (this.token) {
                this.auth(this.token);
            }
        });
        this.socket.on('auth', (data) => {
            if (data.status === 'error') {
                // Nada por ahora
            }
        });
    }

    emit(event, data) {
        this.socket.emit(event, data);
    }

    auth (token) {
        this.token = token;
        this.emit('auth', { token });
    }



}
