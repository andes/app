import { OrganizacionService } from './../../../../services/organizacion.service';
import { ZonaSanitariaService } from './../../../../services/zonaSanitaria.service';
import moment from 'moment';
import { Component, HostBinding, EventEmitter, Output, SimpleChanges, SimpleChange, OnChanges, OnInit } from '@angular/core';
import { ProfesionalService } from '../../../../services/profesional.service';
import { Auth } from '@andes/auth';
import * as loadCombos from '../../utils/comboLabelFiltro.component';

@Component({
    selector: 'turnos-filtros',
    templateUrl: 'filtros.html'
})
export class FiltrosComponent implements OnInit, OnChanges {
    @HostBinding('class.plex-layout') layout = true;

    // Filtros
    public desde: Date = moment(new Date()).startOf('month').toDate();
    public hasta: Date = new Date();
    public hoy = new Date();
    public opciones = [{ id: 'agendas', nombre: 'Agendas' }, { id: 'turnos', nombre: 'Turnos' }];
    public esTablaGrafico = false;
    public tipoTurno = [];
    public estadoTurnos = [];
    public estadosAgendas = [];
    public zonasSanitarias = [];
    public organizaciones = [];
    public zonaSanitaria;
    public organizacion;
    public showFiltroOrganizaciones = false;
    public showFiltroZonasSanitarias = false;
    private permisosZonas: any;
    private permisosOrganizaciones: any;

    // Permisos
    public verProfesionales;
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
        private auth: Auth,
        private servicioProfesional: ProfesionalService,
        private zonaSanitariaService: ZonaSanitariaService,
        private organizacionService: OrganizacionService
    ) { }

    ngOnInit() {
        this.verProfesionales = this.auth.check('visualizacionInformacion:dashboard:citas:verProfesionales');
        this.permisosOrganizaciones = this.auth.getPermissions('visualizacionInformacion:dashboard:citas:organizaciones:?');
        this.permisosZonas = this.auth.getPermissions('visualizacionInformacion:zonasSanitarias:?');
        if (!this.verProfesionales) {
            this.servicioProfesional.get({ id: this.auth.profesional }).subscribe(resultado => {
                this.seleccion.profesional = resultado;
            });
        }
        this.tipoTurno = loadCombos.getTipoTurnos();
        this.estadoTurnos = loadCombos.getEstadosTurnos();
        this.estadosAgendas = loadCombos.getEstadosAgendas();
        if (this.permisosZonas.length > 0 && this.auth.getPermissions('visualizacionInformacion:?')[0] !== '*') {
            this.showFiltroZonasSanitarias = true;
            this.loadZonas();
        }
        this.loadOrganizaciones();
    }

    changeTablaGrafico() {
        this.esTablaGrafico = !this.esTablaGrafico;
        this.onDisplayChange.emit(this.esTablaGrafico);
    }

    loadProfesionales(event) {
        let listaProfesionales = [];
        if (event.query) {
            const query = {
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

    loadOrganizaciones() {
        const params = {};
        if (this.zonaSanitaria) {
            this.organizacion = null;
            params['idsZonasSanitarias'] = [this.zonaSanitaria.id];
            this.organizacionService.get(params).subscribe(resultado => {
                this.organizaciones = resultado;
            });
        } else {
            this.organizaciones = [this.auth.organizacion];
            this.organizacion = this.auth.organizacion;
        }
    }

    loadZonas() {
        const params = {};
        if (this.permisosZonas[0] !== '*') {
            params['ids'] = this.permisosZonas;
        }
        this.zonaSanitariaService.search(params).subscribe(resultado => {
            this.zonasSanitarias = resultado;
        });
    }

    onChange() {
        const filtrosParams = {
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
            estado_agenda: this.seleccion.estado_agenda && this.seleccion.tipoDeFiltro.id === 'agendas' ? this.seleccion.estado_agenda.map(et => et.id) : undefined,
            organizacion: this.organizacion.id
        };
        this.filter.emit(filtrosParams);
    }

    ngOnChanges(changes: SimpleChanges) {
        const name: SimpleChange = changes.name;
    }
}
