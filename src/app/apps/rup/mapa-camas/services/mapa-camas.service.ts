import { Injectable } from '@angular/core';
import { cache } from '@andes/shared';
import { Observable, BehaviorSubject, Subject, combineLatest, of } from 'rxjs';
import { ISnapshot } from '../interfaces/ISnapshot';
import { ICama } from '../interfaces/ICama';
import { IMaquinaEstados, IMAQRelacion, IMAQEstado } from '../interfaces/IMaquinaEstados';
import { MapaCamasHTTP, IFiltrosHistorial } from './mapa-camas.http';
import { switchMap, map, pluck, tap } from 'rxjs/operators';
import { ISectores } from '../../../../interfaces/IOrganizacion';
import { ISnomedConcept } from '../../../../modules/rup/interfaces/snomed-concept.interface';

function arrayToSet(array, key, itemFn) {
    const listado = [];
    array.forEach(elem => {
        const item = itemFn(elem);
        const index = listado.findIndex(i => i[key] === item[key]);
        if (index < 0) {
            listado.push(item);
        }
    });
    return listado;
}


@Injectable()
export class MapaCamasService {

    private ambito2 = new BehaviorSubject<string>(null);
    private capa2 = new BehaviorSubject<string>(null);
    private fecha2 = new BehaviorSubject<Date>(null);
    private organizacion2 = new BehaviorSubject<string>(null);

    public unidadOrganizativaSelected = new BehaviorSubject<ISnomedConcept>(null);
    public sectorSelected = new BehaviorSubject<ISectores>(null);
    public tipoCamaSelected = new BehaviorSubject<ISnomedConcept>(null);
    public esCensable = new BehaviorSubject<any>(null);
    public pacienteText = new BehaviorSubject<string>(null);

    public unidadOrganizativaList$: Observable<any[]>;
    public sectorList$: Observable<any[]>;
    public tipoCamaList$: Observable<any[]>;

    public selectedCama = new BehaviorSubject<ISnapshot>(null);

    private maquinaDeEstado$: Observable<IMaquinaEstados>;

    public estado$: Observable<IMAQEstado[]>;
    public relaciones$: Observable<IMAQRelacion[]>;

    public snapshot$: Observable<ISnapshot[]>;
    public snapshotFiltrado$: Observable<ISnapshot[]>;


    public ambito = 'internacion';
    public capa;

    constructor(
        private camasHTTP: MapaCamasHTTP
    ) {
        this.maquinaDeEstado$ = combineLatest(
            this.ambito2,
            this.capa2,
            this.organizacion2
        ).pipe(
            switchMap(([ambito, capa, organizacion]) => {
                return this.camasHTTP.getMaquinaEstados(ambito, capa, organizacion);
            }),
            cache()
        ) as any;

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
            cache(),
        ) as any;

        this.unidadOrganizativaList$ = this.snapshot$.pipe(
            map((camas) => arrayToSet(camas, 'conceptId', (item) => item.unidadOrganizativa))
        ) as any;

        this.sectorList$ = this.snapshot$.pipe(
            map((camas) => arrayToSet(camas, 'nombre', (item) => item.sectores[0]))
        ) as any;

        this.tipoCamaList$ = this.snapshot$.pipe(
            map((camas) => arrayToSet(camas, 'conceptId', (item) => item.tipoCama))
        ) as any;

        this.snapshotFiltrado$ = combineLatest(
            this.snapshot$,
            this.pacienteText,
            this.unidadOrganizativaSelected,
            this.sectorSelected,
            this.tipoCamaSelected,
            this.esCensable
        ).pipe(
            map(([camas, paciente, unidadOrganizativa, sector, tipoCama, esCensable]) =>
                this.filtrarSnapshot(camas, paciente, unidadOrganizativa, sector, tipoCama, esCensable))
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
    }

    select(cama: ISnapshot) {
        this.selectedCama.next(cama);
    }

    filtrarSnapshot(camas: ISnapshot[], paciente: string, unidadOrganizativa: ISnomedConcept, sector: ISectores, tipoCama: ISnomedConcept, esCensable) {
        let camasFiltradas = camas;

        if (paciente) {
            camasFiltradas = camasFiltradas.filter((snap: ISnapshot) => snap.estado === 'ocupada');
            camasFiltradas = camasFiltradas.filter((snap: ISnapshot) =>
                (snap.paciente.nombre.toLowerCase().includes(paciente.toLowerCase()) ||
                    snap.paciente.apellido.toLowerCase().includes(paciente.toLowerCase()))
            );
        }

        if (unidadOrganizativa) {
            camasFiltradas = camasFiltradas.filter((snap: ISnapshot) => snap.unidadOrganizativa.conceptId === unidadOrganizativa.conceptId);
        }

        if (sector) {
            camasFiltradas = camasFiltradas.filter((snap: ISnapshot) => String(snap.sectores[snap.sectores.length - 1].nombre) === sector.nombre);
        }

        if (tipoCama) {
            camasFiltradas = camasFiltradas.filter((snap: ISnapshot) => snap.tipoCama.conceptId === tipoCama.conceptId);
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

    snapshot(fecha, idInternacion = null, ambito: string = null, capa: string = null, estado: string = null): Observable<ISnapshot[]> {
        ambito = ambito || this.ambito;
        capa = capa || this.capa;

        return this.camasHTTP.snapshot(ambito, capa, fecha, idInternacion, estado);
    }

    historial(desde: Date, hasta: Date, filtros: IFiltrosHistorial): Observable<ISnapshot[]> {
        return this.camasHTTP.historial(this.ambito, this.capa, desde, hasta, filtros);
    }

    get(fecha, idCama): Observable<ICama[]> {
        return this.camasHTTP.get(this.ambito, this.capa, fecha, idCama);
    }

    save(data, fecha, ambito: string = null, capa: string = null): Observable<ICama> {
        ambito = ambito || this.ambito;
        capa = capa || this.capa;
        return this.camasHTTP.save(ambito, capa, fecha, data);
    }

    getMaquinaEstados(organizacion): Observable<IMaquinaEstados[]> {
        return this.camasHTTP.getMaquinaEstados(this.ambito, this.capa, organizacion) as any; // [TODO] BORRAR
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
}
