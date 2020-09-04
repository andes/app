import * as moment from 'moment';
import { Component, AfterViewInit, HostBinding, EventEmitter, Output, SimpleChanges, SimpleChange, OnChanges } from '@angular/core';
import { Plex } from '@andes/plex';
import { TipoPrestacionService } from '../../../../services/tipoPrestacion.service';
import { ProfesionalService } from '../../../../services/profesional.service';
import { Auth } from '@andes/auth';
import * as loadCombos from '../../utils/comboLabelFiltro.component';

@Component({
    selector: 'turnos-filtros',
    template: `
    <div class="row">
        <div class="col-2">
            <plex-select label="Tipo de filtro" [data]="opciones" [(ngModel)]="seleccion.tipoDeFiltro" name="tipoDeFiltro" [required]="true"></plex-select>
        </div>
        <div class="col-2">
            <plex-datetime label="Desde" [max]="hoy" type="date" [(ngModel)]="desde" name="desde"></plex-datetime>
        </div>
        <div class="col-2">
            <plex-datetime label="Hasta" [max]="hoy" type="date" [(ngModel)]="hasta" name="hasta"></plex-datetime>
        </div>
        <div class="col-2 d-flex align-items-end">
            <plex-button type="success mb-1" label="Buscar" (click)="onChange()" [disabled]="(seleccion.tipoDeFiltro && desde && hasta) ? false : true"></plex-button>
        </div>
        <div class="col-1 offset-2 d-flex align-items-end">
            <plex-button [title]="esTablaGrafico ? 'Mostrar gráficos' : 'Mostrar tablas'" [icon]="esTablaGrafico ? 'chart-pie' : 'table-large'"
                class="m-1" (click)="changeTablaGrafico()"></plex-button>
            <plex-button class="m-1" [title]="mostrarMasOpciones ? 'Ocultar filtros' : 'Ver más filtros'" type="default" [icon]="mostrarMasOpciones ? 'chevron-up' : 'chevron-down'"
                (click)="mostrarMasOpciones = !mostrarMasOpciones"></plex-button>
        </div>
    </div>
    <div class="row" *ngIf="mostrarMasOpciones">
        <div class="col-3">
            <plex-select [multiple]="true" [(ngModel)]="seleccion.prestacion" (getData)="loadPrestaciones($event)" name="prestaciones"
                label="Prestación" ngModelOptions="{standalone: true}">
            </plex-select>
        </div>
        <div class="col-3" *ngIf="verProfesionales">
            <plex-select [multiple]="true" [(ngModel)]="seleccion.profesional" name="profesional" (getData)="loadProfesionales($event)"
                label="Profesional" placeholder="Escriba el apellido del Profesional" labelField="apellido + ' ' + nombre">
            </plex-select>
        </div>
        <div class="col-3" *ngIf="seleccion.tipoDeFiltro && seleccion.tipoDeFiltro.id === 'turnos'">
            <plex-select [multiple]="true" [data]="estadoTurnos" [(ngModel)]="seleccion.estado_turno" placeholder="Seleccione..." label="Estado">
            </plex-select>
        </div>
        <div class="col-3" *ngIf="seleccion.tipoDeFiltro && seleccion.tipoDeFiltro.id === 'turnos'">
            <plex-select [multiple]="true" [data]="tipoTurno" [(ngModel)]="seleccion.tipoTurno" placeholder="Seleccione..." label="Tipo de turno">
            </plex-select>
        </div>
        <div class="col-3" *ngIf="seleccion.tipoDeFiltro && seleccion.tipoDeFiltro.id === 'agendas'">
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
    public mostrarMasOpciones = false;
    public tipoTurno = [];
    public estadoTurnos = [];
    public estadosAgendas = [];

    // Permisos
    public verProfesionales = this.auth.check('dashboard:citas:verProfesionales');
    private idPermisoPrestaciones = this.auth.getPermissions('dashboard:citas:tipoPrestacion:?');
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
        public auth: Auth,
        public servicioProfesional: ProfesionalService,
        public servicioPrestacion: TipoPrestacionService) {
    }

    ngAfterViewInit() {
        if (!this.verProfesionales) {
            this.servicioProfesional.get({ id: this.auth.profesional }).subscribe(resultado => {
                this.seleccion.profesional = resultado;
            });
        }
        this.tipoTurno = loadCombos.getTipoTurnos();
        this.estadoTurnos = loadCombos.getEstadosTurnos();
        this.estadosAgendas = loadCombos.getEstadosAgendas();
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
        let queryPrestacion = {};
        if (event.query) {
            if (this.idPermisoPrestaciones.length > 0 && this.idPermisoPrestaciones[0] !== '*') {
                queryPrestacion = { id: this.idPermisoPrestaciones };
            }
            this.servicioPrestacion.get(queryPrestacion).subscribe(result => {
                event.callback(result);
            });
        } else {
            event.callback([]);
        }
    }

    onChange() {
        let filtrosParams = {
            fechaDesde: this.desde,
            fechaHasta: this.hasta,
            tipoDeFiltro: this.seleccion.tipoDeFiltro ? this.seleccion.tipoDeFiltro.id : undefined,
            prestacion: this.seleccion.prestacion ? this.seleccion.prestacion.map(pr => {
                return { id: pr.conceptId, nombre: pr.term };
            }) : undefined,
            profesional: this.seleccion.profesional ? this.seleccion.profesional.map(prof => {
                return { id: prof.id, nombre: prof.nombre + ' ' + prof.apellido };
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
