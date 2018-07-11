import { Component, OnInit, OnDestroy } from '@angular/core';
import { PantallaService } from '../services/pantalla.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { WebSocketService } from '../../../services/websocket.serivice';

@Component({
    templateUrl: 'pantallas.html'
})
export class PantallasComponent implements OnInit, OnDestroy  {
    private sub;

    get pantallas () {
        return this.pantallasService.pantallas;
    }

    get muestraAcciones () {
        return !this.pantallasService.selected;
    }

    constructor(
        public pantallasService: PantallaService,
        private route: ActivatedRoute,
        private router: Router,
        private ws: WebSocketService
    ) {}

    ngOnInit () {
        let temp, id;
        this.ws.join('turnero');
        this.sub = this.ws.events.subscribe(( {event, data} ) => {
            switch (event) {
                case 'turnero-activated':
                    id = data.id;
                    temp = this.pantallas.find(item => item.id === id);
                    if (temp) {
                        temp.token = null;
                        temp.expirationTime = null;
                    }
                    break;
                case 'turnero-update':
                        id = data.pantalla.id;
                        temp = this.pantallas.find(item => item.id === id);
                        if (temp) {
                            Object.assign(temp, data.pantalla);
                        }
                    break;
                case 'turnero-create':
                    const { pantalla } = data;
                    let i = this.pantallas.findIndex(item => item.id === pantalla.id);
                    if (i < 0) {
                        this.pantallas.push(pantalla);
                    }
                    break;
                case 'turnero-remove':
                    let index = this.pantallas.findIndex(item => item.id === data.id);
                    if (index >= 0) {
                        this.pantallas.splice(index, 1);
                        this.pantallasService.pantallas = [...this.pantallasService.pantallas];
                    }
                    break;
            }
        });
        this.pantallasService.list();
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
        this.ws.leave('turnero');
    }

    vencido (expirationTime) {
        return moment(expirationTime).isBefore(moment());
    }

    edit (pantalla) {
        // this.pantallasService.select(pantalla.id);
        this.router.navigate(['/turnero/edit/' + pantalla.id]);
    }

    renovar (pantalla) {
        this.pantallasService.retoken(pantalla). subscribe(() => {});
    }

    nueva () {
        this.router.navigate(['/turnero/create']);
    }

    eliminar (p) {
        this.pantallasService.remove(p).subscribe(() => {

        });
    }

}
