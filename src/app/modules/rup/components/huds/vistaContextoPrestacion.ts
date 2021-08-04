import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { gtag } from '../../../../shared/services/analytics.service';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { IPrestacionRegistro } from '../../interfaces/prestacion.registro.interface';
import { getSemanticClass } from '../../pipes/semantic-class.pipes';
import { HUDSService } from '../../services/huds.service';
import { PrestacionesService } from '../../services/prestaciones.service';
@Component({
    selector: 'vista-contexto-prestacion',
    templateUrl: 'vistaContextoPrestacion.html',
    encapsulation: ViewEncapsulation.None,
})

export class VistaContextoPrestacionComponent implements OnInit {

    public todoRegistro;
    @Input('registro')
    set registro(value: IPrestacionRegistro) {
        this._registro = value;
    }
    get registro() {
        return this._registro;
    }
    @Input('prestacion')
    set prestacion(value: IPrestacion) {
        this._prestacion = value;
    }
    get prestacion() {
        return this._prestacion;
    }

    _registro;
    _prestacion: IPrestacion;


    constructor(public _prestacionesService: PrestacionesService,
        public huds: HUDSService) { }

    ngOnInit() {

        this._prestacionesService.getConceptosByPaciente(this.prestacion.paciente.id, true).subscribe(registros => {
            this.todoRegistro = registros;
        });

    }

    emitTabs(registro, tipo, index: number) {
        const registroAux = this.todoRegistro.find(r => r.evoluciones.some(e => e.idRegistro === registro.id));
        registroAux.class = getSemanticClass(registroAux.concepto, false);
        gtag('huds-open', tipo, registroAux.concepto.term, index);
        this.huds.toogle(registroAux, tipo);

    }

    getPrestacion() {
        const tipo = 'rup';
        this.huds.toogle(this.prestacion, tipo);
    }

}
