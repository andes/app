import { Component, OnInit } from '@angular/core';
import { RupElement } from '.';
import { RUPComponent } from '../core/rup.component';
import { Unsubscribe } from '@andes/shared';

@Component({
    selector: 'app-colposcopia', templateUrl: './colposcopia.component.html'
}
)
@RupElement('ColposcopiaComponent')

export class ColposcopiaComponent extends RUPComponent implements OnInit {
    public colposcopiaRegistro: any =
    {
        colpospia: null,
        detalle: null,
        visibilidadUEC: null,
        zona: null,
        biopsia: null,
        descripcionBiopsia: null,
        evaluacionEndocervical: null,
        testSchiller: null
    };
    @Unsubscribe()
    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {};
        }
        if (!this.registro.valor.colposcopia) {
            this.registro.valor.colposcopia = this.colposcopiaRegistro;
        }
    }

    public colposcopia = [
        { id: 'adecuada', nombre: 'adecuada' },
        { id: 'inadecuada', nombre: 'inadecuada' }
    ];
    public visibilidadUEC = [
        { id: 'completamenteV', nombre: 'completamente visible' },
        { id: 'parcialmeteV', nombre: 'parcialmente visible' },
        { id: 'noVisible', nombre: 'no visible' }

    ];
    public zonaTransformacion = [{ id: '1', label: '1' }, { id: '2', label: '2' }, { id: '3', label: '3' }];
    public hallazgos = [
        { id: 'normal', nombre: 'normal' },
        { id: 'grado 1', nombre: 'grado 1' },
        { id: 'grado 2', nombre: 'grado 2' },
        { id: 'sospechaInvasion', nombre: 'sospecha invasión' },
        { id: 'hallazgosVarios', nombre: 'hallazgos varios' }];
    public testSchiller = [{ id: 'positivo', label: 'positivo' }, { id: 'negativo', label: 'negativo' }];


}

