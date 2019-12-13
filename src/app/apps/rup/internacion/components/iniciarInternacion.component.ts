import { Component, OnInit, Output, Input, EventEmitter, HostBinding } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { CamasService } from '../services/camas.service';
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { ObraSocialService } from '../../../../services/obraSocial.service';
import { OcupacionService } from '../../../../services/ocupacion/ocupacion.service';
import { SnomedService } from '../../../mitos';
import { ProfesionalService } from '../../../../services/profesional.service';
import { InternacionService } from '../services/internacion.service';
import { PacienteService } from '../../../../core/mpi/services/paciente.service';
import { IPrestacionRegistro } from '../../../../modules/rup/interfaces/prestacion.registro.interface';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
    selector: 'rup-iniciarInternacion',
    templateUrl: 'iniciarInternacion.html'
})
export class IniciarInternacionComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;

    private _prestacion: any;
    @Input()
    set prestacion(value: any) {
        this._prestacion = value;
        if (this._prestacion) {
            let existeRegistro = this.servicioInternacion.verRegistro(this._prestacion, 'ingreso');
            if (existeRegistro) {
                this.paciente = this._prestacion.paciente;
                this.informeIngreso = existeRegistro.informeIngreso;
            }
        }

    }
    get prestacion(): any {
        return this._prestacion;
    }

    @Input() desdeListadoInternacion;
    @Input() paciente;
    @Input() camaSelected;
    @Input() soloValores;
    @Input() workflowC;
    @Output() data: EventEmitter<any> = new EventEmitter<any>();
    // Emite la cama con el paciente internado
    @Output() accionCama: EventEmitter<any> = new EventEmitter<any>();
    @Output() otroPaciente: EventEmitter<any> = new EventEmitter<any>();
    nroCarpetaOriginal: string;
    btnIniciarGuardar;
    showEditarCarpetaPaciente = false;

    public listaPasesCama = [];
    public primerPase;
    public listaUnidadesOrganizativas = [];
    public listadoCamas = [];
    public paseAunidadOrganizativa: any;
    public ocupaciones = [];
    public especialidades = [];
    public obraSocial;
    public origenHospitalizacion = [
        { id: 'consultorio externo', nombre: 'Consultorio externo' },
        { id: 'emergencia', nombre: 'Emergencia' },
        { id: 'traslado', nombre: 'Traslado' },
        { id: 'sala de parto', nombre: 'Sala de parto' },
        { id: 'otro', nombre: 'Otro' }
    ];
    public nivelesInstruccion = [
        { id: 'ninguno', nombre: 'Ninguno' },
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
        { id: 1, nombre: 'Trabaja o está de licencia' },
        { id: 2, nombre: 'No trabaja y busca trabajo' },
        { id: 3, nombre: 'No trabaja y no busca trabajo' }
    ];
    public pacienteAsociado = [
        { id: 'Plan de salud privado o Mutual', nombre: 'Plan de salud privado o Mutual' },
        { id: 'Plan o Seguro público', nombre: 'Plan o Seguro público' },
        { id: 'Ninguno', nombre: 'Ninguno' }
    ];

    // Fecha seleccionada
    public fecha: Date = new Date();
    // Fecha seleccionada
    public hora: Date = new Date();
    // Hora de nacimiento (para recien nacidos)
    public pedirHoraNac = false;
    // Tipos de prestacion que el usuario tiene permiso
    public tiposPrestacion: any = [];
    // Tipos de prestacion seleccionada para la internación
    // TODO:: PREGUNTAR SI VAN A EXISTIR VARIOS CONCEPTOS DE INTERNACIÓN

    // armamos el registro para los datos del formulario de ingreso hospitalario
    public snomedIngreso: any = this.servicioInternacion.conceptosInternacion.ingreso;

    // Paciente sleccionado
    // public paciente: IPaciente;
    public buscandoPaciente = false;
    public cama = null;
    public check = false;
    public organizacion: any;
    public origenExterno = false;
    public carpetaPaciente = null;
    public informeIngreso = {
        fechaIngreso: new Date(),
        horaNacimiento: new Date(),
        edadAlIngreso: null,
        origen: null,
        ocupacionHabitual: null,
        situacionLaboral: null,
        nivelInstruccion: null,
        especialidades: [],
        asociado: null,
        obraSocial: null,
        nroCarpeta: null,
        motivo: null,
        organizacionOrigen: null,
        profesional: null,
        PaseAunidadOrganizativa: null

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
        private internacionService: InternacionService,
        public servicioProfesional: ProfesionalService,
        public servicioInternacion: InternacionService,
        public pacienteService: PacienteService,
        public snomed: SnomedService
    ) { }

    ngOnInit() {
        if (this.prestacion) {
            this.btnIniciarGuardar = 'GUARDAR';
            if (this.prestacion.id) {
                this.servicioPrestacion.getPasesInternacion(this.prestacion.id).subscribe(lista => {
                    this.listaPasesCama = lista;
                });
            }
            let existeRegistro = this.prestacion.ejecucion.registros.find(r => r.concepto.conceptId === this.snomedIngreso.conceptId);
            if (existeRegistro) {
                this.paciente = this.prestacion.paciente;
                this.informeIngreso = existeRegistro.valor.informeIngreso;

                // Chequeamos los datos que ya estan registrados para mostrar
                // los campos que están ocultos por defecto
                this.fecha = this.informeIngreso.fechaIngreso;
                this.hora = this.informeIngreso.fechaIngreso;
                this.informeIngreso.obraSocial = existeRegistro.valor.informeIngreso.obraSocial;
                this.obraSocial = existeRegistro.valor.informeIngreso.obraSocial;
                if (existeRegistro.valor.informeIngreso.origen && (existeRegistro.valor.informeIngreso.origen === 'Traslado')) {
                    this.origenExterno = true;
                }
                this.informeIngreso.PaseAunidadOrganizativa = this.informeIngreso.PaseAunidadOrganizativa ? this.informeIngreso.PaseAunidadOrganizativa : null;
                if (this.informeIngreso.PaseAunidadOrganizativa) {
                    this.camasService.getCamasXFecha(this.auth.organizacion.id, existeRegistro.valor.informeIngreso.fechaIngreso).subscribe(resultado => {
                        if (resultado) {
                            let lista = resultado.filter(c => c.ultimoEstado.estado === 'disponible' && c.ultimoEstado.unidadOrganizativa.conceptId === this.informeIngreso.PaseAunidadOrganizativa.conceptId);
                            this.listadoCamas = [...lista];
                        }


                    });
                }


            }
        } else if (this.paciente && this.paciente.id) {
            this.btnIniciarGuardar = 'INICIAR';
            this.servicioPrestacion.internacionesXPaciente(this.paciente, 'ejecucion', this.auth.organizacion.id).subscribe(resultado => {
                // Si el paciente ya tiene una internacion en ejecucion (Puede que haya egresado pero aún la internacion no este validada)
                if (resultado && resultado.ultimaInternacion) {
                    if (resultado.cama) {
                        this.plex.info('warning', 'El paciente registra una internación en ejecución y está ocupando una cama');
                        // Salimos del iniciar internacion
                        this.data.emit(false);
                        this.accionCama.emit({ cama: this.cama, accion: 'cancelaAccion' });
                        this.router.navigate(['/internacion/camas']);
                    } else {

                        let existeEgreso = this.internacionService.verRegistro(resultado.ultimaInternacion, 'egreso');
                        // y no esta ocupando cama lo pasamos directamente a ocupar una cama
                        if (!existeEgreso) {
                            this.plex.info('warning', 'El paciente tiene una internación en ejecución y todavia no egreso');
                            // Mediante el id de la prestación que viene en los parámetros recuperamos el objeto prestación
                            this.data.emit(false);
                            this.accionCama.emit({ cama: this.cama, accion: 'cancelaAccion' });

                        } else {
                            this.servicioPrestacion.getById(resultado.ultimaInternacion.id).subscribe(prestacion => {
                                //   this.prestacion = prestacion;
                                let existeRegistro = prestacion.ejecucion.registros.find(r => r.concepto.conceptId === this.snomedIngreso.conceptId);
                                if (existeRegistro) {
                                    // Carga la información completa del paciente
                                    this.pacienteService.getById(prestacion.paciente.id).subscribe(paciente => {
                                        this.paciente = paciente;
                                        let informeIngreso = existeRegistro.valor.informeIngreso;
                                        this.informeIngreso.ocupacionHabitual = informeIngreso.ocupacionHabitual;
                                        this.informeIngreso.situacionLaboral = { id: this.situacionesLaborales.find(sl => sl.nombre === informeIngreso.situacionLaboral).id, nombre: informeIngreso.situacionLaboral };
                                        this.informeIngreso.nivelInstruccion = { id: this.nivelesInstruccion.find(ni => ni.nombre === informeIngreso.nivelInstruccion).id, nombre: informeIngreso.nivelInstruccion };
                                    });
                                }
                            });
                        }

                    }
                } else {
                    // Chequeamos si el paciente tiene una internacion validad anterior para copiar los datos
                    this.servicioPrestacion.internacionesXPaciente(this.paciente, 'validada', null).subscribe(datosInternacion => {
                        if (datosInternacion && datosInternacion.ultimaInternacion) {
                            this.informeIngreso = this.buscarRegistroInforme(datosInternacion.ultimaInternacion);
                        }
                        this.buscandoPaciente = false;
                    });
                    if (this.paciente.documento) {
                        // Se busca la obra social del paciente y se le asigna
                        this.obraSocialService.get({ dni: this.paciente.documento }).subscribe((os: any) => {
                            if (os && os.length > 0) {
                                this.obraSocial = { nombre: os[0].financiador, codigoFinanciador: os[0].codigoFinanciador };
                                this.informeIngreso.obraSocial = { nombre: os[0].financiador, codigoPuco: os[0].codigoFinanciador };
                            }
                        });
                    }
                    let indiceCarpeta = -1;
                    if (this.paciente.carpetaEfectores && this.paciente.carpetaEfectores.length > 0) {
                        indiceCarpeta = this.paciente.carpetaEfectores.findIndex(x => (x.organizacion as any)._id === this.auth.organizacion.id);
                        if (indiceCarpeta > -1) {
                            this.informeIngreso.nroCarpeta = this.paciente.carpetaEfectores[indiceCarpeta].nroCarpeta;
                        }
                    }
                }
            });
        } else {
            this.plex.info('warning', 'El paciente debe ser registrado en MPI');
        }
        if (this.paciente.fechaNacimiento) {
            if (this.servicioInternacion.compareOnlyDate(new Date(this.paciente.fechaNacimiento), new Date()) === 0) {
                this.pedirHoraNac = true;
            }
        }
        if (this.camaSelected) {
            this.cama = this.camaSelected;
            // let camaId = this.camaSelected.id;
            // this.camasService.getCama(camaId).subscribe(cama => {
            //     this.cama = cama;
            // });
        } else {
            this.route.params.subscribe(params => {
                if (params && params['id']) {
                    let id = params['id'];
                    this.camasService.getCama(id).pipe(catchError(() => of(null))).subscribe(cama => {
                        this.cama = cama;
                    });
                }
            });
        }
        this.organizacionService.getById(this.auth.organizacion.id).subscribe(organizacion => {
            this.organizacion = organizacion;
            this.listaUnidadesOrganizativas = this.organizacion.unidadesOrganizativas ? this.organizacion.unidadesOrganizativas : [];
        });

        // Cargamos todas las ocupaciones

        this.loadEspecialidades();

    }

    actualizarInformeIngreso() {

    }

    getOcupaciones(event) {
        let ocupacionesHabituales = [];
        if (event && event.query) {
            let query = {
                nombre: event.query
            };
            this.ocupacionService.getParams(query).subscribe((rta) => {
                rta.map(dato => { dato.nom = '(' + dato.codigo + ') ' + dato.nombre; });

                ocupacionesHabituales = rta;
                event.callback(ocupacionesHabituales);
            });
        } else {
            let ocupacionHabitual = [];
            if (this.informeIngreso.ocupacionHabitual) {
                ocupacionHabitual = [this.informeIngreso.ocupacionHabitual];
            }
            event.callback(ocupacionHabitual);
        }
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
            if (this.auth.profesional && !this.informeIngreso.profesional) {
                this.servicioProfesional.get({ id: this.auth.profesional }).subscribe(resultado => {
                    if (resultado) {
                        this.informeIngreso.profesional = resultado[0] ? resultado[0] : null;
                        let callback = (resultado) ? resultado : null;
                        event.callback([callback]);
                    }
                });
            } else {
                let profesionalSalida = [];
                if (this.informeIngreso && this.informeIngreso.profesional) {
                    profesionalSalida = [this.informeIngreso.profesional];
                }
                event.callback(profesionalSalida);
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
        this.accionCama.emit({ cama: this.cama, accion: 'cancelaAccion' });
    }

    controlarConflictosInternacion(fechaIngreso: Date, fechaActual: Date): boolean {
        // Controlamos que no me carguen una internación a futuro
        if (fechaIngreso > fechaActual) {
            this.plex.info('warning', 'La fecha de ingreso no puede ser superior a la fecha actual');
            return false;
        }
        if (this.listaPasesCama && this.listaPasesCama.length > 1) {
            this.primerPase = this.listaPasesCama[1];
            if (fechaIngreso > this.primerPase.estados.fecha) {
                this.plex.info('warning', 'La fecha de ingreso no puede ser superior a la fecha del primer movimiento');
                return false;
            }
        }
        // Controlamos conflictos de fechas en el historial de la cama
        // buscamos que en la fechaHora de ingreso, con un margen de una hora, la cama este disponible
        if (this.cama) {
            if (!this.servicioInternacion.esCamaDisponible(this.cama, fechaIngreso)) {
                this.plex.info('warning', 'La cama seleccionada no está disponible en la fecha ingresada. Por favor controle la fecha y hora de ingreso.');
                return false;
            }
        }

        return true;
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

            if (this.cama === null && !this.workflowC && !this.desdeListadoInternacion) {
                this.plex.info('warning', 'Debe seleccionar una cama');
                return;
            }
            if (this.origenExterno) {   // origenHospitalizacion === 'traslado'
                if (this.informeIngreso.organizacionOrigen) {
                    let datosOrganizacionOrigen = {
                        id: this.informeIngreso.organizacionOrigen.id,
                        nombre: this.informeIngreso.organizacionOrigen.nombre
                    };
                    this.informeIngreso.organizacionOrigen = datosOrganizacionOrigen;
                } else {
                    this.plex.info('warning', 'Debe seleccionar una organización');
                    return;
                }
            }

            let fechaActual = new Date();

            let fechaIngreso = this.servicioInternacion.combinarFechas(this.fecha, this.hora);
            if (!this.controlarConflictosInternacion(fechaIngreso, fechaActual)) {
                return;
            }
            // mapeamos los datos en los combos
            this.informeIngreso.situacionLaboral = (this.informeIngreso.situacionLaboral) ? this.informeIngreso.situacionLaboral.nombre : null;
            this.informeIngreso.nivelInstruccion = ((typeof this.informeIngreso.nivelInstruccion === 'string')) ? this.informeIngreso.nivelInstruccion : (Object(this.informeIngreso.nivelInstruccion).nombre);
            this.informeIngreso.asociado = ((typeof this.informeIngreso.asociado === 'string')) ? this.informeIngreso.asociado : (Object(this.informeIngreso.asociado).nombre);
            this.informeIngreso.origen = ((typeof this.informeIngreso.origen === 'string')) ? this.informeIngreso.origen : (Object(this.informeIngreso.origen).nombre);
            this.informeIngreso.PaseAunidadOrganizativa = this.informeIngreso.PaseAunidadOrganizativa;
            this.informeIngreso.fechaIngreso = fechaIngreso;


            // calcualmos la edad al ingreso
            if (this.paciente.fechaNacimiento) {
                if (this.pedirHoraNac) {
                    this.paciente.fechaNacimiento = this.servicioInternacion.combinarFechas(this.paciente.fechaNacimiento, this.informeIngreso.horaNacimiento);
                }
                this.informeIngreso.edadAlIngreso = this.servicioInternacion.calcularEdad(this.paciente.fechaNacimiento, this.informeIngreso.fechaIngreso);
            }

            // armamos dto con datos principales del paciente
            let dtoPaciente = {
                id: this.paciente.id,
                documento: this.paciente.documento,
                nombre: this.paciente.nombre,
                apellido: this.paciente.apellido,
                sexo: this.paciente.sexo,
                genero: this.paciente.genero,
                fechaNacimiento: this.paciente.fechaNacimiento,
                direccion: this.paciente.direccion,
                telefono: this.paciente.telefono
            };

            if (this.prestacion && this.prestacion.id) {
                // reemplazamos el Informe de ingreso en la prestacion
                let indexInforme = this.prestacion.ejecucion.registros.findIndex(r => r.concepto.conceptId === this.snomedIngreso.conceptId);
                this.prestacion.ejecucion.registros[indexInforme].valor = { informeIngreso: this.informeIngreso };
                let cambios = {
                    op: 'registros',
                    registros: this.prestacion.ejecucion.registros
                };
                this.servicioPrestacion.patch(this.prestacion.id, cambios).subscribe(p => {
                    if (this.cama && !this.cama.ultimoEstado.idInternacion) {
                        // vamos a actualizar el estado de la cama
                        let dto = {
                            fecha: this.informeIngreso.fechaIngreso,
                            estado: 'ocupada',
                            unidadOrganizativa: this.cama.ultimoEstado.unidadOrganizativa ? this.cama.ultimoEstado.unidadOrganizativa : null,
                            especialidades: this.cama.ultimoEstado.especialidades ? this.cama.ultimoEstado.especialidades : null,
                            esCensable: this.cama.ultimoEstado.esCensable,
                            genero: this.cama.ultimoEstado.genero ? this.cama.ultimoEstado.genero : null,
                            paciente: dtoPaciente,
                            idInternacion: this.prestacion.id,
                            esMovimiento: true
                        };

                        this.camasService.cambiaEstado(this.cama.id, dto).subscribe(camaActualizada => {
                            this.cama.ultimoEstado = camaActualizada.ultimoEstado;
                            this.accionCama.emit({ cama: this.cama, accion: 'internarPaciente' });
                            this.data.emit(false);
                        }, (err1) => {
                            this.plex.info('danger', err1, 'Error al intentar ocupar la cama');
                        });
                    } else {
                        this.accionCama.emit({ cama: this.cama, accion: 'cancelaAccion' });
                        this.data.emit(false);
                    }

                }, (err) => {
                    this.plex.info('danger', err);
                });
                if (this.cama && this.cama.ultimoEstado.idInternacion) {
                    let cambiosEst = {
                        'op': 'estadoCama',
                        'idEstado': this.primerPase ? this.primerPase._id : this.cama.ultimoEstado._id,
                        'fecha': this.informeIngreso.fechaIngreso
                    };
                    this.camasService.patch(this.cama.id, cambiosEst).subscribe(() => {
                        this.accionCama.emit({ cama: this.cama, accion: 'cancelaAccion' });
                        this.data.emit(false);
                    }, (err1) => {
                        this.plex.info('danger', err1, 'Error al intentar ocupar la cama');
                    });
                }
            } else {
                // armamos el elemento data a agregar al array de registros
                let nuevoRegistro = new IPrestacionRegistro(null, this.snomedIngreso);
                if (this.obraSocial) {
                    this.informeIngreso.obraSocial = this.obraSocial;
                }
                nuevoRegistro.valor = { informeIngreso: this.informeIngreso };

                // armamos dto con datos principales del profesional
                let dtoProfesional = {
                    id: this.informeIngreso.profesional.id,
                    documento: this.informeIngreso.profesional.documento,
                    nombre: this.informeIngreso.profesional.nombre,
                    apellido: this.informeIngreso.profesional.apellido
                };

                // creamos la prestacion de internacion y agregamos el registro de ingreso
                let nuevaPrestacion = this.servicioPrestacion.inicializarPrestacion(this.paciente, PrestacionesService.InternacionPrestacion, 'ejecucion', 'internacion', this.informeIngreso.fechaIngreso, null, dtoProfesional);
                nuevaPrestacion.ejecucion.registros = [nuevoRegistro];
                nuevaPrestacion.paciente['_id'] = this.paciente.id;

                if (this.obraSocial) {
                    nuevaPrestacion.solicitud.obraSocial = { codigoPuco: this.obraSocial.codigoFinanciador, nombre: this.obraSocial.nombre };
                }
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
                            paciente: dtoPaciente,
                            idInternacion: prestacion.id,
                            esMovimiento: true
                        };
                        this.camasService.cambiaEstado(this.cama.id, dto).subscribe(camaActualizada => {
                            this.cama.ultimoEstado = camaActualizada.ultimoEstado;
                            this.accionCama.emit({ cama: this.cama, accion: 'internarPaciente' });
                            // this.data.emit(false);
                        }, (err1) => {
                            this.plex.info('danger', err1, 'Error al intentar ocupar la cama');

                        });
                    } else {

                        this.plex.info('warning', 'Paciente ingresado a lista de espera');
                        // this.router.navigate(['rup/internacion/ver', prestacion.id]);
                        this.data.emit(false);
                        this.accionCama.emit({ cama: this.cama, accion: 'cancelaAccion' });

                    }

                }, (err) => {
                    this.plex.info('danger', 'ERROR: La prestación no pudo ser registrada');
                });
            }
        } else {
            this.plex.info('info', 'ERROR: Los datos de ingreso no estan completos');
            return;
        }

    }

    onReturn() {
        this.router.navigate(['/internacion/camas']);
    }

    changeOrigenHospitalizacion(event) {
        if (event.value.id === 'traslado') {
            this.origenExterno = true;
        } else {
            this.origenExterno = false;
            this.informeIngreso.organizacionOrigen = null;
        }
    }

    loadOrganizacion(event) {
        if (event.query) {
            let query = {
                nombre: event.query
            };
            this.organizacionService.get(query).subscribe(event.callback);
        } else {
            let organizacionSalida = [];
            if (this.informeIngreso && this.informeIngreso.organizacionOrigen) {
                organizacionSalida = [this.informeIngreso.organizacionOrigen];
            }
            event.callback(organizacionSalida);
        }
    }
    onchange(event) {
        if (event.value) {
            this.informeIngreso.organizacionOrigen = null;
        } else {
            this.check = false;
        }

    }
    selectCamasDisponibles(unidadOrganizativa, fecha, hora) {
        // this.cama = null;
        this.listadoCamas = null;
        if (unidadOrganizativa) {
            let f = this.servicioInternacion.combinarFechas(fecha, hora);
            this.camasService.getCamasXFecha(this.auth.organizacion.id, f).subscribe(resultado => {
                if (resultado) {
                    let lista = resultado.filter(c => c.ultimoEstado.estado === 'disponible' && c.ultimoEstado.unidadOrganizativa.conceptId === unidadOrganizativa.conceptId);
                    this.listadoCamas = [...lista];
                }


            });
        }

    }

    // Se usa tanto para guardar como cancelar
    afterComponenteCarpeta(carpetas) {
        // Siempre es 1 sólo el seleccionado cuando se edita una carpeta
        if (carpetas) {
            this.paciente.carpetaEfectores = [];
        }
        this.showEditarCarpetaPaciente = false;
    }

    // permite elegir otro paciente para internar
    buscarOtroPaciente() {
        this.accionCama.emit({ cama: this.cama, accion: 'internarPaciente', otroPaciente: true });
    }


    loadEspecialidades() {
        this.snomed.getQuery({ expression: '<<394733009' }).subscribe(result => {
            this.especialidades = [...result];
            if ((!this.informeIngreso.especialidades || (this.informeIngreso.especialidades && this.informeIngreso.especialidades.length <= 0))
                && this.camaSelected) {
                let especialidadesCama = this.camaSelected.ultimoEstado.especialidades.map(x => {
                    return {
                        conceptId: x.conceptId,
                        fsn: x.fsn,
                        semanticTag: x.semanticTag,
                        term: x.term
                    };
                });
                this.informeIngreso.especialidades = [...especialidadesCama];
            }
        });
    }



}
