import { Component, OnInit, HostBinding } from '@angular/core';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';
import { InternacionCacheService } from '../services/internacion-cache.service';

@Component({
    selector: 'lista-espera-internacion',
    templateUrl: 'lista-espera-internacion.html',
    styleUrls: ['mapa-de-camas.component.scss'],
})
export class ListaEsperaInternacionComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;

    public parametros;
    public fechaDesde: any;
    public fechaHasta: any;
    // Lista de prestaciones que actuamente no tienen una cama asignada
    public prestacionesPendientes: any[];
    // Copia de las prestaciones pendientes
    public prestacionesPendientesCopy: any;
    // objeto con los filtros para la lista de espera
    public filtros = {
        estados: [
            { id: 'paseDe', nombre: 'Pase De' },
            { id: 'ingreso', nombre: 'Ingreso' },
            { id: 'esEgreso', nombre: 'Alta' }
        ]
    };
    // Obj de los filtros seleccionados
    public select: any = {};

    constructor(private router: Router,
        public auth: Auth,
        public prestacionService: PrestacionesService,
        private cacheService: InternacionCacheService) { }

    ngOnInit() {
        this.fechaDesde = moment(new Date()).subtract(1, 'M').toDate();
        this.fechaHasta = new Date();
        this.parametros = {
            fechaDesde: this.fechaDesde,
            fechaHasta: this.fechaHasta
        };
        this.prestacionService.getInternacionesPendientes(this.parametros).subscribe(data => {
            this.prestacionesPendientes = data;
            this.prestacionesPendientesCopy = JSON.parse(JSON.stringify(this.prestacionesPendientes));
        });
    }

    /**
    * Visualizar internacion
    *
    * @param {any} cama Cama en la cual se encuentra internado el paciente.
    * @memberof CamaComponent
    */
    public verInternacion(id) {
        this.router.navigate(['rup/internacion/ver', id]);
    }

    /**
     * Regreso al mapa de camas.
     */
    volver() {
        this.router.navigate(['internacion/camas']);
    }

    /**
     * Se cachea la prestacion y navega al mapa de camas para seleccionar una cama
     * desocupada
     * @param prestacion
     */
    darCama(prestacion) {
        this.cacheService.setData(prestacion, 'lista-espera');
        this.router.navigate(['internacion/camas']);
    }

    filtrar() {
        // if (this.select.estados || this.select.nombre) {
        const regex_nombre = new RegExp('.*' + this.select.nombre + '.*', 'ig');
        this.prestacionesPendientes = this.prestacionesPendientesCopy.filter((p) => {
            return (
                (!this.select.estados || ((!p.paseDe && !p.esEgreso) && this.select.estados.id === 'ingreso') || p[this.select.estados.id])) &&
                (!this.select.nombre || (this.select.nombre && (regex_nombre.test(p.prestacion.paciente.nombre) || (regex_nombre.test(p.prestacion.paciente.apellido)) || (regex_nombre.test(p.prestacion.paciente.documento)))));
        });
    }


    refreshSelection(value, tipo) {
        if (tipo === 'fechaDesde') {
            let fechaDesde = moment(this.fechaDesde).startOf('day');
            if (fechaDesde.isValid()) {
                this.parametros['fechaDesde'] = fechaDesde.isValid() ? fechaDesde.toDate() : moment().format();
            }
        }
        if (tipo === 'fechaHasta') {
            let fechaHasta = moment(this.fechaHasta).endOf('day');
            if (fechaHasta.isValid()) {
                this.parametros['fechaHasta'] = fechaHasta.isValid() ? fechaHasta.toDate() : moment().format();
            }
        }
        this.prestacionService.getInternacionesPendientes(this.parametros).subscribe(data => {
            this.prestacionesPendientes = data;

        });
    }
}

