import { Component, OnInit, Output, EventEmitter, OnDestroy, Optional, QueryList, ViewChildren } from '@angular/core';
import { Plex } from '@andes/plex';
import { ProfesionalService } from '../../../../../services/profesional.service';
import { OcupacionService } from '../../../../../services/ocupacion/ocupacion.service';
import { OrganizacionService } from '../../../../../services/organizacion.service';
import { SnomedExpression } from '../../../../mitos';
import { IPrestacionRegistro } from '../../../../../modules/rup/interfaces/prestacion.registro.interface';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { snomedIngreso, pacienteAsociado, origenHospitalizacion, nivelesInstruccion, situacionesLaborales } from '../../constantes-internacion';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { combineLatest, Subscription, Observable, of } from 'rxjs';
import { map, switchMap, filter, auditTime } from 'rxjs/operators';
import { ListadoInternacionService } from '../../views/listado-internacion/listado-internacion.service';
import { Auth } from '@andes/auth';
import { IngresoPacienteService } from './ingreso-paciente-workflow/ingreso-paciente-workflow.service';
import { ElementosRUPService } from 'src/app/modules/rup/services/elementosRUP.service';
import { InternacionResumenHTTP } from '../../services/resumen-internacion.http';
import { ConceptObserverService } from '../../../../../modules/rup/services/conceptObserver.service';
import { RUPComponent } from '../../../../../modules/rup/components/core/rup.component';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { ObraSocialService } from 'src/app/services/obraSocial.service';

@Component({
    selector: 'app-ingresar-paciente',
    templateUrl: './ingresar-paciente.component.html',
})

export class IngresarPacienteComponent implements OnInit, OnDestroy {
    @ViewChildren(RUPComponent) rupElements: QueryList<any>;

    camas$: Observable<ISnapshot[]>;

    // EVENTOS
    @Output() onSave = new EventEmitter<any>();

    // CONSTANTES
    public pacienteAsociado = pacienteAsociado;
    public origenHospitalizacion = origenHospitalizacion;
    public nivelesInstruccion = nivelesInstruccion;
    public situacionesLaborales = situacionesLaborales;
    public snomedIngreso = snomedIngreso;
    public expr = SnomedExpression;
    public fechaMax = moment().toDate();

    // VARIABLES
    public cama: ISnapshot;
    public snapshot: ISnapshot[];
    public prestacion: IPrestacion;
    public capa: string;
    public fechaValida = true;
    public pacientes = [];
    public paciente = null;
    public view;
    public disableButton = false;
    public fechaHasta = moment().toDate();
    private fechaIngresoOriginal: Date;
    public inProgress = false;
    public prepagas$: Observable<any[]>;
    private backupObraSocial;

    public get origenExterno() {
        return this.informeIngreso && this.informeIngreso.origen && this.informeIngreso.origen.id === 'traslado';
    }
    public check = false;
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

    private subscription: Subscription;
    private subscription2: Subscription;

    constructor(
        private plex: Plex,
        private servicioProfesional: ProfesionalService,
        private ocupacionService: OcupacionService,
        private organizacionService: OrganizacionService,
        private servicioPrestacion: PrestacionesService,
        public mapaCamasService: MapaCamasService,
        private listadoInternacionService: ListadoInternacionService,
        private auth: Auth,
        @Optional() private ingresoPacienteService: IngresoPacienteService,
        public elementosRUPService: ElementosRUPService,
        public internacionResumenService: InternacionResumenHTTP,
        private conceptObserverService: ConceptObserverService,
        private obraSocialService: ObraSocialService
    ) {
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        if (this.subscription2) {
            this.subscription2.unsubscribe();
        }
    }

    onchange(event) {
        if (event.value) {
            this.informeIngreso.organizacionOrigen = null;
        } else {
            this.check = false;
        }
    }

    private handlerPacienteID(): Observable<string> {
        if (this.ingresoPacienteService) {
            return this.ingresoPacienteService.selectedPaciente;
        }
        return combineLatest(
            this.mapaCamasService.selectedCama,
            this.mapaCamasService.prestacion$
        ).pipe(
            map(([snap, prestacion]) => snap.idCama ? snap : prestacion),
            filter(snap => !!snap.paciente),
            map(snap => (snap.paciente.id))
        ) as any;
    }

    ngOnInit() {
        this.informeIngreso.fechaIngreso = this.mapaCamasService.fecha;
        this.fechaHasta = this.listadoInternacionService.fechaIngresoHasta;
        this.prepagas$ = this.obraSocialService.getPrepagas();

        const pacienteID$ = this.handlerPacienteID();

        this.inProgress = true;
        this.subscription = combineLatest(
            this.mapaCamasService.maquinaDeEstado$,
            this.mapaCamasService.view,
            this.mapaCamasService.capa2,
            this.mapaCamasService.selectedCama,
            this.mapaCamasService.prestacion$,
            pacienteID$.pipe(
                filter(pacID => !!pacID),
                switchMap((pacID) => {
                    return this.mapaCamasService.getPaciente({ id: pacID }, false);
                })
            )
        ).subscribe(([estado, view, capa, cama, prestacion, paciente]) => {
            this.view = view;
            this.capa = capa;
            this.prestacion = prestacion;
            this.paciente = paciente;

            if (paciente && paciente.financiador && paciente.financiador.length > 0) {
                const os = paciente.financiador[0];
                this.backupObraSocial = os;
            }

            if (this.prestacion) {
                // this.paciente = this.prestacion.paciente;
                this.informeIngreso = this.prestacion.ejecucion.registros[0].valor.informeIngreso;
                this.fechaIngresoOriginal = this.informeIngreso.fechaIngreso;
                this.paciente.obraSocial = this.prestacion.paciente.obraSocial;
            } else {
                if (paciente.id) {

                    if (this.backupObraSocial) {
                        this.paciente.obraSocial = {
                            nombre: this.backupObraSocial.financiador,
                            financiador: this.backupObraSocial.financiador,
                            codigoPuco: this.backupObraSocial.codigoPuco
                        };
                        this.informeIngreso.asociado = {
                            id: 'Plan o Seguro público',
                            nombre: 'Plan o Seguro público'
                        };
                        this.esPrepaga = false;

                    }

                    let indiceCarpeta = -1;
                    if (paciente.carpetaEfectores && paciente.carpetaEfectores.length > 0) {
                        indiceCarpeta = paciente.carpetaEfectores.findIndex(x => (x.organizacion as any)._id === this.auth.organizacion.id);
                        if (indiceCarpeta > -1) {
                            this.informeIngreso.nroCarpeta = paciente.carpetaEfectores[indiceCarpeta].nroCarpeta;
                        }
                    }

                }

                if (capa === 'estadistica') {
                    this.cargarUltimaInternacion(paciente);
                }

            }

            if (cama.id && cama.id !== ' ') {
                this.cama = cama;
                if (cama.estado === 'ocupada' && !cama.sala) {
                    this.paciente = cama.paciente;
                }
                if (this.informeIngreso.especialidades && this.informeIngreso.especialidades.length === 0) {
                    this.informeIngreso.especialidades = this.cama.especialidades;
                }
                this.createFormularioDinamico(cama, estado);
            } else if (view === 'listado-internacion') {
                if (this.subscription2) {
                    this.subscription2.unsubscribe();
                }
                this.subscription2 = this.mapaCamasService.snapshot(this.informeIngreso.fechaIngreso, prestacion.id).subscribe((snapshot) => {
                    this.cama = snapshot[0];
                    // this.paciente = this.cama.paciente;
                });
            } else {
                this.cama = null;
            }
        });

        this.camas$ = this.mapaCamasService.snapshot$.pipe(
            auditTime(1),
            map((snapshot) => {
                this.inProgress = false;
                let camasDisponibles = [];
                let cama = null;

                snapshot.map(snap => {
                    if (snap.estado === 'ocupada' && !snap.sala) {
                        if (snap.paciente.id === this.paciente.id) {
                            if (!this.cama) {
                                cama = snap;
                            } else if (this.cama.id !== snap.id) {
                                cama = snap;
                            }
                        }
                    } else if (snap.estado === 'disponible' || snap.sala) {
                        camasDisponibles.push(snap);
                    }
                });

                if (cama && this.view !== 'listado-internacion') {
                    camasDisponibles = [];
                    this.plex.info('warning', `${this.paciente.nombreCompleto} (${this.paciente.documento}) se encuentra internado
                en la cama <strong>${cama.nombre}</strong> en <strong>${cama.sectores[cama.sectores.length - 1].nombre}</strong>
                de la unidad organizativa <strong>${cama.unidadOrganizativa.term}</strong>.`, 'Paciente ya internado');
                }
                return camasDisponibles;
            })
        );
    }

    cargarUltimaInternacion(paciente: IPaciente) {
        const conceptIdIngresoInternacion = '721915006';
        this.servicioPrestacion.getRegistrosHuds(paciente.id, conceptIdIngresoInternacion).subscribe(ingreso => {
            if (ingreso.length > 0) {
                ingreso = ingreso.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
                const ultimoIngreso = ingreso[0].registro.valor.informeIngreso;

                this.informeIngreso.situacionLaboral = this.situacionesLaborales?.find(item => item.nombre === ultimoIngreso.situacionLaboral) || null;
                this.informeIngreso.nivelInstruccion = this.nivelesInstruccion?.find(item => item.nombre === ultimoIngreso.nivelInstruccion) || null;
                this.informeIngreso.ocupacionHabitual = ultimoIngreso.ocupacionHabitual;

                this.informeIngreso.asociado = ultimoIngreso.asociado;
                this.informeIngreso.obraSocial = ultimoIngreso.obraSocial;
                this.paciente.obraSocial = ultimoIngreso.obraSocial;
                this.esPrepaga = this.informeIngreso.asociado?.id === 'Plan de salud privado o Mutual';

            }
        });
    }

    esPrepaga = false;


    changeTipoObraSocial() {
        this.esPrepaga = this.informeIngreso.asociado?.id === 'Plan de salud privado o Mutual';
        if (this.esPrepaga || this.informeIngreso.asociado?.id === 'Ninguno') {
            this.paciente.obraSocial = null;
        } else if (this.backupObraSocial) {
            this.paciente.obraSocial = this.backupObraSocial;
        }
    }

    selectCama(cama) {
        this.mapaCamasService.select(cama);
    }

    afterComponenteCarpeta($event) {
        if ($event) {
            const carpeta = $event[0];
            this.informeIngreso.nroCarpeta = carpeta.nroCarpeta;
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
            event.callback(listaProfesionales);
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

    getOcupaciones(event) {
        if (event && event.query) {
            const query = {
                nombre: event.query
            };
            this.ocupacionService.getParams(query).subscribe((rta) => {
                return event.callback(rta);
            });
        } else {
            let ocupacionHabitual = [];
            if (this.informeIngreso.ocupacionHabitual) {
                ocupacionHabitual = [this.informeIngreso.ocupacionHabitual];
            }
            event.callback(ocupacionHabitual);
        }
    }

    changeOrigenHospitalizacion(event) {
        if (event.value && event.value.id) {
            this.informeIngreso.organizacionOrigen = null;
        }
    }


    validarRUP() {
        if (!this.prestacionFake) { return true; }

        let flagValid = true;
        this.rupElements.forEach((item) => {
            const instance = item.rupInstance;
            flagValid = flagValid && (instance.soloValores || instance.validate());
        });
        return flagValid;
    }

    guardar(valid) {
        if (valid.formValid && this.validarRUP()) {
            this.disableButton = true;
            const dtoPaciente = {
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

            if (this.capa === 'estadistica') {
                this.ingresoExtendido(dtoPaciente);
            } else {
                this.ingresoSimplificado('ocupada', dtoPaciente, null);
            }
        }
    }

    ingresoSimplificado(estado, paciente, idInternacion = null) {
        // Se modifica el estado de la cama
        this.cama.estado = estado;
        this.cama.paciente = paciente;
        this.cama.fechaIngreso = this.informeIngreso.fechaIngreso;

        if (this.prestacion) { // SOY CAPA ESTADISTICA
            this.cama.idInternacion = idInternacion;
            if (this.informeIngreso.fechaIngreso.getTime() !== this.fechaIngresoOriginal.getTime()) {
                // recuperamos snapshot inicial, por si hay un cambio de cama
                this.mapaCamasService.snapshot(this.fechaIngresoOriginal, idInternacion).subscribe((snapshot) => {
                    const primeraCama = snapshot[0];
                    this.mapaCamasService.changeTime(primeraCama, this.fechaIngresoOriginal, this.informeIngreso.fechaIngreso, idInternacion).subscribe(camaActualizada => {
                        this.plex.info('success', 'Los datos se actualizaron correctamente');
                        this.mapaCamasService.setFecha(this.informeIngreso.fechaIngreso);
                        this.listadoInternacionService.setFechaHasta(this.informeIngreso.fechaIngreso);
                        this.disableButton = false;
                        this.onSave.emit();
                    }, (err1) => {
                        this.plex.info('danger', err1, 'Error al intentar actualizar los datos');
                        this.disableButton = false;
                    });
                });
            } else {
                this.plex.info('success', 'Los datos se actualizaron correctamente');
                this.mapaCamasService.setFecha(this.informeIngreso.fechaIngreso);
                this.listadoInternacionService.setFechaHasta(this.informeIngreso.fechaIngreso);
                this.disableButton = false;
                this.onSave.emit();
            }
        } else {
            delete this.cama['sectorName'];
            delete this.cama['diaEstada'];
            delete this.cama['_key'];
            this.cama.extras = {
                ingreso: true
            };
            const ingreso = this.elementoRUP ? {
                elementoRUP: this.elementoRUP,
                registros: this.prestacionFake.ejecucion.registros
            } : null;

            const createAction: Observable<any> = idInternacion ? of({ id: idInternacion }) :

                this.internacionResumenService.create({
                    ambito: this.mapaCamasService.ambito,
                    fechaIngreso: this.informeIngreso.fechaIngreso,
                    paciente: this.cama.paciente,
                    organizacion: { ...this.auth.organizacion },
                    ingreso
                });

            createAction.pipe(
                switchMap(internacion => {
                    this.cama.idInternacion = internacion.id;
                    return this.mapaCamasService.save(this.cama, this.informeIngreso.fechaIngreso);
                })
            ).subscribe(() => {
                this.plex.info('success', 'Paciente internado');
                this.mapaCamasService.setFecha(this.informeIngreso.fechaIngreso);
                this.onSave.emit();
                this.disableButton = false;
            }, (err1) => {
                this.plex.info('danger', err1, 'Error al ingresar paciente');
                this.disableButton = false;

            });
        }

    }

    ingresoExtendido(paciente) {
        // Verificamos si es de origen externo
        if (this.origenExterno) {
            this.informeIngreso.organizacionOrigen = {
                id: this.informeIngreso.organizacionOrigen.id,
                nombre: this.informeIngreso.organizacionOrigen.nombre
            };
        }


        // construimos el informe de ingreso
        this.informeIngreso.situacionLaboral = (this.informeIngreso.situacionLaboral) ? this.informeIngreso.situacionLaboral.nombre : null;
        this.informeIngreso.nivelInstruccion = ((typeof this.informeIngreso.nivelInstruccion === 'string')) ? this.informeIngreso.nivelInstruccion : (Object(this.informeIngreso.nivelInstruccion).nombre);
        this.informeIngreso.asociado = ((typeof this.informeIngreso.asociado === 'string')) ? this.informeIngreso.asociado : (Object(this.informeIngreso.asociado).nombre);
        this.informeIngreso.origen = ((typeof this.informeIngreso.origen === 'string')) ? this.informeIngreso.origen : (Object(this.informeIngreso.origen).nombre);
        this.informeIngreso.PaseAunidadOrganizativa = this.informeIngreso.PaseAunidadOrganizativa;
        this.informeIngreso.obraSocial = this.paciente.obraSocial;
        // this.prestacion.paciente.obraSocial = this.paciente.obraSocial;

        if (this.paciente.fechaNacimiento) {
            this.informeIngreso.edadAlIngreso = this.mapaCamasService.calcularEdad(this.paciente.fechaNacimiento, this.informeIngreso.fechaIngreso);

        }

        if (this.prestacion) {
            this.actualizarPrestacion(paciente);
        } else {
            this.crearPrestacion(paciente);
        }
    }

    actualizarPrestacion(paciente) {
        // reemplazamos el Informe de ingreso en la prestacion
        let indexInforme = this.prestacion.ejecucion.registros.findIndex(r => r.concepto.conceptId === this.snomedIngreso.conceptId);
        this.prestacion.ejecucion.registros[indexInforme].valor = { informeIngreso: this.informeIngreso };
        let cambios = {
            op: 'registros',
            registros: this.prestacion.ejecucion.registros,
            paciente: this.paciente
        };
        this.servicioPrestacion.patch(this.prestacion.id, cambios).subscribe((prestacion: any) => {
            this.informeIngreso = prestacion.ejecucion.registros[0].valor.informeIngreso;
            this.ingresoSimplificado('ocupada', paciente, prestacion._id);
        }, (err) => {
            this.plex.info('danger', err);
        });
    }

    crearPrestacion(paciente) {
        // armamos el elemento data a agregar al array de registros
        const nuevoRegistro = new IPrestacionRegistro(null, snomedIngreso);

        nuevoRegistro.valor = {
            informeIngreso: this.informeIngreso
        };

        // armamos dto con datos principales del profesional
        const dtoProfesional = {
            id: this.informeIngreso.profesional.id,
            documento: this.informeIngreso.profesional.documento,
            nombre: this.informeIngreso.profesional.nombre,
            apellido: this.informeIngreso.profesional.apellido
        };

        // creamos la prestacion de internacion y agregamos el registro de ingreso
        const nuevaPrestacion = this.servicioPrestacion.inicializarPrestacion(this.paciente, PrestacionesService.InternacionPrestacion, 'ejecucion', this.mapaCamasService.ambito, this.informeIngreso.fechaIngreso, null, dtoProfesional);
        nuevaPrestacion.ejecucion.registros = [nuevoRegistro];
        nuevaPrestacion.unidadOrganizativa = this.cama.unidadOrganizativa;
        nuevaPrestacion.paciente['_id'] = this.paciente.id;

        this.servicioPrestacion.post(nuevaPrestacion).subscribe(prestacion => {
            if (this.cama) {
                this.ingresoSimplificado('ocupada', paciente, prestacion.id);
            } else if (this.capa === 'estadistica') {
                this.plex.info('warning', 'Paciente ingresado a lista de espera');
            }

        }, (err) => {
            this.plex.info('danger', 'ERROR: La prestación no pudo ser registrada');
        });
    }

    setFecha() {
        if (!this.prestacion) {
            this.mapaCamasService.select(null);
        } else {
            this.checkEstadoCama();
            this.checkMovimientos();
        }
        this.mapaCamasService.setFecha(this.informeIngreso.fechaIngreso);
    }

    onType() {
        this.inProgress = true;
    }



    // Se debe controlar que:
    // La cama este disponible en la fecha que la quiero usar,
    // Y que no puede ser una fecha posterior al siguiente movimiento

    checkMovimientos() {
        const HOY = moment().toDate();
        this.mapaCamasService.historial('internacion', this.fechaIngresoOriginal, HOY).subscribe(h => {
            const movimientoEncontrado = h.filter((s: ISnapshot) => {
                if (s.fecha.getTime() > this.fechaIngresoOriginal.getTime() && s.fecha.getTime() < this.informeIngreso.fechaIngreso.getTime()) {
                    return s;
                }
            });
            if (movimientoEncontrado && movimientoEncontrado.length) {
                this.informeIngreso.fechaIngreso = this.fechaIngresoOriginal;
                this.plex.info('warning', `No es posible realizar el cambio de fecha porque la internacion tiene movimientos previos a la fecha ingresada`);
            }
        });
    }


    checkEstadoCama() {
        this.checkMovimientos();
        this.mapaCamasService.get(this.informeIngreso.fechaIngreso, this.cama.id).subscribe((cama) => {
            if (cama && cama.estado !== 'disponible') {
                if (!cama.idInternacion || (cama.idInternacion && cama.idInternacion !== this.prestacion.id)) {
                    this.informeIngreso.fechaIngreso = this.fechaIngresoOriginal;
                    this.plex.info('warning', `No es posible realizar el cambio de fecha porque la cama ${this.cama.nombre} no se encuentra disponible`,
                        'Cama no dosponible');
                }

            }
        });
    }

    public prestacionFake;
    public elementoRUP: string;

    createFormularioDinamico(cama: ISnapshot, estado: any) {
        this.conceptObserverService.destroy();
        const molecula = estado.ingresos && estado.ingresos[cama.id as string];
        if (!molecula) {
            this.elementoRUP = null;
            this.prestacionFake = null;
            return;
        }

        this.elementoRUP = molecula;
        const elementoRUP = this.elementosRUPService.getById(molecula);

        this.prestacionFake = {
            paciente: this.paciente,
            solicitud: {
                tipoPrestacion: {},
                organizacion: { ...this.auth.organizacion },
                profesional: {}
            },
            ejecucion: {
                organizacion: { ...this.auth.organizacion },
                registros: [],
            }
        };

        for (const elementoRequerido of elementoRUP.requeridos) {
            const elementoRUP_ = this.elementosRUPService.buscarElemento(elementoRequerido.concepto, false);
            const nuevoRegistro = new IPrestacionRegistro(elementoRUP_, elementoRequerido.concepto, this.prestacionFake);
            this.prestacionFake.ejecucion.registros.push(nuevoRegistro);
        }
    }
}
