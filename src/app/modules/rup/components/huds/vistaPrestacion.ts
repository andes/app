import { Component, ViewEncapsulation, Input, HostBinding } from '@angular/core';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { PrestacionesService } from '../../services/prestaciones.service';
import { ElementosRUPService } from '../../services/elementosRUP.service';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { PacienteHttpService } from '../../../../apps/mpi/pacientes/services/pacienteHttp.service';

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
        private servicioPaciente: PacienteHttpService,
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
                    this.servicioPaciente.findById(this.prestacion.paciente.id, {}).subscribe(paciente => {
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
