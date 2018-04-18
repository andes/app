import { SnomedService } from './../../services/term/snomed.service';
import { Plex } from '@andes/plex';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Output, EventEmitter, Input, HostBinding } from '@angular/core';
import * as enumerados from './../../utils/enumerados';
// Services
import { BarrioService } from './../../services/barrio.service';
import { TipoEstablecimientoService } from './../../services/tipoEstablecimiento.service';
import { OrganizacionService } from './../../services/organizacion.service';
import { PaisService } from './../../services/pais.service';
import { ProvinciaService } from './../../services/provincia.service';
import { LocalidadService } from './../../services/localidad.service';
// Interfaces
import { IPais } from './../../interfaces/IPais';
import { IBarrio } from './../../interfaces/IBarrio';
import { ILocalidad } from './../../interfaces/ILocalidad';
import { IUbicacion } from './../../interfaces/IUbicacion';
import { IEdificio } from './../../interfaces/IEdificio';
import { IDireccion } from './../../interfaces/IDireccion';
import { IContacto } from './../../interfaces/IContacto';
import { IOrganizacion, ISectores } from './../../interfaces/IOrganizacion';
import { ITipoEstablecimiento } from './../../interfaces/ITipoEstablecimiento';
import { IProvincia } from './../../interfaces/IProvincia';
import { Router, ActivatedRoute } from '@angular/router';
import { SectoresItemComponent } from './sectores-item/sectores-item.component';

@Component({
    selector: 'organizacion-sectores',
    templateUrl: 'organizacion-sectores.html'
})
export class OrganizacionSectoresComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente

    // definición de arreglos

    public idOrganizacion: String;
    public organizacion: IOrganizacion;
    constructor(
        private organizacionService: OrganizacionService,
        private tipoEstablecimientoService: TipoEstablecimientoService,
        public plex: Plex, private server: Server,
        public snomed: SnomedService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    public ambienteHospitalarioQuery: String = '<<285201006';
    public unidadesOrganizativasQuery: String = '<<284548004';

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.idOrganizacion = params['id'];
            this.organizacionService.getById(this.idOrganizacion).subscribe(org => {
                this.organizacion = org;
            });
        });
    }

    onAdd() {
        let item: ISectores = {
            tipo: 'unidad-organizativa',
            nombre: '',
            concept: { id: '', term: '', conceptId: '', fsn: '',  semanticTag: ''  },
            hijos: []
        };
        this.organizacion.unidadesOrganizativas.push(item);
        this.organizacion.unidadesOrganizativas = [...this.organizacion.unidadesOrganizativas];
    }

    hasItems () {
        return this.organizacion.unidadesOrganizativas && this.organizacion.unidadesOrganizativas.length > 0;
    }

    onSave() {
        this.organizacionService.save(this.organizacion).subscribe(() => {
            console.log('Todo bien!');
        });
    }

    onCancel() {
        this.router.navigate(['tm/organizacion']);
    }

}
