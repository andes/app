import { Component, OnInit } from '@angular/core';
import { RupElement } from '../index';
import { RUPComponent } from '../../core/rup.component';
import { Unsubscribe } from '@andes/shared';
import { IOrganizacion } from '../../../../../interfaces/IOrganizacion';
import { Observable } from 'rxjs';

/**
 * Params:
 *
 * title: Titulo del componete, sino usa el term del concepto
 * multiple: Permite elegir multiples organizaciones
 * required: Es requerida para grabar
 * allowOther: Permite elegir texto libre.
 */


export abstract class SelectBaseComponent extends RUPComponent implements OnInit {

    public labelField = 'nombre';

    public itemSelected: any | any[] = null;

    public otherEnabled: Boolean = false;

    public otherText: String = '';

    ngOnInit() {
        if (this.registro && this.registro.valor) {
            const org = this.registro.valor;
            if (Array.isArray(org)) {
                this.itemSelected = org;
            } else {
                if (org.id) {
                    this.itemSelected = org;
                    this.otherEnabled = false;
                } else {
                    this.otherEnabled = true;
                    this.otherText = org.nombre;
                }
            }
        }
    }

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

    abstract getData(input: string): Observable<any[]>;
}
