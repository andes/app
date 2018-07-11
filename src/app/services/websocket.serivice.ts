import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';
import * as Wildcard from 'socketio-wildcard';

@Injectable()
export class WebSocketService {
    public socket;
    public token = null;
    public events: Observable<any>;

    constructor () {
        let patch = Wildcard(io.Manager);
        this.socket = io(environment.WS);
        patch(this.socket);
        this.events = new Observable(observer => {

            this.socket.on('*', packet => {
                let data = packet.data;
                observer.next({ event: data[0], data: data[1] });
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

    join (room) {
        this.socket.emit('room', { name: room });
    }

    leave (room) {
        this.socket.emit('leave', { name: room });
    }

}
