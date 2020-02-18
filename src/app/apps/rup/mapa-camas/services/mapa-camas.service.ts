import { Injectable } from '@angular/core';
import { Server, cache } from '@andes/shared';
import { Observable, BehaviorSubject, Subject, combineLatest, of } from 'rxjs';
import { ISnapshot } from '../interfaces/ISnapshot';
import { ICama } from '../interfaces/ICama';
import { IMaquinaEstados, IMAQRelacion, IMAQEstado } from '../interfaces/IMaquinaEstados';
import { MapaCamasHTTP, IFiltrosHistorial } from './mapa-camas.http';
import { switchMap, map, pluck, tap } from 'rxjs/operators';

function arrayToSet(array, key, itemFn) {
    const listado = [];
    array.forEach(elem => {
        const item = itemFn(elem);
        const index = listado.findIndex(i => i[key] === item[key]);
        if (index < 0) {
            listado.push(item);
        }
    });
    listado.push({
        conceptId: '1',
        term: 'sucio truco'
    });
    return listado;
}


@Injectable()
export class MapaCamasService {

    private ambito2 = new BehaviorSubject<string>(null);
    private capa2 = new BehaviorSubject<string>(null);
    private fecha2 = new BehaviorSubject<Date>(null);
    private organizacion2 = new BehaviorSubject<string>(null);


    public unidadOrganizativaSelected = new BehaviorSubject<any>(null);
    // private sector = new BehaviorSubject<string>(null);
    // private tipoCama = new BehaviorSubject<string>(null);
    // private pacienteText = new BehaviorSubject<string>(null);
    // private esCensable = new BehaviorSubject<string>(null);

    public unidadOrganizativaList$: Observable<any[]>;
    public sectorList$: Observable<any[]>;
    public tipoCamaList$: Observable<any[]>;


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


        this.snapshotFiltrado$ = combineLatest(
            this.snapshot$,
            this.unidadOrganizativaSelected
        ).pipe(
            map(([camas, unidadOrganizativa]) => {
                let camasFiltradas = camas;

                if (unidadOrganizativa) {
                    camasFiltradas = camasFiltradas.filter((snap: ISnapshot) => snap.unidadOrganizativa.conceptId === unidadOrganizativa.conceptId);
                }

                return camasFiltradas;
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
