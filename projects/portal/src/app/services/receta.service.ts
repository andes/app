import { Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { forkJoin, Observable } from 'rxjs';
import { IProfesional } from 'src/app/interfaces/IProfesional';

@Injectable({
    providedIn: 'root',
})

export class RecetaService {
    private url = '/modules/recetas';

    constructor(
        private server: Server
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

    renovar(recetas: any[], profesional: IProfesional, organizacion: any): Observable<any[]> {
        const requests = recetas.map(receta => this.server.post(`${this.url}`, {
            idPrestacion: receta.idPrestacion,
            idRegistro: receta.idRegistro,
            idRecetaOriginal: receta,
            medicamento: receta.medicamento,
            paciente: receta.paciente,
            diagnostico: receta.diagnostico,
            profesional,
            organizacion
        }));

        return forkJoin(requests);
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
}

