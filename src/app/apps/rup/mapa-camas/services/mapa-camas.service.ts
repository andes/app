import { Injectable } from '@angular/core';
import { cache } from '@andes/shared';
import { Observable, BehaviorSubject, Subject, combineLatest, of, timer } from 'rxjs';
import { ISnapshot } from '../interfaces/ISnapshot';
import { ICama } from '../interfaces/ICama';
import { IMaquinaEstados, IMAQRelacion, IMAQEstado } from '../interfaces/IMaquinaEstados';
import { MapaCamasHTTP } from './mapa-camas.http';
import { switchMap, map, pluck, catchError, startWith } from 'rxjs/operators';
import { ISectores } from '../../../../interfaces/IOrganizacion';
import { ISnomedConcept } from '../../../../modules/rup/interfaces/snomed-concept.interface';
import { IPrestacion } from '../../../../modules/rup/interfaces/prestacion.interface';
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';
import { MaquinaEstadosHTTP } from './maquina-estados.http';
import { PacienteService } from '../../../../core/mpi/services/paciente.service';

@Injectable()
export class MapaCamasService {
    public timer$;
    public fechaMax$;

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

    public selectedPaciente = new BehaviorSubject<any>({} as any);
    public pacienteAux = new BehaviorSubject<any>({} as any);

    public selectedCama = new BehaviorSubject<ISnapshot>({} as any);

    public view = new BehaviorSubject<'mapa-camas' | 'listado-internacion'>('mapa-camas');

    public prestacion$: Observable<IPrestacion>;
    public selectedPrestacion = new BehaviorSubject<IPrestacion>({ id: null } as any);
    public camaSelectedSegunView$: Observable<ISnapshot>;

    private maquinaDeEstado$: Observable<IMaquinaEstados>;

    public estado$: Observable<IMAQEstado[]>;
    public relaciones$: Observable<IMAQRelacion[]>;

    public snapshot$: Observable<ISnapshot[]>;
    public snapshotFiltrado$: Observable<ISnapshot[]>;

    // public listaInternacion$: Observable<IPrestacion[]>;
    // public listaInternacionFiltrada$: Observable<IPrestacion[]>;
    public fechaActual$: Observable<Date>;

    public mainView = new BehaviorSubject<any>('mapa-camas');

    public ambito = 'internacion';
    public capa;
    public fecha: Date;
    public permisos: string[];

    constructor(
        private camasHTTP: MapaCamasHTTP,
        private prestacionService: PrestacionesService,
        private pacienteService: PacienteService,
        private maquinaEstadosHTTP: MaquinaEstadosHTTP
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
                return this.camasHTTP.snapshot(ambito, capa, fecha);
            }),
            map((snapshot: ISnapshot[]) => {
                snapshot.forEach((snap) => {
                    const sectores = snap.sectores || [];
                    const sectorName = [...sectores].reverse().map(s => s.nombre).join(', ');
                    (snap as any).sectorName = sectorName;
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

        const proximoMinuto = moment().add(1, 'minute').startOf('minute');
        const segundosAPoxMin = proximoMinuto.diff(moment());
        this.fechaActual$ = timer(segundosAPoxMin, 60000).pipe(
            startWith(0),
            map(() => moment().endOf('minute').toDate()),
        );
    }

    resetView() {
        this.mainView.next('mapa-camas');
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
        if (cama.idCama) {
            camas.map(c => {
                if (c.estado === 'disponible') {
                    if (c.idCama !== cama.idCama) {
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

    verificarCamaDesocupar(cama: ISnapshot, prestacion: IPrestacion) {
        return this.historial('internacion', cama.fecha, moment().toDate(), prestacion).pipe(
            map((movimientos: ISnapshot[]) => {
                let puedeDesocupar = 'noPuede';
                if (!prestacion.ejecucion.registros[1] || !prestacion.ejecucion.registros[1].valor.InformeEgreso) {
                    if (movimientos.length === 1) {
                        puedeDesocupar = 'puede';
                    } else if (movimientos.length === 0) {
                        puedeDesocupar = 'puede';
                    } else {
                        let movOrd = movimientos.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                        if (movOrd[movOrd.length - 1].nombre === cama.nombre) {
                            puedeDesocupar = 'puede';
                        }
                    }
                }

                return puedeDesocupar;
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

    // setFechaHasta(fecha: Date) {
    //     this.fechaIngresoHasta.next(fecha);
    // }

    setView(view: 'mapa-camas' | 'listado-internacion') {
        this.view.next(view);
    }

    select(cama: ISnapshot) {
        if (!cama) {
            return this.selectedCama.next({ idCama: null } as any);
        }
        this.selectedCama.next(cama);
    }

    selectPaciente(paciente: any) {
        if (!paciente) {
            return this.selectedPaciente.next({ id: null } as any);
        }
        this.selectedPaciente.next(paciente);
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
            camasFiltradas = camasFiltradas.filter((snap: ISnapshot) => snap.tipoCama.conceptId === tipoCama.conceptId);
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

    historial(type: 'cama' | 'internacion', desde: Date, hasta: Date, prestacion = null): Observable<ISnapshot[]> {
        return combineLatest(
            this.ambito2,
            this.capa2,
            this.selectedCama,
            this.selectedPrestacion,
            this.view
        ).pipe(
            switchMap(([ambito, capa, selectedCama, selectedPrestacion, view]) => {
                if (type === 'cama') {
                    return this.camasHTTP.historial(ambito, capa, desde, hasta, { idCama: selectedCama.idCama });
                } else if (type === 'internacion') {
                    if (prestacion) {
                        return this.camasHTTP.historial(ambito, capa, desde, hasta, { idInternacion: prestacion.id, esMovimiento: true });
                    } else {
                        if (view === 'mapa-camas') {
                            return this.camasHTTP.historial(ambito, capa, desde, hasta, { idInternacion: selectedCama.idInternacion, esMovimiento: true });
                        } else if (view === 'listado-internacion') {
                            return this.camasHTTP.historial(ambito, capa, desde, hasta, { idInternacion: selectedPrestacion.id, esMovimiento: true });
                        }
                    }
                }
            })
        );
    }

    get(fecha, idCama): Observable<ISnapshot> {
        return this.camasHTTP.get(this.ambito, this.capa, fecha, idCama);
    }

    save(data, fecha, esMovimiento = true): Observable<ICama> {
        data.esMovimiento = esMovimiento;
        return this.camasHTTP.save(this.ambito, this.capa, fecha, data);
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

    private paciente$: any = {};
    getPaciente(paciente) {
        if (!this.paciente$[paciente.id]) {
            this.paciente$[paciente.id] = this.pacienteService.getById(paciente.id).pipe(
                cache(),
                startWith(paciente)
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
            pluck('acciones')
        );

        return combineLatest(
            unidadOrganizativa$,
            accionesCapa$
        ).pipe(
            map(([uo, acciones]) => {
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
}
