import * as enumerados from '../../../../../../../utils/enumerados';
import { PacienteService } from './../../../../../../../services/paciente.service';
import { AreaLaboratorioService } from './../../../../services/areaLaboratorio.service';
import { OrganizacionService } from './../../../../../../../services/organizacion.service';
import { Auth } from '@andes/auth';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Plex } from '@andes/plex';

@Component({
    selector: 'reporte-resultados-filtros',
    templateUrl: 'filtros-busqueda-protocolo.html',
})

export class ReporteResultadosFiltrosComponent

    implements OnInit {

    @Output() buscarProtocolosEmmiter: EventEmitter<any> = new EventEmitter<any>();

    public origenEnum: any;
    public prioridadesFiltroEnum;
    public estadosFiltroEnum;
    public estadosValFiltroEnum;
    public cargaLaboratorioEnum;
    public modoCargaLaboratorioEnum;
    public areas = [];
    public servicios = [];
    public estado;



    public busqueda = {
        solicitudDesde: new Date(),
        solicitudHasta: new Date(),
        idPaciente: null,
        origen: null,
        numProtocoloDesde: null,
        numProtocoloHasta: null,
        servicio: null,
        prioridad: null,
        areas: [],
        laboratorioInterno: null,
        tipoPrestacionSolicititud: '15220000',
        organizacion: null,
        practicas: null,
        area: null,
        estado: null,
        organizacionDestino: this.auth.organizacion._id,
        practicasValidadas: true
    };

    mostrarMasOpciones = false;

    paciente: any;

    constructor(public plex: Plex, private formBuilder: FormBuilder,
        public auth: Auth,
        private servicioOrganizacion: OrganizacionService,
        private servicioAreaLaboratorio: AreaLaboratorioService,
        private servicioPaciente: PacienteService,
    ) { }

    ngOnInit() {
        this.prioridadesFiltroEnum = enumerados.getPrioridadesFiltroLab();
        this.estadosFiltroEnum = enumerados.getEstadosFiltroLab();
        this.estadosValFiltroEnum = enumerados.getEstadosFiltroLab().slice(1, 4);
        this.origenEnum = enumerados.getOrigenLab();
        this.cargaLaboratorioEnum = enumerados.getCargaLaboratorio();
        this.modoCargaLaboratorioEnum = enumerados.getModoCargaLaboratorio();
        this.cargarAreasLaboratorio();
        this.buscarProtocolos();
    }

    cargarAreasLaboratorio() {
        this.servicioAreaLaboratorio.get().subscribe((areas: any) => {
            this.areas = areas.map((area) => {
                return {
                    id: area._id,
                    nombre: area.nombre
                };
            });
        });
    }

    /**
     * Realiza la búsqueda de prestaciones según selección de filtros
     *
     * @param {any} [tipo]
     * @memberof PuntoInicioLaboratorioComponent
     */
    buscarProtocolos($event?, tipo?) {
        if (tipo) {
            if (tipo === 'area') {
                this.busqueda.areas = this.busqueda.area ? [this.busqueda.area.id] : null;
            } else if (tipo === 'origen') {
                this.busqueda.origen = this.busqueda.origen ? this.busqueda.origen.id : null;
            } else if (tipo === 'prioridad') {
                this.busqueda.prioridad = this.busqueda.prioridad ? this.busqueda.prioridad.id : null;
            } else if (tipo === 'servicio') {
                this.busqueda.servicio = this.servicios.map((e: any) => { return e.id; });
            } else if (tipo === 'paciente') {
                this.busqueda.idPaciente = this.paciente ? this.paciente.id : null;
            } else if (tipo === 'estado') {
                console.log('this.estado', this.estado);
                this.busqueda.estado = this.estado && this.estado.id !== 'todos' ? [this.estado] : null;
            }
        }
        this.buscarProtocolosEmmiter.emit(this.busqueda);
    }

    /**
     * Busca unidades organizativas de la organización
     *
     * @param {any} $event
     * @memberof PuntoInicioLaboratorioComponent
     */
    loadServicios($event) {
        this.servicioOrganizacion.getById(this.auth.organizacion.id).subscribe((organizacion: any) => {
            let servicioEnum = organizacion.unidadesOrganizativas;
            $event.callback(servicioEnum);
        });
    }

    /**
     * Recupera lista de organizaciones
     *
     * @param {any} event
     * @memberof PuntoInicioLaboratorioComponent
     */
    loadOrganizaciones(event) {
        if (event.query) {
            let query = {
                nombre: event.query
            };
            this.servicioOrganizacion.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }

    /**
     * Devuelve lista de prioridades predefinidas para prestaciones de laboratorio
     * @param {any} event
     * @returns
     * @memberof PuntoInicioLaboratorioComponent
     */
    loadPrioridad(event) {
        event.callback(enumerados.getPrioridadesLab());
        return enumerados.getPrioridadesLab();
    }

    /**
     *
     *
     * @param {*} event
     * @memberof FiltrosBusquedaProtocoloComponent
     */
    loadPacientes(event) {
        if (event.query) {
            this.servicioPaciente.get({ type: 'multimatch', cadenaInput: event.query }).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }
}
