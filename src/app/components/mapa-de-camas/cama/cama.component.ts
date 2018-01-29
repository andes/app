import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { Plex } from '@andes/plex';
import { setTimeout } from 'timers';
import { Auth } from '@andes/auth';
import { OrganizacionService } from '../../../services/organizacion.service';

@Component({
    selector: 'app-cama',
    templateUrl: './cama.component.html',
    styleUrls: ['./cama.component.css'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class CamaComponent implements OnInit {

    @Input() cama: any;
    @Output() evtCama: EventEmitter<any> = new EventEmitter<any>();

    // opciones dropdown cama internada
    public opcionesDropdown: any = [];

    constructor(private plex: Plex, private auth: Auth, private serviceOrganizacion: OrganizacionService) { }

    ngOnInit() {
        this.opcionesDropdown = [
            {
                label: 'Valoración inicial enfermería',
                handler: (() => {
                    // this.verValoracionInicial(scope.cama.idInternacion);
                    alert('TODO');
                })
            },
            {
                label: 'Valoración inicial médica',
                handler: (() => {
                    // this.verValoracionMedica(scope.cama.idInternacion);
                    alert('TODO');
                })
            },
            {
                label: 'Desocupar cama',
                handler: (() => {
                    // this.egresarPaciente(scope.cama);
                    alert('TODO');
                })
            }
        ];
    }

    /**
     * Buscar un paciente para internar.
     *
     * @param {any} cama Cama en la cual se va a internar el paciente.
     * @memberof CamaComponent
     */
    public buscarPaciente(cama) {
        if (cama.ultimoEstado.estado !== 'desinfectada') {
            this.plex.info('warning', 'Debe desinfectar la cama antes de poder internar un paciente', 'Error');
        }

        // buscar paciente

        // cambiar el estado a la cama

        // emitir cama modificada
        // this.evtCama.emit(cama);
    }

    public cambiarEstado(cama, estado) {
        let dto = {
            estado: estado,
            observaciones: cama.$motivo
        };

        this.serviceOrganizacion.NewEstado(this.auth.organizacion.id, cama.id, dto).subscribe(camaActualizada => {
            cama.ultimoEstado = camaActualizada.ultimoEstado;
            let msg = '';

            switch (estado) {
                case 'reparacion':
                    msg = ' enviada a reparación';
                    break;
                case 'desinfectada':
                    msg = ' desinfectada';
                    break;
                case 'bloqueada':
                    msg = ' bloqueada';
                    break;
                case 'desocupada':
                    if (cama.$action === 'reparacion') {
                        msg = ' reparada';
                    } else if (cama.$action === 'bloquear') {
                        msg = ' desbloqueada';
                    } else {
                        msg = ' desocupada';
                    }
                break;
            }

            this.plex.toast('success', 'Cama ' + msg, 'Cambio estado');

            // rotamos card
            setTimeout(() => {
                // rotamos cama
                cama.$rotar = false;
                // limpiar motivo por el cual se cambio el estado
                cama.$motivo = '';
                // emitimos la cama modificada
                this.evtCama.emit(cama);
            }, 100);
        }, (err) => {
            this.plex.info('danger', err, 'Error');
        });
    }
}
