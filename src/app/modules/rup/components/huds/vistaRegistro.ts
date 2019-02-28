import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { IPrestacionRegistro } from '../../interfaces/prestacion.registro.interface';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { PrestacionesService } from '../../services/prestaciones.service';
import { ElementosRUPService } from '../../services/elementosRUP.service';
import { IPaciente } from '../../../../interfaces/IPaciente';

@Component({
    selector: 'vista-registro',
    templateUrl: 'vistaRegistro.html',
    encapsulation: ViewEncapsulation.None,
})

export class VistaRegistroComponent implements OnInit {

    @Input() paciente: IPaciente;
    @Input() registro: IPrestacionRegistro = null;
    @Input() prestacion: IPrestacion = null;
    @Input() evolucionActual: any = null;
    @Input() indice = 0;

    constructor(public prestacionesService: PrestacionesService, public elementosRUPService: ElementosRUPService) { }

    ngOnInit() {
        this.prestacionesService.getByPaciente(this.paciente.id).subscribe(prestacion => {
            this.prestacion = prestacion.find(x => x.id === this.registro.idPrestacion);
        });
    }

    cambiarEvolucion(signo) {
        if (signo === '+') {
            if (this.indice < (this.registro.evoluciones.length - 1)) {
                this.indice = this.indice + 1;
            }
        } else {
            if (this.indice > 0) {
                this.indice = this.indice - 1;
            }
        }
    }

}
