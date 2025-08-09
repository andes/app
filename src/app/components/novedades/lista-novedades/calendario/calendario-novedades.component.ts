import moment from 'moment';
import { Component, EventEmitter, Input, LOCALE_ID, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
    selector: 'calendario-novedades',
    templateUrl: 'calendario-novedades.component.html',
    providers: [{
        provide: LOCALE_ID, useValue: 'es-AR'
    }]
})
export class CalendarioNovedadesComponent implements OnChanges {
    @Input() fecha;
    @Input() novedad;
    @Output() setFecha = new EventEmitter<any>();
    @Output() volver = new EventEmitter<any>();

    fechaSelector;

    ngOnChanges(changes: SimpleChanges) {
        if (changes.novedad?.currentValue) {
            const fechaNovedad = moment(changes.novedad.currentValue.fecha).format('YYYY-MM-DD');
            const fechaSelector = moment(this.fechaSelector).format('YYYY-MM-DD');

            if (fechaNovedad !== fechaSelector) {
                this.fechaSelector = null;
            }
        }
    }

    onChangeFecha(event: { value: string }) {
        if (event.value) {
            const fecha = moment(event.value).format('YYYY-MM-DD');
            this.setFecha.emit(fecha);
        } else {
            this.volver.emit();
        }
    }
}
