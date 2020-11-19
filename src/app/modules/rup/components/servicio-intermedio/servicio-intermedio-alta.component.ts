import { Auth } from '@andes/auth';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReglaService } from 'src/app/services/top/reglas.service';
import { ITurno } from '../../../../interfaces/turnos/ITurno';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { PrestacionesService } from '../../services/prestaciones.service';

@Component({
    selector: 'rup-servicio-intermedio-alta',
    templateUrl: './servicio-intermedio-alta.component.html'
})
export class RUPServicioIntermedioAltaComponent implements OnInit {

    @Input() turno: ITurno;

    @Input() prestacion: IPrestacion;

    @Output() cancel = new EventEmitter();

    prestacionSolicitada;

    datosSolicitud;

    regla;

    prestacionElegida;

    constructor(
        private prestacionService: PrestacionesService,
        private reglasService: ReglaService,
        private auth: Auth
    ) {

    }

    ngOnInit() {
        if (this.prestacion) {
            this.datosSolicitud = this.prestacion.solicitud.registros[0].valor.solicitudPrestacion;
            this.prestacionSolicitada = this.prestacion.solicitud.registros[0].concepto;

            const reglaID = this.datosSolicitud.reglaID;

            this.reglasService.getById(reglaID).subscribe((regla) => {
                this.regla = regla;
                if (this.regla?.destino.agendas?.length > 0) {
                    this.prestacionElegida = this.regla?.destino.agendas[0];
                }
            });

        }
    }

    onCancelar() {
        this.cancel.emit();
    }

    onConfirmar() {
        this.ejecutarPrestacionPendiente(this.prestacion, this.turno).subscribe(() => {
            this.prestacionService.navegarAEjecucion(this.prestacion, this.turno);
        });
    }

    ejecutarPrestacionPendiente(prestacion, turno?) {
        const params: any = {
            op: 'estadoPush',
            ejecucion: {
                fecha: turno?.horaInicio || new Date(),
                registros: [],
                organizacion: {
                    id: this.auth.organizacion.id,
                    nombre: this.auth.organizacion.nombre
                }
            },
            estado: { tipo: 'ejecucion' }
        };

        if (this.prestacionElegida) {
            params.solicitud = {
                tipoPrestacion: this.prestacionElegida
            };
        }

        return this.prestacionService.patch(prestacion.id, params);
    }
}
