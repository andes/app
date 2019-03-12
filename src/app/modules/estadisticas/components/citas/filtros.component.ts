import * as moment from 'moment';
import { Component, AfterViewInit, HostBinding, EventEmitter, Output, Input, SimpleChanges, SimpleChange, OnChanges } from '@angular/core';
import { Plex } from '@andes/plex';
import { TipoPrestacionService } from '../../../../services/tipoPrestacion.service';
import { ProfesionalService } from '../../../../services/profesional.service';

@Component({
    selector: 'turnos-filtros',
    template: `
    <div class="row">
        <div class="col-2">
            <plex-select label="Tipo de filtro" [data]="opciones" [(ngModel)]="seleccion.tipoDeFiltro" name="tipoDeFiltro"></plex-select>
        </div>
        <div class="col-2">
            <plex-datetime label="Desde" [max]="hoy" type="date" [(ngModel)]="desde" name="desde"></plex-datetime>
        </div>
        <div class="col-2">
            <plex-datetime label="Hasta" [max]="hoy" type="date" [(ngModel)]="hasta" name="hasta"></plex-datetime>
        </div>
        <div class="col-4 d-flex align-items-end">
            <plex-button type="success mb-1" label="Filtrar" (click)="onChange()" ></plex-button>
        </div>
        <div class="col-2 d-flex align-items-end" (click)="changeTablaGrafico()">
            <plex-button *ngIf="esTablaGrafico" icon="mdi mdi-chart-pie"></plex-button>
            <plex-button *ngIf="!esTablaGrafico" icon="mdi mdi-table-large"></plex-button>
        </div>
    </div>
    <div class="row">
        <div class="col-3">
            <plex-select [multiple]="true" [(ngModel)]="seleccion.prestacion" (getData)="loadPrestaciones($event)" name="prestaciones"
                label="Prestación" ngModelOptions="{standalone: true}">
            </plex-select>
        </div>
        <div class="col-3">
            <plex-select [multiple]="true" [(ngModel)]="seleccion.profesional" name="profesional" (getData)="loadProfesionales($event)"
                label="Profesional" placeholder="Escriba el apellido del Profesional" labelField="apellido + ' ' + nombre">
            </plex-select>
        </div>
        <div class="col-3" *ngIf="seleccion.tipoDeFiltro.id === 'turnos'">
            <plex-select [multiple]="true" [data]="estadoTurnos" [(ngModel)]="seleccion.estado_turno" placeholder="Seleccione..." label="Estado">
            </plex-select>
        </div>
        <div class="col-3" *ngIf="seleccion.tipoDeFiltro.id === 'turnos'">
            <plex-select [multiple]="true" [data]="tipoTurnos" [(ngModel)]="seleccion.tipoTurno" placeholder="Seleccione..." label="Tipo Turno">
            </plex-select>
        </div>
        <div class="col-3" *ngIf="seleccion.tipoDeFiltro.id === 'agendas'">
            <plex-select [multiple]="true" [data]="estadosAgendas" [(ngModel)]="seleccion.estado_agenda" placeholder="Seleccione..." label="Estado">
            </plex-select>
        </div>
    </div>
    `
})
export class FiltrosComponent implements AfterViewInit, OnChanges {
    @HostBinding('class.plex-layout') layout = true;

    // Filtros
    public desde: Date = moment(new Date()).startOf('month').toDate();
    public hasta: Date = new Date();
    public hoy = new Date();
    public opciones = [{ id: 'agendas', nombre: 'Agendas' }, { id: 'turnos', nombre: 'Turnos' }];
    public esTablaGrafico = false;
    public estadosAgendas = [
        { id: 'planificacion', nombre: 'Planificacion' },
        { id: 'disponible', nombre: 'Disponible' },
        { id: 'publicada', nombre: 'Publicada' },
        { id: 'suspendida', nombre: 'Suspendida' },
        { id: 'pausada', nombre: 'Pausada' },
        { id: 'pendienteAsistencia', nombre: 'Pendiente Asistencia' },
        { id: 'pendienteAuditoria', nombre: 'Pendiente Auditoria' },
        { id: 'auditada', nombre: 'Auditada' },
        { id: 'borrada', nombre: 'Borrada' }
    ];

    public estadoTurnos = [
        { id: 'disponible', nombre: 'Disponible' },
        { id: 'asignado', nombre: 'Asignado' },
        { id: 'reasignado', nombre: 'Reasignado' },
        { id: 'suspendido', nombre: 'Suspendido' }
    ];

    public tipoTurnos = [
        { id: 'delDia', nombre: 'Del Dia' },
        { id: 'programado', nombre: 'Programado' },
        { id: 'gestion', nombre: 'Gestion' },
        { id: 'profesional', nombre: 'Profesional' },
        { id: 'sobreturno', nombre: 'Sobreturno' }
    ];

    @Output() filter = new EventEmitter();
    @Output() onDisplayChange = new EventEmitter();

    public seleccion: any = {
        tipoDeFiltro: { id: 'turnos', nombre: 'Turnos' },
        profesional: undefined,
        prestacion: undefined,
        estado_turno: undefined,
        estado_agenda: undefined,
        tipoTurno: undefined
    };

    constructor(
        private plex: Plex,
        public servicioProfesional: ProfesionalService,
        public servicioPrestacion: TipoPrestacionService) {
    }

    ngAfterViewInit() {
        this.onChange();
    }

    changeTablaGrafico() {
        this.esTablaGrafico = !this.esTablaGrafico;
        this.onDisplayChange.emit(this.esTablaGrafico);
    }

    loadProfesionales(event) {
        let listaProfesionales = [];
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.servicioProfesional.get(query).subscribe(resultado => {
                listaProfesionales = resultado;
                event.callback(listaProfesionales);
            });
        } else {
            event.callback([]);
        }
    }

    loadPrestaciones(event) {
        this.servicioPrestacion.get({}).subscribe(result => {
            event.callback(result);
        });
    }

    onChange() {
        let filtrosParams = {
            fechaDesde: this.desde,
            fechaHasta: this.hasta,
            tipoDeFiltro: this.seleccion.tipoDeFiltro ? this.seleccion.tipoDeFiltro.id : undefined,
            prestacion: this.seleccion.prestacion ? this.seleccion.prestacion.map(pr => {
                return {id: pr.conceptId, nombre: pr.term };
            }) : undefined,
            profesional: this.seleccion.profesional ? this.seleccion.profesional.map(prof => {
                return {id: prof.id, nombre: prof.nombre + ' ' + prof.apellido };
            }) : undefined,
            estado_turno: this.seleccion.estado_turno && this.seleccion.tipoDeFiltro.id === 'turnos' ? this.seleccion.estado_turno.map(et => et.id) : undefined,
            tipoTurno: this.seleccion.tipoTurno && this.seleccion.tipoDeFiltro.id === 'turnos' ? this.seleccion.tipoTurno.map(tt => tt.id) : undefined,
            estado_agenda: this.seleccion.estado_agenda && this.seleccion.tipoDeFiltro.id === 'agendas' ? this.seleccion.estado_agenda.map(et => et.id) : undefined
        };
        this.filter.emit(filtrosParams);
    }

    ngOnChanges(changes: SimpleChanges) {
        const name: SimpleChange = changes.name;
    }
}
