import { Component, OnInit } from '@angular/core';
import { RupElement } from '../..';
import { RUPComponent } from '../../../core/rup.component';
import { IPrestacionRegistro } from '../../../../interfaces/prestacion.registro.interface';
import { IElementoRUP } from '../../../../interfaces/elementoRUP.interface';
import { ISnomedConcept } from '../../../../interfaces/snomed-concept.interface';

@Component({
    selector: 'rup-plan-indicacion',
    templateUrl: 'planDeIndicacion.html',
    styleUrls: ['planDeIndicacion.scss']
})
@RupElement('PlanIndicacionComponent')
export class PlanIndicacionComponent extends RUPComponent implements OnInit {
    rupElemento: IElementoRUP;
    conceptoSnomed: ISnomedConcept;
    registroNuevo: IPrestacionRegistro;
    ngOnInit() {
        this.rupElemento = this.elementoRUP.requeridos[0].elementoRUP;
        this.conceptoSnomed = this.registro.registros[0].concepto;
        if (!this.registro.registros[0].valor) {
            this.registro.registros[0].valor = { estado: 'activo' };
        }
        this.registro.registros.forEach(reg => {
            if (reg.valor.idRegistroOrigen) {
                if (reg.registros[3].valor) {
                    reg.registros[3].valor = { existeRegistro: true, estado: reg.registros[3].valor.estado };
                } else {
                    reg.registros[3].valor = { existeRegistro: true };
                }
            }
        });
        this.disable();
        if (!this.soloValores) {
            this.agregarRegistro();
        }
    }

    disable() {
        this.registro.registros.forEach(reg => {
            for (let i = 0; i < reg.registros.length - 1; i++) {
                if (reg.registros[i].valor) {
                    reg.registros[i].modificar = true;
                }
            }
        });
    }

    agregarRegistro() {
        this.registroNuevo = new IPrestacionRegistro(this.rupElemento, this.conceptoSnomed);
        this.registroNuevo.valor = { estado: 'activo' };
        this.registro.registros = [...this.registro.registros, this.registroNuevo];
    }



    quitarIndicacion(index) {
        if (this.registro.registros.length > 1) {
            this.registro.registros.splice(index, 1);
        } else {
            this.plex.info('danger', 'Es necesario la carga de un registro ');
        }
    }


    modificar(index) {
        for (let i = 0; i < this.registro.registros[index].registros.length - 1; i++) {
            this.registro.registros[index].registros[i].modificar = false;
        }

    }

    /**
     * Agrega un item de Prescripción siempre y cuando no haya uno vacio
     * @param index valor index de la prescripción que se está modificando
     */
    rupOnchange(index) {
        if (this.registro.registros[index].registros[0].valor !== null) {
            let registroVacio = false;
            for (let i = 0; i < this.registro.registros.length; i++) {
                if (this.registro.registros[i].registros[0].valor === null) {
                    registroVacio = false;
                    break;
                } else {
                    registroVacio = true;
                }
            }

            if (registroVacio) {
                this.agregarRegistro();
            }
        }
    }
}
