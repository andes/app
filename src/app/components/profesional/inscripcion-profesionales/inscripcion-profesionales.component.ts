import { Plex } from '@andes/plex';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuarios/usuario.service';
import { UsuariosHttp } from '../../../apps/gestor-usuarios/services/usuarios.http';
import { ProfesionalService } from '../../../services/profesional.service';
import { getObjSexos } from '../../../utils/enumerados';
import { certificadosProfesionalesCovid } from '../../../utils/permisos/permisos-update.component';


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

  constructor(
    private profesionalService: ProfesionalService,
    private usuariosHttp: UsuariosHttp,
    private usuarioService: UsuarioService,
    private plex: Plex,
    private router: Router
  ) { }

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
    }).subscribe(datos => {
      if (datos.errMsg) {
        this.plex.info('danger', datos.errMsg, 'Sus datos no pudieron ser validados');
        this.enProceso = false;
        this.profesional.recaptcha = '';
      } else {
        this.profesional.id = datos.id;
        this.profesional.nombre = datos.nombre;
        this.profesional.apellido = datos.apellido;
        this.contactos = datos.contactos;
        const datosMatricula: any = this.getMatricula(datos);
        this.profesional.nombreCompleto = datos.nombreCompleto;
        this.profesional.fechaNacimiento = moment(datos.fechaNacimiento).format('L');
        this.profesional.matricula = datosMatricula.numeroMatricula;
        this.profesional.profesion = datosMatricula.profesion;
        this.profesional.email = datos.contactos ? this.getEmail(datos.contactos) : '';
        this.profesional.telefono = datos.contactos ? this.getTelefono(datos.contactos) : '';
        this.profesional.estaMatriculado = Object.keys(datosMatricula).length ? true : false;
        this.profesional.caducidadMatricula = datosMatricula?.fechaFin;
        this.estaValidado = true;
        this.enProceso = false;
      }
    });
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
    const email: any = contacto.filter(elem => elem.tipo === 'email');
    return (email.length ? email[0].valor : null);
  }

  getTelefono(contacto: Array<any>) {
    const telefono: any = contacto.filter(elem => elem.tipo === 'celular');
    return (telefono.length ? telefono[0].valor : null);
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
        ultimaMatricula = especialidad.matriculacion[especialidad.matriculacion.length - 1];
        if (ultimaMatricula.fin > new Date()) {
          resultado['numeroMatricula'] = ultimaMatricula.matriculaNumero;
          resultado['profesion'] = especialidad.profesion.nombre;
          resultado['fechaFin'] = ultimaMatricula.fin;
        }
      }
    }
    return resultado;
  }

  verificarUsuario() {
    this.usuariosHttp.find({ documento: this.profesional.documento }).subscribe(user => {
      this.user = user;
      this.existeUsuario = user.length ? true : false;
    });
  }

  agregarPermisos() {
    this.enProceso = true;
    const permisos = certificadosProfesionalesCovid;
    this.usuarioService.updateUsuario(this.user[0]._id, permisos).subscribe(user => {
      if (user) {
        const contactoProfesional = this.updateContactos();
        this.profesionalService.actualizarProfesional({ id: this.profesional.id, contactos: contactoProfesional }).subscribe((res) => {
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
      permisos: certificadosProfesionalesCovid
    };
    this.usuarioService.createUsuario(newUser).subscribe(user => {
      if (user) {
        const contactoProfesional = this.updateContactos();
        this.profesionalService.actualizarProfesional({ id: this.profesional.id, contactos: contactoProfesional }).subscribe((res) => {
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
    const telFijo = this.contactos.filter(contacto => contacto.tipo === 'fijo');
    if (telFijo[0]) {
      nuevoContacto.push(telFijo[0]);
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
}
