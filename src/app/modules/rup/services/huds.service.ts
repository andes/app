import { Injectable, Type } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';

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

    constructor() { }

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
     * @param tipo 'cda' 'rup' 'concepto' 'dom'.
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
                        if (registro.id === _registro.id) {
                            return i;
                        }
                        break;
                    case 'dom':
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
}
