import { Plex } from '@andes/plex';
import { Component, Input, OnChanges, SimpleChange } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IProfesional } from '../../../../interfaces/IProfesional';
import { ProfesionalService } from '../../../../services/profesional.service';
import { IUsuario } from '../../interfaces/IUsuario';
import { UsuariosHttp } from '../../services/usuarios.http';
import { Auth } from '@andes/auth';

@Component({
    selector: 'gestor-usuarios-usuario-detalle',
    templateUrl: 'usuario-detalle.html',
    styleUrls: ['usuario-detalle.scss']
})

export class UsuarioDetalleComponent implements OnChanges {
    private usuario$ = new BehaviorSubject<IUsuario>(null);

    @Input() usuario: IUsuario;

    public profesional: IProfesional;
    public email;
    public activate;
    public editable;

    constructor(
        private profesionalService: ProfesionalService,
        private usuariosHttp: UsuariosHttp,
        private auth: Auth,
        public plex: Plex,
    ) { }

    ngOnChanges(changes: { [key: string]: SimpleChange }) {
        if (changes.hasOwnProperty('usuario')) {
            this.usuario$.next(changes['usuario'].currentValue);
        }

        this.getProfesional(this.usuario.documento).subscribe((profesional) => {
            const permission = this.auth.getPermissions('usuarios:?');
            const profesionalHabilitado = profesional.find(prof => prof.habilitado === true);
            this.profesional = profesionalHabilitado || profesional[0];
            this.editable = (permission.includes('cuenta') || permission.includes('*')) && !!profesional[0]?.id;
        });

        this.email = this.usuario.email;
    }

    getProfesional(documento) {
        return this.profesionalService.get({
            documento,
            fields: 'id habilitado documento nombre apellido profesionalMatriculado formacionGrado matriculaExterna profesionExterna'
        });
    }

    enviarActivacion() {
        this.auth.setValidationTokenAndNotify(this.usuario.usuario).subscribe(
            data => {
                if (data.status === 'ok') {
                    this.plex.info('success', 'Hemos enviado un e-mail para regenerar su contraseña');
                } else {
                    this.plex.info('danger', 'No se ha podido enviar el email de activación. <br>Por favor, vuelva a intentar');
                }
            }
        );
    }

    onEditarUsuario() {
        return this.usuariosHttp.update(this.usuario.documento, {
            email: this.email
        }).subscribe(() => {
            this.usuario.email = this.email;
            this.plex.toast('success', 'Usuario modificado exitosamente');

            if (this.activate) {
                this.enviarActivacion();
            }
        });
    }
}
