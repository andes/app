import { DesocuparCamaComponent } from './cama-desocupar.component';
import { Component, OnInit, ViewEncapsulation, HostBinding, ViewChildren, ViewChild, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { InternacionService } from '../services/internacion.service';
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { CamasService } from '../services/camas.service';
import * as enumerados from '../../../../utils/enumerados';
import { ResumenInternacionComponent } from './resumenInternacion.component';

// ../../../../services/internacion.service
@Component({
    selector: 'app-listado-internacion',
    templateUrl: './listado-internacion.html',
    styleUrls: [
        'listado-internacion.scss',
        'mapa-de-camas.component.scss'
    ],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class ListadoInternacionComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente
    @ViewChildren(ResumenInternacionComponent) Resumen: ResumenInternacionComponent;
    // filtros para el mapa de cama
    public filtros: any = {
        documento: null,
        apellido: null,
        fechaIngresoHasta: null,
        fechaIngresoDesde: null,
        estado: null
    };
    public mostrarPases = false;
    public estadosInternacion;
    public listadoInternacion;
    public internacionSelected;
    public showEgreso = false;
    public soloValores = true;
    constructor(
        public servicioPrestacion: PrestacionesService,
        private auth: Auth,
        private plex: Plex,
        private router: Router,
        public organizacionService: OrganizacionService,
        private internacionService: InternacionService,
        public camasService: CamasService) {
    }

    ngOnInit() {
        this.plex.updateTitle([{
            route: '/',
            name: 'ANDES'
        }, {
            route: '/internacion/camas',
            name: 'Listado de internación'
        }]);

        let unMesAtras = new Date();
        this.filtros.fechaIngresoDesde = new Date((unMesAtras.setMonth(unMesAtras.getMonth() - 1)));
        this.filtros.fechaIngresoHasta = new Date();
        this.servicioPrestacion.listadoInternacion(this.filtros).subscribe(a => { this.listadoInternacion = a; });
        this.estadosInternacion = enumerados.getObjEstadoInternacion();

    }


    volver() {
        this.router.navigate(['/internacion/camas']);
    }

    devuelveFecha(internacion, tipo) {
        let informe = this.internacionService.verRegistro(internacion, tipo);
        if (tipo === 'ingreso') {
            return informe.informeIngreso.fechaIngreso;
        } else {
            return informe ? informe.InformeEgreso.fechaEgreso : null;

        }
    }

    datosCama(idInternacion) {
        this.camasService.getInternacionCama(idInternacion).subscribe(a => { return a; });
    }


    filtrar() {
        if (this.filtros.estados) {
            this.filtros['estadoString'] = this.filtros.estados.id;
        } else {
            this.filtros['estadoString'] = '';
        }
        this.servicioPrestacion.listadoInternacion(this.filtros).subscribe(a => { this.listadoInternacion = a; });

    }

    seleccionarInternacion(internacion) {
        this.soloValores = true;
        this.showEgreso = false;
        this.internacionSelected = null;
        this.mostrarPases = false;
        this.internacionSelected = Object.assign({}, internacion);
        if ((this.Resumen as any).first && (this.Resumen as any).first.puedeEditar) {
            (this.Resumen as any).first.puedeEditar = true;
        }
    }

    actualizarListado(event) {
        // Si viene event.desocupaCama significa que se cargaron los datos de egreso
        if (event.desocupaCama) {
            this.filtrar();
            this.desocuparCama(event.egresoExiste, event.cama);
        }
    }


    desocuparCama(egreso, unaCama) {
        let dto;
        if (!unaCama) {
            let fechaEgreso = egreso.valor.InformeEgreso.fechaEgreso;
            this.servicioPrestacion.getPasesInternacion(this.internacionSelected.id).subscribe(lista => {
                let listaFiltrada = lista.filter(c => c.estados.fecha < fechaEgreso);
                this.camasService.getCama(listaFiltrada[listaFiltrada.length - 1]._id).subscribe(cama => {
                    if (cama) {
                        dto = {
                            fecha: egreso.valor.InformeEgreso.fechaEgreso,
                            estado: this.internacionService.usaWorkflowCompleto(this.auth.organizacion._id) ? 'desocupada' : 'disponible',
                            unidadOrganizativa: cama.ultimoEstado.unidadOrganizativa ? cama.ultimoEstado.unidadOrganizativa : null,
                            especialidades: cama.ultimoEstado.especialidades ? cama.ultimoEstado.especialidades : null,
                            esCensable: cama.ultimoEstado.esCensable,
                            genero: cama.ultimoEstado.genero ? cama.ultimoEstado.genero : null,
                            paciente: null,
                            idInternacion: null
                        };
                        this.camasService.cambiaEstado(cama.id, dto).subscribe(camaActualizada => {
                        }, (err1) => {
                            this.plex.info('danger', 'Error al intentar desocupar la cama');
                        });
                    }
                });
            });
        }
    }

}
