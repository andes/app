import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, EventEmitter, OnDestroy, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { auditTime, filter, map, switchMap, take } from 'rxjs/operators';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { ElementosRUPService } from 'src/app/modules/rup/services/elementosRUP.service';
import { ObraSocialService } from 'src/app/services/obraSocial.service';
import { RUPComponent } from '../../../../../modules/rup/components/core/rup.component';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { IPrestacionRegistro } from '../../../../../modules/rup/interfaces/prestacion.registro.interface';
import { ConceptObserverService } from '../../../../../modules/rup/services/conceptObserver.service';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { OcupacionService } from '../../../../../services/ocupacion/ocupacion.service';
import { OrganizacionService } from '../../../../../services/organizacion.service';
import { ProfesionalService } from '../../../../../services/profesional.service';
import { SnomedExpression } from '../../../../mitos';
import { nivelesInstruccion, origenHospitalizacion, pacienteAsociado, situacionesLaborales, snomedIngreso } from '../../constantes-internacion';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { InternacionResumenHTTP, IResumenInternacion } from '../../services/resumen-internacion.http';
import { ListadoInternacionService } from '../../views/listado-internacion/listado-internacion.service';
import { IngresoPacienteService } from './ingreso-paciente-workflow/ingreso-paciente-workflow.service';
import { cache } from '@andes/shared';
import { IMaquinaEstados } from '../../interfaces/IMaquinaEstados';
import { ListadoInternacionCapasService } from '../../views/listado-internacion-capas/listado-internacion-capas.service';
import { IObraSocial } from 'src/app/interfaces/IObraSocial';

@Component({
    selector: 'app-ingresar-paciente',
    templateUrl: './ingresar-paciente.component.html',
    styleUrls: ['./ingresar-paciente.component.scss'],
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
    public esPrepaga = false;
    public cama: ISnapshot;
    public snapshot: ISnapshot[];
    public prestacion: IPrestacion;
    public resumen: IResumenInternacion;
    public capa: string;
    public fechaValida = true;
    public paciente = null;
    public view;
    public disableButton = false;
    public fechaHasta = moment().toDate();
    private fechaIngresoOriginal: Date;
    public inProgress = false;
    public prepagas$: Observable<any[]>;
    private backupObraSocial;
    public registrosIngresoResumen$: Observable<any>;;
    public get origenExterno() {
        return this.informeIngreso?.origen?.id === 'traslado' || this.informeIngreso.origen === 'Traslado';
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
    public poseeMovimientos: Boolean;
    private subscription: Subscription;
    private subscription2: Subscription;
    public selectedOS = false;
    public financiador;
    public selectorFinanciadores: IObraSocial[] = [];
    public obrasSociales: IObraSocial[] = [];
    public OSPrivada = false;

    constructor(
        private plex: Plex,
        private servicioProfesional: ProfesionalService,
        private ocupacionService: OcupacionService,
        private organizacionService: OrganizacionService,
        private servicioPrestacion: PrestacionesService,
        public mapaCamasService: MapaCamasService,
        private listadoInternacionService: ListadoInternacionService,
        private historialInternacionService: ListadoInternacionCapasService,
        private auth: Auth,
        private ingresoPacienteService: IngresoPacienteService,
        public elementosRUPService: ElementosRUPService,
        public internacionResumenService: InternacionResumenHTTP,
        private conceptObserverService: ConceptObserverService,
        private obraSocialService: ObraSocialService
    ) { }

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
        return combineLatest([
            this.mapaCamasService.selectedCama,
            this.mapaCamasService.prestacion$
        ]).pipe(
            map(([snap, prestacion]) => snap.paciente ? snap.paciente.id : prestacion?.paciente.id)
        ) as Observable<string>;
    }

    ngOnInit() {
        this.view = this.mapaCamasService.view.getValue();
        this.fechaHasta = this.listadoInternacionService.fechaIngresoHasta.getValue();
        this.prepagas$ = this.obraSocialService.getPrepagas();
        const pacienteID$ = this.handlerPacienteID();
        this.inProgress = true;

        this.registrosIngresoResumen$ = combineLatest([
            this.mapaCamasService.capa2,
            this.mapaCamasService.fecha2,
            pacienteID$
        ]).pipe(
            switchMap(([capa, fecha, paciente]) => {
                if (capa === 'estadistica' || (capa === 'estadistica-v2' && this.view === 'mapa-camas')) {
                    const desde = moment(fecha).subtract(12, 'hours').toDate();
                    const hasta = moment(fecha).add(12, 'hours').toDate();
                    return this.internacionResumenService.search({
                        organizacion: this.auth.organizacion.id,
                        paciente: paciente,
                        ingreso: this.internacionResumenService.queryDateParams(desde, hasta)
                    }).pipe(
                        map(resumen => resumen[0])
                    );
                }
                if (capa === 'estadistica-v2' && this.view === 'listado-internacion') {
                    return this.mapaCamasService.resumenInternacion$;
                }

                return of(null);
            }),
            map(resumen => resumen?.registros.filter(r => r.tipo === 'valoracion-inicial')),
            cache()
        );

        this.subscription = combineLatest([
            this.mapaCamasService.maquinaDeEstado$,
            this.mapaCamasService.view,
            this.mapaCamasService.capa2,
            this.mapaCamasService.camaSelectedSegunView$,
            this.mapaCamasService.prestacion$,
            this.mapaCamasService.resumenInternacion$,
            pacienteID$.pipe(
                filter(pacID => !!pacID),
                switchMap((pacID) => {
                    return this.mapaCamasService.getPaciente({ id: pacID }, false);
                })
            )]
        ).subscribe(([estado, view, capa, cama, prestacion, resumen, paciente]: [IMaquinaEstados, string, string, ISnapshot, IPrestacion, IResumenInternacion, IPaciente]) => {
            this.capa = capa;
            this.prestacion = prestacion;
            this.paciente = paciente;
            this.resumen = resumen;
            // Puede suceder, por error, que el ingreso impacte pero no se cree el movimiento correspondiente
            this.poseeMovimientos = !!(cama?.id); // si tiene cama, entonces registra al menos un movimiento

            if (paciente && paciente.financiador && paciente.financiador.length > 0) {
                const os = paciente.financiador[0];
                this.backupObraSocial = os;
            }

            if (this.prestacion) {
                // capa estadistica o estadistica-v2 con ingreso cargado
                this.informeIngreso = this.prestacion.ejecucion.registros[0].valor.informeIngreso;
                if (this.origenExterno) {
                    this.check = typeof this.informeIngreso.organizacionOrigen === 'string';
                }
                this.fechaIngresoOriginal = new Date(this.informeIngreso.fechaIngreso);
                this.paciente.obraSocial = this.prestacion.paciente.obraSocial;
            } else {
                // capa medica/enfermeria, ingreso en estadistica o carga de prestacion en estadistica-v2
                if (paciente.id) {
                    const fechaIngresoInicial = resumen?.fechaIngreso || this.mapaCamasService.fecha;
                    this.informeIngreso.fechaIngreso = new Date(fechaIngresoInicial);
                    this.fechaIngresoOriginal = new Date(fechaIngresoInicial);
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

            if (cama && cama.id && cama.id !== ' ') {
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
                if (this.poseeMovimientos) {
                    const idInternacion = resumen?.id || prestacion.id;
                    this.subscription2 = this.mapaCamasService.snapshot(this.informeIngreso.fechaIngreso, idInternacion).pipe(
                        map(snapshot => this.cama = snapshot[0])
                    ).subscribe();
                }
            } else {
                this.cama = null;
            }

            if (this.informeIngreso.asociado?.id === 'Plan de salud privado o Mutual') {
                this.selectedOS = true;
            }
        });

        this.camas$ = combineLatest([
            this.mapaCamasService.snapshot$,
            pacienteID$
        ]).pipe(
            auditTime(1),
            map(([snapshot, idPaciente]) => {
                this.inProgress = false;
                // filtra por cama disponible / ocupada por el mismo paciente (edicion) / cama de sala
                const camasDisponibles = snapshot.filter(snap => snap.estado === 'ocupada' && snap.paciente.id === idPaciente || snap.estado === 'disponible' || snap.sala);
                return camasDisponibles;
            })
        );

        this.obraSocialService.getListado({}).subscribe(listado => this.selectorFinanciadores = listado.filter(financiador => this.obrasSociales.every(os => os.nombre !== financiador.nombre)));
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

    changeTipoObraSocial() {
        this.selectedOS = false;
        if (this.informeIngreso.asociado?.id === 'Plan de salud privado o Mutual') {
            this.selectedOS = true;
        }
        this.esPrepaga = this.informeIngreso.asociado?.id === 'Plan de salud privado o Mutual';
        if (this.esPrepaga || !this.informeIngreso.asociado) {
            this.paciente.obraSocial = null;
        } else if (this.informeIngreso.asociado?.id === 'Ninguno') {
            this.paciente.obraSocial = 'Ninguno';
        } else if (this.informeIngreso.asociado?.id === 'Sin Datos') {
            this.paciente.obraSocial = 'Sin Datos';
        } else {
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
            const query = {
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
            const query = {
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
        if (!this.prestacionFake) {
            return true;
        }
        let flagValid = true;
        this.rupElements.forEach((item) => {
            const instance = item.rupInstance;
            flagValid = flagValid && (instance.soloValores || instance.validate());
        });
        return flagValid;
    }

    guardar(valid) {
        if (valid.formValid && this.validarRUP()) {
            if (this.cama.sala) {
                this.confirmarGuardar();
                return;
            }
            this.mapaCamasService.historial('cama', this.mapaCamasService.fecha, moment().toDate(), this.cama).pipe(
                take(1),
                map(resp => resp)
            ).subscribe(historial => {
                if (historial.length) {
                    // Verificamos si hay otra internacion mas adelante. Asi mismo un bloqueo de cama o cambio de UO
                    if ((this.cama.idInternacion !== historial[0]?.idInternacion && historial[0].estado !== 'disponible') ||
                        historial[0].unidadOrganizativa.id !== this.cama.unidadOrganizativa.id) {
                        const fechaEnConflicto = moment(historial[0].fecha);

                        this.plex.confirm(`Esta cama está disponible hasta el día ${fechaEnConflicto.format('DD/MM/YYYY')} a las ${fechaEnConflicto.format('HH:mm')}. ¿Desea continuar con la internación?`, 'Aviso').then(respuesta => {
                            if (respuesta) {
                                this.confirmarGuardar();
                            }
                        });
                    } else {
                        this.confirmarGuardar();
                    }
                } else {
                    this.confirmarGuardar();
                }
            });
        }
    }

    private confirmarGuardar() {
        this.disableButton = true;
        const dtoPaciente = {
            id: this.paciente.id,
            documento: this.paciente.documento,
            numeroIdentificacion: this.paciente.numeroIdentificacion,
            nombre: this.paciente.nombre,
            alias: this.paciente.alias,
            apellido: this.paciente.apellido,
            sexo: this.paciente.sexo,
            genero: this.paciente.genero,
            fechaNacimiento: this.paciente.fechaNacimiento,
            direccion: this.paciente.direccion,
            telefono: this.paciente.telefono,
            obraSocial: this.paciente.obraSocial || this.financiador
        };
        if (this.capa === 'estadistica' || (this.capa === 'estadistica-v2' && !this.prestacion)) {
            this.ingresoExtendido(dtoPaciente);
        } else if (this.capa === 'estadistica-v2') {
            this.completarIngreso(dtoPaciente);
        } else if (this.prestacion) {
            this.actualizarPrestacion(dtoPaciente);
        } else {
            this.ingresoSimplificado('ocupada', dtoPaciente, this.resumen?.id);
        }
    }

    // Sincroniza las fechas editadas entre la cama y elresumen/prestacion
    private sincronizarCamaInternacion(idInternacion, fechaIngresoOriginal, fechaIngreso): Observable<IResumenInternacion> {
        return this.mapaCamasService.snapshot(this.fechaIngresoOriginal, idInternacion).pipe(
            switchMap(snapshot => {
                const primeraCama = snapshot[0];
                return this.mapaCamasService.changeTime(primeraCama, fechaIngresoOriginal, fechaIngreso, idInternacion);
            }),
            switchMap(cama => {
                if (!cama.id) {
                    // algun error en changeTime
                    throw new Error();
                }
                if (this.capa === 'estadistica') {
                    return of(null);
                }
                this.cama = cama;
                // Prestacion creada por capa estadistica-v2. Puede estar siendo actualizada por medica/enfermeria
                return this.internacionResumenService.update(cama.idInternacion, {
                    idPrestacion: this.prestacion?.id,
                    fechaIngreso: this.informeIngreso.fechaIngreso
                });
            })
        ) as Observable<IResumenInternacion>;
    }

    ingresoSimplificado(estado, paciente, idInternacion = null, nuevaPrestacion = null) {
        // si idInternacion === null es ingreso nuevo
        // si nuevaPrestacion !== null estadistica-v2 esta ingresando un paciente
        // Se modifica el estado de la cama
        this.cama.estado = estado;
        this.cama.paciente = paciente;
        this.cama.fechaIngreso = new Date(this.informeIngreso.fechaIngreso);

        if (this.prestacion && this.poseeMovimientos) {
            // Se actualiza fecha y hora en camas
            this.cama.idInternacion = idInternacion;
            if (this.informeIngreso.fechaIngreso.getTime() !== this.fechaIngresoOriginal.getTime()) {
                // Recuperamos snapshot inicial, por si hay un cambio de cama
                this.sincronizarCamaInternacion(idInternacion, this.fechaIngresoOriginal, this.informeIngreso.fechaIngreso).subscribe(() => {
                    this.plex.info('success', 'Los datos se actualizaron correctamente');
                    this.mapaCamasService.setFecha(this.informeIngreso.fechaIngreso);
                    this.listadoInternacionService.setFechaHasta(this.informeIngreso.fechaIngreso);
                    this.disableButton = false;
                    this.onSave.emit();
                }, () => {
                    this.plex.info('danger', 'Ocurrió un error actualizando los datos. Revise los movimientos e intente nuevamente.', 'Atención');
                    this.disableButton = false;
                });
            } else {
                this.plex.info('success', 'Los datos se actualizaron correctamente');
                this.mapaCamasService.setFecha(this.informeIngreso.fechaIngreso);
                this.listadoInternacionService.setFechaHasta(this.informeIngreso.fechaIngreso);
                this.disableButton = false;
                this.onSave.emit();
            }
        } else {
            if (nuevaPrestacion) {
                // estadistica-v2
                this.prestacion = nuevaPrestacion;
            }
            if (this.cama.idInternacion) {
                // Edición de internación existente por capa medica/enfermeria
                this.sincronizarCamaInternacion(this.cama.idInternacion, this.fechaIngresoOriginal, this.informeIngreso.fechaIngreso).subscribe(() => {
                    this.onSave.emit();
                    this.disableButton = false;
                    this.mapaCamasService.fecha2.next(this.informeIngreso.fechaIngreso); // para vista del mapa
                    this.mapaCamasService.select(this.cama);
                    this.historialInternacionService.refresh.next(null); // para vista del historial
                    this.plex.info('success', 'Los datos se actualizaron correctamente');
                }, () => {
                    this.plex.info('danger', 'Ocurrió un error actualizando los datos. Revise los movimientos e intente nuevamente.', 'Atención');
                    this.disableButton = false;
                });
            } else {
                // Nueva internacion por capa medica/enfermería/estadistica-v2
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
                        ingreso,
                        idPrestacion: this.capa === 'estadistica-v2' ? nuevaPrestacion.id : undefined
                    });

                createAction.pipe(
                    switchMap(internacion => {
                        if (!internacion.id) {
                            throw new Error();
                        }
                        this.cama.idInternacion = internacion.id;
                        return this.mapaCamasService.save(this.cama, this.informeIngreso.fechaIngreso);
                    })
                ).subscribe(camaEstado => {
                    if (camaEstado?.id) {
                        this.plex.info('success', 'Paciente internado');
                        this.mapaCamasService.setFecha(this.informeIngreso.fechaIngreso);
                        this.selectCama(camaEstado);
                        this.onSave.emit();
                    } else {
                        this.plex.info('warning', 'Ocurrió un error realizando el ingreso. Por favor revise los movimientos y de ser necesario anule la internación.', 'Atención');
                    }
                    this.disableButton = false;
                }, () => {
                    this.plex.info('warning', 'Ocurrió un error realizando el ingreso. Por favor revise los movimientos y de ser necesario anule la internación.', 'Atención');
                    this.disableButton = false;
                });
            }
        }
    }

    ingresoExtendido(paciente) {
        // construimos el informe de ingreso
        this.informeIngreso.situacionLaboral = (this.informeIngreso.situacionLaboral) ? this.informeIngreso.situacionLaboral.nombre : null;
        this.informeIngreso.nivelInstruccion = ((typeof this.informeIngreso.nivelInstruccion === 'string')) ? this.informeIngreso.nivelInstruccion : (Object(this.informeIngreso.nivelInstruccion).nombre);
        this.informeIngreso.asociado = ((typeof this.informeIngreso.asociado === 'string')) ? this.informeIngreso.asociado : (Object(this.informeIngreso.asociado).nombre);
        this.informeIngreso.origen = ((typeof this.informeIngreso.origen === 'string')) ? this.informeIngreso.origen : (Object(this.informeIngreso.origen).nombre);
        // Verificamos si es de origen externo
        if (this.origenExterno && !this.check) {
            this.informeIngreso.organizacionOrigen = {
                id: this.informeIngreso.organizacionOrigen.id,
                nombre: this.informeIngreso.organizacionOrigen.nombre
            };
        }
        this.informeIngreso.PaseAunidadOrganizativa = this.informeIngreso.PaseAunidadOrganizativa;
        if (!this.informeIngreso.asociado && this.informeIngreso.obraSocial) {
            delete this.informeIngreso.obraSocial;
        } if (this.informeIngreso.asociado === 'Plan o Seguro público') {
            this.informeIngreso.obraSocial = null;
        } else {
            this.informeIngreso.obraSocial = this.paciente.obraSocial || this.financiador;
        }

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
        const indexInforme = this.prestacion.ejecucion.registros.findIndex(r => r.concepto.conceptId === this.snomedIngreso.conceptId);
        this.prestacion.ejecucion.registros[indexInforme].valor = { informeIngreso: this.informeIngreso };
        const cambios = {
            op: 'registros',
            registros: this.prestacion.ejecucion.registros,
            paciente: this.paciente
        };
        this.servicioPrestacion.patch(this.prestacion.id, cambios).subscribe((prestacion: any) => {
            this.informeIngreso = prestacion.ejecucion.registros[0].valor.informeIngreso;
            this.mapaCamasService.selectPrestacion(prestacion);
            const idInternacion = this.capa === 'estadistica' ? prestacion._id : this.resumen.id;
            this.ingresoSimplificado('ocupada', paciente, idInternacion);
        }, (err) => {
            this.plex.info('danger', err);
        });
    }

    crearPrestacion(paciente) {
        const nuevaPrestacion = this.datosBasicosPrestacion();

        this.servicioPrestacion.post(nuevaPrestacion).subscribe(prestacion => {
            if (this.cama) {
                if (this.capa === 'estadistica') {
                    this.ingresoSimplificado('ocupada', paciente, prestacion.id);
                } else {
                    // capa estadistica-v2 usa como idInternacion el id del resumen, por tanto primero hay que crearlo
                    this.ingresoSimplificado('ocupada', paciente, null, prestacion);
                }
            } else if (this.capa === 'estadistica') {
                this.plex.info('warning', 'Paciente ingresado a lista de espera');
            }

        }, () => {
            this.plex.info('danger', 'ERROR: La prestación no pudo ser registrada');
        });
    }

    // Inicializa una prestación con todos sus datos básicos
    datosBasicosPrestacion() {
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

        return nuevaPrestacion;
    }

    // Crea o actualiza una prestación de internación
    completarIngreso(paciente) {
        if (!this.prestacion) {
            // creamos la prestacion de internacion y agregamos el registro de ingreso
            const nuevaPrestacion = this.datosBasicosPrestacion();
            this.servicioPrestacion.post(nuevaPrestacion).pipe(
                switchMap(prestacion => {
                    return this.internacionResumenService.update(this.cama.idInternacion, { idPrestacion: prestacion.id });
                })
            ).subscribe(() => {
                this.onSave.emit();
                this.disableButton = false;
                this.mapaCamasService.select(this.cama);
                this.plex.info('success', 'Registro completado con éxito');
            }, () => {
                this.plex.info('danger', 'ERROR: La prestación no pudo ser registrada');
            });
        } else {
            this.actualizarPrestacion(paciente);
        }
    }

    setFecha() {
        if (this.prestacion?.id || this.resumen?.id) { // Si se trata de un movimiento (Paciente ya ingresado)
            this.checkEstadoCama();
            this.checkMovimientos();
        }

        this.mapaCamasService.setFecha(this.informeIngreso.fechaIngreso);
        if (!this.prestacion?.id && !this.resumen?.id) { // se trata de un ingreso nuevo
            // chequeamos estado de la cama

            this.mapaCamasService.snapshot$.subscribe(camas => {
                if (this.informeIngreso.fechaIngreso && this.cama) {
                    //  si para la nueva fecha la cama seleccionada se encuentra ocupada, anulamos la seleccion
                    const camaSeleccionada = camas.filter(cama => cama.id === this.cama.id)?.shift();

                    if (!camaSeleccionada || camaSeleccionada?.estado === 'ocupada') {
                        this.plex.toast('danger', 'La cama seleccionada no está disponible en la fecha indicada');
                        this.mapaCamasService.select(null);
                    }
                }
            });

        }
    }

    onType() {
        this.inProgress = true;
    }

    selectReadonly() {
        return this.capa !== 'estadistica' && this.capa !== 'estadistica-v2' && this.resumen?.id && this.poseeMovimientos;
    }

    /**
     *  Se debe controlar que:
        La cama este disponible en la fecha que la quiero usar,
        Y que no puede ser una fecha posterior al siguiente movimiento
     */
    checkMovimientos() {
        const HOY = moment().toDate();
        this.mapaCamasService.historial('internacion', this.fechaIngresoOriginal, HOY).subscribe(h => {
            const movimientoEncontrado = h.filter((s: ISnapshot) => {
                if (s.fecha.getTime() > this.fechaIngresoOriginal.getTime() && s.fecha.getTime() < this.informeIngreso.fechaIngreso.getTime()) {
                    return s;
                }
            });
            if (movimientoEncontrado && movimientoEncontrado.length) {
                this.informeIngreso.fechaIngreso = new Date(this.fechaIngresoOriginal);
                this.plex.info('warning', 'No es posible realizar el cambio de fecha porque la internacion tiene movimientos previos a la fecha ingresada');
            }
        });
    }

    checkEstadoCama() {
        this.checkMovimientos();
        if (this.cama?.idCama) {
            this.mapaCamasService.get(this.informeIngreso.fechaIngreso, this.cama.id).subscribe((cama) => {
                if (cama && cama.estado !== 'disponible') {
                    const controlEstadistica = this.capa === 'estadistica' && cama.idInternacion !== this.prestacion.id;
                    const controlEstadisticaV2 = this.resumen && cama.idInternacion !== this.resumen.id;
                    // como la cama esta ocupada, se controla que sea por la misma internación
                    if (!cama.idInternacion || controlEstadistica || controlEstadisticaV2) {
                        this.informeIngreso.fechaIngreso = new Date(this.fechaIngresoOriginal);
                        this.plex.info('warning', `No es posible realizar el cambio de fecha porque la cama ${this.cama.nombre.bold()} no se encuentra disponible`,
                            'Cama no disponible');
                        this.mapaCamasService.setFecha(this.informeIngreso.fechaIngreso);
                    }
                }
            });
        }
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

    /**
     * Retorna true si la prestacion de internación es censable.
     * Una internación es cesable unicamente si posee flag 'esCensable'
     * y el mismo posee valor true
     */
    public get esInternacionCensable() {
        const reg = this.prestacion?.ejecucion.registros[0];
        if (reg) {
            return ('esCensable' in reg) && reg.esCensable === true;
        }
        return false;
    }

    /**
     * Retorna true si la prestacion de internación es censable.
     * Una internación es 'no censable' unicamente si posee flag 'esCensable'
     * y el mismo posee valor false
     */
    public get esInternacionNoCensable() {
        const reg = this.prestacion?.ejecucion.registros[0];
        if (reg) {
            return ('esCensable' in reg) && reg.esCensable === false;
        }
        return false;
    }

    /**
     * Se marca una internación como 'censable' seteando el flag 'esCensable'
     * en valor true.
     * Se desmarca una internación como 'censable' eliminando el flag 'esCensable'
     */
    togglePrestacionCensable() {
        const reg: any = this.prestacion.ejecucion.registros[0];
        if ('esCensable' in reg) {
            delete reg.esCensable;
        } else {
            reg.esCensable = true;
        }
    }

    /**
     * Se marca una internación como 'no censable' seteando el flag 'esCensable'
     * en valor false.
     * Se desmarca una internación como 'no censable' eliminando el flag 'esCensable'
     */
    togglePrestacionNoCensable() {
        const reg: any = this.prestacion.ejecucion.registros[0];
        if ('esCensable' in reg) {
            delete reg.esCensable;
        } else {
            reg.esCensable = false;
        }
    }

    public setFinanciador(financiador) {
        this.financiador = financiador;
    }
}
