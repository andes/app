import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DerivacionesService } from 'src/app/services/com/derivaciones.service';
import { IDerivacion } from '../interfaces/IDerivacion.interface';

@Injectable()
export class PuntoInicioService {

    public derivacionesOrdenadas$: Observable<any[]>;
    public derivacionesFiltradas = new BehaviorSubject<any[]>(null);

    public priorityOrder = {
        'especial': 1,
        'alta': 2,
        'intermedia': 3,
        'media': 4,
        'baja': 5
    };
    public sortBy = new BehaviorSubject<string>('fecha');
    public sortOrder = new BehaviorSubject<string>('asc');

    constructor(private derivacionesService: DerivacionesService) {
        this.derivacionesOrdenadas$ = combineLatest(
            this.derivacionesFiltradas,
            this.sortBy,
            this.sortOrder
        ).pipe(
            map(([derivaciones, sortBy, sortOrder]) =>
                this.sortDerivaciones(derivaciones, sortBy, sortOrder)
            )
        );
    }

    get(query: any): Observable<IDerivacion[]> {
        return this.derivacionesService.search(query);
    }

    sortDerivaciones(derivaciones, sortBy: string, sortOrder: string) {
        if (sortOrder === 'desc') {
            derivaciones = derivaciones.reverse();
        } else {
            switch (sortBy) {
                case 'fecha':
                    derivaciones = derivaciones.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
                    break;
                case 'paciente':
                    derivaciones = derivaciones.sort((a, b) => a.paciente.apellido.localeCompare((b.paciente.apellido as string)));
                    break;
                case 'origen':
                    derivaciones = derivaciones.sort((a, b) => a.organizacionOrigen.nombre.localeCompare((b.organizacionOrigen.nombre as string)));
                    break;
                case 'destino':
                    derivaciones = derivaciones.sort((a, b) => a.organizacionDestino.nombre.localeCompare((b.organizacionDestino.nombre as string)));
                    break;
                case 'prioridad':
                    derivaciones = derivaciones.sort((a, b) => {
                        let prioridadA = this.priorityOrder[a.prioridad];
                        let prioridadB = this.priorityOrder[b.prioridad];
                        if (!prioridadA) {
                            prioridadA = 6;
                        }
                        if (!prioridadB) {
                            prioridadB = 6;
                        }
                        return prioridadA - prioridadB;
                    });
                    break;
            }
        }
        return derivaciones;
    }
}
