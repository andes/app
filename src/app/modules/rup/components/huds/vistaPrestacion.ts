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
    styleUrls: ['../core/_rup.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class VistaPrestacionComponent {
    @HostBinding('class.plex-layout') layout = true;

    @Input() paciente: IPaciente;
    @Input() prestacion: IPrestacion;
    @Input() evolucionActual: any;
    @Input() indice = 0;

    public ready$ = this.elementosRUPService.ready;

    constructor(
        public servicioPrestacion: PrestacionesService,
        private servicioPaciente: PacienteService,
        public elementosRUPService: ElementosRUPService) {
    }

    private _idPrestacion;
    @Input()
    set idPrestacion(value: any) {
        this.paciente = null;
        this.prestacion = null;
        this._idPrestacion = value;
        this.servicioPrestacion.getById(this.idPrestacion).subscribe(prestacion => {
            this.servicioPaciente.getById(prestacion.paciente.id).subscribe(paciente => {
                this.prestacion = prestacion;
                this.paciente = paciente;
            });
        });
    }
    get idPrestacion(): any {
        return this._idPrestacion;
    }

    getTimestamp(fecha) {
        return fecha.getTime();
    }


}
