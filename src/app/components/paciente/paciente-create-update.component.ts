import { ParentescoService } from './../../services/parentesco.service';
import { DocumentoEscaneado, DocumentoEscaneados } from './documento-escaneado.const';
import { Server } from '@andes/shared';
import { IUbicacion } from './../../interfaces/IUbicacion';
import { PacienteSearch } from './../../services/pacienteSearch.interface';
import { IContacto } from './../../interfaces/IContacto';
import { FinanciadorService } from './../../services/financiador.service';
import { IDireccion } from './../../interfaces/IDireccion';
import { IBarrio } from './../../interfaces/IBarrio';
import { ILocalidad } from './../../interfaces/ILocalidad';
import { IPais } from './../../interfaces/IPais';
import { IFinanciador } from './../../interfaces/IFinanciador';
import { Observable } from 'rxjs/Rx';
import { BarrioService } from './../../services/barrio.service';
import { LocalidadService } from './../../services/localidad.service';
import { ProvinciaService } from './../../services/provincia.service';
import { PaisService } from './../../services/pais.service';
import { PacienteService } from './../../services/paciente.service';
import * as enumerados from './../../utils/enumerados';
import { IPaciente } from './../../interfaces/IPaciente';
import { IProvincia } from './../../interfaces/IProvincia';
import { FechaPipe } from './../../pipes/fecha.pipe';
import { Plex } from '@andes/plex';
import { MapsComponent } from './../../utils/mapsComponent';
import * as moment from 'moment';
import { PacientePipe } from './../../pipes/paciente.pipe';
import { EdadPipe } from './../../pipes/edad.pipe';

import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators
} from '@angular/forms';
import {
  DomSanitizer,
  SafeHtml
} from '@angular/platform-browser';
import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter,
  HostBinding
} from '@angular/core';


@Component({
  selector: 'paciente-create-update',
  templateUrl: 'paciente-create-update.html',
  styleUrls: ['paciente-create-update.css']
})
export class PacienteCreateUpdateComponent implements OnInit {
  @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
  @Input('seleccion') seleccion: IPaciente;
  @Input('isScan') isScan: IPaciente;
  @Input('escaneado') escaneado: Boolean;
  @Output() data: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

  foto:string='';
  estados = [];
  sexos: any[];
  generos: any[];
  estadosCiviles: any[];
  tipoComunicacion: any[];
  relacionTutores: any[];
  relacionesBorradas: any[];

  provincias: IProvincia[] = [];
  obrasSociales: IFinanciador[] = [];
  pacientesSimilares = [];
  barriosNeuquen: any[];
  localidadesNeuquen: any[];

  paisArgentina = null;
  provinciaNeuquen = null;
  localidadNeuquen = null;
  unSexo = null;
  unEstadoCivil = null;
  unGenero = null;

  error = false;
  mensaje = '';
  validado = false;
  noPoseeDNI = false;
  noPoseeContacto = false;
  disableGuardar = false;
  enableIgnorarGuardar = false;
  sugerenciaAceptada = false;
  entidadValidadora = '';
  viveEnNeuquen = false;
  viveProvNeuquen = false;
  posibleDuplicado = false;
  altoMacheo = false;
  buscarPacRel = '';
  timeoutHandle: number;
  PacientesRel = null;
  loading = false;
  esEscaneado = false;
  nuevaNota = '';
  autoFocus = 0;
  hoy = new Date();

  contacto: IContacto = {
    tipo: 'celular',
    valor: '',
    ranking: 0,
    activo: true,
    ultimaActualizacion: new Date()
  };

  direccion: IDireccion = {
    valor: '',
    codigoPostal: '',
    ubicacion: {
      pais: null,
      provincia: null,
      localidad: null,
      barrio: null,
    },
    ranking: 0,
    geoReferencia: null,
    ultimaActualizacion: new Date(),
    activo: true
  };

  showCargar: boolean;

  pacienteModel: IPaciente = {
    id: null,
    documento: '',
    activo: true,
    estado: 'temporal',
    nombre: '',
    apellido: '',
    nombreCompleto: '',
    alias: '',
    contacto: [this.contacto],
    sexo: undefined,
    genero: undefined,
    fechaNacimiento: null, // Fecha Nacimiento
    edad: null,
    edadReal: null,
    fechaFallecimiento: null,
    direccion: [this.direccion],
    estadoCivil: undefined,
    // Foto default
    foto: '',
    relaciones: null,
    financiador: null,
    identificadores: null,
    claveBlocking: null,
    entidadesValidadoras: [this.entidadValidadora],
    scan: null,
    reportarError: false,
    notaError: ''
  };

  constructor(private formBuilder: FormBuilder, private _sanitizer: DomSanitizer,
    private paisService: PaisService,
    private provinciaService: ProvinciaService,
    private localidadService: LocalidadService,
    private barrioService: BarrioService,
    private pacienteService: PacienteService,
    private parentescoService: ParentescoService,
    private financiadorService: FinanciadorService, public plex: Plex, private server: Server) { }

  ngOnInit() {


    // Se cargan los combos
    this.financiadorService.get().subscribe(resultado => {
      this.obrasSociales = resultado;
    });

    this.relacionesBorradas = [];

    // Se cargan los parentescos para las relaciones
    this.parentescoService.get().subscribe(resultado => {
      this.relacionTutores = resultado;
    });

    // Set País Argentina
    this.paisService.get({
      nombre: 'Argentina'
    }).subscribe(arg => {
      this.paisArgentina = arg[0];
    });

    // Cargamos todas las provincias
    this.provinciaService.get({}).subscribe(rta => {
      this.provincias = rta;
    });

    this.provinciaService.get({
      nombre: 'Neuquén'
    }).subscribe(Prov => {
      this.provinciaNeuquen = Prov[0];
    });

    this.localidadService.get({
      nombre: 'Neuquén'
    }).subscribe(Loc => {
      this.localidadNeuquen = Loc[0];
    });

    // Se cargan los enumerados
    this.showCargar = false;
    this.sexos = enumerados.getObjSexos();
    this.generos = enumerados.getObjGeneros();
    this.estadosCiviles = enumerados.getObjEstadoCivil();
    this.tipoComunicacion = enumerados.getObjTipoComunicacion();
    this.estados = enumerados.getEstados();
    /*this.relacionTutores = enumerados.getObjRelacionTutor();*/

    if (this.seleccion) {
      this.actualizarDatosPaciente();
      if (this.seleccion.id) {
        // Busco el paciente en mongodb (caso que no este en mongo y si en elastic server)
        this.pacienteService.getById(this.seleccion.id)
          .subscribe(resultado => {
            if (resultado) {
              if (!resultado.scan) {
                resultado.scan = this.seleccion.scan;
              }
              if (this.escaneado && resultado.estado !== 'validado') {
                resultado.nombre = this.seleccion.nombre.toUpperCase();
                resultado.apellido = this.seleccion.apellido.toUpperCase();
                resultado.fechaNacimiento = this.seleccion.fechaNacimiento;
                resultado.sexo = this.seleccion.sexo;
                resultado.documento = this.seleccion.documento;
              }
              this.seleccion = Object.assign({}, resultado);
              
              
            }
            this.actualizarDatosPaciente();

          });
      }
      if (this.seleccion.notas && this.seleccion.notas.length) {
        this.mostrarNotas();
      }
    }
  }

  actualizarDatosPaciente() {
    if (this.escaneado) {
      this.validado = true;
      this.seleccion.estado = 'validado';
      if (this.seleccion.entidadesValidadoras) {
        if (this.seleccion.entidadesValidadoras.length <= 0) {
          // Caso que el paciente existe y no tiene ninguna entidad validadora e ingresó como validado
          this.seleccion.entidadesValidadoras.push('RENAPER');
        } else {
          let validador = this.seleccion.entidadesValidadoras.find(entidad => entidad === 'RENAPER');
          if (!validador) {
            this.seleccion.entidadesValidadoras.push('RENAPER');
          }
        }
      } else {
        // El caso que el paciente no existe
        this.seleccion.entidadesValidadoras = ['RENAPER'];
      }

    } else {
      if (this.seleccion.estado !== 'validado') {
        this.validado = false;
        this.seleccion.estado = 'temporal';
      } else {
        this.validado = true;
      }
    }

    if (this.seleccion.contacto) {
      if (this.seleccion.contacto.length <= 0) {
        this.seleccion.contacto[0] = this.contacto;
      }
    } else {
      this.seleccion.contacto = [this.contacto];
    }

    if (this.seleccion.direccion) {
      if (this.seleccion.direccion.length <= 0) {
        // Si la dirección existe pero esta vacía, completamos la 1er posición del arreglo con el schema default de dirección
        this.seleccion.direccion[0] = this.direccion;
      } else {
        if (this.seleccion.direccion[0].ubicacion) {
          if (this.seleccion.direccion[0].ubicacion.provincia !== null) {
            (this.seleccion.direccion[0].ubicacion.provincia.nombre === 'Neuquén') ? this.viveProvNeuquen = true : this.viveProvNeuquen = false;
            this.loadLocalidades(this.seleccion.direccion[0].ubicacion.provincia);
          }
          if (this.seleccion.direccion[0].ubicacion.localidad !== null) {
            (this.seleccion.direccion[0].ubicacion.localidad.nombre === 'Neuquén') ? this.viveEnNeuquen = true : this.viveEnNeuquen = false;
            this.loadBarrios(this.seleccion.direccion[0].ubicacion.localidad);
          }
        }
        if (!this.seleccion.reportarError) {
          this.seleccion.reportarError = false;
        }

      }
    } else {
      // Si no tenia dirección se le asigna el arreglo con el schema default
      this.seleccion.direccion = [this.direccion];
    }

    this.pacienteModel = Object.assign({}, this.seleccion);
    if (!this.seleccion.foto) {
        //Seteo una foto default
        this.pacienteModel.foto = 'data:image/jpeg;base64,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';
    }
    this.pacienteModel.genero = this.pacienteModel.genero ? this.pacienteModel.genero : this.pacienteModel.sexo;

  }

  mostrarNotas() {
    let texto: any;
    this.seleccion.notas.forEach(nota => {
      texto = nota.nota;
      if (nota.destacada) {
        this.plex.toast('info', texto);
      }
    });
  }

  loadProvincias(event, pais) {
    if (pais && pais.id) {
      this.provinciaService.get({
        'pais': pais.id
      }).subscribe(event.callback);
    }
  }

  loadLocalidades(provincia) {
    if (provincia && provincia.id) {
      this.localidadService.get({
        'provincia': provincia.id
      }).subscribe(result => {
        this.localidadesNeuquen = [...result];
      });
    }
  }

  loadBarrios(localidad) {
    if (localidad && localidad.id) {
      this.barrioService.get({
        'localidad': localidad.id,
      }).subscribe(result => { this.barriosNeuquen = [...result]; });
    }
  }
  /**
   * Change del plex-bool viveProvNeuquen
   * carga las localidades correspondientes a Neuquén
   * @param {any} event
   *
   * @memberOf PacienteCreateUpdateComponent
   */
  changeProvNeuquen(event) {
    if (event.value) {
      this.loadLocalidades(this.provinciaNeuquen);
    } else {
      this.viveEnNeuquen = false;
      this.changeLocalidadNeuquen(false);
      this.localidadesNeuquen = [];
    }

  }
  /**
   * Change del plex-bool viveNQN
   * carga los barrios de Neuquén
   * @param {any} event
   *
   * @memberOf PacienteCreateUpdateComponent
   */
  changeLocalidadNeuquen(event) {
    if (event.value) {
      this.loadBarrios(this.localidadNeuquen);
    } else {
      this.barriosNeuquen = [];
    }
  }

  completarGenero() {
    if (!this.pacienteModel.genero) {
      this.pacienteModel.genero = ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id);
    }
  }

  limpiarDocumento() {
    if (this.noPoseeDNI) {
      this.pacienteModel.documento = '';
      this.plex.alert('Recuerde que al guardar un paciente sin el número de documento será imposible realizar validaciones contra fuentes auténticas.');
    }
  }
  limpiarContacto() {
    if (this.noPoseeContacto) {
      this.pacienteModel.contacto = [this.contacto];
    }
  }
  save(valid) {
    if (valid.formValid) {
      let pacienteGuardar = Object.assign({}, this.pacienteModel);

      pacienteGuardar.sexo = ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id);
      pacienteGuardar.estadoCivil = this.pacienteModel.estadoCivil ? ((typeof this.pacienteModel.estadoCivil === 'string')) ? this.pacienteModel.estadoCivil : (Object(this.pacienteModel.estadoCivil).id) : null;
      pacienteGuardar.genero = this.pacienteModel.genero ? ((typeof this.pacienteModel.genero === 'string')) ? this.pacienteModel.genero : (Object(this.pacienteModel.genero).id) : undefined;

      pacienteGuardar.contacto.map(elem => {
        elem.tipo = ((typeof elem.tipo === 'string') ? elem.tipo : (Object(elem.tipo).id));
        return elem;
      });
      if (pacienteGuardar.financiador) {
        pacienteGuardar.financiador.map((elem: any) => {
          delete elem.entidad.$order;
          return elem;
        });
      }

      // Luego aquí habría que validar pacientes de otras prov. y paises (Por ahora solo NQN)
      pacienteGuardar.direccion[0].ubicacion.pais = this.paisArgentina;

      if (this.viveProvNeuquen) {
        pacienteGuardar.direccion[0].ubicacion.provincia = this.provinciaNeuquen;
      }

      if (this.viveEnNeuquen) {
        pacienteGuardar.direccion[0].ubicacion.localidad = this.localidadNeuquen;
      }

      if (this.altoMacheo) {
        this.server.post('/core/log/mpi/macheoAlto', { data: { pacienteScan: this.pacienteModel } }, { params: null, showError: false }).subscribe(() => { });
      }

      if (this.posibleDuplicado) {
        this.server.post('/core/log/mpi/posibleDuplicado', { data: { pacienteScan: this.pacienteModel } }, { params: null, showError: false }).subscribe(() => { });
      }

      let operacionPac: Observable<IPaciente>;

      operacionPac = this.pacienteService.save(pacienteGuardar);
      operacionPac.subscribe(result => {

        if (result) {
          // Borramos relaciones
          if (this.relacionesBorradas.length > 0) {
            this.relacionesBorradas.forEach(rel => {
              let relacionOpuesta = this.relacionTutores.find((elem) => {
                if (elem.nombre === rel.relacion.opuesto) {
                  return elem;
                }
              });
              let dto = {
                relacion: relacionOpuesta,
                referencia: pacienteGuardar.id,
              };
              if (rel.referencia) {
                this.pacienteService.patch(rel.referencia, {
                  'op': 'deleteRelacion', 'dto': dto
                }).subscribe(result2 => {
                  console.log('RESULT PATCH--------', result2);
                });
              }
            });
          }
          // agregamos las relaciones opuestas
          if (pacienteGuardar.relaciones && pacienteGuardar.relaciones.length > 0) {
            pacienteGuardar.relaciones.forEach(rel => {
              let relacionOpuesta = this.relacionTutores.find((elem) => {
                if (elem.nombre === rel.relacion.opuesto) {
                  return elem;
                }
              });
              let dto = {
                relacion: relacionOpuesta,
                referencia: pacienteGuardar.id,
                nombre: pacienteGuardar.nombre,
                apellido: pacienteGuardar.apellido,
                documento: pacienteGuardar.documento
              };
              if (rel.referencia) {
                this.pacienteService.patch(rel.referencia, {
                  'op': 'updateRelacion', 'dto': dto
                }).subscribe(result2 => {
                  console.log('RESULT PATCH--------', result2);
                });
              }
            });
          }
          this.plex.alert('Los datos se actualizaron correctamente');
          this.data.emit(result);
        } else {
          this.plex.alert('ERROR: Ocurrio un problema al actualizar los datos');
        }
      });
    } else {
      this.plex.alert('Debe completar los datos obligatorios');
    }
  }
  onCancel() {
    this.data.emit(null);
  }
  onSelect(paciente: IPaciente) {
    this.seleccion = Object.assign({}, paciente);
    this.actualizarDatosPaciente();
    this.disableGuardar = false;
    this.enableIgnorarGuardar = false;
    this.sugerenciaAceptada = true;
  }
  // Verifica paciente repetido y genera lista de candidatos
  verificaPacienteRepetido() {
    this.posibleDuplicado = false;
    this.altoMacheo = false;

    return new Promise((resolve, reject) => {
      if (this.pacienteModel.nombre && this.pacienteModel.apellido && this.pacienteModel.documento
        && this.pacienteModel.fechaNacimiento && this.pacienteModel.sexo) {
        let dto: any = {
          type: 'suggest',
          claveBlocking: 'documento',
          percentage: true,
          apellido: this.pacienteModel.apellido.toString(),
          nombre: this.pacienteModel.nombre.toString(),
          documento: this.pacienteModel.documento.toString(),
          sexo: ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id),
          fechaNacimiento: this.pacienteModel.fechaNacimiento
        };
        this.pacienteService.get(dto).subscribe(resultado => {
          this.pacientesSimilares = resultado;
          
          // agregamos la condición de abajo para filtrar las sugerencias
          // cuando el pacienfe fue escaneado o ya estaba validado.
          if (this.escaneado || this.pacienteModel.estado === 'validado') {
            
            this.pacientesSimilares = this.pacientesSimilares.filter(item => item.estado === 'validado');
          }
          if (this.pacientesSimilares.length > 0 && !this.sugerenciaAceptada) {
            // Nos quedamos todos los pacientes menos el mismo.
          
            this.pacientesSimilares = this.pacientesSimilares.filter(paciente => paciente.paciente.id !== this.pacienteModel.id)

            if (this.pacientesSimilares[0].match >= 0.94) {
              if (this.pacientesSimilares[0].match >= 1.0) {
                this.onSelect(this.pacientesSimilares[0].paciente);
                this.pacientesSimilares = null;
                this.enableIgnorarGuardar = false;
              } else {
                this.server.post('/core/log/mpi/macheoAlto', { data: { pacienteDB: this.pacientesSimilares[0], pacienteScan: this.pacienteModel } }, { params: null, showError: false }).subscribe(() => { });
                this.plex.alert('El paciente que está cargando ya existe en el sistema, favor seleccionar');
                this.enableIgnorarGuardar = false;
                this.disableGuardar = true;
              }
            } else {
              if (!this.verificarDNISexo(this.pacientesSimilares)) {
                this.server.post('/core/log/mpi/posibleDuplicado', { data: { pacienteDB: this.pacientesSimilares[0], pacienteScan: this.pacienteModel } }, { params: null, showError: false }).subscribe(() => { });
                this.posibleDuplicado = true;
                this.plex.alert('Existen pacientes con un alto procentaje de matcheo, verifique la lista');
                this.enableIgnorarGuardar = true;
                this.disableGuardar = true;
              } else {
                resolve(true);
              }
            }
            resolve(true);

          } else {
            this.disableGuardar = false;
            this.enableIgnorarGuardar = false;
            resolve(false);
          }
        });
      } else {
        resolve(false);
      }
    });
  }
  verificarDNISexo(listaSimilares) {
    let i = 0;
    let cond = false;
    let sexoPac = ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id);
    while (i < listaSimilares.length && !cond) {
      if ((listaSimilares[i].paciente.documento === this.pacienteModel.documento) && (listaSimilares[i].paciente.sexo === sexoPac)) {
        this.enableIgnorarGuardar = false;
        cond = true;
      }
      i++;
    }
    return cond;
  }
  preSave(valid) {
    if (valid.formValid) {
      this.verificaPacienteRepetido().then((resultado) => {
        if (!resultado) {
          this.save(valid);
        }
      });
    } else {
      this.plex.alert('Debe completar los datos obligatorios');
    }
  }
  addContacto() {
    let nuevoContacto = Object.assign({}, {
      tipo: 'celular',
      valor: '',
      ranking: 0,
      activo: true,
      ultimaActualizacion: new Date()
    });
    this.pacienteModel.contacto.push(nuevoContacto);
  }

  removeContacto(i) {
    if (i >= 0) {
      this.pacienteModel.contacto.splice(i, 1);
    }
  }

  addFinanciador() {
    let nuevoFinanciador = {
      entidad: null,
      codigo: '',
      activo: true,
      fechaAlta: null,
      fechaBaja: null,
      ranking: this.pacienteModel.financiador ? this.pacienteModel.financiador.length : 0
    };
    if (this.pacienteModel.financiador) {
      this.pacienteModel.financiador.push(nuevoFinanciador);
    } else {
      this.pacienteModel.financiador = [nuevoFinanciador];
    }
  }

  removeFinanciador(i) {
    if (i >= 0) {
      this.pacienteModel.financiador.splice(i, 1);
    }
  }
  private comprobarDocumentoEscaneado(): DocumentoEscaneado {
    for (let key in DocumentoEscaneados) {
      if (DocumentoEscaneados[key].regEx.test(this.buscarPacRel)) {
        // Loggea el documento escaneado para análisis
        this.server.post('/core/log/mpi/scan', { data: this.buscarPacRel }, { params: null, showError: false }).subscribe(() => { });
        return DocumentoEscaneados[key];
      }
    }
    if (this.buscarPacRel.length > 30) {
      this.server.post('/core/log/mpi/scanFail', { data: this.buscarPacRel }, { params: null, showError: false }).subscribe(() => { });
    }
    return null;
  }

  /**
   * Parsea el texto libre en un objeto paciente
   *
   * @param {DocumentoEscaneado} documento escaneado
   * @returns {*} Datos del paciente
   */
  private parseDocumentoEscaneado(documento: DocumentoEscaneado): any {
    debugger;
    let datos = this.buscarPacRel.match(documento.regEx);
    let sexo = '';
    if (documento.grupoSexo > 0) {
      sexo = (datos[documento.grupoSexo].toUpperCase() === 'F') ? 'femenino' : 'masculino';
    }

    let fechaNacimiento = null;
    if (documento.grupoFechaNacimiento > 0) {
      fechaNacimiento = moment(datos[documento.grupoFechaNacimiento], 'DD/MM/YYYY');
    }

    return {
      documento: datos[documento.grupoNumeroDocumento].replace(/\D/g, ''),
      apellido: datos[documento.grupoApellido],
      nombre: datos[documento.grupoNombre],
      sexo: sexo,
      fechaNacimiento: fechaNacimiento
    };
  }
  public buscar() {
    // Cancela la búsqueda anterior
    if (this.timeoutHandle) {
      window.clearTimeout(this.timeoutHandle);
    }

    // Limpia los resultados de la búsqueda anterior
    this.PacientesRel = null;
    // Inicia búsqueda
    if (this.buscarPacRel && this.buscarPacRel.trim()) {
      this.timeoutHandle = window.setTimeout(() => {
        this.timeoutHandle = null;

        // Si matchea una expresión regular, busca inmediatamente el paciente
        let documentoEscaneado = this.comprobarDocumentoEscaneado();
        if (documentoEscaneado) {
          this.loading = true;
          let pacienteEscaneado = this.parseDocumentoEscaneado(documentoEscaneado);
          // Consulta API
          this.pacienteService.get({
            type: 'simplequery',
            apellido: pacienteEscaneado.apellido.toString(),
            nombre: pacienteEscaneado.nombre.toString(),
            documento: pacienteEscaneado.documento.toString(),
            sexo: pacienteEscaneado.sexo.toString(),
            escaneado: true
          }).subscribe(resultado => {
            this.loading = false;
            this.PacientesRel = resultado;
            this.esEscaneado = true;
            // Encontramos un matcheo al 100%
            if (resultado.length) {
              resultado[0].scan = pacienteEscaneado.scan;
              this.seleccionarPacienteRelacionado(resultado.length ? resultado[0] : pacienteEscaneado, true);
            } else {
              // Realizamos una busqueda por Suggest
              this.pacienteService.get({
                type: 'suggest',
                claveBlocking: 'documento',
                percentage: true,
                apellido: pacienteEscaneado.apellido.toString(),
                nombre: pacienteEscaneado.nombre.toString(),
                documento: pacienteEscaneado.documento.toString(),
                sexo: pacienteEscaneado.sexo.toString(),
                fechaNacimiento: pacienteEscaneado.fechaNacimiento,
                escaneado: true
              }).subscribe(resultSuggest => {
                this.PacientesRel = resultSuggest;
                if (this.PacientesRel.length > 0) {
                  this.buscarPacRel = '';
                  let pacienteEncontrado = this.PacientesRel.find(valuePac => {
                    if (valuePac.paciente.scan && valuePac.paciente.scan === this.buscarPacRel) {
                      return valuePac.paciente;
                    }
                  });

                  let datoDB = {
                    id: this.PacientesRel[0].paciente.id,
                    apellido: this.PacientesRel[0].paciente.apellido,
                    nombre: this.PacientesRel[0].paciente.nombre,
                    documento: this.PacientesRel[0].documento,
                    sexo: this.PacientesRel[0].paciente.sexo,
                    fechaNacimiento: this.PacientesRel[0].paciente.fechaNacimiento,
                    match: this.PacientesRel[0].match
                  };

                  if (pacienteEncontrado) {
                    this.server.post('/core/log/mpi/validadoScan', { data: { pacienteDB: datoDB, pacienteScan: pacienteEscaneado } }, { params: null, showError: false }).subscribe(() => { });
                    this.seleccionarPacienteRelacionado(pacienteEncontrado, true);
                  } else {
                    if (this.PacientesRel[0].match >= 0.94) {
                      this.server.post('/core/log/mpi/macheoAlto', { data: { pacienteDB: datoDB, pacienteScan: pacienteEscaneado } }, { params: null, showError: false }).subscribe(() => { });
                      this.seleccionarPacienteRelacionado(this.pacientesSimilares[0].paciente, true);
                    } else {
                      if (this.PacientesRel[0].match >= 0.80 && this.PacientesRel[0].match < 0.94) {
                        this.server.post('/core/log/mpi/posibleDuplicado', { data: { pacienteDB: datoDB, pacienteScan: pacienteEscaneado } }, { params: null, showError: false }).subscribe(() => { });
                      }
                    }
                  }

                } else {
                  ///Cargar como paciente validado pq está escaneado
                  this.buscarPacRel = '';
                  this.PacientesRel = null;
                  let pacienteGuardar: any = {
                    activo: true,
                    apellido: pacienteEscaneado.apellido.toString(),
                    nombre: pacienteEscaneado.nombre.toString(),
                    documento: pacienteEscaneado.documento.toString(),
                    sexo: pacienteEscaneado.sexo.toString(),
                    fechaNacimiento: pacienteEscaneado.fechaNacimiento,
                    genero: pacienteEscaneado.sexo.toString(),
                    estado: 'validado',
                    contacto: null,
                    estadoCivil: null,
                    entidadesValidadoras: ['RENAPER'],
                    scan: this.buscarPacRel,
                    financiador: null,
                    identificadores: null,
                    direccion: null,
                    reportarError: false,
                    notaError: '',
                    nombreCompleto: '',
                    alias: '',
                    edad: null,
                    edadReal: null,
                    fechaFallecimiento: null,
                    foto: '',
                    relaciones: [],
                    claveBlocking: null,
                    isScan: this.esEscaneado
                  };


                  let operacionPac = this.pacienteService.save(pacienteGuardar);
                  operacionPac.subscribe(result => {
                    if (result) {
                      this.seleccionarPacienteRelacionado(result, true);
                    }
                  });



                }
              });

            }

          }, (err) => {
            this.loading = false;
          });


        } else {
          // Si no es un documento escaneado, hace una búsqueda multimatch
          this.pacienteService.get({
            type: 'multimatch',
            cadenaInput: this.buscarPacRel
          }).subscribe(resultado => {
            this.loading = false;
            this.PacientesRel = resultado;
            this.esEscaneado = false;
            // }
          }, (err) => {
            this.loading = false;
          });
        }
      }, 200);
    }
  }


  seleccionarPacienteRelacionado(pacienteEncontrado, esReferencia) {
    this.buscarPacRel = '';
    let unaRelacion = Object.assign({}, {
      relacion: null,
      referencia: null,
      nombre: '',
      apellido: '',
      documento: ''
    });

    if (pacienteEncontrado) {
      if (esReferencia) {
        unaRelacion.referencia = pacienteEncontrado.id;
      }
      unaRelacion.documento = pacienteEncontrado.documento;
      unaRelacion.apellido = pacienteEncontrado.apellido;
      unaRelacion.nombre = pacienteEncontrado.nombre;

    }
    if (this.pacienteModel.relaciones) {
      this.pacienteModel.relaciones.push(unaRelacion);
    } else {
      this.pacienteModel.relaciones = [unaRelacion];
    }
    this.autoFocus = this.autoFocus + 1;
  }

  removeRelacion(i) {
    if (i >= 0) {
      this.relacionesBorradas.push(this.pacienteModel.relaciones[i]);
      this.pacienteModel.relaciones.splice(i, 1);
    }
  }

  removeNota(i) {
    if (i >= 0) {
      this.pacienteModel.notas.splice(i, 1);
    }
  }

  addNota() {
    let nuevaNota = {
      'fecha': new Date(),
      'nota': '',
      'destacada': false
    };
    if (this.nuevaNota) {
      nuevaNota.nota = this.nuevaNota;
      if (this.pacienteModel.notas) {
        this.pacienteModel.notas.push(nuevaNota);
      } else {
        this.pacienteModel.notas = [nuevaNota];
      }
      if (this.pacienteModel.notas.length > 1) {
        this.pacienteModel.notas.sort((a, b) => {
          return (a.fecha.getDate() > b.fecha.getDate() ? 1 : (b.fecha.getDate() > a.fecha.getDate() ? -1 : 0));
        });
      }
    }
    this.nuevaNota = '';
  }

  destacarNota(indice: any) {
    this.pacienteModel.notas[indice].destacada = !this.pacienteModel.notas[indice].destacada;
    if (this.pacienteModel.notas.length > 1) {
      this.pacienteModel.notas.sort((a, b) => {
        let resultado = (a.destacada && !b.destacada ? -1 : (b.destacada && !a.destacada ? 1 : 0));
        return resultado;
      });
    }
  }

}
