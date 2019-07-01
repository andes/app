import { Component, ViewEncapsulation, Input, HostBinding } from '@angular/core';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { PrestacionesService } from '../../services/prestaciones.service';
import { ElementosRUPService } from '../../services/elementosRUP.service';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { PacienteService } from '../../../../core/mpi/services/paciente.service';

@Component({
    selector: 'vista-prestacion',
    templateUrl: 'vistaPrestacion.html',
    encapsulation: ViewEncapsulation.None,
})

export class VistaPrestacionComponent {
    @HostBinding('class.plex-layout') layout = true;

    @Input() paciente: IPaciente;
    @Input() prestacion: IPrestacion;
    @Input() evolucionActual: any;
    @Input() indice = 0;

    constructor(
        public servicioPrestacion: PrestacionesService,
        private servicioPaciente: PacienteService,
        public elementosRUPService: ElementosRUPService) {
    }

    private _idPrestacion;
    @Input()
    set idPrestacion(value: any) {
        this.paciente = null;
        this._idPrestacion = value;
        this.elementosRUPService.ready.subscribe((resultado) => {
            if (resultado) {
                this.servicioPrestacion.getById(this.idPrestacion).subscribe(prestacion => {
                    this.prestacion = prestacion;
                    this.servicioPaciente.getById(this.prestacion.paciente.id).subscribe(paciente => {
                        this.paciente = paciente;
                    });
                });
            }
        });
    }
    get idPrestacion(): any {
        return this._idPrestacion;
    }

    getTimestamp(fecha) {
        return fecha.getTime();
    }


}
