import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { IPrestacionRegistro } from '../../interfaces/prestacion.registro.interface';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { PrestacionesService } from '../../services/prestaciones.service';
import { gtag } from '../../../../shared/services/analytics.service';
import { getSemanticClass } from '../../pipes/semantic-class.pipes';
import { HUDSService } from '../../services/huds.service';
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

    _registro: IPrestacionRegistro;
    _prestacion: IPrestacion;


    constructor(public _prestacionesService: PrestacionesService,
        public huds: HUDSService) { }

    ngOnInit() {

        this._prestacionesService.getConceptosByPaciente(this.prestacion.paciente.id, true).subscribe(registros => {
            this.todoRegistro = registros;
        });

    }

    emitTabs(registro, tipo, index: number) {
        let registroAux = this.todoRegistro.find(r => r.idRegistro === registro.id);
        registroAux.class = getSemanticClass(registroAux.concepto, false);
        gtag('huds-open', tipo, registroAux.concepto.term, index);
        this.huds.toogle(registroAux, tipo);

    }

    getPrestacion() {
        let tipo = 'rup';
        this.huds.toogle(this.prestacion, tipo);
    }


}
