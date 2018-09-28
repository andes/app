import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Observable';
import { ICama } from '../interfaces/ICama';
import { IPaciente } from '../../../interfaces/IPaciente';


@Injectable()
export class InternacionService {

    private url = '/modules/rup/internaciones';
    public conceptosInternacion = {
        ingreso: {
            fsn: 'documento de solicitud de admisión (elemento de registro)',
            semanticTag: 'elemento de registro',
            refsetIds: ['900000000000497000'],
            conceptId: '721915006',
            term: 'documento de solicitud de admisión'
        },
        egreso: {
            fsn: 'alta del paciente (procedimiento)',
            semanticTag: 'procedimiento',
            refsetIds: ['900000000000497000'],
            conceptId: '58000006',
            term: 'alta del paciente'
        }
    };

    public workflowCompleto = [{ 'id': '57e9670e52df311059bc8964', 'nombre': 'HOSPITAL PROVINCIAL NEUQUEN - DR. EDUARDO CASTRO RENDON' }];

    constructor(private server: Server) { }


    getInfoCenso(params: any): Observable<any[]> {
        return this.server.get(this.url + '/censo', { params: params });
    }

    getCensoMensual(params: any): Observable<any[]> {
        return this.server.get(this.url + '/censoMensual', { params: params });
    }

    liberarCama(idInternacion: any, fecha): Observable<any> {
        let param = {
            fecha: fecha
        };
        return this.server.patch(this.url + '/desocuparCama/' + idInternacion, param);
    }

    getCamaDisponibilidadCenso(params: any): Observable<any[]> {
        return this.server.get(this.url + '/censo/disponibilidad', { params: params });
    }

    usaWorkflowCompleto(idOrganizacion: string) {
        if (this.workflowCompleto.find(o => o.id === idOrganizacion)) {
            return true;
        } else {
            return false;
        }
    }




}
