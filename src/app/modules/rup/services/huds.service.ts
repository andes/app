import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Server } from '@andes/shared';
import { IPrestacionRegistro } from '../interfaces/prestacion.registro.interface';

// Por el momento lo dejo en any.
// Este alias me permite en el futuro cambiar el tipo en todos lados
type Registro = any;
interface ElementoHUDS {
    tipo: String;
    data: Registro;
}

@Injectable()
export class HUDSService {
    private _registrosHUDS: ElementoHUDS[] = [];
    private _obsRegistros = new BehaviorSubject<ElementoHUDS[]>([]);
    public registrosHUDS = this._obsRegistros.asObservable();
    public activeTab = -1;
    private hudsUrl = '/modules/huds/accesos';

    constructor(private server: Server) { }

    /**
     * Controladores globales de las tabs de la huds
     */
    private push(elemento: ElementoHUDS) {
        this._registrosHUDS = [...this._registrosHUDS, elemento];
        this._obsRegistros.next([...this._registrosHUDS]);
        this.activeTab = this._registrosHUDS.length;
    }

    public remove(index) {
        this._registrosHUDS.splice(index, 1);
        this._obsRegistros.next([...this._registrosHUDS]);

    }

    /**
     * Agrega o quita un elemento a las tabs
     * @param registro Elemento seleccionado en hudsBusqueda.
     * @param tipo 'cda' 'rup' 'concepto'.
     */
    public toogle(registro: Registro, tipo: string) {
        const index = this.index(registro, tipo);
        if (index === -1) {
            const elemento: ElementoHUDS = {
                tipo: tipo,
                data: registro
            };
            this.push(elemento);
        } else {
            this.remove(index);
        }
    }

    public clear() {
        this._registrosHUDS = [];
        this._obsRegistros.next([]);
        this.activeTab = -1;
    }

    index(registro: Registro, tipo: string) {
        if (!this._registrosHUDS.length) {
            return -1;
        }
        for (let i = 0; i < this._registrosHUDS.length; i++) {
            const _registro = this._registrosHUDS[i].data;
            if (this._registrosHUDS[i].tipo === tipo) {
                switch (tipo) {
                    case 'concepto':
                        if (registro.idRegistro === _registro.idRegistro) {
                            return i;
                        }
                        break;
                    case 'rup':
                    case 'cda':
                    case 'solicitud':
                        if (registro.id === _registro.id) {
                            return i;
                        }
                        break;
                    case 'ficha-epidemiologica':
                        if (registro.id === _registro.id) {
                            return i;
                        }
                        break;
                }
            }
        }
        return -1;
    }

    isOpen(registro: Registro, tipo: string) {
        return this.index(registro, tipo) >= 0;
    }


    /**
    * Genera un token para el acceso a la HUDS de un paciente
    */
    generateHudsToken(usuario, organizacion, paciente, motivo, profesional, idTurno, idPrestacion) {
        let paramsToken = {
            usuario: usuario,
            organizacion: organizacion,
            paciente: paciente,
            motivo: motivo,
            profesional: profesional,
            idTurno: idTurno,
            idPrestacion: idPrestacion
        };
        return this.server.post(this.hudsUrl + '/token', paramsToken);

    }

    getAccesos(params: any): Observable<any> {
        return this.server.get(this.hudsUrl, { params: params });
    }

    getHudsToken() {
        return window.sessionStorage.getItem('huds-token');
    }

    armarRelaciones(registros: IPrestacionRegistro[]) {
        let registrosDeep: any = {};
        let relacionesOrdenadas = [];
        let roots = registros.filter(x => x.relacionadoCon.length === 0);

        let traverse = (_registros, registro, deep) => {
            let orden = [];
            let hijos = _registros.filter(item => item.relacionadoCon[0] && (item.relacionadoCon[0].id === registro.id || item.relacionadoCon[0].conceptId === registro.concepto.conceptId));
            registrosDeep[registro.id] = deep;
            hijos.forEach((hijo) => {
                orden = [...orden, hijo, ...traverse(_registros, hijo, deep + 1)];
            });
            return orden;
        };

        roots.forEach((root) => {
            registrosDeep[root.id] = 0;
            relacionesOrdenadas = [...relacionesOrdenadas, root, ...traverse(registros, root, 1)];
        });


        return { relacionesOrdenadas, registrosDeep };
    }
}
