import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { ITurno } from './../../../../interfaces/turnos/ITurno';
import { ListaEsperaService } from '../../../../services/turnos/listaEspera.service';
import { AgendaService } from '../../../../services/turnos/agenda.service';
import { getMotivosLiberacion } from '../../../../utils/enumerados';
import { forkJoin } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';

@Component({
    selector: 'liberar-turno',
    templateUrl: 'liberar-turno.html'
})

export class LiberarTurnoComponent implements OnInit {

    @Input() agenda: IAgenda;
    @Input() turnosSeleccionados: ITurno[];
    @Input() desdeAgenda = false;
    @Output() saveLiberarTurno = new EventEmitter<IAgenda>();
    @Output() reasignarTurnoLiberado = new EventEmitter<boolean>();
    @Output() cancelaLiberarTurno = new EventEmitter<boolean>();

    turnos: any = [];

    showLiberarTurno: Boolean = true;

    public reasignar: any = {};

    public motivoLiberacion = getMotivosLiberacion();
    public motivoLiberacionSelect;
    public otroMotivoLiberacion;

    constructor(public plex: Plex, public listaEsperaService: ListaEsperaService, public serviceAgenda: AgendaService) { }

    ngOnInit() {
        this.turnos = this.turnosSeleccionados;
        this.motivoLiberacionSelect = this.motivoLiberacion[1];
    }

    liberarTurno() {
        if (this.motivoLiberacionSelect) {
            const patch = {
                op: 'liberarTurno',
                turnos: this.turnos.map(resultado => resultado._id),
                observaciones: this.motivoLiberacionSelect.nombre === 'Otro' ? this.otroMotivoLiberacion : this.motivoLiberacionSelect.nombre
            };

            if (this.turnos[0].sobreturno || !this.turnos[0].tipoTurno) {
                patch['sobreturno'] = true;
            }
            const mensaje = this.turnos.length === 1 ? 'El turno seleccionado fue liberado' : 'Los turnos seleccionados fueron liberados';

            this.serviceAgenda.patch(this.agenda.id, patch).subscribe({
                complete: () => {
                    (this.turnos[0].sobreturno || !this.turnos[0].tipoTurno) ? this.plex.toast('success', 'El sobreturno fue liberado exitosamente.', 'Liberar sobreturno', 4000) : this.plex.toast('success', mensaje, 'Liberar turno', 4000);
                    this.saveLiberarTurno.emit(this.agenda);
                },
                error: () => {
                    (this.turnos[0].sobreturno || !this.turnos[0].tipoTurno) ?
                        this.plex.info('warning', 'El sobreturno ya tiene una prestación iniciada.', 'Información') :
                        this.plex.info('warning', 'El turno ya tiene una prestación iniciada.', 'Información');
                    this.cancelaLiberarTurno.emit(true);
                }
            });
        }
    }

    agregarPacienteListaEspera() {
        const turnos = this.turnos.map(turno => {
            const patch = {
                'op': 'listaEsperaSuspensionAgenda',
                'idAgenda': this.agenda.id,
                'pacientes': turno
            };

            this.liberarTurno();

            return this.listaEsperaService.postXIdAgenda(this.agenda.id, patch);
        });

        forkJoin(turnos).pipe(
            mergeMap(() => this.serviceAgenda.getById(this.agenda.id)),
            tap(resulAgenda => {
                this.saveLiberarTurno.emit(resulAgenda);
                this.plex.info('info', 'Los pacientes seleccionados se agregaron a Lista de Espera');
            })
        ).subscribe();
    }

    cancelar() {
        this.cancelaLiberarTurno.emit(true);
        this.turnos = [];
    }
}
