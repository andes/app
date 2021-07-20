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
        let clasificacionfinal = seccionClasificacion?.fields.find(f => f.clasificacionfinal)?.clasificacionfinal;
        return clasificacionfinal ? clasificacionfinal : 'Sin clasificación';
    }
}
