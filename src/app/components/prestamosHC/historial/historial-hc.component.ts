import { Component, OnInit } from '@angular/core';
import { PrestamosService } from './../../../services/prestamosHC/prestamos-hc.service';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import * as moment from 'moment';


@Component({
    selector: 'app-historial-carpetas',
    templateUrl: './historial-hc.component.html',
    styleUrls: ['../prestamos-hc.scss']
})

export class HistorialCarpetasComponent implements OnInit {
    public historial: any[] = [];
    public numeroCarpeta = '';
    public inicioBusqueda = false;
    public paciente;

    constructor(
        public prestamosService: PrestamosService,
        public auth: Auth
    ) {
    }

    ngOnInit() {
    }

    buscarHistorial() {
        this.paciente = null;
        this.historial = [];
        this.inicioBusqueda = true;
        if (this.numeroCarpeta) {
            this.prestamosService.getHistorialCarpetas({ numero: this.numeroCarpeta, organizacion: this.auth.organizacion.id })
                .subscribe(resultado => {
                    if (resultado?.historial?.length > 0) {
                        this.historial = resultado.historial;
                    } else {
                        this.historial = [];
                    }

                    if (resultado.paciente) {
                        this.paciente = resultado.paciente;
                    }
                });
        } else {
            this.inicioBusqueda = false;
        }
    }

    loadCarpetas(event) {
        let listaProfesionales = [];
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
        }
    }
}
