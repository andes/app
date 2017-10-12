import { Plex } from '@andes/plex';
import { Component, OnInit, HostBinding, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Server } from '@andes/shared';
import { Auth } from '@andes/auth';
import * as enumerados from './../../utils/enumerados';
// Services
import { UsuarioService } from '../../services/usuarios/usuario.service';
import { ProvinciaService } from './../../services/provincia.service';
import { OrganizacionService } from './../../services/organizacion.service';
import { IOrganizacion } from './../../interfaces/IOrganizacion';
@Component({
    selector: 'usuarioCreate',
    templateUrl: 'usuarioCreate.html',
    styleUrls: ['usuarios.css']
})

export class UsuarioCreateComponent {

    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente
    @Output() data: EventEmitter<string> = new EventEmitter<string>();

    // Propiedades públicas
    public showUpdate = false;
    public unFiltro: any;
    public filtros: any[] = [];
    public documento: number;
    public permisos: any[] = [];
    public nuevoPermiso: string;
    public userModel: any = {
        id: null,
        usuario: '',
        nombre: '',
        apellido: '',
        password: '',
        organizaciones: []
    };

    constructor(private plex: Plex, private server: Server, private usuarioService: UsuarioService,
        private auth: Auth, private provinciaService: ProvinciaService,
        private organizacionService: OrganizacionService) { }


    buscarUsuario() {
        this.usuarioService.getByDni(this.documento).subscribe(user => {
            if (user.length < 1) {
                this.usuarioService.getUser(this.documento.toString()).subscribe(res => {
                    this.userModel.nombre = res.givenName;
                    this.userModel.apellido = res.sn;
                    this.userModel.usuario = res.uid;
                    this.userModel.organizaciones = this.auth.organizaciones;
                    this.showUpdate = true;
                }, err => {
                    this.plex.toast('warning', err, 'Error', 5);
                }
                );
            } else {
                this.userModel.id = user[0].id;
                this.userModel.nombre = user[0].nombre;
                this.userModel.apellido = user[0].apellido;
                this.userModel.usuario = user[0].usuario;
                this.userModel.organizaciones = user[0].organizaciones;
                this.plex.toast('info', 'Usuario existente', 'Información', 5);
                this.showUpdate = true;
            }
        }
        );
    }

    onSave() {
        this.userModel.permisos = this.permisos;
        this.usuarioService.save(this.userModel).subscribe(user => {
            this.plex.toast('success', 'Usuario guardado', '', 5);
            this.data.emit(user);
        });
    }

    onCancel() {
        this.data.emit(null);
    }

    afterCreateUpdate(user) {
        this.data.emit(user);
    }
}
