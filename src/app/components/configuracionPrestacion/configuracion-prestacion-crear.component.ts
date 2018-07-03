import { Component, OnInit, HostBinding } from '@angular/core';
import { OrganizacionService } from './../../services/organizacion.service';
import { ConfiguracionPrestacionService } from './../../services/term/configuracionPrestacion.service';
import { TipoPrestacionService } from './../../services/tipoPrestacion.service';
import { PrestacionLegacyService } from './../../services/prestacionLegacy.service';
import { IOrganizacion } from '../../interfaces/IOrganizacion';

@Component({
    selector: 'configuracion-prestacion-crear',
    templateUrl: 'configuracion-prestacion-crear.html',
})
export class ConfiguracionPrestacionCrearComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente

    public organizaciones: IOrganizacion[] = [];
    public tipoPrestaciones: any[] = [];    // conceptoTurneable
    public especialidades: any[] = [];  // prestacionesLegacy


    constructor(
        private organizacionService: OrganizacionService,
        private tipoPrestacionService: TipoPrestacionService,
        private prestacionLegacyService: PrestacionLegacyService,
        private configuracionPrestacionService: ConfiguracionPrestacionService) { }


    ngOnInit() {
        this.organizacionService.get({}).subscribe(resultado => {
            this.organizaciones = resultado;
        });

        this.tipoPrestacionService.get({}).subscribe(resultado => {
            this.tipoPrestaciones = resultado;
        });

        this.prestacionLegacyService.get({}).subscribe(resultado => {
            this.especialidades = resultado;
        });
    }

    public agregarNuevoMapeo(unaOrganizacion, unTipoPrestacion, unaEspecialidad) {
        let nuevaCP = /*JSON.parse(JSON.stringify(*/{ organizacion: unaOrganizacion, conceptSnomed: unTipoPrestacion, prestacionLegacy: unaEspecialidad }/*)))*/;
        console.log(nuevaCP);
        this.configuracionPrestacionService.post(nuevaCP).subscribe(resultado => {
            return resultado;
        });
    }
}
