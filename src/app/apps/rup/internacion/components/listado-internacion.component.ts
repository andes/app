import { estados } from '../../../../utils/enumerados';
import { Component, OnInit, ViewEncapsulation, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { InternacionService } from '../services/internacion.service';
import { IOrganizacion } from '../../../../interfaces/IOrganizacion';
import { IPacienteMatch } from '../../../../modules/mpi/interfaces/IPacienteMatch.inteface';
import { IPaciente } from '../../../../interfaces/IPaciente';
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { CamasService } from '../services/camas.service';
import { PacienteBuscarResultado } from '../../../../modules/mpi/interfaces/PacienteBuscarResultado.inteface';
import { ElementosRUPService } from '../../../../modules/rup/services/elementosRUP.service';
import * as enumerados from '../../../../utils/enumerados';

import { PacienteService } from '../../../../services/paciente.service';
// ../../../../services/internacion.service
@Component({
    selector: 'app-listado-internacion',
    templateUrl: './listado-internacion.html',
    styleUrls: [
        'listado-internacion.scss'
    ],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class ListadoInternacionComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente



    // filtros para el mapa de cama
    public filtros: any = {
        documento: null,
        apellido: null,
        fechaIngresoHasta: null,
        fechaIngresoDesde: null,
        estado: null
    };
    public estadosInternacion;
    public listadoInternacion;
    public internacionSelected;
    constructor(
        public servicioPrestacion: PrestacionesService,
        private auth: Auth,
        private plex: Plex,
        private router: Router,
        private servicioPaciente: PacienteService,

        public organizacionService: OrganizacionService,
        private internacionService: InternacionService,
        public camasService: CamasService,
        private elementoRupService: ElementosRUPService) {
    }

    ngOnInit() {


        this.plex.updateTitle([{
            route: '/',
            name: 'ANDES'
        }, {
            route: '/internacion/camas',
            name: 'Listado de internacion'
        }]);

        let unMesAtras = new Date();
        this.filtros.fechaIngresoDesde = new Date((unMesAtras.setMonth(unMesAtras.getMonth() - 1)));
        this.filtros.fechaIngresoHasta = new Date();
        this.servicioPrestacion.listadoInternacion(this.filtros).subscribe(a => { debugger; this.listadoInternacion = a; });
        this.estadosInternacion = enumerados.getObjEstadoInternacion();

    }


    volver() {
        this.router.navigate(['/internacion/inicio']);
    }

    devuelveFecha(internacion, tipo) {
        let informe = this.internacionService.verRegistro(internacion, tipo);
        if (tipo === 'ingreso') {
            return informe.informeIngreso.fechaIngreso;
        } else {
            return informe ? informe.InformeEgreso.fechaEgreso : '';

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
        this.internacionSelected = internacion;
    }
}
