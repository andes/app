import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { Auth } from '@andes/auth';
import { Plex, SelectEvent } from '@andes/plex';

import { CamasService } from '../../../services/camas.service';
import { ICama } from '../../../interfaces/ICama';

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

    constructor(private auth: Auth, private plex: Plex,
        private router: Router,
        private camasService: CamasService) { }

    ngOnInit() {
        // verificar permisos
        // buscar camas para la organización
        this.camasService.getCamas(this.auth.organizacion.id).subscribe(camas => {
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

        let existe;
        // asignamos los sectores para los filtros
        camas.forEach(cama => {
            if (cama.sector && this.filtros.opciones.sectores.indexOf(cama.sector) === -1) {
                this.filtros.opciones.sectores.push({ 'id': cama.sector, 'nombre': cama.sector });
            }

            existe = this.filtros.opciones.habitaciones.find(habitacion => cama.habitacion === habitacion.id);
            if (cama.habitacion && !existe) {
                this.filtros.opciones.habitaciones.push({ 'id': cama.habitacion, 'nombre': cama.habitacion });
            }

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
            if (this.filtros.opciones.sectores) { this.filtros.opciones.sectores.sort((a, b) => a.id - b.id); }
            if (this.filtros.opciones.habitaciones) { this.filtros.opciones.habitaciones.sort((a, b) => a.id - b.id); }
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
                (!this.filtros.tipoCama || (this.filtros.tipoCama && i.tipoCama.conceptId === this.filtros.tipoCama.id)) &&
                (!this.filtros.habitacion || (this.filtros.habitacion && i.habitacion === this.filtros.habitacion.id)) &&
                (!this.filtros.estado || (this.filtros.estado && i.ultimoEstado.estado === this.filtros.estado.id)) &&
                (!this.filtros.sector || (this.filtros.sector && i.sector === this.filtros.sector.id)) &&
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
        this.camas[index] = e;
    }


    public ingresarPaciente() {
        this.router.navigate(['rup/internacion/crear']);
    }

    public censoDiario() {
        this.router.navigate(['rup/internacion/censo']);
    }
}
