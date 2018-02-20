import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { environment } from '../../environments/environment';
import * as io from 'socket.io-client';

@Injectable()
export class TurneroService {

    private turneroUrl = '/modules/turnero/';  // URL to web api
    private url = 'http://localhost:3002';
    private socket;

    constructor(private server: Server) { }


    get(params: any): Observable<any> {
        return this.server.get(this.turneroUrl, {params: params, showError: true});
    }


    post(turno): Observable<any> {
        console.log(turno);
        this.socket.emit('proximoNumero', turno);
        return this.server.post(this.turneroUrl + 'insert', turno); // ...using post request
    }

    getTurno(datos): any {
        console.log(datos)
        let observable = new Observable(observer => {
            
            this.socket = io(this.url);

            
// let's assume that the client page, once rendered, knows what room it wants to join
var room = "pantalla1";

this.socket.data = "hola";
   // Connected, let's sign-up for to receive messages for this room
   this.socket.emit('room', datos);


            this.socket.on('muestraTurno', (data) => {
                observer.next(data);
            });

            return () => {
                this.socket.disconnect();
            };
        });
        return observable;
    }


    // getTurno(datos): any {
    //     console.log(datos)
    //     let observable = new Observable(observer => {
    //         this.socket = io(this.url);

    //             this.socket.emit('datosPantalla', datos);

    //         this.socket.on(datos.pantalla, (data) => {
    //             observer.next(data);
    //         });

    //         return () => {
    //             this.socket.disconnect();
    //         };
    //     });
    //     return observable;
    // }

}
