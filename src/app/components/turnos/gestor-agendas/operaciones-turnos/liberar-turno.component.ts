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

    pacientes: any = [];

    showLiberarTurno: Boolean = true;

    public reasignar: any = {};

    public motivoLiberacion: any[] = [{
        id: 1,
        nombre: 'edilicia'
    }, {
        id: 2,
        nombre: 'profesional'
    },
    {
        id: 3,
        nombre: 'organizacion'
    },
    {
        id: 4,
        nombre: 'paciente'
    }];

    public motivoLiberacionSelect = {
        select: null
    };

    ngOnInit() {
        this.pacientes = this.turnosSeleccionados;
        this.motivoLiberacionSelect.select = this.motivoLiberacion[1];
    }

    liberarTurno() {
        let alertCount = 0;
        let patch = {
            op: 'liberarTurno',
            turnos: this.pacientes
        };

        let mensaje = this.pacientes.length === 1 ? 'El turno seleccionado fue liberado' : 'Los turnos seleccionados fueron liberados';

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

        for (let x = 0; x < this.pacientes.length; x++) {
            let patch = {
                'op': 'listaEsperaSuspensionAgenda',
                'idAgenda': this.agenda.id,
                'pacientes': this.pacientes[x]
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

    reasignarTurno(turno: ITurno) {
        // this.reasignar = { 'paciente': paciente.paciente, 'idTurno': paciente.id, 'idAgenda': this.agenda.id };
        // this.reasignarTurnoLiberado.emit(this.reasignar);
    }

    cancelar() {
        this.cancelaLiberarTurno.emit(true);
        this.pacientes = [];
    }

    constructor(public plex: Plex, public listaEsperaService: ListaEsperaService, public serviceAgenda: AgendaService) { }
}
