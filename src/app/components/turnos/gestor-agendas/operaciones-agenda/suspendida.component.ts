import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { ITurno } from './../../../../interfaces/turnos/ITurno';
import { EstadosAgenda } from './../../enums';
import { AgendaService } from '../../../../services/turnos/agenda.service';



@Component({
    selector: 'suspendida',
    templateUrl: 'suspendida.html'
})

export class SuspendidaComponent implements OnInit {


    @Input() agenda: IAgenda;
    @Output() cancelaSuspenderAgenda = new EventEmitter<boolean>();


    constructor(public plex: Plex, public serviceAgenda: AgendaService) { }

    public motivoSuspensionSelect = { select: null };
    public motivoSuspension: { id: number; nombre: string; }[];
    public estadosAgenda = EstadosAgenda;
    public ag;
    public showData = false;
    public showConfirmar = false;
    public turnos = [];
    ngOnInit() {
        this.motivoSuspension = [{
            id: 1,
            nombre: 'edilicia'
        }, {
            id: 2,
            nombre: 'profesional'
        },
        {
            id: 3,
            nombre: 'organizacion'
        }];
        this.motivoSuspensionSelect.select = this.motivoSuspension[1];

        (this.agenda.estado !== 'suspendida') ? this.showConfirmar = true : this.showData = true;
    }

    suspenderTurno() {
        this.showConfirmar = false;
        this.showData = true;
        if (this.motivoSuspensionSelect.select.nombre === null) {
            return;
        }

        let patch: any;
        patch = {
            op: 'suspenderTurno',
            turnos: this.turnos.map((resultado) => { return resultado.id; }),
            motivoSuspension: this.motivoSuspensionSelect.select.nombre
        };


        // Patchea los turnosSeleccionados (1 o más)
        this.serviceAgenda.patch(this.agenda.id, patch).subscribe(

            resultado => {
                this.agenda = resultado;
                if (this.turnos.length === 1) {
                    this.plex.toast('warning', 'El turno seleccionado fue suspendido');
                } else {
                    this.plex.toast('warning', 'Los turnos seleccionados fueron suspendidos');
                }


                // // Se envían SMS sólo en Producción
                // if (environment.production === true) {
                //     for (let x = 0; x < this.seleccionadosSMS.length; x++) {

                //         let dia = moment(this.seleccionadosSMS[x].horaInicio).format('DD/MM/YYYY');
                //         let horario = moment(this.seleccionadosSMS[x].horaInicio).format('HH:mm');
                //         let mensaje = 'Le informamos que su turno del dia ' + dia + ' a las ' + horario + ' horas fue suspendido.';
                //         this.enviarSMS(this.seleccionadosSMS[x].paciente, mensaje);
                //     };
                // } else {
                //     this.plex.toast('info', 'INFO: SMS no enviado (activo sólo en Producción)');
                // }
            },
            err => {
                if (err) {
                    console.log(err);
                }
            }

        );
        this.cancelaSuspenderAgenda.emit(true);

    }

    cancelar() {
        this.showConfirmar = false;
        this.showData = false;
        this.cancelaSuspenderAgenda.emit(true);
    }

}
