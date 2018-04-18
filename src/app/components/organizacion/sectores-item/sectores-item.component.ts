import { SnomedService } from '../../../services/term/snomed.service';
import { Plex } from '@andes/plex';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Output, EventEmitter, Input, HostBinding } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { ISectores } from '../../../interfaces/IOrganizacion';

@Component({
    selector: 'sectores-item',
    templateUrl: 'sectores-item.html',
    styleUrls: ['sectores-item.scss']
})
export class SectoresItemComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente

    // definición de arreglos

    public tipos = [
        {id: 'unidad-organizativa', nombre: 'Unidades organizativas'},
        {id: 'sector-fisico', nombre: 'Espacio físico'}
    ];
    public selectTipo: any;

    @Input() root: ISectores;
    @Input() first: Boolean = false;

    public idOrganizacion: String;
    constructor(
        public plex: Plex, private server: Server,
        public snomed: SnomedService,
        private router: Router,
        private route: ActivatedRoute,
    ) { }

    public ambienteHospitalarioQuery: String = '^2391000013102';
    public unidadesOrganizativasQuery: String = '<<284548004';

    ngOnInit() {
        this.selectTipo = this.root.tipo;
    }

    loadTipos($event) {
        $event.callback(this.tipos);
    }

    loadUnidades($event) {
        this.snomed.getQuery({ expression: this.unidadesOrganizativasQuery }).subscribe(result => {
            $event.callback(result);
        });
    }

    loadSectores($event) {
        this.snomed.getQuery({ expression: this.ambienteHospitalarioQuery }).subscribe(result => {
            $event.callback(result);
        });
    }

    onAdd() {
        let item: ISectores = {
            tipo: 'sector-fisico',
            nombre: '',
            concept: { id: '', term: '', conceptId: '', fsn: '',  semanticTag: ''  },
            hijos: []
        };
        if (!this.root.hijos) {
            this.root.hijos = [];
        }
        this.root.hijos.push(item);
        this.root.hijos = [...this.root.hijos];
    }

    onSectorChange() {

    }

    onUnidadChange () {
        this.root.nombre = this.root.concept.term;
    }

    onTipoChange ($event) {
        this.root.tipo = $event.value.id;
    }

}
