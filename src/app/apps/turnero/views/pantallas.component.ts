import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import moment from 'moment';
import { WebSocketService } from '../../../services/websocket.service';
import { PantallaService } from '../services/pantalla.service';


@Component({
    templateUrl: 'pantallas.html',
    styleUrls: ['pantallas.scss'],
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
        this.plex.updateTitle('Configuración de pantallas interactivas');
        let temp;
        this.ws.connect();
        this.ws.join(`turnero-${this.auth.organizacion}`);
        this.sub = this.ws.events.subscribe(({ event, data }) => {
            const { pantalla } = data;
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
                const i = this.pantallas.findIndex(item => item.id === pantalla.id);
                if (i < 0) {
                    this.pantallas.push(pantalla);
                }
                break;
            case 'turnero-remove':
                const index = this.pantallas.findIndex(item => item.id === pantalla.id);
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
        this.router.navigate(['/pantallas/edit/' + pantalla.id]);
    }

    renovar(pantalla) {
        this.pantallasService.retoken(pantalla).subscribe(() => {
            this.plex.toast('success', 'Pantalla renovada correctamente', 'Pantalla renovada', 1000);
        });
    }

    nueva() {
        this.pantalla = {
            nombre: '',
            espaciosFisicos: [],
            organizacion: this.auth.organizacion
        };
        this.mostrarDetalle = true;
        this.router.navigate(['/pantallas/create']);
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
