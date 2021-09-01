import { ResourceBaseHttp, Server } from '@andes/shared';
import { ElementosRUPService } from '../../../../../src/app/modules/rup/services/elementosRUP.service';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FormsEpidemiologiaService extends ResourceBaseHttp {
    protected url = '/modules/forms/forms-epidemiologia/formEpidemiologia';
    SECCION_CLASIFICACION_FINAL = 'Tipo de confirmación y Clasificación Final';

    constructor(
        protected server: Server,
        private elementoRupService: ElementosRUPService) {
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

    getConceptosCovidConfirmado(ficha) {
        let conceptos = [];

        const seccionClasificacion = ficha.secciones.find(seccion => seccion.name === this.SECCION_CLASIFICACION_FINAL);
        const segundaClasificacion = seccionClasificacion?.fields.find(f => f.segundaclasificacion)?.segundaclasificacion;

        if (segundaClasificacion.id === 'confirmado') {
            conceptos.push(this.elementoRupService.getConceptoCovidConfirmadoNexo());
        } else if (segundaClasificacion.id === 'antigeno') {
            const antigeno = seccionClasificacion?.fields.find(f => f.antigeno)?.antigeno;
            if (antigeno.id === 'confirmado') {
                conceptos.push(this.elementoRupService.getConceptoConfirmadoTestRapido());
            } else if (antigeno.id === 'muestra') {
                conceptos.push(this.elementoRupService.getConceptoDescartadoTestRapido());
                conceptos.push(this.elementoRupService.getConceptoConfirmadoPCR());
            }
        }

        return conceptos;
    }
}
