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
import { OrganizacionService } from '../../../../../services/organizacion.service';

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

    // armamos el registro para los datos del formulario de ingreso hospitalario
    public snomedIngreso: any = {
        fsn: 'documento de solicitud de admisión (elemento de registro)',
        semanticTag: 'elemento de registro',
        refsetIds: ['900000000000497000'],
        conceptId: '721915006',
        term: 'documento de solicitud de admisión'
    };

    // Paciente sleccionado
    public paciente: IPaciente;
    public buscandoPaciente = false;
    public cama = null;
    public organizacion = null;

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
        private organizacionService: OrganizacionService,
        public financiadorService: FinanciadorService,
        public ocupacionService: OcupacionService,
        public snomedService: SnomedService,
        private location: Location) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            if (params && params['id']) {
                let id = params['id'];
                this.camasService.getCama(id).subscribe(cama => {
                    this.cama = cama;
                });
            }
            this.organizacionService.getById(this.auth.organizacion.id).subscribe(organizacion => {
                this.organizacion = organizacion;
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

    buscarRegistroInforme(internacion) {
        let registros = internacion.ejecucion.registros;
        let informe = registros.find(r => r.concepto.conceptId === this.snomedIngreso.conceptId);
        return informe;
    }

    onPacienteSelected(paciente: IPaciente) {
        if (paciente.id) {
            this.servicioPrestacion.internacionesXPaciente(paciente, 'ejecucion').subscribe(resultado => {
                // Si el paciente ya tiene una internacion en ejecucion
                if (resultado) {
                    if (resultado.cama) {
                        this.plex.alert('El paciente registra una internación en ejecución y está ocupando una cama');
                        this.router.navigate(['/mapa-de-camas']);
                    } else {
                        // y no esta ocupando cama lo pasamos directamente a ocupar una cama
                        this.plex.alert('El paciente tiene una internación en ejecución');
                        this.router.navigate(['rup/internacion/ocuparCama', this.cama.id, resultado.ultimaInternacion.id]);
                    }
                } else {
                    // Chequeamos si el paciente tiene una internacion validad anterios para copiar los datos
                    this.servicioPrestacion.internacionesXPaciente(paciente, 'validada').subscribe(datosInternacion => {
                        if (datosInternacion) {
                            this.informeIngreso = this.buscarRegistroInforme(datosInternacion.ultimaInternacion);
                        }
                        this.paciente = paciente;
                        this.buscandoPaciente = false;
                    });
                }
                //
            });
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


        // armamos el elemento data a agregar al array de registros
        let nuevoRegistro = new IPrestacionRegistro(null, this.snomedIngreso);
        nuevoRegistro.valor = { informeIngreso: this.informeIngreso };
        // el concepto snomed del tipo de prestacion para la internacion
        let conceptoSnomed = this.tipoPrestacionSeleccionada;

        this.informeIngreso.fechaIngreso = this.combinarFechas(this.informeIngreso.fechaIngreso, this.informeIngreso.horaIngreso);
        delete this.informeIngreso.horaIngreso;
        // creamos la prestacion de internacion y agregamos el registro de ingreso
        let nuevaPrestacion = this.servicioPrestacion.inicializarPrestacion(this.paciente, this.tipoPrestacionSeleccionada, 'ejecucion', 'internacion', this.informeIngreso.fechaIngreso);
        nuevaPrestacion.ejecucion.registros = [nuevoRegistro];
        nuevaPrestacion.paciente['_id'] = this.paciente.id;
        this.servicioPrestacion.post(nuevaPrestacion).subscribe(prestacion => {
            if (this.cama) {
                // vamos a actualizar el estado de la cama
                let dto = {
                    fecha: this.informeIngreso.fechaIngreso,
                    estado: 'ocupada',
                    unidadOrganizativa: this.cama.ultimoEstado.unidadOrganizativa ? this.cama.ultimoEstado.unidadOrganizativa : null,
                    especialidades: this.cama.ultimoEstado.especialidades ? this.cama.ultimoEstado.especialidades : null,
                    esCensable: this.cama.ultimoEstado.esCensable,
                    genero: this.cama.ultimoEstado.genero ? this.cama.ultimoEstado.genero : null,
                    paciente: this.paciente,
                    idInternacion: prestacion.id
                };

                this.camasService.cambiaEstado(this.cama.id, dto).subscribe(camaActualizada => {
                    this.cama.ultimoEstado = camaActualizada.ultimoEstado;
                    this.router.navigate(['rup/internacion/ver', prestacion.id]);
                }, (err1) => {
                    this.plex.info('danger', err1, 'Error al intentar ocupar la cama');
                });
            } else {
                this.router.navigate(['rup/internacion/ver', prestacion.id]);
            }

        }, (err) => {
            this.plex.info('danger', 'La prestación no pudo ser registrada. Por favor verifica la conectividad de la red.');
        });
    }

    onReturn() {
        this.router.navigate(['/mapa-de-camas']);
    }
}
