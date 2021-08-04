import { cache, notNull } from '@andes/shared';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of, timer } from 'rxjs';
import { catchError, filter, map, multicast, pluck, startWith, switchMap } from 'rxjs/operators';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { PacienteService } from '../../../../core/mpi/services/paciente.service';
import { ISectores } from '../../../../interfaces/IOrganizacion';
import { IPrestacion } from '../../../../modules/rup/interfaces/prestacion.interface';
import { ISnomedConcept } from '../../../../modules/rup/interfaces/snomed-concept.interface';
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';
import { IMAQEstado, IMAQRelacion, IMaquinaEstados } from '../interfaces/IMaquinaEstados';
import { ISnapshot } from '../interfaces/ISnapshot';
import { MapaCamaListadoColumns } from '../interfaces/mapa-camas.internface';
import { SalaComunService } from '../views/sala-comun/sala-comun.service';
import { MapaCamasHTTP } from './mapa-camas.http';
import { MaquinaEstadosHTTP } from './maquina-estados.http';
import { InternacionResumenHTTP, IResumenInternacion } from './resumen-internacion.http';

@Injectable()
export class MapaCamasService {
    public timer$;
    public fechaMax$;

    public sortBy = new BehaviorSubject<string>(null);
    public sortOrder = new BehaviorSubject<string>(null);

    public ambito2 = new BehaviorSubject<string>(null);
    public capa2 = new BehaviorSubject<string>(null);
    public fecha2 = new BehaviorSubject<Date>(null);
    private organizacion2 = new BehaviorSubject<string>(null);

    public unidadOrganizativaSelected = new BehaviorSubject<ISnomedConcept>(null);
    public sectorSelected = new BehaviorSubject<ISectores>(null);
    public tipoCamaSelected = new BehaviorSubject<ISnomedConcept>(null);
    public esCensable = new BehaviorSubject<any>(null);
    public pacienteText = new BehaviorSubject<string>(null);
    public estadoSelected = new BehaviorSubject<string>(null);
    public equipamientoSelected = new BehaviorSubject<ISnomedConcept[]>(null);

    public pacienteAux = new BehaviorSubject<any>({} as any);

    public selectedCama = new BehaviorSubject<ISnapshot>({} as any);

    public view = new BehaviorSubject<'mapa-camas' | 'listado-internacion' | 'mapa-recursos'>('mapa-camas');

    public prestacion$: Observable<IPrestacion>;
    public selectedPrestacion = new BehaviorSubject<IPrestacion>({ id: null } as any);
    public camaSelectedSegunView$: Observable<ISnapshot>;

    public maquinaDeEstado$: Observable<IMaquinaEstados>;

    public estado$: Observable<IMAQEstado[]>;
    public relaciones$: Observable<IMAQRelacion[]>;

    public snapshot$: Observable<ISnapshot[]>;
    public snapshotFiltrado$: Observable<ISnapshot[]>;
    public snapshotOrdenado$: Observable<ISnapshot[]>;


    public resumenInternacion$: Observable<IResumenInternacion>;


    public fechaActual$: Observable<Date>;

    public columnsMapa = new BehaviorSubject<MapaCamaListadoColumns>({} as any);

    public mainView = new BehaviorSubject<any>('principal');

    public ambito;
    public capa;
    public fecha: Date;
    public permisos: string[];

    /**
     * Listado de movimientos de la internacion seleccionada
     */
    public historialInternacion$: Observable<ISnapshot[]>;

    constructor(
        private camasHTTP: MapaCamasHTTP,
        private prestacionService: PrestacionesService,
        private pacienteService: PacienteService,
        private maquinaEstadosHTTP: MaquinaEstadosHTTP,
        private salaComunService: SalaComunService,
        private internacionResumenHTTP: InternacionResumenHTTP
    ) {
        this.maquinaDeEstado$ = combineLatest(
            this.ambito2,
            this.capa2,
            this.organizacion2
        ).pipe(
            switchMap(([ambito, capa, organizacion]) => {
                return this.maquinaEstadosHTTP.getOne(ambito, capa, organizacion);
            }),
            cache()
        );
        this.estado$ = this.maquinaDeEstado$.pipe(pluck('estados'));
        this.relaciones$ = this.maquinaDeEstado$.pipe(pluck('relaciones'));

        this.snapshot$ = combineLatest(
            this.ambito2,
            this.capa2,
            this.fecha2
        ).pipe(
            switchMap(([ambito, capa, fecha]) => {
                return this.camasHTTP.snapshot(ambito, capa, fecha).pipe(
                    map(snapshot => [snapshot, fecha])
                );
            }),
            map(([snapshot, fecha]: [ISnapshot[], Date]) => {
                snapshot = snapshot.filter(snap => snap.estado !== 'inactiva');
                snapshot.forEach((snap) => {
                    const sectores = snap.sectores || [];
                    const sectorName = [...sectores].reverse().map(s => s.nombre).join(', ');
                    (snap as any).sectorName = sectorName;

                    snap._key = snap.id + '-' + snap.idInternacion;

                    if (snap.fechaIngreso && snap.estado === 'ocupada') {
                        snap.diaEstada = this.calcularDiasEstada(snap.fechaIngreso, fecha);
                    } else {
                        snap.diaEstada = 0;
                    }
                });



                return snapshot.sort((a, b) => (a.unidadOrganizativa.term.localeCompare(b.unidadOrganizativa.term)) ||
                    (a.sectores[a.sectores.length - 1].nombre.localeCompare(b.sectores[b.sectores.length - 1].nombre + '')) ||
                    (a.nombre.localeCompare('' + b.nombre)));
            }),
            cache(),
        );

        this.snapshotFiltrado$ = combineLatest(
            this.snapshot$,
            this.pacienteText,
            this.unidadOrganizativaSelected,
            this.sectorSelected,
            this.tipoCamaSelected,
            this.esCensable,
            this.estadoSelected,
            this.equipamientoSelected
        ).pipe(
            map(([camas, paciente, unidadOrganizativa, sector, tipoCama, esCensable, estado, equipamiento]) =>
                this.filtrarSnapshot(camas, paciente, unidadOrganizativa, sector, tipoCama, esCensable, estado, equipamiento)
            )
        );

        this.snapshotOrdenado$ = combineLatest(
            this.snapshotFiltrado$,
            this.sortBy,
            this.sortOrder
        ).pipe(
            map(([camas, sortBy, sortOrder]) =>
                this.sortSnapshots(camas, sortBy, sortOrder)
            )
        );


        this.prestacion$ = combineLatest(
            this.selectedPrestacion,
            this.selectedCama,
            this.view,
            this.capa2
        ).pipe(
            switchMap(([prestacion, cama, view, capa]) => {
                const idInternacion = (view === 'listado-internacion') ? prestacion.id : cama.idInternacion;
                if (capa === 'estadistica') {
                    if (idInternacion) {
                        return this.prestacionService.getById(idInternacion, { showError: false }).pipe(
                            // No todas las capas tienen un ID de internacion real.
                            catchError(() => of(null))
                        );
                    }
                }
                return of(null);
            }),
            cache()
        );

        this.camaSelectedSegunView$ = this.view.pipe(
            switchMap((view) => {
                if (view === 'mapa-camas') {
                    return this.selectedCama;
                } else {
                    // Chamuyo para conseguir la cama de la internación!
                    return combineLatest(
                        this.snapshot$,
                        this.selectedPrestacion
                    ).pipe(
                        map(([camas, prestacion]) => {
                            return camas.find(c => c.idInternacion === prestacion.id);
                        })
                    );
                }
            })
        );

        // const hoy = new Date();
        const desde = moment().subtract(12, 'months').toDate();
        this.historialInternacion$ = this.historial('internacion', desde).pipe(
            map((historial: ISnapshot[]) => {
                return historial.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
            }),
            multicast(
                () => new BehaviorSubject([])
            )
        );
        (this.historialInternacion$ as any).connect();

        const proximoMinuto = moment().add(1, 'minute').startOf('minute');
        const segundosAPoxMin = proximoMinuto.diff(moment());
        this.fechaActual$ = timer(segundosAPoxMin, 60000).pipe(
            startWith(0),
            map(() => moment().endOf('minute').toDate()),
        );

        this.resumenInternacion$ = combineLatest([
            this.selectedCama,
            this.ambito2,
            this.capa2
        ]).pipe(
            switchMap(([cama, ambito, capa]) => {
                if (cama.idInternacion && capa !== 'estadistica') {
                    return this.internacionResumenHTTP.get(cama.idInternacion).pipe(
                        catchError((err) => {
                            return of({});
                        })
                    );
                }
                return of({});
            }),
            cache()
        ) as Observable<IResumenInternacion>;
    }

    resetView() {
        this.mainView.next('principal');
    }

    getEstadoCama(cama: ISnapshot) {
        return this.estado$.pipe(
            map(estados => {
                return estados.filter(est => cama.estado === est.key)[0];
            })
        );
    }

    private getEstadosRelacionesCama(cama: ISnapshot, estados: IMAQEstado[], relaciones: IMAQRelacion[]) {
        const relacionesPosibles = [];
        const estadoCama = estados.filter(est => cama.estado === est.key)[0];

        if (estadoCama) {
            estados.map(est => relaciones.map(rel => {
                if (estadoCama.key === rel.origen) {
                    if (est.key === rel.destino && rel.destino !== 'inactiva') {
                        relacionesPosibles.push(rel);
                    }
                }
            }));
        }
        return relacionesPosibles;
    }

    getRelacionesPosibles(cama: ISnapshot) {
        return combineLatest(this.estado$, this.relaciones$).pipe(
            map(([estados, relaciones]) => {
                return this.getEstadosRelacionesCama(cama, estados, relaciones);
            })
        );
    }

    private getCamasDisponiblesCama(camas: ISnapshot[], cama: ISnapshot) {
        let camasMismaUO = [];
        let camasDistintaUO = [];
        if (cama?.id) {
            camas.map(c => {
                if (c.sala || c.estado === 'disponible') {
                    if (c.id !== cama.id) {
                        if (c.unidadOrganizativa.conceptId === cama.unidadOrganizativa.conceptId) {
                            camasMismaUO.push(c);
                        } else {
                            camasDistintaUO.push(c);
                        }
                    }
                }
            });
        }
        return { camasMismaUO, camasDistintaUO };
    }

    getCamasDisponibles(cama: ISnapshot) {
        return this.snapshot$.pipe(
            map((camas) => {
                return this.getCamasDisponiblesCama(camas, cama);
            })
        );
    }

    setAmbito(ambito: string) {
        this.ambito2.next(ambito);
        this.ambito = ambito;
    }

    setCapa(capa: string) {
        this.capa2.next(capa);
        this.capa = capa;
    }

    setOrganizacion(organizacion: string) {
        this.organizacion2.next(organizacion);
    }

    setFecha(fecha: Date) {
        this.fecha2.next(fecha);
        this.fecha = fecha;
    }

    setView(view: 'mapa-camas' | 'listado-internacion' | 'mapa-recursos') {
        this.view.next(view);
    }

    select(cama: ISnapshot) {
        if (!cama) {
            return this.selectedCama.next({ idCama: null } as any);
        }
        this.selectedCama.next(cama);
    }

    selectPrestacion(prestacion: IPrestacion) {
        if (!prestacion) {
            return this.selectedPrestacion.next({ id: null } as any);
        }
        this.selectedPrestacion.next(prestacion);
    }

    filtrarSnapshot(camas: ISnapshot[], paciente: string, unidadOrganizativa: ISnomedConcept, sector: ISectores, tipoCama: ISnomedConcept, esCensable, estado, equipamiento: ISnomedConcept[]) {
        let camasFiltradas = camas;

        if (paciente) {
            camasFiltradas = camasFiltradas.filter((snap: ISnapshot) => snap.estado === 'ocupada');
            const esNumero = Number.isInteger(Number(paciente));
            if (esNumero) {
                camasFiltradas = camasFiltradas.filter((snap: ISnapshot) =>
                    snap.paciente.documento.includes(paciente));
            } else {
                camasFiltradas = camasFiltradas.filter((snap: ISnapshot) =>
                    (snap.paciente.nombre.toLowerCase().includes(paciente.toLowerCase()) ||
                    snap.paciente.apellido.toLowerCase().includes(paciente.toLowerCase()))
                );
            }
        }

        if (unidadOrganizativa) {
            camasFiltradas = camasFiltradas.filter((snap: ISnapshot) => snap.unidadOrganizativa.conceptId === unidadOrganizativa.conceptId);
        }

        if (sector) {
            camasFiltradas = camasFiltradas.filter((snap: ISnapshot) => snap.sectores.some(sect => sect.nombre === sector.nombre));
        }

        if (tipoCama) {
            camasFiltradas = camasFiltradas.filter((snap: ISnapshot) => (snap.tipoCama && snap.tipoCama.conceptId === tipoCama.conceptId));
        }

        if (estado) {
            camasFiltradas = camasFiltradas.filter(snap => snap.estado === estado.estado);
        }

        if (equipamiento && equipamiento.length > 0) {
            camasFiltradas = camasFiltradas.filter(snap => !!snap.equipamiento).filter(snap => {
                return equipamiento.every(equip => {
                    return snap.equipamiento.some(e => e.conceptId === equip.conceptId);
                });
            });
        }

        if (esCensable) {
            if (esCensable.id === 0) {
                camasFiltradas = camasFiltradas.filter((snap: ISnapshot) => !snap.esCensable);
            } else if (esCensable.id === 1) {
                camasFiltradas = camasFiltradas.filter((snap: ISnapshot) => snap.esCensable);
            }
        }

        return camasFiltradas;
    }

    sortSnapshots(snapshots: ISnapshot[], sortBy: string, sortOrder: string) {
        if (sortOrder === 'asc') {
            snapshots = snapshots.reverse();
        } else {
            if (sortBy === 'cama') {
                snapshots = snapshots.sort((a, b) => a.nombre.localeCompare((b.nombre as string)));
            } else if (sortBy === 'unidadOrganizativa') {
                snapshots = snapshots.sort((a, b) => a.unidadOrganizativa.term.localeCompare(b.unidadOrganizativa.term));
            } else if (sortBy === 'estado') {
                snapshots = snapshots.sort((a, b) => a.estado.localeCompare((b.estado as string)));
            } else if (sortBy === 'paciente') {
                snapshots = snapshots.sort((a, b) => (!a.paciente) ? 1 : (!b.paciente) ? -1 : a.paciente.apellido.localeCompare((b.paciente.apellido as string)));
            } else if (sortBy === 'diasEstada') {
                snapshots = snapshots.sort((a, b) => {
                    if (a.fechaIngreso) {
                        if (b.fechaIngreso) {
                            return a.diaEstada - b.diaEstada;
                        } else {
                            return 1;
                        }
                    }
                    return -1;
                });
            } else if (sortBy === 'fechaIngreso') {
                snapshots = snapshots.sort((a, b) => {
                    if (!a.fechaIngreso) {
                        return -1;
                    }
                    if (!b.fechaIngreso) {
                        return 1;
                    }
                    return a.fechaIngreso.getTime() - b.fechaIngreso.getTime();
                });
            } else if (sortBy === 'fechaMovimiento') {
                snapshots = snapshots.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
            } else if (sortBy === 'usuario') {
                snapshots = snapshots.sort((a, b) => {
                    const compareApellido = a.createdBy.apellido.localeCompare((b.createdBy.apellido as string));
                    return (compareApellido !== 0) ? compareApellido : a.createdBy.nombre.localeCompare((b.createdBy.nombre as string));
                });
            } else if (sortBy === 'sector') {
                snapshots = snapshots.sort((a, b) => a.sectores[0].nombre.localeCompare((b.sectores[0].nombre as string)));
            } else if (sortBy === 'documento') {
                snapshots = snapshots.sort((a, b) => (!a.paciente) ? 1 : (!b.paciente) ? -1 : a.paciente.documento.localeCompare((b.paciente.documento as string)));
            } else if (sortBy === 'sexo') {
                snapshots = snapshots.sort((a, b) => (!a.paciente) ? 1 : (!b.paciente) ? -1 : a.paciente.sexo.localeCompare((b.paciente.sexo as string)));
            } else if (sortBy === 'prioridad') {
                snapshots = snapshots.sort((a, b) => (a.prioridad?.id || -10) - (b.prioridad?.id || -10));
            } else if (sortBy === 'guardia') {
                snapshots = snapshots.sort((a, b) => {
                    const dateA = a.fechaAtencion || a.fechaIngreso;
                    const dateB = b.fechaAtencion || b.fechaIngreso;
                    if (!dateA) {
                        return -1;
                    } else if (!dateB) {
                        return 1;
                    } else {
                        return dateA.getTime() - dateB.getTime();
                    }
                });
            }
        }

        return snapshots;
    }

    filtrarListaInternacion(listaInternacion: IPrestacion[], documento: string, apellido: string, estado: string) {
        let listaInternacionFiltrada = listaInternacion;

        if (documento) {
            listaInternacionFiltrada = listaInternacionFiltrada.filter((internacion: IPrestacion) => internacion.paciente.documento.toLowerCase().includes(documento.toLowerCase()));
        }

        if (apellido) {
            listaInternacionFiltrada = listaInternacionFiltrada.filter((internacion: IPrestacion) => internacion.paciente.apellido.toLowerCase().includes(apellido.toLowerCase()));
        }

        if (estado) {
            listaInternacionFiltrada = listaInternacionFiltrada.filter((internacion: IPrestacion) =>
                internacion.estados[internacion.estados.length - 1].tipo === estado
            );
        }

        return listaInternacionFiltrada;
    }

    snapshot(fecha, idInternacion = null, ambito: string = null, capa: string = null, estado: string = null): Observable<ISnapshot[]> {
        ambito = ambito || this.ambito;
        capa = capa || this.capa;

        return this.camasHTTP.snapshot(ambito, capa, fecha, idInternacion, estado) as any;
    }

    historial(type: 'cama' | 'internacion', desde: Date, hasta: Date = null, cama: ISnapshot = null): Observable<ISnapshot[]> {
        return combineLatest(
            this.ambito2,
            this.capa2,
            this.selectedCama.pipe(filter(snap => {
                return !!snap.id;
            })),
            this.selectedPrestacion,
            this.view
        ).pipe(
            switchMap(([ambito, capa, selectedCama, selectedPrestacion, view]) => {
                hasta = hasta || new Date();
                if (type === 'cama') {
                    return this.camasHTTP.historial(ambito, capa, desde, hasta, { idCama: cama ? cama.idCama : selectedCama.idCama });
                } else if (type === 'internacion') {
                    if (view === 'mapa-camas' && selectedCama.idInternacion) {
                        return this.camasHTTP.historialInternacion(ambito, capa, desde, hasta, selectedCama.idInternacion);
                    } else if (view === 'listado-internacion' && selectedPrestacion.id) {
                        return this.camasHTTP.historialInternacion(ambito, capa, desde, hasta, selectedPrestacion.id);
                    }
                    return of([]);
                }
            }),
            cache()
        );
    }

    get(fecha, idCama): Observable<ISnapshot> {
        return this.camasHTTP.get(this.ambito, this.capa, fecha, idCama);
    }

    save(data, fecha, esMovimiento = true): Observable<any> {
        if (!data.sala) {
            data.esMovimiento = esMovimiento;
            return this.camasHTTP.save(this.ambito, this.capa, fecha, data);
        } else {
            if (data.estado === 'ocupada') {
                return this.salaComunService.ingresarPaciente(data, fecha);
            } else {
                return this.salaComunService.egresarPaciente(data, fecha);
            }
        }
    }

    changeTime(cama, fechaOriginal, nuevaFecha, idInternacion, ambito: string = null, capa: string = null) {
        ambito = ambito || this.ambito;
        capa = capa || this.capa;
        return this.camasHTTP.changeTime(ambito, capa, cama, idInternacion, fechaOriginal, nuevaFecha);
    }

    censoDiario(fecha, unidadOrganizativa): Observable<any[]> {
        return this.camasHTTP.censoDiario(fecha, unidadOrganizativa);
    }

    listaEspera(ambito: string, capa: string): Observable<any[]> {
        ambito = ambito || this.ambito;
        capa = capa || this.capa;
        return this.camasHTTP.listaEspera(ambito, capa);
    }

    censoMensual(fechaDesde, fechaHasta, unidadOrganizativa): Observable<any[]> {
        return this.camasHTTP.censoMensual(fechaDesde, fechaHasta, unidadOrganizativa);
    }

    calcularEdad(fechaNacimiento: Date, fechaCalculo: Date): any {
        let edad: any;
        let fechaNac: any;
        let fechaActual: Date = fechaCalculo ? fechaCalculo : new Date();
        let fechaAct: any;
        let difAnios: any;
        let difDias: any;
        let difMeses: any;
        let difHs: any;
        let difMn: any;

        fechaNac = moment(fechaNacimiento, 'YYYY-MM-DD HH:mm:ss');
        fechaAct = moment(fechaActual, 'YYYY-MM-DD HH:mm:ss');
        difDias = fechaAct.diff(fechaNac, 'd'); // Diferencia en días
        difAnios = Math.floor(difDias / 365.25);
        difMeses = Math.floor(difDias / 30.4375);
        difHs = fechaAct.diff(fechaNac, 'h'); // Diferencia en horas
        difMn = fechaAct.diff(fechaNac, 'm'); // Diferencia en minutos

        if (difAnios !== 0) {
            edad = {
                valor: difAnios,
                unidad: 'año/s'
            };
        } else if (difMeses !== 0) {
            edad = {
                valor: difMeses,
                unidad: 'mes/es'
            };
        } else if (difDias !== 0) {
            edad = {
                valor: difDias,
                unidad: 'día/s'
            };
        } else if (difHs !== 0) {
            edad = {
                valor: difHs,
                unidad: 'hora/s'
            };
        } else if (difMn !== 0) {
            edad = {
                valor: difMn,
                unidad: 'minuto/s'
            };
        }

        return (String(edad.valor) + ' ' + edad.unidad);
    }

    private paciente$: { [key: string]: Observable<IPaciente> } = {};
    getPaciente(paciente, _startWith = true) {
        if (!this.paciente$[paciente.id]) {
            this.paciente$[paciente.id] = this.pacienteService.getById(paciente.id).pipe(
                _startWith ? startWith(paciente) : map(res => res),
                cache()
            );
        }
        return this.paciente$[paciente.id];
    }


    prestacionesPermitidas(cama: Observable<ISnapshot>) {
        const unidadOrganizativa$ = cama.pipe(
            pluck('unidadOrganizativa')
        );
        const accionesCapa$ = cama.pipe(
            switchMap(_cama => this.getEstadoCama(_cama)),
            notNull(),
            pluck('acciones')
        );

        return combineLatest(
            unidadOrganizativa$,
            accionesCapa$
        ).pipe(
            map(([uo, acciones]) => {
                if (!uo) {
                    return [];
                }
                const registros = acciones.filter(acc => acc.tipo === 'nuevo-registro');
                return registros.filter((registro) => {
                    const { unidadOrganizativa } = registro.parametros;
                    if (unidadOrganizativa.length === 0) {
                        return true;
                    }
                    const isExclude = unidadOrganizativa[0].startsWith('!');
                    if (!isExclude) {
                        return unidadOrganizativa.includes(uo.conceptId);
                    } else {
                        return !unidadOrganizativa.map(s => s.substr(1)).includes(uo.conceptId);
                    }
                });

            })
        );
    }

    calcularDiasEstada(fechaDesde, fechaHasta?) {
        /*  Si la fecha de egreso es el mismo día del ingreso -> debe mostrar 1 día de estada
            Si la fecha de egreso es al otro día del ingreso, no importa la hora -> debe mostrar 1 día de estada
            Si la fecha de egreso es posterior a los dos casos anteriores -> debe mostrar la diferencia de días */
        const dateDif = moment(fechaHasta).endOf('day').diff(moment(fechaDesde).startOf('day'), 'days');
        const diasEstada = dateDif === 0 ? 1 : dateDif;
        return diasEstada;
    }
}
