import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FormsEpidemiologiaService extends ResourceBaseHttp {
    protected url = '/modules/forms/forms-epidemiologia/formEpidemiologia';

    constructor(protected server: Server) {
        super(server);
    }

    getClasificacionFinal(ficha) {
        const seccionClasificacion = ficha.secciones.find(s => s.name === 'Tipo de confirmación y Clasificación Final');
        const clasificacionfinal = seccionClasificacion?.fields.find(f => f.clasificacionfinal)?.clasificacionfinal;
        return clasificacionfinal ? clasificacionfinal : 'Sin clasificación';
    }

    // Devuelve una seccion entera de una ficha o un campo especifico
    getField(ficha, seccionName: string, fieldName?: string) {
        const seccionBuscada = ficha.secciones.find(s => s.name === seccionName);
        if (fieldName) {
            const fieldBuscado = seccionBuscada?.fields.find(field => field[fieldName]);
            return fieldBuscado ? fieldBuscado[fieldName] : null;
        } else {
            return seccionBuscada;
        }
    }
}
