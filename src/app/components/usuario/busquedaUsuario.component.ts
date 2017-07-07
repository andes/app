import { Plex } from '@andes/plex';
import { Component, OnInit, HostBinding, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Server } from '@andes/shared';
import { Auth } from '@andes/auth';
// Services
import { UsuarioService } from '../../services/usuarios/usuario.service';

@Component({
    selector: 'busquedaUsuario',
    templateUrl: 'busquedaUsuario.html',
    styleUrls: ['usuarios.css']
})

export class BusquedaUsuarioComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente

    private timeoutHandle: number;

    // Propiedades públicas
    public busquedaAvanzada = false;
    public textoLibre: string = null;
    public resultado = null;
    public seleccion = null;
    public loading = false;
    public showCreateUpdate = false;
    public mostrarNuevo = true;
    public autoFocus = 0;
    public users;

    // Eventos
    @Output() selected: EventEmitter<any> = new EventEmitter<any>();

    constructor(private plex: Plex, private server: Server, private usuarioService: UsuarioService, private auth: Auth) {

    }

    public ngOnInit() {
        this.autoFocus = this.autoFocus + 1;
        this.loadUsuarios();
    }


    /**
     * Selecciona un usuario y emite el evento 'selected'
     *
     * @private
     * @param {*} user Usuario para seleccionar
     */
    public seleccionarUsuario(user: any) {
        this.seleccion = user;
        if (user) {
            this.selected.emit(user);
        }
        this.textoLibre = null;
        this.mostrarNuevo = false;
        this.showCreateUpdate = true;
    }

    /**
     * Busca usuario cada vez que el campo de busca cambia su valor
     */
    public loadUsuarios() {
        this.usuarioService.get().subscribe(
            datos => {
                this.users = datos;

            }
        );
    }

    afterCreateUpdate(user) {
        this.showCreateUpdate = false;
        this.mostrarNuevo = true;
        this.seleccion = null;
        this.autoFocus = this.autoFocus + 1;
        this.textoLibre = '';
        if (user) {
            this.resultado = [user];
        }
    }
}
