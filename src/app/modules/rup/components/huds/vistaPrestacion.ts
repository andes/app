import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { IPrestacionRegistro } from '../../interfaces/prestacion.registro.interface';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { PrestacionesService } from '../../services/prestaciones.service';
import { ElementosRUPService } from '../../services/elementosRUP.service';

@Component({
    selector: 'vista-prestacion',
    templateUrl: 'vistaPrestacion.html',
    encapsulation: ViewEncapsulation.None,
})

export class VistaPrestacionComponent implements OnInit {

    @Input() registro: IPrestacionRegistro;
    @Input() prestacion: IPrestacion;
    @Input() evolucionActual: any;
    @Input() indice = 0;

    constructor(public prestacionesService: PrestacionesService, public elementosRUPService: ElementosRUPService) {
    }

    ngOnInit() {
        this.prestacionesService.getByPaciente(this.registro.paciente.id).subscribe(prestacion => {
            this.prestacion = prestacion.find(x => x.id === this.registro.id);
        });
    }

    getTimestamp(fecha) {
        return fecha.getTime();
    }

}
