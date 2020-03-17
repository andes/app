import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NovedadesService } from '../../services/novedades/novedades.service';
import { INovedad } from '../../interfaces/novedades/INovedad.interface';

@Injectable()
export class CommonNovedadesService {
    private selectedNovedad: BehaviorSubject<INovedad> = new BehaviorSubject(null);
    private token = new BehaviorSubject('');
    private novedades: BehaviorSubject<any[]> = new BehaviorSubject([]);
    private novedadesSinFiltrar: BehaviorSubject<INovedad[]> = new BehaviorSubject([]);

    constructor(
        private registroNovedades: NovedadesService
    ) {
    }

    setSelectedNovedad(value: any) {
        this.selectedNovedad.next(value);
    }

    getSelectedNovedad(): Observable<any> {
        return this.selectedNovedad.asObservable();
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

    setNovedades(modulo?: string, novedad?: INovedad) {
        if (modulo) {
            this.novedades.next(this.novedadesSinFiltrar.value.filter(n => n.modulo._id === modulo));
        } else {
            this.novedades.next(this.novedadesSinFiltrar.value);
        }
        if (novedad) {
            this.setSelectedNovedad(novedad);
        } else {
            this.setSelectedNovedad(this.novedades.value[0]);
        }
    }

    setNovedadesSinFiltrar(modulos: string[], novedad?: INovedad) {
        let paramsNovedades: any = {};
        paramsNovedades.modulos = modulos;
        this.registroNovedades.get(paramsNovedades).subscribe(
            registros => {
                this.novedadesSinFiltrar.next(registros);
                if (novedad) {
                    this.setSelectedNovedad(novedad);
                } else {
                    this.setSelectedNovedad(registros[0]);
                }
            },
            (err) => {
            }
        );
    }

    getNovedadesSinFiltrar(): Observable<any> {
        return this.novedadesSinFiltrar.asObservable();
    }
}
