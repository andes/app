import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { PrestacionesService } from '../../services/prestaciones.service';
import { ElementosRUPService } from '../../services/elementosRUP.service';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { PacienteService } from '../../../../core/mpi/services/paciente.service';
@Component({
    selector: 'vista-prestacion',
    templateUrl: 'vistaPrestacion.html',
    encapsulation: ViewEncapsulation.None,
})

export class VistaPrestacionComponent implements OnInit {

    @Input() paciente: IPaciente;
    @Input() prestacion: IPrestacion;
    @Input() evolucionActual: any;
    @Input() indice = 0;
    private _idPrestacion;
    @Input()
    set idPrestacion(value: any) {
        this.prestacion = null;
        this.paciente = null;
        this._idPrestacion = value;
        this.elementosRUPService.ready.subscribe((resultado) => {
            if (resultado) {
                this.servicioPrestacion.getById(this.idPrestacion).subscribe(prestacion => {
                    this.prestacion = prestacion;
                    this.pacienteService.getById(this.prestacion.paciente.id).subscribe(paciente => {
                        this.paciente = paciente;
                    });
                });
            }
        });
    }
    get idPrestacion(): any {
        return this._idPrestacion;
    }

    constructor(public servicioPrestacion: PrestacionesService, public pacienteService: PacienteService, public elementosRUPService: ElementosRUPService) {
    }


    ngOnInit() {

    }

    getTimestamp(fecha) {
        return fecha.getTime();
    }


}
