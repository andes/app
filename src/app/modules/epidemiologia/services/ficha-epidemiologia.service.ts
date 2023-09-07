import { ResourceBaseHttp, Server } from '@andes/shared';
import { ElementosRUPService } from '../../../../../src/app/modules/rup/services/elementosRUP.service';
import { Injectable } from '@angular/core';
import { SECCION_CLASIFICACION } from '../constantes';

@Injectable({ providedIn: 'root' })
export class FormsEpidemiologiaService extends ResourceBaseHttp {
    protected url = '/modules/forms/forms-epidemiologia/formEpidemiologia';

    constructor(
        protected server: Server,
        private elementoRupService: ElementosRUPService) {
        super(server);
    }

    getClasificacionFinal(ficha) {
        const seccionClasificacion = this.getSeccionClasifacionFinal(ficha);
        const clasificacionfinal = seccionClasificacion?.fields.find(f => f.clasificacionfinal)?.clasificacionfinal;
        return clasificacionfinal ? clasificacionfinal : 'Sin clasificación';
    }

    // Devuelve una seccion entera de una ficha o un campo especifico
    getField(ficha, seccionName: string, fieldName?: string) {
        const seccionBuscada = this.getSeccion(ficha, seccionName);
        if (fieldName) {
            const fieldBuscado = seccionBuscada?.fields.find(field => field[fieldName]);
            return fieldBuscado ? fieldBuscado[fieldName] : null;
        } else {
            return seccionBuscada;
        }
    }

    getSeccion(ficha, seccionName) {
        return ficha.secciones.find(s => s.name === seccionName);
    }

    getSeccionClasifacionFinal(ficha) {
        return this.getSeccion(ficha, SECCION_CLASIFICACION);
    }

    getConceptosCovid(ficha) {
        const conceptos = [];
        const seccionClasificacion = this.getSeccionClasifacionFinal(ficha);
        let segundaClasificacionId = '';
        seccionClasificacion.fields.forEach(field => {
            const key = Object.keys(field)[0];
            switch (key) {
                case 'clasificacionfinal':
                    if (field.clasificacionfinal === 'Sospechoso') {
                        conceptos.push(this.elementoRupService.getConceptosCovidSospechoso());
                    }
                    if (field.clasificacionfinal === 'Confirmado') {
                        conceptos.push(this.elementoRupService.getConceptoCertificadoAislamiento());
                    }
                    break;
                case 'segundaclasificacion':
                    segundaClasificacionId = field.segundaclasificacion?.id;
                    if (field.segundaclasificacion.id === 'autotest' ||
                        field.segundaclasificacion.id === 'laboPcr'
                        || field.segundaclasificacion.id === 'laboAntigeno') {
                        conceptos.push(this.elementoRupService.getConceptoEnfermedadCovid());
                    }
                    break;
                case 'pcr':
                    if (field.pcr.id === 'confirmado') {
                        conceptos.push(this.elementoRupService.getConceptoConfirmadoPcr());
                    };
                    break;
                case 'antigeno':
                    if (field.antigeno.id === 'confirmado' && segundaClasificacionId !== 'ifi') {
                        conceptos.push(this.elementoRupService.getConceptoConfirmadoTestRapido());
                    } if (field.antigeno.id === 'muestra' && segundaClasificacionId !== 'ifi') {
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
