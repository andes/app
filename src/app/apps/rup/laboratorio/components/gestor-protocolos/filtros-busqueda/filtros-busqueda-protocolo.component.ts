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

    public showSelectPracticas: Boolean = false;
    public showSelectHojaTrabajo: Boolean = false;
    public origenEnum: any;
    public prioridadesFiltroEnum;
    public estadosFiltroEnum;
    public estadosValFiltroEnum;
    public hojaTrabajo;
    public pacientes;
    public pacienteActivo;
    public cargaLaboratorioEnum;
    public modoCargaLaboratorio;
    public modoCargaLaboratorioEnum;
    public laboratorioInternoEnum;
    public indexProtocolo;
    public turnosRecepcion;
    public areas = [];
    public servicios = [];
    public busqueda = {
        solicitudDesde: new Date(),
        solicitudHasta: new Date(),
        pacienteDocumento: null,
        nombrePaciente: null,
        apellidoPaciente: null,
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
        area: null
    };

    mostrarMasOpciones = false;

    paciente: any;

    constructor(public plex: Plex, private formBuilder: FormBuilder,
        public auth: Auth,
        private servicioOrganizacion: OrganizacionService,
        private servicioAreaLaboratorio: AreaLaboratorioService,
        private servicioHojaTrabajo: HojaTrabajoService,
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
            } else if (tipo === 'hojaTrabajo') {
                this.busqueda.practicas = this.hojaTrabajo ? this.hojaTrabajo.practicas.map(p => { return p.id; }) : [];
            } else if (tipo === 'origen') {
                this.busqueda.origen = this.busqueda.origen ? this.busqueda.origen.id : null;
            } else if (tipo === 'prioridad') {
                this.busqueda.prioridad = this.busqueda.prioridad ? this.busqueda.prioridad.id : null;
            } else if (tipo === 'servicio') {
                this.busqueda.servicio = this.servicios.map( (e: any) => { return e.id; } );
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
     * @param {*} $event
     * @memberof FiltrosBusquedaProtocoloComponent
     */
    cambiarModoCarga($event) {
        // if ($event.value === 'Lista de protocolos') {
        //     this.showSelectPracticas = true;
        //     this.showSelectHojaTrabajo = false;
        // } else
         if ($event.value === 'Hoja de trabajo') {
            this.showSelectHojaTrabajo = true;
            this.showSelectPracticas = false;
        } else {
            this.showSelectHojaTrabajo = false;
        }
    }

    /**
     *
     *
     * @param {*} $event
     * @memberof FiltrosBusquedaProtocoloComponent
     */
    getHojasTrabajo($event) {
        this.servicioHojaTrabajo.get(this.auth.organizacion.id).subscribe((hojas: any) => {
            $event.callback(hojas);
        });
    }

    /**
     * Guarda en el local storage del browser la selección de filtros de búsqueda para futuras búsquedas
     *
     * @memberof PuntoInicioLaboratorioComponent
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

    filtrarPaciente() {
        this.buscarProtocolosEmmiter.emit(this.busqueda);
    }
}



