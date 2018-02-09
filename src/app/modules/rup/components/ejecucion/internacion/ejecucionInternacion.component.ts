import { PrestacionesService } from './../../../services/prestaciones.service';
import { CamasService } from './../../../../../services/camas.service';
import { IPaciente } from './../../../../../interfaces/IPaciente';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, Output, Input, EventEmitter, HostBinding, ViewEncapsulation } from '@angular/core';
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
import { take } from 'rxjs/operator/take';
import { PacienteService } from '../../../../../services/paciente.service';
import { ElementosRUPService } from '../../../services/elementosRUP.service';

@Component({
    templateUrl: 'ejecucionInternacion.html',
    styleUrls: [
        './../prestacionValidacion.scss',
        './../buscador.scss'
    ],
    // Use to disable CSS Encapsulation for this component
    encapsulation: ViewEncapsulation.None
})
export class EjecucionInternacionComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;


    public ocupaciones = [];
    public obrasSociales = [];
    public situacionesLaborales = [];
    public nivelesInstruccion = [{ id: 'primario completo', nombre: 'Primario completo' },
    { id: 'secundario completo', nombre: 'Secundario completo' }, { id: 'terciario/universitario completo', nombre: 'Terciario/Universitario completo' }];
    public origenHospitalizacion = [{ id: 'ambulatorio', nombre: 'Ambulatorio' },
    { id: 'emergencia', nombre: 'Emergencia' }, { id: 'consultorio externo', nombre: 'Consultorio externo' },
    { id: 'derivación', nombre: 'Derivación' }];
    // Fecha seleccionada
    public fecha: Date = new Date();
    // Tipos de prestacion que el usuario tiene permiso
    public tiposPrestacion: any = [];
    // Tipos de prestacion seleccionada para la internación
    // TODO:: PREGUNTAR SI VAN A EXISTIR VARIOS CONCEPTOS DE INTERNACIÓN
    public tipoPrestacionSeleccionada = {
        fsn: 'admisión hospitalaria (procedimiento)',
        semanticTag: 'procedimiento',
        conceptId: '32485007',
        term: 'internación'
    };

    // prestacion actual en ejecucion
    public prestacion: any;
    // Paciente sleccionado
    public paciente: IPaciente;
    public buscandoPaciente = false;
    public cama = null;

    public informeIngreso = {
        fechaIngreso: new Date(),
        horaIngreso: null,
        origen: null,
        ocupacionHabitual: null,
        obraSocial: null
    };

    constructor(private router: Router, private route: ActivatedRoute,
        private plex: Plex, public auth: Auth,
        public camasService: CamasService,
        private servicioPrestacion: PrestacionesService,
        public financiadorService: FinanciadorService,
        public ocupacionService: OcupacionService,
        public snomedService: SnomedService,
        private servicioPaciente: PacienteService,
        public elementosRUPService: ElementosRUPService,
        private location: Location) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            let id = params['id'];
            this.elementosRUPService.ready.subscribe((resultado) => {
                if (resultado) {
                    this.inicializar(id);
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

    /**
     * Vuelve a la página anterior
     */
    cancelar() {
        this.location.back();
    }


}
