import { IDemanda, IListaEspera } from './../../interfaces/turnos/IListaEspera';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';
import { IPacienteBasico } from 'src/app/core/mpi/interfaces/IPaciente';
import { Plex } from '@andes/plex';

@Injectable()
export class ListaEsperaService {

    private listaEsperaUrl = '/modules/turnos/listaEspera';

    constructor(
        private server: Server,
        private plex: Plex
    ) { }

    /**
       * Metodo get. Trae el objeto organizacion.
       * @param {any} params Opciones de busqueda
       */
    get(params: any): Observable<IListaEspera[]> {
        return this.server.get(this.listaEsperaUrl, { params: params, showError: true });
    }

    post(listaEspera: IListaEspera): Observable<IListaEspera> {
        return this.server.post(this.listaEsperaUrl, listaEspera);
    }

    postXIdAgenda(id: String, cambios: any): Observable<IListaEspera> {
        return this.server.post(this.listaEsperaUrl + '/IdAgenda/' + id, cambios);
    }

    getById(id: String): Observable<IListaEspera> {
        return this.server.get(this.listaEsperaUrl + '/' + id, null);
    }

    put(id: String, cambios: any): Observable<IListaEspera> {
        return this.server.put(this.listaEsperaUrl + '/' + id, cambios);
    }

    patch(id: String, datoMod: String, cambios: any): Observable<IListaEspera> {
        return this.server.patch(this.listaEsperaUrl + '/' + id + '/' + datoMod, cambios);
    }

    save(listaEspera: IListaEspera): Observable<IListaEspera> {
        if (listaEspera.id) {
            return this.server.put(this.listaEsperaUrl + '/' + listaEspera.id, listaEspera);
        } else {
            return this.server.post(this.listaEsperaUrl, listaEspera);
        }
    }

    guardar(paciente, tipoPrestacion, estado: String, profesional, organizacion, motivo: String, origen: String) {
        if (!paciente || !tipoPrestacion || !estado || !organizacion || !motivo || !origen) {
            this.plex.toast('danger', 'Error en parámetros');
            return false;
        }
        const datosProfesional = !profesional ? null : {
            id: profesional.id,
            nombre: profesional.nombre,
            apellido: profesional.apellido
        };
        const demanda: IDemanda = {
            profesional: datosProfesional,
            organizacion,
            motivo,
            fecha: moment().toDate(),
            origen
        };
        const params = {
            'pacienteId': paciente.id,
            'conceptId': tipoPrestacion.conceptId,
            'estado': estado
        };
        const r = this.get(params).subscribe(resultado => {
            if (resultado[0]?.demandas) {
                resultado[0].demandas.push(demanda);
                this.patch(resultado[0].id, 'demandas', resultado[0].demandas).subscribe(() => {
                    return true;
                }, (error) => {
                    this.plex.toast('danger', error, 'Ha ocurrido un error al guardar');
                    return false;
                });
            } else {
                const datosPaciente: IPacienteBasico = {
                    id: paciente.id,
                    nombre: paciente.nombre,
                    alias: paciente.alias,
                    apellido: paciente.apellido,
                    documento: paciente.documento,
                    numeroIdentificacion: paciente.numeroIdentificacion,
                    fechaNacimiento: paciente.fechaNacimiento,
                    sexo: paciente.sexo,
                    genero: paciente.genero
                };
                const listaEspera: IListaEspera = {
                    paciente: datosPaciente,
                    fecha: moment().toDate(),
                    vencimiento: null,
                    estado,
                    demandas: [demanda],
                    tipoPrestacion,
                    resolucion: null
                };
                if (listaEspera !== null) {
                    this.post(listaEspera).subscribe(() => {
                        return true;
                    }, (error) => {
                        this.plex.toast('danger', error, 'Ha ocurrido un error al guardar');
                        return false;
                    });
                }
            }
        });
        return r;
    }
}
