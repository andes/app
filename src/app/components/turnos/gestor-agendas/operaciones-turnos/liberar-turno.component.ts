import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { ITurno } from './../../../../interfaces/turnos/ITurno';
import { ListaEsperaService } from '../../../../services/turnos/listaEspera.service';
import { AgendaService } from '../../../../services/turnos/agenda.service';

@Component({
    selector: 'liberar-turno',
    templateUrl: 'liberar-turno.html'
})

export class LiberarTurnoComponent implements OnInit {

    @Input() agenda: IAgenda;
    @Input() turnosSeleccionados: ITurno;

    @Output() saveLiberarTurno = new EventEmitter<IAgenda>();
    @Output() reasignarTurnoLiberado = new EventEmitter<boolean>();
    @Output() cancelaLiberarTurno = new EventEmitter<boolean>();

    turnos: any = [];

    showLiberarTurno: Boolean = true;

    public reasignar: any = {};

    public motivoLiberacion: any[] = [{ // Hardcodeame que me gusta
        id: 1,
        nombre: 'Error'
    }, {
        id: 2,
        nombre: 'Paciente canceló'
    },
    {
        id: 3,
        nombre: 'Paciente cambió turno'
    }];

    public motivoLiberacionSelect = {
        select: null
    };

    constructor(public plex: Plex, public listaEsperaService: ListaEsperaService, public serviceAgenda: AgendaService) { }

    ngOnInit() {
        this.turnos = this.turnosSeleccionados;
        this.motivoLiberacionSelect.select = this.motivoLiberacion[1];
    }

    liberarTurno() {
        if (this.motivoLiberacionSelect.select.nombre === null) {
            return;
        }

        let alertCount = 0;
        let patch = {
            op: 'liberarTurno',
            turnos: this.turnos.map((resultado) => { return resultado._id; })
        };
        let mensaje = this.turnos.length === 1 ? 'El turno seleccionado fue liberado' : 'Los turnos seleccionados fueron liberados';

        this.serviceAgenda.patch(this.agenda.id, patch).subscribe(resultado => {

            this.plex.toast('success', mensaje, 'Liberar turno', 4000);

            this.saveLiberarTurno.emit(this.agenda);
        },
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    agregarPacienteListaEspera() {

        for (let x = 0; x < this.turnos.length; x++) {
            let patch = {
                'op': 'listaEsperaSuspensionAgenda',
                'idAgenda': this.agenda.id,
                'pacientes': this.turnos[x]
            };

            this.liberarTurno();

            this.listaEsperaService.postXIdAgenda(this.agenda.id, patch).subscribe(resultado => {

                this.serviceAgenda.getById(this.agenda.id).subscribe(resulAgenda => {

                    this.saveLiberarTurno.emit(resulAgenda);

                    this.plex.alert('Los pacientes seleccionados pasaron a Lista de Espera');
                });
            });
        }
    }

    cancelar() {
        this.cancelaLiberarTurno.emit(true);
        this.turnos = [];
    }
}
