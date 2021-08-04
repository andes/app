import { Plex } from '@andes/plex';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuarios/usuario.service';
import { captcha } from 'src/environments/apiKeyMaps';
import { UsuariosHttp } from '../../../apps/gestor-usuarios/services/usuarios.http';
import { ProfesionalService } from '../../../services/profesional.service';
import { getObjSexos } from '../../../utils/enumerados';


@Component({
    selector: 'app-inscripcion-profesionales',
    templateUrl: './inscripcion-profesionales.component.html'
})
export class InscripcionProfesionalesComponent implements OnInit {

    public aceptaPermisos = false;
    public existeUsuario = false;
    public sexos = [];
    public contactos = [];
    public recaptcha = null;
    public enProceso = false;
    public token = '';
    public captchaEnabled = true;
    public infoNroTramite = false;
    public profesional = {
        id: '',
        documento: '',
        nombre: '',
        apellido: '',
        sexo: null,
        nroTramite: '',
        recaptcha: '',
        nombreCompleto: '',
        fechaNacimiento: null,
        matricula: '',
        profesion: '',
        email: '',
        telefono: '',
        estaMatriculado: null,
        caducidadMatricula: ''
    };
    public estaValidado = false;
    public user = null;
    private tipoPermisos = 'certificadosCovid19';

    constructor(
        private profesionalService: ProfesionalService,
        private usuariosHttp: UsuariosHttp,
        private usuarioService: UsuarioService,
        private plex: Plex,
        private router: Router
    ) {
        this.captchaEnabled = captcha.enabled;
    }

    ngOnInit(): void {
        this.sexos = getObjSexos();
    }

    getProfesional() {
        this.enProceso = true;
        this.recaptcha = '';
        this.profesionalService.validarProfesional({
            documento: this.profesional.documento,
            sexo: this.profesional.sexo.id,
            nroTramite: this.profesional.nroTramite
        }).subscribe(
            (datos) => {
                if (datos.profesional) {
                    this.token = datos.token;
                    this.profesional.id = datos.profesional.id;
                    this.profesional.nombre = datos.profesional.nombre;
                    this.profesional.apellido = datos.profesional.apellido;
                    this.contactos = datos.profesional.contactos;
                    const datosMatricula: any = this.getMatricula(datos.profesional);
                    this.profesional.nombreCompleto = datos.profesional.nombreCompleto;
                    this.profesional.fechaNacimiento = moment(datos.profesional.fechaNacimiento).format('L');
                    this.profesional.matricula = datosMatricula.numeroMatricula;
                    this.profesional.profesion = datosMatricula.profesion;
                    this.profesional.email = datos.profesional.contactos ? this.getEmail(datos.profesional.contactos) : '';
                    this.profesional.telefono = datos.profesional.contactos ? this.getTelefono(datos.profesional.contactos) : '';
                    this.profesional.estaMatriculado = Object.keys(datosMatricula).length ? true : false;
                    this.profesional.caducidadMatricula = datosMatricula?.fechaFin;
                    this.estaValidado = true;
                    this.enProceso = false;
                }
            },
            (error) => {
                this.plex.info('danger', error, 'Sus datos no pudieron ser validados');
                this.enProceso = false;
                this.profesional.recaptcha = '';
            }
        );
    }

    resolved(captchaResponse: any[]) {
        this.recaptcha = captchaResponse;
        this.profesional.recaptcha = this.recaptcha;
    }

    resetForm() {
        this.profesional = {
            id: '',
            documento: '',
            nombre: '',
            apellido: '',
            sexo: null,
            nroTramite: '',
            recaptcha: '',
            nombreCompleto: '',
            fechaNacimiento: null,
            matricula: '',
            profesion: '',
            email: '',
            telefono: '',
            estaMatriculado: null,
            caducidadMatricula: ''
        };
        this.estaValidado = false;
        this.aceptaPermisos = false;
    }

    getEmail(contacto: Array<any>) {
        const email: any = contacto.find(elem => elem.tipo === 'email');
        return (email ? email.valor : null);
    }

    getTelefono(contacto: Array<any>) {
        const telefono: any = contacto.find(elem => elem.tipo === 'celular');
        return (telefono ? telefono.valor : null);
    }

    getMatricula(profesional) {
        let resultado = {};
        let ultimaEspecialidad;
        let especialidad;
        let ultimaMatricula;
        if (profesional.formacionPosgrado?.length) {
            ultimaEspecialidad = profesional.formacionPosgrado.length - 1;
            especialidad = profesional.formacionPosgrado[ultimaEspecialidad];
            ultimaMatricula = especialidad.matriculacion[especialidad.matriculacion.length - 1];
            if (ultimaMatricula.fin > new Date()) {
                resultado['numeroMatricula'] = ultimaMatricula.matriculaNumero;
                resultado['profesion'] = especialidad.especialidad.nombre;
                resultado['fechaFin'] = ultimaMatricula.fin;

            } else {
                ultimaEspecialidad = profesional.formacionGrado.length - 1;
                especialidad = profesional.formacionGrado[ultimaEspecialidad];
                ultimaMatricula = especialidad.matriculacion[especialidad.matriculacion.length - 1];
                if (ultimaMatricula.fin > new Date()) {
                    resultado['numeroMatricula'] = ultimaMatricula.matriculaNumero;
                    resultado['profesion'] = especialidad.profesion.nombre;
                    resultado['fechaFin'] = ultimaMatricula.fin;
                }
            }
        } else {
            if (profesional.formacionGrado?.length) {
                ultimaEspecialidad = profesional.formacionGrado.length - 1;
                especialidad = profesional.formacionGrado[ultimaEspecialidad];
                if (especialidad.matriculado) {
                    ultimaMatricula = especialidad.matriculacion[especialidad.matriculacion.length - 1];
                    if (ultimaMatricula.fin > new Date()) {
                        resultado['numeroMatricula'] = ultimaMatricula.matriculaNumero;
                        resultado['profesion'] = especialidad.profesion.nombre;
                        resultado['fechaFin'] = ultimaMatricula.fin;
                    }
                }
            }
        }
        return resultado;
    }

    verificarUsuario() {
        this.usuariosHttp.find({ documento: this.profesional.documento, token: this.token }).subscribe(user => {
            this.user = user;
            this.existeUsuario = user.length ? true : false;
        });
    }

    agregarPermisos() {
        this.enProceso = true;
        this.usuarioService.updateUsuarioPermisos(this.user[0]._id, this.tipoPermisos, { token: this.token }).subscribe(user => {
            if (user) {
                const contactoProfesional = this.updateContactos();
                this.profesionalService.actualizarProfesional({ id: this.profesional.id, contactos: contactoProfesional }, { token: this.token }).subscribe((res) => {
                    if (res) {
                        this.enProceso = false;
                        this.plex.info('success', 'Sus permisos fueron actualizado correctamente', 'Se encuentra autorizado para generar certificados COVID19');
                        this.resetForm();
                    }
                });
            }
        });
    }

    createUser() {
        this.enProceso = true;
        const newUser = {
            documento: this.profesional.documento,
            nombre: this.profesional.nombre,
            apellido: this.profesional.apellido,
            email: this.profesional.email,
            tipoPermisos: this.tipoPermisos
        };
        this.usuarioService.createUsuario(newUser, { token: this.token }).subscribe(user => {
            if (user) {
                const contactoProfesional = this.updateContactos();
                this.profesionalService.actualizarProfesional({ id: this.profesional.id, contactos: contactoProfesional }, { token: this.token }).subscribe((res) => {
                    if (res) {
                        this.plex.info('success', `Un email a ${newUser.email} fue enviado con sus datos de inicio de sesión`, 'Su usuario fue creado correctamente');
                        this.enProceso = false;
                        this.resetForm();
                    }
                });
            }
        });
    }

    updateContactos() {
        let nuevoContacto = [];
        const telFijo = this.contactos.find(contacto => contacto.tipo === 'fijo');
        if (telFijo) {
            nuevoContacto.push(telFijo);
        }
        if (this.profesional.email) {
            nuevoContacto.push({ tipo: 'email', valor: this.profesional.email, activo: true });
        }
        if (this.profesional.telefono) {
            nuevoContacto.push({ tipo: 'celular', valor: this.profesional.telefono, activo: true });
        }
        return nuevoContacto;
    }

    renovarMatricula() {
        this.router.navigate(['matriculaciones']);
    }

    infoTramite() {
        this.infoNroTramite = !this.infoNroTramite;
    }
}
