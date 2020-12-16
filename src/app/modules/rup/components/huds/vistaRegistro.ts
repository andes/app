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

    @Input() indice = 0;


    public relacionAux;

    @Input() prestacion: IPrestacion;

    @Input() registro: IPrestacionRegistro;

    prestaciones: IPrestacion[];

    contextoEvolutivo: IPrestacion = null;

    constructor(
        public prestacionesService: PrestacionesService,
        public elementosRUPService: ElementosRUPService
    ) { }

    ngOnInit() {
        this.prestacionesService.getByPaciente(this.paciente.id).subscribe(arrayPrestaciones => {
            this.prestaciones = arrayPrestaciones;
            if (this.registro.evoluciones) {
                this.contextoEvolutivo = this.prestaciones.find(p => p.id === this.registro.evoluciones[0].idPrestacion);
                this.buscarRelacion();
            }
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
        this.contextoEvolutivo = this.prestaciones.find(p => p.id === this.registro.evoluciones[this.indice].idPrestacion);
        this.buscarRelacion();
    }

    buscarRelacion() {
        const relacionInvertida = this.contextoEvolutivo.ejecucion.registros.find(r => {
            return r.relacionadoCon.some(rl => rl.concepto.conceptId === this.registro.concepto.conceptId);
        });

        if (relacionInvertida) {
            this.relacionAux = relacionInvertida;
        } else {
            if (this.registro.evoluciones[this.indice]?.relacionadoCon[0]?.concepto.conceptId === '1921000013108') {
                this.relacionAux = this.registro.evoluciones[this.indice].relacionadoCon[0];
            } else {
                this.relacionAux = null;
            }
        }

    }

}
