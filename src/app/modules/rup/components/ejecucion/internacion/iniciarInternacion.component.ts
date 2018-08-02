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
import { OcupacionService } from '../../../../../services/ocupacion/ocupacion.service';
import { IPrestacionRegistro } from '../../../interfaces/prestacion.registro.interface';
import { SnomedService } from '../../../../../services/term/snomed.service';
import { take } from 'rxjs/operator/take';
import { OrganizacionService } from '../../../../../services/organizacion.service';
import { CamasService } from '../../../services/camas.service';
import { ProfesionalService } from '../../../../../services/profesional.service';
import { ObraSocialService } from '../../../../../services/obraSocial.service';
import { PacienteService } from '../../../../../services/paciente.service';

@Component({
    selector: 'rup-iniciarInternacion',
    templateUrl: 'iniciarInternacion.html'
})
export class IniciarInternacionComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;

    @Input() paciente;
    @Input() camaSelected;
    @Input() prestacion;
    @Input() soloValores;
    @Output() data: EventEmitter<any> = new EventEmitter<any>();
    @Output() refreshCamas: EventEmitter<any> = new EventEmitter<any>();

    // soloValores = false;
    showEditarCarpetaPaciente = false;
    public ocupaciones = [];
    public obraSocial = { nombre: '', codigo: '' };
    public origenHospitalizacion = [
        { id: 'consultorio externo', nombre: 'Consultorio externo' },
        { id: 'emergencia', nombre: 'Emergencia' },
        { id: 'traslado', nombre: 'Traslado' },
        { id: 'sala de parto', nombre: 'Sala de parto' },
        { id: 'otro', nombre: 'Otro' }
    ];
    public nivelesInstruccion = [
        { id: 'primario incompleto', nombre: 'Primario incompleto' },
        { id: 'primario completo', nombre: 'Primario completo' },
        { id: 'secundario incompleto', nombre: 'Secundario incompleto' },
        { id: 'secundario completo', nombre: 'Secundario completo' },
        { id: 'Ciclo EGB (1 y 2) incompleto', nombre: 'Ciclo EGB (1 y 2) incompleto' },
        { id: 'Ciclo EGB (1 y 2) completo', nombre: 'Ciclo EGB (1 y 2) completo' },
        { id: 'Ciclo EGB 3 incompleto', nombre: 'Ciclo EGB 3 incompleto' },
        { id: 'Ciclo EGB 3 completo', nombre: 'Ciclo EGB 3 completo' },
        { id: 'Polimodal incompleto', nombre: 'Polimodal incompleto' },
        { id: 'Polimodal completo', nombre: 'Polimodal completo' },
        { id: 'terciario/universitario incompleto', nombre: 'Terciario/Universitario incompleto' },
        { id: 'terciario/universitario completo', nombre: 'Terciario/Universitario completo' }
    ];
    public situacionesLaborales = [
        { id: 'Trabaja o está de licencia', nombre: 'Trabaja o está de licencia' },
        { id: 'No trabaja y busca trabajo', nombre: 'No trabaja y busca trabajo' },
        { id: 'No trabaja y no busca trabajo', nombre: 'No trabaja y no busca trabajo' }
    ];
    public pacienteAsociado = [
        { id: 'Obra Social', nombre: 'Obra Social' },
        { id: 'Plan de salud privado o Mutual', nombre: 'Plan de salud privado o Mutual' },
        { id: 'Plan o Seguro público', nombre: 'Plan o Seguro público' },
        { id: 'Mas de uno', nombre: 'Mas de uno' },
        { id: 'Ninguno', nombre: 'Ninguno' }
    ];

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
    // public paciente: IPaciente;
    public buscandoPaciente = false;
    public cama = null;
    public organizacion = null;
    public origenExterno = false;
    public carpetaPaciente = null;
    public informeIngreso = {
        fechaIngreso: new Date(),
        origen: null,
        ocupacionHabitual: null,
        situacionLaboral: null,
        nivelInstruccion: null,
        asociado: null,
        obraSocial: null,
        motivo: null,
        organizacionOrigen: null,
        profesional: null
    };

    constructor(private router: Router, private route: ActivatedRoute,
        private plex: Plex, public auth: Auth,
        public camasService: CamasService,
        private servicioPrestacion: PrestacionesService,
        private organizacionService: OrganizacionService,
        public obraSocialService: ObraSocialService,
        public ocupacionService: OcupacionService,
        public snomedService: SnomedService,
        private location: Location,
        public servicioProfesional: ProfesionalService,
        public pacienteService: PacienteService
    ) { }

    ngOnInit() {
        if (this.prestacion) {
            let existeRegistro = this.prestacion.ejecucion.registros.find(r => r.concepto.conceptId === this.snomedIngreso.conceptId);
            if (existeRegistro) {
                this.paciente = this.prestacion.paciente;
                this.informeIngreso = existeRegistro.valor.informeIngreso;
            }
        } else if (this.paciente.id) {
            this.servicioPrestacion.internacionesXPaciente(this.paciente, 'ejecucion').subscribe(resultado => {
                // Si el paciente ya tiene una internacion en ejecucion
                if (resultado) {
                    if (resultado.cama) {
                        this.plex.alert('El paciente registra una internación en ejecución y está ocupando una cama');
                        this.router.navigate(['/internacion/camas']);
                    } else {
                        // y no esta ocupando cama lo pasamos directamente a ocupar una cama
                        this.plex.alert('El paciente tiene una internación en ejecución');
                        this.router.navigate(['rup/internacion/ocuparCama', this.cama.id, resultado.ultimaInternacion.id]);
                    }
                } else {
                    // Chequeamos si el paciente tiene una internacion validad anterios para copiar los datos
                    this.servicioPrestacion.internacionesXPaciente(this.paciente, 'validada').subscribe(datosInternacion => {
                        if (datosInternacion) {
                            this.informeIngreso = this.buscarRegistroInforme(datosInternacion.ultimaInternacion);
                        }
                        // Se busca la obra social del paciente y se le asigna
                        this.obraSocialService.get({ dni: this.paciente.documento }).subscribe(os => {
                            this.obraSocial = os;
                        });
                        this.buscandoPaciente = false;
                    });
                }
            });
        } else {
            this.plex.alert('El paciente debe ser registrado en MPI');
        }
        if (this.camaSelected) {
            let camaId = this.camaSelected;
            this.camasService.getCama(camaId).subscribe(cama => {
                this.cama = cama;
            });
        } else {
            this.route.params.subscribe(params => {
                if (params && params['id']) {
                    let id = params['id'];
                    this.camasService.getCama(id).subscribe(cama => {
                        this.cama = cama;
                    });
                }
            });
        }
        this.organizacionService.getById(this.auth.organizacion.id).subscribe(organizacion => {
            this.organizacion = organizacion;
        });

        // Cargamos todas las ocupaciones
        this.ocupacionService.get().subscribe(rta => {
            this.ocupaciones = rta;
        });
    }

    loadProfesionales(event) {
        let listaProfesionales = [];
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.servicioProfesional.get(query).subscribe(resultado => {
                listaProfesionales = resultado;
                event.callback(listaProfesionales);
            });
        } else {
            if (this.auth.profesional) {
                this.servicioProfesional.get({ id: this.auth.profesional.id }).subscribe(resultado => {
                    if (resultado) {
                        this.informeIngreso.profesional = resultado[0];
                        let callback = (resultado) ? resultado : null;
                        event.callback([callback]);
                    }
                });
            } else {
                event.callback([]);
            }
        }
    }

    buscarRegistroInforme(internacion) {
        let registros = internacion.ejecucion.registros;
        let informe = registros.find(r => r.concepto.conceptId === this.snomedIngreso.conceptId);
        return informe;
    }


    onPacienteCancel() {
        this.buscandoPaciente = false;
    }

    /**
     * Emite un false para ocultar el componente
     */
    cancelar() {
        this.data.emit(false);
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
    guardar(valid) {
        if (valid.formValid) {
            if (!this.paciente) {
                this.plex.info('warning', 'Debe seleccionar un paciente');
                return;
            }
            if (this.informeIngreso.organizacionOrigen === 'consultorio externo' || this.informeIngreso.organizacionOrigen === 'traslado' && !this.informeIngreso.organizacionOrigen) {
                this.plex.info('warning', 'Debe seleccionar una organización');
                return;
            }

            // mapeamos los datos en los combos
            this.informeIngreso.situacionLaboral = ((typeof this.informeIngreso.situacionLaboral === 'string')) ? this.informeIngreso.situacionLaboral : (Object(this.informeIngreso.situacionLaboral).nombre);
            this.informeIngreso.nivelInstruccion = ((typeof this.informeIngreso.nivelInstruccion === 'string')) ? this.informeIngreso.nivelInstruccion : (Object(this.informeIngreso.nivelInstruccion).nombre);
            this.informeIngreso.asociado = ((typeof this.informeIngreso.asociado === 'string')) ? this.informeIngreso.asociado : (Object(this.informeIngreso.asociado).nombre);
            this.informeIngreso.ocupacionHabitual = ((typeof this.informeIngreso.ocupacionHabitual === 'string')) ? this.informeIngreso.ocupacionHabitual : (Object(this.informeIngreso.ocupacionHabitual).nombre);
            this.informeIngreso.origen = ((typeof this.informeIngreso.origen === 'string')) ? this.informeIngreso.origen : (Object(this.informeIngreso.origen).nombre);
            // armamos el elemento data a agregar al array de registros
            let nuevoRegistro = new IPrestacionRegistro(null, this.snomedIngreso);
            nuevoRegistro.valor = { informeIngreso: this.informeIngreso };
            // el concepto snomed del tipo de prestacion para la internacion
            let conceptoSnomed = this.tipoPrestacionSeleccionada;

            // creamos la prestacion de internacion y agregamos el registro de ingreso
            let nuevaPrestacion = this.servicioPrestacion.inicializarPrestacion(this.paciente, this.tipoPrestacionSeleccionada, 'ejecucion', 'internacion', this.informeIngreso.fechaIngreso);
            nuevaPrestacion.ejecucion.registros = [nuevoRegistro];
            nuevaPrestacion.paciente['_id'] = this.paciente.id;
            nuevaPrestacion.solicitud.obraSocial = { codigoPuco: this.obraSocial.codigo, nombre: this.obraSocial.nombre };
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
                        // this.router.navigate(['rup/internacion/ver', prestacion.id]);
                        this.refreshCamas.emit();
                        this.data.emit(false)
                    }, (err1) => {
                        this.plex.info('danger', err1, 'Error al intentar ocupar la cama');
                    });
                } else {
                    // this.router.navigate(['rup/internacion/ver', prestacion.id]);
                    this.data.emit(false)
                    this.refreshCamas.emit();
                }

            }, (err) => {
                this.plex.info('danger', 'La prestación no pudo ser registrada. Por favor verifica la conectividad de la red.');
            });
        }

    }

    onReturn() {
        this.router.navigate(['/internacion/camas']);
    }

    changeOrigenHospitalizacion(event) {
        if (event.value.id === 'consultorio externo' || event.value.id === 'traslado') {
            this.origenExterno = true;
        } else {
            this.origenExterno = false;
        }
    }

    loadOrganizacion(event) {
        if (event.query) {
            let query = {
                nombre: event.query
            };
            this.organizacionService.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }

    // Se usa tanto para guardar como cancelar
    afterComponenteCarpeta(carpetas) {
        // Siempre es 1 sólo el seleccionado cuando se edita una carpeta
        if (carpetas) {
            this.paciente.carpetaEfectores = carpetas;
        }
        this.showEditarCarpetaPaciente = false;
    }
}
