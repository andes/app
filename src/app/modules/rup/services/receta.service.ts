import { Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { IProfesional } from 'src/app/interfaces/IProfesional';
import { PrestacionesService } from './prestaciones.service';

@Injectable({
    providedIn: 'root',
})

export class RecetaService {
    private url = '/modules/recetas';

    constructor(
        private server: Server,
        private prestacionesService: PrestacionesService
    ) { }


    getRecetas(params: { [key: string]: string }): Observable<any[]> {
        return this.server.get(this.url, { params });
    }

    getMotivosSuspension() {
        return this.server.get(`${this.url}/motivos`);
    }

    suspender(recetas: string[], profesional: IProfesional, motivo: string, observacion: string) {
        return this.server.patch(`${this.url}`, { op: 'suspender', recetas, motivo, observacion, profesional });
    }

    getUltimaReceta(recetas) {
        return recetas?.reduce((mostRecent, receta) => {
            const recetaDate = moment(receta.fechaRegistro);
            const mostRecentDate = moment(mostRecent.fechaRegistro);

            return recetaDate.isAfter(mostRecentDate) ? receta : mostRecent;
        });
    };

    getLabel(recetas: any[]) {
        const receta = this.getUltimaReceta(recetas);

        let label = receta.medicamento.concepto.term;
        if (label.length > 30) {
            label = label.substring(0, 30) + '...';
        }

        return label;
    }

    // -------------- NO HTTP ---------------------------

    buscarDiagnosticosConTrastornos(paciente): Observable<any[]> {
        const recetasConFiltros = [];
        const fechaLimite = moment().subtract(6, 'months');
        return this.prestacionesService.getByPacienteTrastorno(paciente.id).pipe(
            map(trastornos => {
                trastornos.forEach(trastorno => {
                    const fechaCreacion = trastorno.fechaEjecucion ? moment(trastorno.fechaEjecucion) : null;
                    const esActivo = trastorno.evoluciones[trastorno.evoluciones.length - 1].estado === 'activo';
                    if (fechaCreacion?.isAfter(fechaLimite) && esActivo) {
                        recetasConFiltros.push(trastorno.concepto);
                    }
                });
                return recetasConFiltros;
            })
        );
    }
}

