import { Auth } from '@andes/auth';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReglaService } from 'src/app/services/top/reglas.service';
import { ITurno } from '../../../../interfaces/turnos/ITurno';
import { CONDICIONES_PACIENTE, CondicionPaciente, ICondicionPacienteOpcion, IPrestacion } from '../../interfaces/prestacion.interface';
import { PrestacionesService } from '../../services/prestaciones.service';

@Component({
    selector: 'rup-servicio-intermedio-alta',
    templateUrl: './servicio-intermedio-alta.component.html'
})
export class RUPServicioIntermedioAltaComponent implements OnInit {

    @Input() turno: ITurno;

    @Input() prestacion: IPrestacion;

    @Input() condicionPacienteInicial: CondicionPaciente;

    @Output() cancel = new EventEmitter();

    prestacionSolicitada;

    datosSolicitud;

    regla;

    prestacionElegida;
    condicionPaciente: ICondicionPacienteOpcion;
    condicionesPaciente = CONDICIONES_PACIENTE;

    constructor(
        private prestacionService: PrestacionesService,
        private reglasService: ReglaService,
        private auth: Auth
    ) {

    }

    ngOnInit() {
        this.condicionPaciente = this.condicionesPaciente.find(opcion => opcion.id === this.condicionPacienteInicial);
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
        this.ejecutarPrestacionPendiente(this.prestacion, this.turno, this.condicionPaciente?.id).subscribe(() => {
            this.prestacionService.navegarAEjecucion(this.prestacion, this.turno);
        });
    }

    ejecutarPrestacionPendiente(prestacion, turno?, condicionPaciente?: CondicionPaciente) {
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
        if (condicionPaciente) {
            params.condicionPaciente = condicionPaciente;
        }

        if (this.prestacionElegida) {
            params.solicitud = {
                tipoPrestacion: this.prestacionElegida
            };
        }

        return this.prestacionService.patch(prestacion.id, params);
    }
}
