import { Component, OnInit, OnChanges, AfterViewInit, Input, ViewChildren, QueryList, Output, EventEmitter } from '@angular/core';
import { ArbolPermisosItemComponent } from './arbol-permisos-item.component';

@Component({
    selector: 'arbol-permisos',
    templateUrl: 'arbol-permisos.component.html'
})

export class ArbolPermisosComponent {
    @ViewChildren(ArbolPermisosItemComponent) childsComponents: QueryList<ArbolPermisosItemComponent>;

    @Input() permisos = [];
    @Input() userPermissions = [];
    @Output() change = new EventEmitter();

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
