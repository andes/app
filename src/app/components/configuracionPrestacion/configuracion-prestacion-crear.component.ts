import { Component, OnInit, HostBinding, Output, EventEmitter } from '@angular/core';
import { OrganizacionService } from './../../services/organizacion.service';
import { ConfiguracionPrestacionService } from './../../services/term/configuracionPrestacion.service';
import { TipoPrestacionService } from './../../services/tipoPrestacion.service';
import { PrestacionLegacyService } from './../../services/prestacionLegacy.service';
import { IOrganizacion } from '../../interfaces/IOrganizacion';
import { Plex } from '@andes/plex';

@Component({
    selector: 'configuracion-prestacion-crear',
    templateUrl: 'configuracion-prestacion-crear.html',
    // styleUrls: ['configuracion-prestacion-crear.css']
})
export class ConfiguracionPrestacionCrearComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente

    public organizaciones: IOrganizacion[] = [];
    public tipoPrestaciones: any[] = [];    // conceptoTurneable
    public especialidades: any[] = [];  // prestacionesLegacy
    public organizacion: IOrganizacion = null;
    public tipoPrestacion = null;
    public especialidad = null;


    @Output() data: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor(
        public plex: Plex,
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
        if (unaOrganizacion && unTipoPrestacion && unaEspecialidad) {
            let nuevaCP = { organizacion: unaOrganizacion, conceptSnomed: unTipoPrestacion, prestacionLegacy: unaEspecialidad };
            this.configuracionPrestacionService.post(nuevaCP).subscribe(resultado => {
                this.plex.toast('success', '', 'Mapeo agregado exitosamente');
                this.data.emit(unaOrganizacion);
            });
        }
    }

    public botonVolver() {
        this.data.emit(false);
    }
}
