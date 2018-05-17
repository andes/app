import { PrestacionesService } from './../../../services/prestaciones.service';
import { IPaciente } from './../../../../../interfaces/IPaciente';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, Output, Input, EventEmitter, HostBinding } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import * as moment from 'moment';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { FinanciadorService } from '../../../../../services/financiador.service';
import { OcupacionService } from '../../../../../services/ocupacion/ocupacion.service';
import { IPrestacionRegistro } from '../../../interfaces/prestacion.registro.interface';
import { SnomedService } from '../../../../../services/term/snomed.service';
import { OrganizacionService } from '../../../../../services/organizacion.service';
import { ElementosRUPService } from '../../../services/elementosRUP.service';
import { PacienteService } from '../../../../../services/paciente.service';
import { CamasService } from '../../../services/camas.service';

@Component({
    templateUrl: 'ocuparCama.html'
})
export class OcuparCamaComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;

    // prestacion actual en ejecucion
    public prestacion: any;
    // Paciente sleccionado
    public paciente: IPaciente;
    public cama = null;
    public organizacion = null;
    public fecha = new Date();

    constructor(private router: Router, private route: ActivatedRoute,
        private plex: Plex, public auth: Auth,
        public camasService: CamasService,
        private servicioPrestacion: PrestacionesService,
        private organizacionService: OrganizacionService,
        public financiadorService: FinanciadorService,
        public ocupacionService: OcupacionService,
        public snomedService: SnomedService,
        public elementosRUPService: ElementosRUPService,
        private servicioPaciente: PacienteService,
        private location: Location) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            let idCama = params['idCama'];
            let idInternacion = params['idInternacion'];
            this.camasService.getCama(idCama).subscribe(cama => {
                this.cama = cama;
                this.organizacionService.getById(this.auth.organizacion.id).subscribe(organizacion => {
                    this.organizacion = organizacion;
                });
            });
            // cargar el elementoRUP de la internacion
            this.elementosRUPService.ready.subscribe((resultado) => {
                if (resultado) {
                    this.inicializar(idInternacion);
                }
            });
        });
    }

    inicializar(id) {

        // Mediante el id de la prestación que viene en los parámetros recuperamos el objeto prestación
        this.servicioPrestacion.getById(id).subscribe(prestacion => {
            this.prestacion = prestacion;
            // Carga la información completa del paciente
            this.servicioPaciente.getById(prestacion.paciente.id).subscribe(paciente => {
                this.paciente = paciente;
            });

        });
    }

    ocuparCama() {
        // vamos a actualizar el estado de la cama
        let dto = {
            fecha: this.fecha,
            estado: 'ocupada',
            unidadOrganizativa: this.cama.ultimoEstado.unidadOrganizativa ? this.cama.ultimoEstado.unidadOrganizativa : null,
            especialidades: this.cama.ultimoEstado.especialidades ? this.cama.ultimoEstado.especialidades : null,
            esCensable: this.cama.ultimoEstado.esCensable,
            genero: this.cama.ultimoEstado.genero ? this.cama.ultimoEstado.genero : null,
            paciente: this.paciente,
            idInternacion: this.prestacion.id
        };

        this.camasService.cambiaEstado(this.cama.id, dto).subscribe(camaActualizada => {
            this.cama.ultimoEstado = camaActualizada.ultimoEstado;
            this.router.navigate(['/internacion/camas']);
        }, (err1) => {
            this.plex.info('danger', err1, 'Error al intentar ocupar la cama');
        });
    }

    cancelar() {
        this.router.navigate(['/internacion/camas']);
    }

}
