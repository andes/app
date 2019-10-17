import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { IUsuario } from '../../interfaces/IUsuario';
import { ProfesionalService } from '../../../../services/profesional.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { IProfesional } from '../../../../interfaces/IProfesional';

function elementAt(index = 0) {
    return map((array: any[]) => array.length ? array[0] : null);
}

@Component({
    selector: 'gestor-usarios-usuario-detalle',
    templateUrl: 'usuario-detalle.component.html'
})

export class UsuarioDetalleComponent implements OnInit, OnChanges {
    private usuario$ = new BehaviorSubject<IUsuario>(null);
    public profesional$: Observable<IProfesional>;
    @Input() usuario: IUsuario;

    constructor(
        private profesionalService: ProfesionalService
    ) {
        this.profesional$ = this.usuario$.pipe(
            switchMap((user: IUsuario) => {
                return this.getProfesional(user);
            }),
            elementAt()
        );
    }

    ngOnChanges(changes: { [key: string]: SimpleChange }) {
        if (changes.hasOwnProperty('usuario')) {
            this.usuario$.next(changes['usuario'].currentValue);
        }
    }

    getProfesional(user) {
        return this.profesionalService.get({
            documento: user.usuario,
            fields: 'nombre'
        });
    }

    ngOnInit() {

    }
}
