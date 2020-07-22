import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NovedadesService } from '../../services/novedades/novedades.service';
import { INovedad } from '../../interfaces/novedades/INovedad.interface';

@Injectable()
export class CommonNovedadesService {
    private token = new BehaviorSubject('');
    private novedades: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private novedadesSinFiltrar: BehaviorSubject<INovedad[]> = new BehaviorSubject([]);

    constructor(
        private novedadesService: NovedadesService
    ) {
    }

    setToken(value: any) {
        this.token.next(value);
    }

    getToken(): Observable<any> {
        return this.token.asObservable();
    }

    getNovedades(): Observable<any> {
        return this.novedades.asObservable();
    }

    setNovedades(novedades?: INovedad[]) {
        this.novedades.next(novedades);
    }

    setNovedadesSinFiltrar(modulos: string[]) {
        this.novedadesService.search({ activa: true }).subscribe(
            novedades => {
                novedades = novedades.filter(novedad => (novedad.modulo ? modulos.includes(novedad.modulo._id) : true));
                this.novedadesSinFiltrar.next(novedades);
            },
            (err) => {
            }
        );
    }

    getNovedadesSinFiltrar(): Observable<any> {
        return this.novedadesSinFiltrar.asObservable();
    }
}
