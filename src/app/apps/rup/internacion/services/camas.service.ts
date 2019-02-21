import { Server } from '@andes/shared';
import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs/Observable';
import { ICama } from '../interfaces/ICama';
import { IPaciente } from '../../../../interfaces/IPaciente';
import { Observable } from 'rxjs';

@Injectable()
export class CamasService {
    public showListaEspera = false;
    private camasUrl = '/modules/rup/camas';  // URL to web api
    constructor(private server: Server) { }

    getCama(id: String): Observable<any> {
        return this.server.get(this.camasUrl + '/' + id, null);
    }

    getCamas(params): Observable<ICama[]> {
        return this.server.get(this.camasUrl, { params: params, showError: true });
    }


    /**
     * Busca todas las camas segun la fecha y hora que pasemos.
     * @param idOrganizacion
     * @param fecha
     */
    getCamasXFecha(idOrganizacion, fecha): Observable<ICama[]> {
        let params = {
            idOrganizacion: idOrganizacion,
            fecha: fecha
        };
        return this.server.get(this.camasUrl + '/porfecha', { params: params, showError: true });
    }
    getHistorialCama(idOrganizacion, fechaDesde, fechaHasta, idCama): Observable<any[]> {
        let params = {
            idOrganizacion: idOrganizacion,
            fechaDesde: fechaDesde,
            fechaHasta: fechaHasta,
            idCama: idCama
        };
        return this.server.get(this.camasUrl + '/historial', { params: params });
    }
    getInternacionCama(idCama): Observable<any[]> {
        let params = {
            idCama: idCama
        };
        return this.server.get(this.camasUrl + '/internacionCama', { params: params });
    }


    /**
     * @param cama recibe una cama para agregar a la organizacion
     */
    addCama(cama: ICama): Observable<ICama> {
        if (cama.id) {
            return this.server.put(this.camasUrl + '/' + cama.id, cama);
        } else {
            return this.server.post(this.camasUrl, cama);
        }
    }

    /**
    * @param idcama recibe un id de una cama para agregar a la organizacion
    * @param options opciones para el patch
    */
    patch(idcama, options): Observable<any> {
        return this.server.patch(this.camasUrl + '/' + idcama, options);
    }

    cambiaEstado(idcama, estado): Observable<any> {
        return this.server.patch(this.camasUrl + '/cambiaEstado/' + idcama, estado);
    }
    eliminarCama(idcama): Observable<any> {
        return this.server.delete(this.camasUrl + '/eliminarCama/' + idcama);
    }

    NewEstado(idcama, estado): Observable<any> {
        let dto: any = {
            op: 'estado',
            estado: estado
        };

        return this.server.patch(this.camasUrl + '/' + idcama, dto);
    }

    /**
    * Devuelve el estado del servicio del mapa de cama consultado de una organización
    * Si paso como parámetro el servicioHospitalario, filtrará las camas que pertenezcan a ese servicio.
    *
    * @param {any} camas Array de camas a obtener los resultados
    * @param {any} [servicioHospitalario=null]
    * @returns {any} Object {total, desocupadas, ocupadas, descontaminacion, reparacion, bloqueadas, desocupadasOxigeno}
    * @memberof OrganizacionService
    */
    getEstadoServicio(camas, servicioHospitalario = null): Observable<any> {
        return new Observable((observer) => {

            // si paso el servicio entonces filtro primero por ese servicio
            if (servicioHospitalario) {
                camas = camas.filter(cama => cama.servicio.id === servicioHospitalario);
            }

            const ocupadas = camas.filter(function (i) {
                return (i.ultimoEstado.estado === 'ocupada');
            });

            // ocupacion
            const bloqueadas = camas.filter(function (i) {
                return (i.ultimoEstado.estado === 'bloqueada');
            });

            // descontaminadas
            const descontaminacion = camas.filter(function (i) {
                return (i.ultimoEstado.estado === 'desocupada' && !i.desinfectada);
            });

            // reparación
            const reparacion = camas.filter(function (i) {
                return (i.ultimoEstado.estado === 'reparacion');
            });

            // disponibles
            const desocupadas = camas.filter(function (i) {
                return (i.ultimoEstado.estado === 'desocupada');
            });

            // desocupadas y con oxígeno - TODO: modificar filtro una vez que se defina
            const desocupadasOxigeno = camas.filter(function (i) {
                return (i.ultimoEstado.estado === 'desocupada' && i.oxigeno);
            });

            const estado = {
                'total': camas.length,
                'ocupadas': ocupadas.length,
                'desocupadas': desocupadas.length,
                'descontaminacion': descontaminacion.length,
                'reparacion': reparacion.length,
                'bloqueadas': bloqueadas.length,
                'desocupadasOxigeno': desocupadasOxigeno.length
            };

            observer.next(estado);

            observer.complete();
        });
    }


    /**
     *
     * retorna un array con las camas que ocupan el sector.
     * @param idSector
     */
    camaXsector(idSector): Observable<any> {
        let params = {
            sectorId: idSector
        };
        return this.server.get(this.camasUrl, { params: params, showError: true });
    }


    cambioEstadoMovimiento(cama: ICama, estado: String, fecha: Date, paciente: IPaciente, internacion: String, sugierePase) {

        if (paciente) {
            paciente.id = paciente['_id'];
        }

        let dto = {
            fecha: fecha,
            estado: estado,
            unidadOrganizativa: cama.ultimoEstado.unidadOrganizativa ? cama.ultimoEstado.unidadOrganizativa : null,
            especialidades: cama.ultimoEstado.especialidades ? cama.ultimoEstado.especialidades : null,
            esCensable: cama.ultimoEstado.esCensable,
            genero: cama.ultimoEstado.genero ? cama.ultimoEstado.genero : null,
            paciente: paciente ? paciente : null,
            idInternacion: internacion ? internacion : null,
            esMovimiento: true,
            sugierePase: sugierePase ? sugierePase : null
        };

        return this.cambiaEstado(cama.id, dto);

    }


    nuevoEstadoCama(cama: ICama, estado: String, fecha: Date, observacion?: any) {

        let dto = {
            fecha: fecha,
            estado: estado,
            unidadOrganizativa: cama.ultimoEstado.unidadOrganizativa ? cama.ultimoEstado.unidadOrganizativa : null,
            especialidades: cama.ultimoEstado.especialidades ? cama.ultimoEstado.especialidades : null,
            esCensable: cama.ultimoEstado.esCensable,
            genero: cama.ultimoEstado.genero ? cama.ultimoEstado.genero : null,
            paciente: cama.ultimoEstado.paciente ? cama.ultimoEstado.paciente : null,
            idInternacion: cama.ultimoEstado.idInternacion ? cama.ultimoEstado.idInternacion : null,
            esMovimiento: false
        };
        if (observacion) {
            dto['observaciones'] = observacion;
        }
        return this.cambiaEstado(cama.id, dto);

    }

    UOxCama(conceptIdUO): Observable<any> {
        let params = {
            unidadesOrganizativas: conceptIdUO
        };
        return this.server.get(this.camasUrl, { params: params, showError: true });
    }

    getCamaXUnidOrg() {

    }

}
