import { Component, OnInit, OnDestroy } from '@angular/core';
import { PantallaService } from '../services/pantalla.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';

@Component({
    templateUrl: 'pantallas.html'
})
export class PantallasComponent implements OnInit, OnDestroy  {
    get pantallas () {
        return this.pantallasService.pantallas;
    }

    get muestraAcciones () {
        return !this.pantallasService.selected;
    }

    constructor(
        public pantallasService: PantallaService,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit () {
        this.pantallasService.list();
    }

    ngOnDestroy() {

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
