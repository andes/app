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

    constructor(
        private semaforoService: SemaforoService
    ) { }

    ngOnInit(): void {
        this.semaforoService.findByName(this.name).subscribe(res => this.semaforo = res);
    }

    isSelected(opt, prioridad) {
        if (typeof prioridad === 'string') {
            return opt.label === prioridad || opt.priority === prioridad;
        } else if (opt.min >= 0) {
            return prioridad >= opt.min && (!opt.max || prioridad <= opt.max);
        }

        return false;
    }

    select(e) {
        this.prioridad = e.value;
        this.change.emit(e);
    }
}
