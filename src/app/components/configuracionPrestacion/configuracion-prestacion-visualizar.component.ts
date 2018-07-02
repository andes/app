import { Component, OnInit } from '@angular/core';
import { OrganizacionService } from './../../services/organizacion.service';
import { ConfiguracionPrestacionService } from './../../services/term/configuracionPrestacion.service';
import { IOrganizacion } from '../../interfaces/IOrganizacion';

@Component({
    selector: 'configuracion-prestacion-visualizar',
    templateUrl: 'configuracion-prestacion-visualizar.html',
})
export class ConfiguracionPrestacionVisualizarComponent implements OnInit {

    public organizaciones: IOrganizacion[] = [];
    public mapeos: any[] = [];

    constructor(
        private organizacionService: OrganizacionService,
        private configuracionPrestacionService: ConfiguracionPrestacionService) { }


    ngOnInit() {
        this.organizacionService.get({}).subscribe(resultado => {
            this.organizaciones = resultado;
        });
    }

    public actualizarListaMapeos(unaOrganizacion: IOrganizacion) {

        this.configuracionPrestacionService.get({ organizacion: unaOrganizacion.id }).subscribe(resultado => {
            this.mapeos = resultado;

            if (this.mapeos) {
                this.mapeos.forEach(unMapeo => {
                    unMapeo.organizaciones = unMapeo.organizaciones.filter(unaOrg => unaOrg._id === unaOrganizacion.id);
                });
            }
        });
    }

    public eliminarMapeo(unMapeo) {
    }
}
