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

    getConceptosCovid(ficha) {
        const conceptos = [];
        const seccionClasificacion = ficha.secciones.find(seccion => seccion.name === this.SECCION_CLASIFICACION_FINAL);

        seccionClasificacion.fields.forEach(field => {
            const key = Object.keys(field)[0];
            switch (key) {
                case 'clasificacionfinal':
                    if (field.clasificacionfinal === 'Sospechoso') {
                        conceptos.push(this.elementoRupService.getConceptosCovidSospechoso());
                    }
                    break;
                case 'segundaclasificacion':
                    if (field.segundaclasificacion.id === 'confirmado') {
                        conceptos.push(this.elementoRupService.getConceptoCovidConfirmadoNexo());
                    }
                    break;
                case 'pcr':
                    if (field.pcr.id === 'confirmado') {
                        conceptos.push(this.elementoRupService.getConceptoConfirmadoPcr());
                    };
                    break;
                case 'antigeno':
                    if (field.antigeno.id === 'confirmado') {
                        conceptos.push(this.elementoRupService.getConceptoConfirmadoTestRapido());
                    } else if (field.antigeno.id === 'muestra') {
                        conceptos.push(this.elementoRupService.getConceptoDescartadoTestRapido());
                    }
                    break;
                case 'lamp':
                    if (field.lamp.id === 'confirmado') {
                        conceptos.push(this.elementoRupService.getConceptoEnfermedadCovid());
                    };
                    break;
            }
        });
        return conceptos;
    }
}
