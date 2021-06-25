import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SemaforoService } from '../service/semaforo.service';


@Component({
    selector: 'semaforo-priorizacion',
    templateUrl: './semaforo-priorizacion.html',
    styleUrls: ['./scss/semaforo.scss']

})

export class SemaforoPriorizacionComponent implements OnInit {
    @Output() onChangeEvent = new EventEmitter<any>();
    @Input() name;
    @Input() prioridad;
    opciones;

    constructor(
        private semaforoService: SemaforoService) { }

    ngOnInit(): void {
        this.semaforoService.findByName('com').subscribe(res =>  this.opciones = res.options);
    }

    select(e) {
        this.prioridad = e.label;
        this.onChangeEvent.emit(e);
    }
}
