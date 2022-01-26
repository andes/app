import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, Subject } from 'rxjs';
import { cache, Server, saveAs } from '@andes/shared';
import { ITurnosPrestaciones } from '../interfaces/turnos-prestaciones.interface';
import { map, switchMap, tap } from 'rxjs/operators';

@Injectable()
export class TurnosPrestacionesService {

    private turnosPrestacionesURL = '/modules/estadistica/turnos_prestaciones'; // URL to web api

    public listadoPrestaciones$: Observable<any[]>;
    public prestacionesOrdenada$: Observable<any[]>;
    public prestacionesFiltrada$ = new BehaviorSubject<any[]>(null);

    public sortBy$ = new BehaviorSubject<string>('fecha'); // Seteo con fecha para que el primer orden sea por fecha
    public sortOrder$ = new BehaviorSubject<string>('asc');

    private filtros = new Subject<any>();

    constructor(private server: Server) {

        this.listadoPrestaciones$ = this.filtros.pipe(
            switchMap(params => this.get(params)),
            tap(data => data.forEach((item: any, index) => item.key = `${item._id}-${item.idPrestacion}-${index}`)),
            cache()
        );

        this.prestacionesOrdenada$ = combineLatest(
            this.listadoPrestaciones$,
            this.sortBy$,
            this.sortOrder$
        ).pipe(
            map(([prestaciones, sortBy, sortOrder]) =>
                this.sortPrestaciones(prestaciones, sortBy, sortOrder)
            )
        );
    }

    buscar(params: any) {
        this.filtros.next(params);
    }

    /**
     * Metodo get.
     * @param {any} params Opciones de busqueda
     */
    get(params: any): Observable<ITurnosPrestaciones[]> {
        return this.server.get(this.turnosPrestacionesURL, { params: params, showError: true });
    }

    sortPrestaciones(prestaciones, sortBy: string, sortOrder: string) {
        if (sortOrder === 'desc') {
            prestaciones = prestaciones.reverse();
        } else {
            switch (sortBy) {
                case 'fecha':
                    prestaciones = prestaciones.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
                    break;
                case 'documento':
                    prestaciones = prestaciones.sort((a, b) => (!a.paciente) ? 1 : (!b.paciente) ? -1 : a.paciente.documento.localeCompare((b.paciente.documento as string)));
                    break;
                case 'paciente':
                    prestaciones = prestaciones.sort((a, b) => (!a.paciente) ? 1 : (!b.paciente) ? -1 : a.paciente.apellido.localeCompare((b.paciente.apellido as string)));
                    break;
                case 'prestacion':
                    prestaciones = prestaciones.sort((a, b) => (!a.prestacion) ? 1 : (!b.prestacion) ? -1 : a.prestacion.term.localeCompare((b.prestacion.term as string)));
                    break;
                case 'profesional':
                    prestaciones = prestaciones.sort((a, b) => (!a.profesionales[0]) ? 1 : (!b.profesionales[0]) ? -1 : a.profesionales[0].apellido.localeCompare((b.profesionales[0].apellido as string)));
                    break;
                case 'estado':
                    prestaciones = prestaciones.sort((a, b) => (!a.estado) ? 1 : (!b.estado) ? -1 : a.estado.localeCompare((b.estado as string)));
                    break;
                case 'ambito':
                    prestaciones = prestaciones.sort((a, b) => (!a.ambito) ? 1 : (!b.ambito) ? -1 : a.ambito.localeCompare((b.ambito as string)));
                    break;
                default:
                    break;
            }
        }
        return prestaciones;
    }

    descargar(params: any, nombreArchivo: string): Observable<ITurnosPrestaciones[]> {
        return this.server.post(this.turnosPrestacionesURL + '/csv', params, { responseType: 'blob' } as any).pipe(
            saveAs(nombreArchivo, 'csv')
        );
    }
}
