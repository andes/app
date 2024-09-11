import { Component, Input, OnInit } from '@angular/core';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { PrestacionesService } from '../../services/prestaciones.service';
import { HUDSService } from '../../services/huds.service';
import { ElementosRUPService } from '../../services/elementosRUP.service';

@Component({
    selector: 'detalle-registro',
    templateUrl: 'detalleRegistro.html',
    styleUrls: ['detalleRegistro.scss']
})

export class DetalleRegistronComponent implements OnInit {
    @Input() paciente: IPaciente;
    @Input() registro: any;
    @Input() indice = 0;

    prestaciones: IPrestacion[];
    contextoEvolutivo: IPrestacion = null;
    relacionAux;
    prestacionRelacionada;

    constructor(
        public prestacionesService: PrestacionesService,
        public elementosRUPService: ElementosRUPService,
        public huds: HUDSService
    ) { }

    ngOnInit() {
        this.prestacionesService.getByPaciente(this.paciente.id).subscribe(arrayPrestaciones => {
            this.prestaciones = arrayPrestaciones;
            if (this.registro.evoluciones) {
                this.contextoEvolutivo = this.prestaciones.find(p => p.id === this.registro.evoluciones[0].idPrestacion);
                this.buscarRelacion();
            }
        });

        this.prestacionesService.getByPaciente(this.paciente.id).subscribe(prestacion => {
            this.prestacionRelacionada = prestacion.find(x => x.id === this.registro.idPrestacion);
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
        this.prestacionRelacionada = this.prestaciones?.find(p => p.id === this.registro.evoluciones[this.indice].idPrestacion);
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

    getPrestacion() {
        const tipo = 'rup';
        this.huds.toogle(this.prestacionRelacionada, tipo);
    }

    getEstado(tipo: string) {
        return { activo: 'success', inactivo: 'danger', resuelto: 'info' }[tipo];
    }
}
