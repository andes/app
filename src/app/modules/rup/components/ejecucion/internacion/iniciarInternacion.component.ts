import { PrestacionesService } from './../../../services/prestaciones.service';
import { CamasService } from './../../../../../services/camas.service';
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
import { take } from 'rxjs/operator/take';

@Component({
    templateUrl: 'iniciarInternacion.html'
})
export class IniciarInternacionComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;


    public ocupaciones = [];
    public obrasSociales = [];
    public origenHospitalizacion = [{ id: 'consultorio externo', nombre: 'Consultorio externo' },
    { id: 'emergencia', nombre: 'Emergencia' }, { id: 'traslado', nombre: 'Traslado' },
    { id: 'sala de parto', nombre: 'Sala de parto' }, { id: 'otro', nombre: 'Otro' }];
    public nivelesInstruccion = [{ id: 'primario incompleto', nombre: 'Primario incompleto' }, { id: 'primario completo', nombre: 'Primario completo' },
    { id: 'secundario incompleto', nombre: 'Secundario incompleto' }, { id: 'secundario completo', nombre: 'Secundario completo' },
    { id: 'Ciclo EGB (1 y 2) incompleto', nombre: 'Ciclo EGB (1 y 2) incompleto' },
    { id: 'Ciclo EGB (1 y 2) completo', nombre: 'Ciclo EGB (1 y 2) completo' },
    { id: 'Ciclo EGB 3 incompleto', nombre: 'Ciclo EGB 3 incompleto' },
    { id: 'Ciclo EGB 3 completo', nombre: 'Ciclo EGB 3 completo' },
    { id: 'Polimodal incompleto', nombre: 'Polimodal incompleto' },
    { id: 'Polimodal completo', nombre: 'Polimodal completo' },
    { id: 'terciario/universitario incompleto', nombre: 'Terciario/Universitario incompleto' },
    { id: 'terciario/universitario completo', nombre: 'Terciario/Universitario completo' }];
    public situacionesLaborales = [{ id: 'Trabaja o está de licencia', nombre: 'Trabaja o está de licencia' },
    { id: 'No trabaja y busca trabajo', nombre: 'No trabaja y busca trabajo' },
    { id: 'No trabaja y no busca trabajo', nombre: 'No trabaja y no busca trabajo' }];
    public pacienteAsociado = [{ id: 'Obra Social', nombre: 'Obra Social' },
    { id: 'Plan de salud privado o Mutual', nombre: 'Plan de salud privado o Mutual' },
    { id: 'Plan o Seguro público', nombre: 'Plan o Seguro público' },
    { id: 'Mas de uno', nombre: 'Mas de uno' }, { id: 'Ninguno', nombre: 'Ninguno' }];

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
        private location: Location) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            let id = params['id'];
            this.camasService.getCama(id).subscribe(cama => {
                this.cama = cama;
            });
        });

        // Cargamos todas las ocupaciones
        this.ocupacionService.get().subscribe(rta => {
            this.ocupaciones = rta;
        });

        // Se cargan los combos
        this.financiadorService.get().subscribe(resultado => {
            this.obrasSociales = resultado;
        });
    }

    onPacienteSelected(paciente: IPaciente) {
        if (paciente.id) {
            this.paciente = paciente;
            this.buscandoPaciente = false;
        } else {
            this.plex.alert('El paciente debe ser registrado en MPI');
        }
    }

    onPacienteCancel() {
        this.buscandoPaciente = false;
    }

    /**
     * Vuelve a la página anterior
     */
    cancelar() {
        this.location.back();
    }


    combinarFechas(fecha1, fecha2) {
        if (fecha1 && fecha2) {
            let horas: number;
            let minutes: number;
            let auxiliar: Date;

            auxiliar = new Date(fecha1);
            horas = fecha2.getHours();
            minutes = fecha2.getMinutes();
            // Date.setHours(hour, min, sec, millisec)
            auxiliar.setHours(horas, minutes, 0, 0);
            return auxiliar;
        } else {
            return null;
        }
    }

    /**
     * Guarda la prestación
     */
    guardar() {
        if (!this.paciente) {
            this.plex.info('warning', 'Debe seleccionar un paciente');
            return;
        }

        // armamos el registro para los datos del formulario de ingreso hospitalario
        let snomedConcept: any = {
            fsn: 'documento de solicitud de admisión (elemento de registro)',
            semanticTag: 'elemento de registro',
            refsetIds: ['900000000000497000'],
            conceptId: '721915006',
            term: 'documento de solicitud de admisión'
        };
        // armamos el elemento data a agregar al array de registros
        let nuevoRegistro = new IPrestacionRegistro(null, snomedConcept);
        nuevoRegistro.valor = { informeIngreso: this.informeIngreso };
        // el concepto snomed del tipo de prestacion para la internacion
        let conceptoSnomed = this.tipoPrestacionSeleccionada;

        this.informeIngreso.fechaIngreso = this.combinarFechas(this.informeIngreso.fechaIngreso, this.informeIngreso.horaIngreso);
        delete this.informeIngreso.horaIngreso;
        let nuevaPrestacion;
        nuevaPrestacion = {
            paciente: this.paciente,
            solicitud: {
                fecha: this.informeIngreso.fechaIngreso,
                tipoPrestacion: conceptoSnomed,
                // profesional logueado
                profesional:
                    {
                        id: this.auth.profesional.id, nombre: this.auth.usuario.nombre,
                        apellido: this.auth.usuario.apellido, documento: this.auth.usuario.documento
                    },
                // organizacion desde la que se solicita la prestacion
                organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.nombre },
            },
            ejecucion: {
                fecha: this.informeIngreso.fechaIngreso,
                registros: [nuevoRegistro],
                // organizacion desde la que se solicita la prestacion
                organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.nombre }
            },
            estados: {
                fecha: this.informeIngreso.fechaIngreso,
                tipo: 'ejecucion'
            }
        };

        nuevaPrestacion.paciente['_id'] = this.paciente.id;
        this.servicioPrestacion.post(nuevaPrestacion).subscribe(prestacion => {
            // vamos a actualizar el estado de la cama
            let dto = {
                fecha: this.informeIngreso.fechaIngreso,
                estado: 'ocupada',
                observaciones: '',
                idInternacion: prestacion.id,
                paciente: this.paciente
            };
            this.camasService.NewEstado(this.cama.id, dto).subscribe(camaActualizada => {
                this.router.navigate(['rup/internacion/ver', prestacion.id]);
            });
        }, (err) => {
            this.plex.info('danger', 'La prestación no pudo ser registrada. Por favor verifica la conectividad de la red.');
        });
    }

    onReturn() {
        this.router.navigate(['/mapa-de-camas']);
    }
}
