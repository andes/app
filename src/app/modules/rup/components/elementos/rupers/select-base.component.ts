import { OnInit, Component, AfterViewInit } from '@angular/core';
import { RUPComponent } from '../../core/rup.component';
import { Unsubscribe } from '@andes/shared';
import { Observable, of } from 'rxjs';
import { RupElement } from '..';

/**
 * Params:
 *
 * title: Titulo del componete, sino usa el term del concepto
 * multiple: Permite elegir multiples organizaciones
 * required: Es requerida para grabar
 * allowOther: Permite elegir texto libre.
 * preload: Carga el plex-select al renderizar el componente.
 *          Ejecuta el request a la API con todos los datos.
 */
@Component({
    selector: 'rup-select',
    template: ''
})
export class SelectBaseComponent extends RUPComponent implements OnInit, AfterViewInit {

    public idField = 'id';

    public labelField = 'nombre';

    public dataLoaded: any[] = [];

    public itemSelected: any | any[] = null;

    public otherEnabled: Boolean = false;


    public otherText: String = '';

    get titulo() {
        if (this.params.title !== null && this.params.title !== undefined) {
            return this.params.title;
        } else {
            return this.registro.concepto.term;
        }
    }

    get allowOther() {
        if (this.params.allowOther !== null && this.params.allowOther !== undefined) {
            return this.params.allowOther;
        } else {
            return false;
        }
    }

    getData(input: string): Observable<any[]> {
        return of([]);
    }

    ngOnInit() {
        if (!this.params) {
            this.params = {};
        }

        if (this.registro && this.registro.valor) {
            const value = this.registro.valor;
            if (Array.isArray(value)) {
                this.itemSelected = value;
            } else {
                if (value.id || value.conceptId) {
                    this.itemSelected = value;
                    this.otherEnabled = false;
                } else if (this.allowOther) {
                    this.otherEnabled = true;
                    this.otherText = value.nombre;
                }
            }
        }

    }

    ngAfterViewInit() {
        if (this.params.preload) {
            this.getData(undefined).subscribe((data) => {
                this.dataLoaded = data;
            });
        }
    }

    displayName(item) {
        return item.nombre;
    }

    onValueChange() {
        if (!this.otherEnabled) {
            if (this.itemSelected) {
                this.registro.valor = this.itemSelected;
            } else {
                this.registro.valor = null;
            }
        } else {
            this.registro.valor = {
                nombre: this.otherText,
                id: null
            };
        }
        this.emitChange();
    }

    @Unsubscribe()
    loadDatos(event) {
        if (!event) { return; }
        if (event.query && event.query.length > 2) {
            return this.getData(event.query).subscribe((data) => {
                event.callback(data);
            });
        } else {
            if (this.registro.valor && this.registro.valor.length) {
                event.callback(this.registro.valor);
            } else {
                event.callback([]);
            }
        }
    }


}
