import * as moment from 'moment';
import { Component, AfterViewInit, HostBinding, EventEmitter, Output, Input, SimpleChanges, SimpleChange, OnChanges } from '@angular/core';
import { Plex } from '@andes/plex';
import { TipoPrestacionService } from '../../../../services/tipoPrestacion.service';
import { ProfesionalService } from '../../../../services/profesional.service';

@Component({
    selector: 'turnos-filtros',
    template: `
    <div class="row">
        <div class="col-3">
            <plex-select label="Tipo de filtro" [data]="opciones" [(ngModel)]="seleccion.tipoDeFiltro" name="tipoDeFiltro" (change)="onChange($event)"></plex-select>
        </div>
        <div class="col-3">
            <plex-datetime label="Desde" [max]="hoy" type="date" [(ngModel)]="desde" name="desde" (change)="onChange()"></plex-datetime>
        </div>
        <div class="col-3">
            <plex-datetime label="Hasta" [max]="hoy" type="date" [(ngModel)]="hasta" name="hasta" (change)="onChange()"></plex-datetime>
        </div>
        <div class="col-3">
            <plex-button type="success" label="Filtrar" (click)="onChange()" class="vertical-center" ></plex-button>
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
    public estadosAgendas = [
        {id: 'planificacion', nombre: 'Planificacion'},
        {id: 'disponible', nombre: 'Disponible'},
        {id: 'publicada', nombre: 'Publicada'},
        {id: 'suspendida', nombre: 'Suspendida'},
        {id: 'pausada', nombre: 'Pausada'},
        {id: 'pendienteAsistencia', nombre: 'Pendiente Asistencia'},
        {id: 'pendienteAuditoria', nombre: 'Pendiente Auditoria'},
        {id: 'auditada', nombre: 'Auditada'},
        {id: 'borrada', nombre: 'Borrada'}
    ];

    public estadoTurnos = [
        {id: 'disponible', nombre: 'Disponible'},
        {id: 'asignado', nombre: 'Asignado'},
        {id: 'suspendido', nombre: 'Suspendido'},
        {id: 'turnoDoble', nombre: 'Turno Doble'}
    ];

    public tipoTurnos = [
        {id: 'delDia', nombre: 'Del Dia'},
        {id: 'programado', nombre: 'Programado'},
        {id: 'gestion', nombre: 'Gestion'},
        {id: 'profesional', nombre: 'Profesional'}
    ];

    @Input() params: any = {};
    @Output() filter = new EventEmitter();

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
        let params = {
            fechaDesde: this.desde,
            fechaHasta: this.hasta,
            tipoDeFiltro: this.seleccion.tipoDeFiltro ? this.seleccion.tipoDeFiltro.id : undefined,
            prestacion: this.seleccion.prestacion ? this.seleccion.prestacion.map(pr => pr.conceptId) : undefined,
            profesional: this.seleccion.profesional ? this.seleccion.profesional.map(prof => prof.id) : undefined,
            estado_turno: this.seleccion.estado_turno ? this.seleccion.estado_turno.map(et => et.id) : undefined,
            estado_agenda: this.seleccion.estado_agenda ? this.seleccion.estado_agenda.map(et => et.id) : undefined,
            tipoTurno: this.seleccion.tipoTurno ? this.seleccion.tipoTurno.map(tt => tt.id) : undefined
        };
        this.filter.emit(params);
    }

    ngOnChanges(changes: SimpleChanges) {
        const name: SimpleChange = changes.name;
    }
}
