import { Component } from '@angular/core';
import { PrestamosService } from './../../../services/prestamosHC/prestamos-hc.service';
import { Auth } from '@andes/auth';

@Component({
    selector: 'app-historial-carpetas',
    templateUrl: './historial-hc.component.html',
    styleUrls: ['../prestamos-hc.scss']
})

export class HistorialCarpetasComponent {
    public historial = null;
    public numeroCarpeta = '';
    public paciente;
    public loading = false;

    constructor(
        public prestamosService: PrestamosService,
        public auth: Auth
    ) { }

    buscarHistorial() {
        if (this.numeroCarpeta.length) {
            this.loading = true;
            this.paciente = null;
            if (this.numeroCarpeta) {
                this.prestamosService.getHistorialCarpetas({ numero: this.numeroCarpeta, organizacion: this.auth.organizacion.id })
                    .subscribe(resultado => {
                        this.loading = false;
                        if (resultado?.historial?.length > 0) {
                            this.historial = resultado.historial;
                        } else {
                            this.historial = [];
                        }
                        if (resultado.paciente) {
                            this.paciente = resultado.paciente;
                        }
                    });
            }
        }
    }

    loadCarpetas(event) {
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
        }
    }
}
