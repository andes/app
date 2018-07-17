import { Component, OnInit, HostBinding } from '@angular/core';
import { OrganizacionService } from './../../services/organizacion.service';
import { ConfiguracionPrestacionService } from './../../services/term/configuracionPrestacion.service';
import { IOrganizacion } from '../../interfaces/IOrganizacion';
import { Plex } from '@andes/plex';

@Component({
    selector: 'configuracion-prestacion-visualizar',
    templateUrl: 'configuracion-prestacion-visualizar.html',
})
export class ConfiguracionPrestacionVisualizarComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente

    public organizaciones: IOrganizacion[] = [];
    public organizacionSelect;
    public mapeos: any[] = [];
    public showCrear = false;

    constructor(
        public plex: Plex,
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
        this.plex.confirm('¿Eliminar mapeo con ' + unMapeo.organizaciones[0].nombreEspecialidad + '?').then(value => {
            if (value) {
                if (unMapeo) {
                    this.configuracionPrestacionService.put({ idTipoPrestacion: unMapeo.id, idOrganizacion: unMapeo.organizaciones[0].id }).subscribe(respuesta => {
                        if (respuesta) {
                            let index = this.mapeos.findIndex(elem => elem._id === unMapeo.id);
                            this.mapeos.splice(index, 1);
                        }
                    });
                }
            }
        });
    }

    public mostrarCrearMapeo(bool) {
        this.showCrear = bool;
    }

    public afterCrearMapeo(unaOrganizacion) {
        if (unaOrganizacion) {
            this.actualizarListaMapeos(unaOrganizacion);
            this.organizacionSelect = unaOrganizacion;
        }
        this.showCrear = false;
    }
}
