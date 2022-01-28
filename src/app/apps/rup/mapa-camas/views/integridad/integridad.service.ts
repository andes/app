import { Injectable } from '@angular/core';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { Auth } from '@andes/auth';
import { switchMap, map } from 'rxjs/operators';
import { Server, cache } from '@andes/shared';
import { IInconsistencia } from '../../interfaces/IInconsistencia';
import { ISectores } from '../../../../../interfaces/IOrganizacion';
import { ISnapshot } from '../../interfaces/ISnapshot';

@Injectable()
export class IntegridadService {
    public url = '/modules/rup/internacion';

    public ambito = new BehaviorSubject<string>(null);
    public capa = new BehaviorSubject<string>(null);
    public selectedInconsistencia = new BehaviorSubject<IInconsistencia>({ source: { _id: null } } as any);
    public listaInconsistencias$: Observable<IInconsistencia[]>;
    public listaInconsistenciasFiltrada$: Observable<IInconsistencia[]>;

    public fechaOrigenDesde = new BehaviorSubject<Date>(null);
    public fechaOrigenHasta = new BehaviorSubject<Date>(null);
    public fechaDestinoDesde = new BehaviorSubject<Date>(null);
    public fechaDestinoHasta = new BehaviorSubject<Date>(null);
    public sectorSelected = new BehaviorSubject<ISectores>(null);
    public camaSelected = new BehaviorSubject<ISnapshot>(null);

    constructor(
        private server: Server,
        private auth: Auth,
    ) {
        this.listaInconsistencias$ = combineLatest(
            this.ambito,
            this.capa
        ).pipe(
            switchMap(([ambito, capa]) => {
                return this.listaInconsistencias(ambito, capa);
            }),
            cache(),
        );

        this.listaInconsistenciasFiltrada$ = combineLatest(
            this.listaInconsistencias$,
            this.fechaOrigenDesde,
            this.fechaOrigenHasta,
            this.fechaDestinoDesde,
            this.fechaDestinoHasta,
            this.sectorSelected,
            this.camaSelected,
        ).pipe(
            map(([listaInconsistencias, fechaOrigenDesde, fechaOrigenHasta, fechaDestinoDesde, fechaDestinoHasta, sector, cama]) =>
                this.filtrarListaIntegridad(listaInconsistencias, fechaOrigenDesde, fechaOrigenHasta, fechaDestinoDesde, fechaDestinoHasta, sector, cama)
            )
        );

    }

    setAmbito(ambito: string) {
        this.ambito.next(ambito);
    }

    setCapa(capa: string) {
        this.capa.next(capa);
    }

    select(integridad: IInconsistencia) {
        if (!integridad) {
            return this.selectedInconsistencia.next({ source: { _id: null } } as any);
        }
        this.selectedInconsistencia.next(integridad);
    }

    listaInconsistencias(ambito: string, capa: string, cama = null, desde = null, hasta = null): Observable<any[]> {
        return this.server.get(`${this.url}/integrity-check-camas`, { params: { ambito, capa, cama, desde, hasta } });
    }

    filtrarListaIntegridad(listaIntegridad: IInconsistencia[], fechaOrigenDesde: Date, fechaOrigenHasta: Date, fechaDestinoDesde: Date, fechaDestinoHasta: Date, sector: ISectores, cama: ISnapshot) {
        let listaIntegridadFiltrada = listaIntegridad;

        if (fechaOrigenDesde) {
            listaIntegridadFiltrada = listaIntegridadFiltrada.filter((integridad: IInconsistencia) => moment(fechaOrigenDesde).isSameOrBefore(integridad.source.fecha));
        }

        if (fechaOrigenHasta) {
            listaIntegridadFiltrada = listaIntegridadFiltrada.filter((integridad: IInconsistencia) => moment(fechaOrigenHasta).isSameOrAfter(integridad.source.fecha));
        }

        if (fechaDestinoDesde) {
            listaIntegridadFiltrada = listaIntegridadFiltrada.filter((integridad: IInconsistencia) => moment(fechaDestinoDesde).isSameOrBefore(integridad.target.fecha));
        }

        if (fechaDestinoHasta) {
            listaIntegridadFiltrada = listaIntegridadFiltrada.filter((integridad: IInconsistencia) => moment(fechaDestinoHasta).isSameOrAfter(integridad.target.fecha));
        }

        if (sector) {
            listaIntegridadFiltrada = listaIntegridadFiltrada.filter((integridad: IInconsistencia) => integridad.source.sectores.some(sect => sect.nombre === sector.nombre));
        }

        if (cama) {
            listaIntegridadFiltrada = listaIntegridadFiltrada.filter((integridad: IInconsistencia) => integridad.source.nombre === cama.nombre);
        }

        return listaIntegridadFiltrada;
    }

}
