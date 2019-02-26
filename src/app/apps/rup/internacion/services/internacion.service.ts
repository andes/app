import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Observable';
import { ICama } from '../interfaces/ICama';
import { IPrestacion } from '../../../../modules/rup/interfaces/prestacion.interface';

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

    public workflowCompleto = [{ 'id': '57e9670e52df311059bc8964', 'nombre': 'HOSPITAL PROVINCIAL NEUQUEN - DR. EDUARDO CASTRO RENDON' }, { 'id': '57fcf037326e73143fb48c3a', 'nombre': 'CENTRO DE SALUD PROGRESO' }];
    // public workflowCompleto = [{ 'id': '57e9670e52df311059bc8964', 'nombre': 'HOSPITAL PROVINCIAL NEUQUEN - DR. EDUARDO CASTRO RENDON' }];

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

    /**
    * Devuelve si la cama se encuentra disponible para ser ocupada en una fechaHora solicitada
    * Si paso como parámetro el servicioHospitalario, filtrará las camas que pertenezcan a ese servicio.
    *
    * @param {ICama} cama cama a evaluar disponibilidad
    * @param {Date} fecha fecha en que se desea ocupar
    * @returns {ICama} cama disponible o null en caso contrario
    * @memberof InternacionService
    */
    esCamaDisponible(cama, fechaIngreso) {
        let estados = cama.estados;
        estados.sort((a, b) => {
            return b.fecha - a.fecha;
        });
        // chequeamos que la fecha de ingreso sea superior a la fecha de carga disponible de la cama
        if (estados[estados.length - 1].fecha <= fechaIngreso) {
            // buscamos el ultimo estado en que la cama estuvo ocupada
            const estadoEncontrado = estados.find(e => e.fecha < fechaIngreso);
            if (estadoEncontrado) {
                if (estadoEncontrado.estado === 'disponible') {
                    return cama;
                }
            }
        }

        return null;
    }

    /**
        * Devuelve los datos del informe de ingreso/egreso de una internacion si lo encuentra, null en caso contrario
        *         *
        * @param {IPrestacion} prestacion Internacion
        * @param {string} tipoRegistro tipo de registro: ingreso o egreso
        * @returns {object} Objecto con los datos del ingreso
        * @memberof InternacionService
        */
    verRegistro(prestacion, tipoRegistro) {
        let registro = null;
        if (tipoRegistro === 'ingreso') {
            registro = prestacion.ejecucion.registros.find(r => r.concepto.conceptId === this.conceptosInternacion.ingreso.conceptId);
        }
        if (tipoRegistro === 'egreso') {
            registro = prestacion.ejecucion.registros.find(r => r.concepto.conceptId === this.conceptosInternacion.egreso.conceptId);
        }

        if (registro) {
            return registro.valor;
        }
        return null;
    }


    combinarFechas(fecha1, fecha2) {
        if (fecha1 && fecha2) {
            let horas: number;
            let minutes: number;
            let segundos: number;
            let auxiliar: Date;

            auxiliar = new Date(fecha1);
            horas = fecha2.getHours();
            minutes = fecha2.getMinutes();
            segundos = fecha2.getSeconds();
            auxiliar.setHours(horas, minutes, segundos, 0);
            return auxiliar;
        } else {
            return null;
        }
    }

    compareOnlyDate(dateTimeA, dateTimeB) {
        // new Date(year, month, day, hours, minutes, seconds, milliseconds)
        let momentA = dateTimeA.setHours(0, 0, 0, 0);
        let momentB = dateTimeB.setHours(0, 0, 0, 0);
        if (momentA > momentB) {
            return 1;
        } else {
            if (momentA < momentB) {
                return -1;
            } else { return 0; }
        }
    }

    calcularEdad(fechaNacimiento: Date, fechaCalculo: Date): any {
        let edad: any;
        let fechaNac: any;
        let fechaActual: Date = fechaCalculo ? fechaCalculo : new Date();
        let fechaAct: any;
        let difAnios: any;
        let difDias: any;
        let difMeses: any;
        let difD: any;
        let difHs: any;
        let difMn: any;

        fechaNac = moment(fechaNacimiento, 'YYYY-MM-DD HH:mm:ss');
        fechaAct = moment(fechaActual, 'YYYY-MM-DD HH:mm:ss');
        difDias = fechaAct.diff(fechaNac, 'd'); // Diferencia en días
        difAnios = Math.floor(difDias / 365.25);
        difMeses = Math.floor(difDias / 30.4375);
        difHs = fechaAct.diff(fechaNac, 'h'); // Diferencia en horas
        difMn = fechaAct.diff(fechaNac, 'm'); // Diferencia en minutos

        if (difAnios !== 0) {
            edad = {
                valor: difAnios,
                unidad: 'año/s'
            };
        } else if (difMeses !== 0) {
            edad = {
                valor: difMeses,
                unidad: 'mes/es'
            };
        } else if (difDias !== 0) {
            edad = {
                valor: difDias,
                unidad: 'día/s'
            };
        } else if (difHs !== 0) {
            edad = {
                valor: difHs,
                unidad: 'hora/s'
            };
        } else if (difMn !== 0) {
            edad = {
                valor: difMn,
                unidad: 'minuto/s'
            };
        }

        return (String(edad.valor) + ' ' + edad.unidad);
    }

    usaWorkflowCompleto(idOrganizacion: string) {
        if (this.workflowCompleto.find(o => o.id === idOrganizacion)) {
            return true;
        } else {
            return false;
        }
    }
}
