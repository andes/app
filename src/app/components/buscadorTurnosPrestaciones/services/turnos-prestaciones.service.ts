import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { Server } from '@andes/shared';
import { ITurnosPrestaciones } from '../interfaces/turnos-prestaciones.interface';
import { map } from 'rxjs/operators';

@Injectable()
export class TurnosPrestacionesService {

    private turnosPrestacionesURL = '/modules/estadistica/turnos_prestaciones';  // URL to web api

    public prestacionesOrdenada$: Observable<any[]>;
    public prestacionesFiltrada$ = new BehaviorSubject<any[]>(null);

    public sortBy$ = new BehaviorSubject<string>('fecha'); // Seteo con fecha para que el primer orden sea por fecha
    public sortOrder$ = new BehaviorSubject<string>(null);


    constructor(private server: Server) {
        this.prestacionesOrdenada$ = combineLatest(
            this.prestacionesFiltrada$,
            this.sortBy$,
            this.sortOrder$
        ).pipe(
            map(([prestaciones, sortBy, sortOrder]) =>
                this.sortPrestaciones(prestaciones, sortBy, sortOrder)
            )
        );
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
}
