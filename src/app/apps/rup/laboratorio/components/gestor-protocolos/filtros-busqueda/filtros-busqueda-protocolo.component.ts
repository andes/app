import { LaboratorioContextoCacheService } from './../../../services/protocoloCache.service';
import { PracticaService } from './../../../services/practica.service';
import { PacienteService } from './../../../../../../services/paciente.service';
import { HojaTrabajoService } from './../../../services/hojatrabajo.service';
import { Auth } from '@andes/auth';
import { AreaLaboratorioService } from '../../../services/areaLaboratorio.service';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Plex } from '@andes/plex';
import * as enumerados from '../../../../../../utils/enumerados';
import { OrganizacionService } from '../../../../../../services/organizacion.service';

@Component({
    selector: 'filtros-busqueda-protocolo',
    templateUrl: 'filtros-busqueda-protocolo.html',
})

export class FiltrosBusquedaProtocoloComponent

    implements OnInit {

    @Output() buscarProtocolosEmmiter: EventEmitter<any> = new EventEmitter<any>();
    @Input() modo;
    @Input() editarListaPracticas;

    public showSelectHojaTrabajo: Boolean = false;
    public showSelectPracticas: Boolean = false;
    public showSelectArea: Boolean = false;
    public origenEnum: any;
    public prioridadesFiltroEnum;
    public estadosFiltroEnum;
    public estadosValFiltroEnum;
    public hojaTrabajo;
    public pacientes;
    public pacienteActivo;
    public cargaLaboratorioEnum;
    public modoCargaLaboratorioEnum;
    public laboratorioInternoEnum;
    public indexProtocolo;
    public turnosRecepcion;
    public hojasTrabajo = [];
    // public practicas = [];
    public practicasFiltro;
    public areas = [];
    public servicios = [];
    public cacheContexto;
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
        estado: [],
        practicas: null,
        area: null,
        organizacionDestino: this.auth.organizacion._id
    };

    mostrarMasOpciones = false;

    paciente: any;

    constructor(public plex: Plex, private formBuilder: FormBuilder,
        public auth: Auth,
        private servicioOrganizacion: OrganizacionService,
        private servicioAreaLaboratorio: AreaLaboratorioService,
        private servicioHojaTrabajo: HojaTrabajoService,
        private servicioPaciente: PacienteService,
        private practicaService: PracticaService,
        private laboratorioContextoCacheService: LaboratorioContextoCacheService
    ) { }

    ngOnInit() {
        this.cacheContexto = this.laboratorioContextoCacheService.getContextoCache();
        this.prioridadesFiltroEnum = enumerados.getPrioridadesFiltroLab();
        this.estadosFiltroEnum = enumerados.getEstadosFiltroLab();
        this.estadosValFiltroEnum = enumerados.getEstadosFiltroLab().slice(1, 4);
        this.origenEnum = enumerados.getOrigenLab();
        this.cargaLaboratorioEnum = enumerados.getCargaLaboratorio();
        this.modoCargaLaboratorioEnum = enumerados.getModoCargaLaboratorio();
        this.cargarAreasLaboratorio();
        this.buscarProtocolos();
        if (!this.cacheContexto.modoCargaLaboratorio) {
            this.cacheContexto.modoCargaLaboratorio = 'Lista de protocolos';
        }
        this.cambiarModoCarga(this.cacheContexto.modoCargaLaboratorio);
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
            } else if (tipo === 'hojaTrabajo') {
                this.busqueda.practicas = this.hojaTrabajo ? this.hojaTrabajo.practicas.map(p => { return p.id; }) : [];
            } else if (tipo === 'practicas') {
                this.busqueda.practicas = this.busqueda.practicas.map( e => { return e.id; } );
            } else if (tipo === 'origen') {
                this.busqueda.origen = this.busqueda.origen ? this.busqueda.origen.id : null;
            } else if (tipo === 'prioridad') {
                this.busqueda.prioridad = this.busqueda.prioridad ? this.busqueda.prioridad.id : null;
            } else if (tipo === 'servicio') {
                this.busqueda.servicio = this.servicios.map((e: any) => { return e.id; });
            } else if (tipo === 'paciente') {
                this.busqueda.idPaciente = this.paciente ? this.paciente.id : null;
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

    /**
     *
     *
     * @param {*} $event
     * @memberof FiltrosBusquedaProtocoloComponent
     */
    cambiarModoCarga($event) {
        this.cacheContexto.cargarPorPracticas = false;
        if ($event.value === 'Análisis') {
            if (this.laboratorioContextoCacheService.isModoCarga()) {
                this.cacheContexto.cargarPorPracticas = true;
            }
            this.showSelectArea = true;
            this.showSelectHojaTrabajo = false;
            this.showSelectPracticas = true;
        } else if ($event.value === 'Hoja de trabajo') {
            this.showSelectArea = true;
            this.showSelectHojaTrabajo = true;
            this.showSelectPracticas = false;
        } else {
            this.showSelectArea = false;
            this.showSelectHojaTrabajo = false;
            this.showSelectPracticas = false;
        }
    }

    /**
     * Buscar hojas de trabajo según área seleccionada. En cualquier caso (área seleccionada o no) limpia los atributos hojaTrabajo (dependiente de hojasTrabajo)
     *  y this.busqueda.practicas (dependientes en este caso de la hojaTrabajo seleccionada)
     *
     * @param {*} $event
     * @memberof FiltrosBusquedaProtocoloComponent
     */
    onChangeSelectArea($event) {
        if ($event.value) {
            if (this.showSelectHojaTrabajo) {
                this.servicioHojaTrabajo.get(this.auth.organizacion.id, $event.value.id).subscribe((hojas: any) => {
                    this.hojasTrabajo = hojas;
                });
            } else if (this.showSelectPracticas) {
                this.practicaService.getByArea($event.value.id).subscribe((practicas: any) => {
                    this.practicasFiltro = practicas;
                });
            }
        } else {
            this.hojasTrabajo = [];
            this.busqueda.practicas = [];
        }
        this.hojaTrabajo = null;
        this.busqueda.practicas = null;
        this.buscarProtocolosEmmiter.emit(null);
    }

    /**
     * Guarda en el local storage del browser la selección de filtros de búsqueda para futuras búsquedas
     *
     * @memberof FiltrosBusquedaProtocoloComponent
     */
    recordarFiltros() {
        let filtrosPorDefecto = {
            busqueda: this.busqueda,
            profesional: this.auth.profesional._id
        };

        //     let filtros = JSON.parse(localStorage.getItem('filtros'));
        //     if (!filtros) {
        //         filtros = [filtrosPorDefecto];
        //     } else {
        //         let existe = filtros.findIndex(x => x.profesional === filtrosPorDefecto.profesional);
        //         if (existe === -1) {
        //             filtros.push(filtrosPorDefecto);
        //         }
        //     }

        localStorage.setItem('filtros', JSON.stringify(filtrosPorDefecto));
        this.plex.toast('success', 'Se recordará su selección de filtro en sus próximas sesiones.', 'Información', 3000);
    }

    /**
     *
     *
     * @memberof FiltrosBusquedaProtocoloComponent
     */
    filtrarPaciente() {
        this.buscarProtocolosEmmiter.emit(this.busqueda);
    }
}



