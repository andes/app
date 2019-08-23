import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PrestacionesService } from '../../../services/prestaciones.service';
import { TipoPrestacionService } from '../../../../../services/tipoPrestacion.service';
import { HUDSService } from '../../../services/huds.service';

@Component({
    selector: 'rup-mini-card',
    templateUrl: './rup-mini-card.component.html',
    styleUrls: ['rup-mini-card.component.scss']
})

export class RupMiniCardComponent implements OnInit {

    @Input() registro;
    @Input() filtroActual;
    @Input() emitirConceptos;
    @Input() snomed;

    @Output() registroVolador: EventEmitter<any> = new EventEmitter<any>();
    @Output() accionSecundaria: EventEmitter<any> = new EventEmitter<any>();

    customTag = null;

    constructor(
        public huds: HUDSService,
        public servicioPrestacion: PrestacionesService,
        public servicioTipoPrestacion: TipoPrestacionService) { }

    ngOnInit() {
        if (this.filtroActual === 'vacunas') {
            this.customTag = 'vacuna';
        } else if (this.filtroActual === 'laboratorios') {
            this.customTag = 'laboratorio';
        }
    }

    emitirRegistro(registro, tipo, destino) {
        this.registroVolador.emit({ registro, tipo, destino });
    }

    emitirAccion(registro, tipo, destino) {
        this.accionSecundaria.emit({ registro, tipo, destino });
    }
}
