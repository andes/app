import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { IPrestacionRegistro } from '../../interfaces/prestacion.registro.interface';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { PrestacionesService } from '../../services/prestaciones.service';
import { ElementosRUPService } from '../../services/elementosRUP.service';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';

@Component({
    selector: 'vista-registro',
    templateUrl: 'vistaRegistro.html',
    encapsulation: ViewEncapsulation.None,
})

export class VistaRegistroComponent implements OnInit {

    @Input() paciente: IPaciente;
    // @Input() registro: IPrestacionRegistro = null;
    // @Input() prestacion: IPrestacion = null;
    @Input() evolucionActual: any = null;
    @Input() indice = 0;
    public relacionAux;
    @Input('registro')
    set registro(value: IPrestacionRegistro) {
        this._registro = value;
    }
    get registro() {
        return this._registro;
    }
    @Input('prestacion')
    set prestacion(value: IPrestacion) {
        this._prestacion = value;
    }
    get prestacion() {
        return this._prestacion;
    }

    _registro: IPrestacionRegistro;
    _prestacion: IPrestacion;
    prestaciones: IPrestacion[];
    contextoEvolutivo = null;

    constructor(public prestacionesService: PrestacionesService, public elementosRUPService: ElementosRUPService) { }

    ngOnInit() {
        // this.prestacionesService.getByPaciente(this.paciente.id).subscribe(prestacion => {
        //     this.prestacion = prestacion.find(x => x.id === this.registro.idPrestacion);
        // });
        this.prestacionesService.getByPaciente(this.paciente.id).subscribe(arrayPrestaciones => {
            this.prestaciones = arrayPrestaciones;
            // this.prestacion = arrayPrestaciones.find(x => x.id === this.registro.idPrestacion);
            if (this.registro.evoluciones) {
                this.contextoEvolutivo = this.prestaciones.find(p => p.id === this.registro.evoluciones[0].idPrestacion);
            }
        });
        if (this.registro.evoluciones[0]?.relacionadoCon[0]?.concepto.conceptId === '1921000013108') {
            this.relacionAux = this.registro.evoluciones[0].relacionadoCon[0];

        }
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
        this.contextoEvolutivo = this.prestaciones.find(p => p.id === this.registro.evoluciones[this.indice].idPrestacion);
    }

}
