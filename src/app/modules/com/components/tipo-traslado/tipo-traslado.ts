import { Input, Component, OnInit } from '@angular/core';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { TipoTrasladoService } from 'src/app/services/com/tipoTraslados.service';

@Component({
    selector: 'tipo-traslado',
    templateUrl: './tipo-traslado.html',
})
export class TipoTrasladoComponent implements OnInit {
    @Input() derivacion;
    tipoTraslados = [];
    organizacionesTraslado = [];

    constructor(
        private organizacionService: OrganizacionService,
        private tipoTrasladoService: TipoTrasladoService
    ) { }

    ngOnInit() {
        this.cargarTipoTraslados();
    }

    cargarTipoTraslados() {
        this.tipoTrasladoService.search().subscribe(resultado => {
            this.tipoTraslados = resultado;
        });
    }

    onTipoTrasladoChange() {
        if (this.derivacion.tipoTraslado) {
            this.organizacionService.get({ trasladosEspeciales: this.derivacion.tipoTraslado.id }).subscribe(resultado => {
                this.organizacionesTraslado = resultado;
                if (resultado.length === 1) {
                    this.derivacion.organizacionTraslado = resultado[0];
                }
            });
        } else {
            this.derivacion.organizacionTraslado = null;
            this.organizacionesTraslado = [];
        }
    }
}
