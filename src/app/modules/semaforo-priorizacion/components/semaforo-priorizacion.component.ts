import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SemaforoService } from '../service/semaforo.service';
import { ISemaforo } from '../interfaces/ISemaforo';


@Component({
    selector: 'semaforo-priorizacion',
    templateUrl: './semaforo-priorizacion.html',
    styleUrls: ['./scss/semaforo.scss']

})

export class SemaforoPriorizacionComponent implements OnInit {
    @Output() change = new EventEmitter<any>();
    @Input() name;
    @Input() prioridad;
    public semaforo: ISemaforo;
    opciones;

    constructor(
        private semaforoService: SemaforoService
    ) { }

    ngOnInit(): void {
        this.semaforoService.findByName(this.name).subscribe(res =>  this.semaforo = res);
    }

    select(e) {
        this.prioridad = e.label;
        this.change.emit(e);
    }
}
