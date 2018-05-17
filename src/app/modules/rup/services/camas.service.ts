import { Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { ICama } from '../interfaces/ICama';
import { ICamaEstado } from '../interfaces/ICamaEstado';

@Injectable()
export class CamasService {

    private camasUrl = '/core/tm/camas';  // URL to web api
    constructor(private server: Server) { }

    getCama(id: String): Observable<ICama[]> {
        return this.server.get(this.camasUrl + '/' + id, null);
    }

    getCamas(params): Observable<ICama[]> {
        return this.server.get(this.camasUrl, { params: params, showError: true });
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
}
