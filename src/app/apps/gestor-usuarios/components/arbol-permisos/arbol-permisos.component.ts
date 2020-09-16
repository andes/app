import { Component, OnInit, OnChanges, AfterViewInit, Input, ViewChildren, QueryList, Output, EventEmitter } from '@angular/core';
import { ArbolPermisosItemComponent } from './arbol-permisos-item.component';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { Observable } from 'rxjs';
import { Observe } from '@andes/shared';

@Component({
    selector: 'arbol-permisos',
    templateUrl: 'arbol-permisos.component.html'
})

export class ArbolPermisosComponent implements OnInit {
    @ViewChildren(ArbolPermisosItemComponent) childsComponents: QueryList<ArbolPermisosItemComponent>;

    @Input() permisos = [];
    @Input() userPermissions = [];
    @Input() organizacionId;

    @Output() change = new EventEmitter();
    public unidadesOrganizativas$: Observable<any>;
    @Observe({ initial: [] }) unidadesOrganizativas;

    constructor(private organizacionService: OrganizacionService) { }

    ngOnInit() {
        if (this.organizacionId) {
            this.organizacionService.unidadesOrganizativas(this.organizacionId).subscribe((data) => {
                this.unidadesOrganizativas = data;
            });
        }
    }

    public getPermisos() {
        let permisos = [];
        this.childsComponents.forEach(child => {
            permisos = [...permisos, ...child.generateString()];
        });
        return permisos;
    }

    public onChange() {
        this.change.emit();
    }
}
