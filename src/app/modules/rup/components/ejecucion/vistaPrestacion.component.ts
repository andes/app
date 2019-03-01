
import { Component, OnInit, OnChanges, HostBinding, Input } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { PacienteService } from '../../../../services/paciente.service';
import { ElementosRUPService } from '../../services/elementosRUP.service';
import { IPaciente } from '../../../../interfaces/IPaciente';
import { PrestacionesService } from '../../services/prestaciones.service';
import { NgOnChangesFeature } from '@angular/core/src/render3';

@Component({
    selector: 'rup-vistaPrestacion',
    templateUrl: 'vistaPrestacion.html',
    styleUrls: [
        'prestacionValidacion.scss']
})
export class VistaPrestacionComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;

    private _idPrestacion;
    @Input()
    set idPrestacion(value: any) {
        this.registro = null;
        this.paciente = null;
        this._idPrestacion = value;
        this.elementosRUPService.ready.subscribe((resultado) => {
            if (resultado) {
                this.servicioPrestacion.getById(this.idPrestacion).subscribe(prestacion => {
                    this.registro = prestacion;
                    this.servicioPaciente.getById(this.registro.paciente.id).subscribe(paciente => {
                        this.paciente = paciente;
                    });
                });
            }
        });
    }
    get idPrestacion(): any {
        return this._idPrestacion;
    }

    private registro: any;
    private paciente: IPaciente;

    constructor(public elementosRUPService: ElementosRUPService,
        public plex: Plex, public auth: Auth,
        private servicioPaciente: PacienteService,
        private servicioPrestacion: PrestacionesService) { }


    ngOnInit() {


    }
}
