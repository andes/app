import { Auth } from '@andes/auth';
import { Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IProfesional } from 'src/app/interfaces/IProfesional';

@Injectable({
    providedIn: 'root',
})

export class RecetaService {
    private url = '/modules/recetas';

    constructor(
        private server: Server,
        private auth: Auth
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
}

