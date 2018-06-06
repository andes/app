import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { Auth } from '@andes/auth';
import { Plex, SelectEvent } from '@andes/plex';

import { IOrganizacion } from '../../../../../../interfaces/IOrganizacion';
import { OrganizacionService } from '../../../../../../services/organizacion.service';
import { CamasService } from '../../../../services/camas.service';

@Component({
    selector: 'app-mapa-de-camas',
    templateUrl: './mapa-de-camas.component.html',
    styleUrls: ['./mapa-de-camas.component.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class MapaDeCamasComponent implements OnInit {

    // listado de camas de la organizacion
    public camas: any[] = [];
    // copia de las camas
    public camasCopy = [];
    // estado de las camas de la organizacion
    public estadoServicio: any = {};
    // tipo de vista del mapa de camas
    public layout: String = 'grid';
    public organizacion: IOrganizacion;
    public prestacion: any;

    // filtros para el mapa de cama
    public filtros: any = {
        camas: null,
        habitacion: null,
        oxigeno: false,
        desinfectada: null,
        tipoCama: false,
        nombre: null,
        estado: null,
        servicio: null,
        sector: null,
        opciones: {
            sectores: [],
            habitaciones: [],
            estados: [],
            servicios: [],
            tiposCamas: []
        }
    };

    public showListaEspera = false;

    constructor(
        private auth: Auth,
        private plex: Plex,
        private router: Router,
        public organizacionService: OrganizacionService,
        private camasService: CamasService) { }

    ngOnInit() {
        this.refresh();
    }

    refresh() {
        // verificar permisos
        // buscar camas para la organización
        this.limpiarFiltros();
        this.camasService.getCamas({ idOrganizacion: this.auth.organizacion.id }).subscribe(camas => {
            this.camas = camas;

            this.camasService.getEstadoServicio(camas).subscribe(estado => {
                this.estadoServicio = estado;
            });

            // creamos copia para reestablecer luego de los filtros
            this.camasCopy = JSON.parse(JSON.stringify(this.camas));

            // seteamos las opciones para los filtros del mapa de camas
            this.setOpcionesFiltros(camas);
        }, (err) => {
            if (err) {
                this.plex.info('danger', err, 'Error');
                this.router.navigate(['/']);
            }
        });
    }

    /**
     * Limpiamos los filtros del mapa de camas
     *
     * @memberof MapaDeCamasComponent
     */
    public limpiarFiltros() {
        this.filtros.habitacion = null;
        this.filtros.oxigeno = false;
        this.filtros.desinfectada = false;
        this.filtros.tipoCama = false;
        this.filtros.nombre = null;
        this.filtros.estado = null;
        this.filtros.servicio = null;
        this.filtros.sector = null;
        this.filtros.opciones = {
            sectores: [],
            habitaciones: [],
            estados: [],
            servicios: [],
            tiposCamas: []
        };

        this.camas = this.camasCopy;
    }

    /**
     * Creamos las opciones de los filtros en base a las características
     * que traigan las camas para armar el mapa de camas
     * @param {any} camas
     * @returns
     * @memberof MapaDeCamasComponent
     */
    public setOpcionesFiltros(camas) {
        if (!camas) {
            return;
        }

        this.organizacionService.getById(this.auth.organizacion.id).subscribe(organizacion => {
            this.organizacion = organizacion;
            // Filtros por sector
            this.filtros.opciones.sectores = this.organizacionService.getFlatTree(this.organizacion, false);
        });

        let existe;
        // asignamos los sectores para los filtros
        camas.forEach(cama => {

            existe = this.filtros.opciones.estados.find(estado => estado.id === cama.ultimoEstado.estado);
            if (cama.ultimoEstado && !existe) {
                this.filtros.opciones.estados.push({ 'id': cama.ultimoEstado.estado, 'nombre': cama.ultimoEstado.estado });
            }
            existe = this.filtros.opciones.servicios.find(servicio => servicio.id === cama.ultimoEstado.unidadOrganizativa.conceptId);
            if (cama.ultimoEstado.unidadOrganizativa && !existe) {
                this.filtros.opciones.servicios.push({ 'id': cama.ultimoEstado.unidadOrganizativa.conceptId, 'nombre': cama.ultimoEstado.unidadOrganizativa.term });
            }

            existe = this.filtros.opciones.tiposCamas.find(tipoCama => tipoCama.id === cama.tipoCama.conceptId);
            if (cama.tipoCama && !existe) {
                this.filtros.opciones.tiposCamas.push({ 'id': cama.tipoCama.conceptId, 'nombre': cama.tipoCama.term });
            }

            // TODO: Definir filtros para , oxigeno, etc.

            // ordenamos las opciones utilizando el desaconsejado metodo sort() :D
            if (this.filtros.opciones.estados) { this.filtros.opciones.estados.sort((a, b) => a.id - b.id); }
            if (this.filtros.opciones.servicios) { this.filtros.opciones.servicios.sort((a, b) => a.term - b.term); }
            if (this.filtros.opciones.tiposCamas) { this.filtros.opciones.tiposCamas.sort((a, b) => a.term - b.term); }
        });
    }

    /**
     * Aplicar filtros al mapa de camas
     *
     * @memberof MapaDeCamasComponent
     */
    public filtrar() {
        const regex_nombre = new RegExp('.*' + this.filtros.nombre + '.*', 'ig');

        let _desinfectada = (this.filtros.desinfectada) ? false : null;

        this.camas = this.camasCopy.filter((i) => {
            return (
                (!this.filtros.sector || i.sectores.findIndex((_s) => _s.id === this.filtros.sector.id) >= 0) &&
                (!this.filtros.tipoCama || (this.filtros.tipoCama && i.tipoCama.conceptId === this.filtros.tipoCama.id)) &&
                (!this.filtros.estado || (this.filtros.estado && i.ultimoEstado.estado === this.filtros.estado.id)) &&
                (!this.filtros.servicio || !this.filtros.servicio || (this.filtros.servicio.id && i.ultimoEstado.unidadOrganizativa && i.ultimoEstado.unidadOrganizativa.conceptId === this.filtros.servicio.id)) &&
                (!this.filtros.nombre || (this.filtros.nombre && i.ultimoEstado && (regex_nombre.test(i.ultimoEstado.paciente.nombre) || (regex_nombre.test(i.ultimoEstado.paciente.apellido)) || (regex_nombre.test(i.ultimoEstado.paciente.documento)))))
            );
        });
    }

    /**
     * Actualizar cama del array a mostrar en el mapa de camas
     * Metodo que se ejecuta luego que el EventEmitter de CamasComponent
     * devuelve la cama modificada
     * @param {any} e EventEmmiter result
     * @param {any} index Indice de la cama en el array de camas
     * @memberof MapaDeCamasComponent
     */
    public updateCama(e, index) {
        if (e) {
            this.camas[index] = e;
        } else {
            this.refresh();
        }
    }

    /**
     * Ir al ABM de camas
     */

    onGestionCamaClick() {
        let org = this.auth.organizacion.id;
        this.router.navigate(['tm/organizacion/cama']);
    }

    public ingresarPaciente() {
        this.router.navigate(['rup/internacion/crear']);
    }

    public censoDiario() {
        this.router.navigate(['rup/internacion/censo']);
    }

    public censoMensual() {
        this.router.navigate(['rup/internacion/censo/mensual']);
    }

    /**
     * Check de los permisos para mostrar botones o datos.
     */

    checkAuth(permiso) {
        return this.auth.check('internacion:' + permiso);
    }

    onDarCama($event) {
        this.prestacion = $event;
        if ($event) {
            this.filtros.estado = { 'id': 'disponible', 'nombre': 'disponible' };
            this.filtros.opciones.estados = [{ 'id': 'disponible', 'nombre': 'disponible' }];
        } else {
            this.limpiarFiltros();
            this.refresh();
        }
        this.filtrar();
    }
}
