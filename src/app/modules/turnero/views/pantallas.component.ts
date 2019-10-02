import { Component, OnInit, OnDestroy } from '@angular/core';
import { PantallaService } from '../services/pantalla.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { WebSocketService } from '../../../services/websocket.service';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';

@Component({
    templateUrl: 'pantallas.html'
})
export class PantallasComponent implements OnInit, OnDestroy {
    private sub;
    public mostrarDetalle = false;
    pantalla = null;

    get pantallas() {
        return this.pantallasService.pantallas;
    }

    get muestraAcciones() {
        // return !this.pantallasService.selected;
        return !this.pantalla;
    }

    constructor(
        public pantallasService: PantallaService,
        private router: Router,
        private ws: WebSocketService,
        private auth: Auth,
        private plex: Plex
    ) { }

    ngOnInit() {
        this.plex.updateTitle('Configuración de turneros');
        let temp;
        this.ws.connect();
        this.ws.join(`turnero-${this.auth.organizacion.id}`);
        this.sub = this.ws.events.subscribe(({ event, data }) => {
            let { pantalla } = data;
            switch (event) {
                case 'turnero-activated':
                    temp = this.pantallas.find(item => item.id === pantalla.id);
                    if (temp) {
                        temp.token = null;
                        temp.expirationTime = null;
                    }
                    break;
                case 'turnero-update':
                    temp = this.pantallas.find(item => item.id === pantalla.id);
                    if (temp) {
                        Object.assign(temp, data.pantalla);
                    }
                    break;
                case 'turnero-create':
                    let i = this.pantallas.findIndex(item => item.id === pantalla.id);
                    if (i < 0) {
                        this.pantallas.push(pantalla);
                    }
                    break;
                case 'turnero-remove':
                    let index = this.pantallas.findIndex(item => item.id === pantalla.id);
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
        this.ws.disconnect();
    }

    vencido(expirationTime) {
        return moment(expirationTime).isBefore(moment());
    }

    edit(pantalla) {
        this.pantalla = pantalla;
        this.mostrarDetalle = true;
        this.router.navigate(['/turnero/edit/' + pantalla.id]);
    }

    renovar(pantalla) {
        this.pantallasService.retoken(pantalla).subscribe(() => { });
    }

    nueva() {
        this.pantalla = {
            nombre: '',
            espaciosFisicos: []
        };
        this.mostrarDetalle = true;
        this.router.navigate(['/turnero/create']);
    }

    eliminar(p) {
        this.plex.confirm('Eliminar pantalla "' + p.nombre + '"', '¿Desea eliminar?').then(x => {
            if (x) {
                this.pantallasService.remove(p).subscribe(() => { });
            }
        });
    }

    ocultarDetalle() {
        this.mostrarDetalle = false;
        this.pantalla = null;
    }

}
