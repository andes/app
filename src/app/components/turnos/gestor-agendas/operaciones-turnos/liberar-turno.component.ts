import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { ITurno } from './../../../../interfaces/turnos/ITurno';
import { ListaEsperaService } from '../../../../services/turnos/listaEspera.service';
import { AgendaService } from '../../../../services/turnos/agenda.service';
import { getMotivosLiberacion } from '../../../../utils/enumerados';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';
import { IPrestacion } from 'src/app/modules/rup/interfaces/prestacion.interface';

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

    public motivoLiberacion = getMotivosLiberacion();
    public motivoLiberacionSelect;
    public otroMotivoLiberacion;

    constructor(public plex: Plex,
        public listaEsperaService: ListaEsperaService,
        public serviceAgenda: AgendaService,
        public prestacionesService: PrestacionesService) { }

    ngOnInit() {
        this.turnos = this.turnosSeleccionados;
        this.motivoLiberacionSelect = this.motivoLiberacion[1];
    }

    liberarTurno() {
        this.prestacionesService.get({ turnos: this.turnos[0].id }).subscribe((prestacion: any) => {
            if (prestacion?.length) {
                const estadoPrestacion = prestacion[0].estados[prestacion[0].estados.length - 1].tipo;
                if (estadoPrestacion === 'ejecucion' || estadoPrestacion === 'validada') {
                    this.plex.info('danger', 'El turno seleccionado está asociado a una prestación ya iniciada', 'No se puede liberar el turno');
                    return;
                }
            }
            if (this.motivoLiberacionSelect) {
                let patch = {
                    op: 'liberarTurno',
                    turnos: this.turnos.map(resultado => resultado._id),
                    observaciones: this.motivoLiberacionSelect.nombre === 'Otro' ? this.otroMotivoLiberacion : this.motivoLiberacionSelect.nombre
                };
                let mensaje = this.turnos.length === 1 ? 'El turno seleccionado fue liberado' : 'Los turnos seleccionados fueron liberados';

                this.serviceAgenda.patch(this.agenda.id, patch).subscribe(resultado => {
                    this.plex.toast('success', mensaje, 'Liberar turno', 4000);
                    this.saveLiberarTurno.emit(this.agenda);
                },
                    err => {
                        if (err) {
                            this.plex.info('warning', 'Turno en ejecución', 'Error');
                            this.cancelaLiberarTurno.emit(true);
                        }
                    });
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

                    this.plex.info('warning', 'Los pacientes seleccionados pasaron a Lista de Espera');
                });
            });
        }
    }

    cancelar() {
        this.cancelaLiberarTurno.emit(true);
        this.turnos = [];
    }
}
