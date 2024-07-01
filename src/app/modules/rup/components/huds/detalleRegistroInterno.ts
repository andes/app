import { Component, Input, OnChanges } from '@angular/core';
import { PrestacionesService } from '../../services/prestaciones.service';

@Component({
    selector: 'detalle-registro-interno',
    templateUrl: 'detalleRegistroInterno.html',
    styleUrls: ['detalleRegistroInterno.scss']
})

export class DetalleRegistroInternoComponent implements OnChanges {
    @Input() registro;

    public prestacion;

    constructor(
        public prestacionesService: PrestacionesService,
    ) { }

    ngOnChanges() {
        if (this.registro?.idPrestacion) {
            this.prestacionesService.getById(this.registro.idPrestacion).subscribe(resultado => {
                this.prestacion = resultado;
            });
        }
    }
}
