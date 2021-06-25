import { cache } from '@andes/shared';
import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormsEpidemiologiaService } from '../../epidemiologia/services/ficha-epidemiologia.service';
import { IPrestacion } from '../interfaces/prestacion.interface';
import { PrestacionesService } from './prestaciones.service';


@Injectable({ providedIn: 'root' })
export class HUDSStore {

    private hudsByPaciente = {};

    constructor(
        private formEpidemiologiaService: FormsEpidemiologiaService,
        private servicioPrestacion: PrestacionesService,
    ) { }

    getHUDSPaciente(paciente: string) {
        if (this.hudsByPaciente[paciente]) {
            return this.hudsByPaciente[paciente];
        }

        const token = this.getHudsToken();
        this.hudsByPaciente[paciente] = forkJoin([
            this.servicioPrestacion.getByPaciente(paciente).pipe(
                map(prestaciones => prestaciones.filter(p => p.estadoActual.tipo === 'validada')),
                map(prestaciones => {
                    return groupBy(prestaciones).map(p => {
                        if (Array.isArray(p)) {
                            return {
                                data: p,
                                tipo: 'rup-group',
                                prestacion: p[0].solicitud.tipoPrestacion,
                                profesional: p[0].estadoActual.createdBy.nombreCompleto,
                                fecha: p[0].ejecucion.fecha || p[0].estadoActual.createdAt,
                                estado: p[0].estadoActual.tipo,
                                ambito: p[0].solicitud.ambitoOrigen,
                                organizacion: p[0].solicitud.organizacion,
                                id: p[0].id
                            };
                        } else {
                            const lastState = p.estados[p.estados.length - 1];
                            return {
                                data: p,
                                tipo: 'rup',
                                prestacion: p.solicitud.tipoPrestacion,
                                profesional: lastState.createdBy.nombreCompleto,
                                fecha: p.ejecucion.fecha || lastState.createdAt,
                                estado: lastState.tipo,
                                ambito: p.solicitud.ambitoOrigen,
                                organizacion: p.solicitud.organizacion,
                                id: p.id
                            };
                        }
                    });
                })
            ),
            this.servicioPrestacion.getCDAByPaciente(paciente, token).pipe(
                map(cdas => {
                    return cdas.map(cda => {
                        cda.id = cda.cda_id;
                        return {
                            data: cda,
                            tipo: 'cda',
                            prestacion: cda.prestacion.snomed,
                            profesional: cda.profesional ? `${cda.profesional.apellido} ${cda.profesional.nombre}` : '',
                            fecha: cda.fecha,
                            estado: 'validada',
                            ambito: 'ambulatorio',
                            organizacion: cda.organizacion,
                            id: cda.id,
                        };
                    });
                })
            ),
            this.formEpidemiologiaService.search({ paciente: paciente }).pipe(
                map(fichas => {
                    return fichas.map(f => {

                        function getOrganizacion(ficha) {
                            for (const seccion of ficha.secciones) {
                                for (const field of seccion.fields) {
                                    if (field.organizacion) {
                                        return field.organizacion;
                                    }
                                }
                            }
                            return null;
                        }

                        return {
                            data: f,
                            tipo: 'ficha-epidemiologica',
                            ambito: 'ambulatorio',
                            prestacion: {
                                term: 'Ficha Epidemiológica',
                                conceptId: '1'
                            },
                            profesional: f.createdBy.nombreCompleto,
                            organizacion: getOrganizacion(f),
                            fecha: f.createdAt,
                            estado: 'validada',
                            id: f.id
                        };
                    });
                })
            )
        ]).pipe(
            map(([prestaciones, cdas, fichas]) => {
                return [...prestaciones, ...cdas, ...fichas];
            }),
            cache()
        );

        return this.hudsByPaciente[paciente];
    }



    getHudsToken() {
        return window.sessionStorage.getItem('huds-token');
    }

}


function groupBy(prestaciones: IPrestacion[]) {
    const resultado = [];
    const diccionario = {};

    prestaciones.forEach(p => {
        if (p.groupId) {
            if (!diccionario[p.groupId]) {
                diccionario[p.groupId] = [];
            }
            diccionario[p.groupId].push(p);
        } else {
            resultado.push(p);
        }
    });

    Object.values(diccionario).forEach(dc => resultado.push(dc));

    return resultado;

}
