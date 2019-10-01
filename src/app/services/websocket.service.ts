import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import * as io from 'socket.io-client';
import * as Wildcard from 'socketio-wildcard';

@Injectable()
export class WebSocketService {
    public autheticated = false;
    public socket;
    public token = null;
    public events: Subject<any>;
    public rooms: String[] = [];

    constructor() {
    }

    connect() {
        let patch = Wildcard(io.Manager);
        this.socket = io(environment.WS);
        patch(this.socket);
        this.events = new Subject();

        this.socket.on('*', packet => {
            let data = packet.data;
            this.events.next({ event: data[0], data: data[1] });
        });


        this.socket.on('connect', () => {
            if (this.token) {
                this.emitAuth();
            }
        });

        this.socket.on('disconnect', () => {
            this.autheticated = false;
        });

        this.socket.on('auth', (data) => {
            if (data.status !== 'error') {
                this.autheticated = true;
                this.rooms.forEach((room) => {
                    this.socket.emit('room', { name: room });
                });
            }
        });
    }

    disconnect() {
        this.socket.disconnect();
    }

    emit(event, data) {
        this.socket.emit(event, data);
    }


    setToken(token) {
        this.token = token;
    }

    emitAuth() {
        this.emit('auth', { token: this.token });
    }

    join(room) {
        const index = this.rooms.findIndex(name => name === room);
        if (index < 0) {
            this.rooms.push(room);
            if (this.autheticated) {
                this.socket.emit('room', { name: room });
            }
        }
    }

    leave(room) {
        this.emit('leave', { name: room });
        const index = this.rooms.findIndex(name => name === room);
        if (index < 0) {
            this.rooms.splice(index, 1);
        }
    }

    close() {
        this.token = null;
        if (this.socket) {
            this.socket.close();
        }
    }

}
