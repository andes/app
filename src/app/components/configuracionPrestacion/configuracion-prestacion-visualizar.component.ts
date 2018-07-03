import { Component, OnInit, HostBinding } from '@angular/core';
import { OrganizacionService } from './../../services/organizacion.service';
import { ConfiguracionPrestacionService } from './../../services/term/configuracionPrestacion.service';
import { IOrganizacion } from '../../interfaces/IOrganizacion';

@Component({
    selector: 'configuracion-prestacion-visualizar',
    templateUrl: 'configuracion-prestacion-visualizar.html',
})
export class ConfiguracionPrestacionVisualizarComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente

    public organizaciones: IOrganizacion[] = [];
    public mapeos: any[] = [];
    public showCrear = false;

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
        let query = null;
        if (unMapeo.organizaciones[0].idEspecialidad) {
            query = { 'idOrganizacion': unMapeo.organizaciones[0].id, 'conceptIdSnomed': unMapeo.snomed.conceptId, 'idEspecialidad': unMapeo.organizaciones[0].idEspecialidad };
        }
        if (unMapeo.organizaciones[0].codigo) {
            query = { idOrganizacion: unMapeo.organizaciones[0].id, conceptIdSnomed: unMapeo.snomed.conceptId, codigo: unMapeo.organizaciones[0].codigo };
        }
        this.configuracionPrestacionService.put(query).subscribe(resultado => {
            console.log('service: ', resultado);
        });
    }

    public mostrarCrearMapeo() {
        this.showCrear = true;
    }
}
