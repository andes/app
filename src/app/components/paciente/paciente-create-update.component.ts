import { Server } from '@andes/shared';
import {
  IUbicacion
} from './../../interfaces/IUbicacion';
import {
  PacienteSearch
} from './../../services/pacienteSearch.interface';
import {
  IContacto
} from './../../interfaces/IContacto';
import {
  FinanciadorService
} from './../../services/financiador.service';
import {
  IDireccion
} from './../../interfaces/IDireccion';
import {
  IBarrio
} from './../../interfaces/IBarrio';
import {
  ILocalidad
} from './../../interfaces/ILocalidad';
import {
  IPais
} from './../../interfaces/IPais';
import {
  IFinanciador
} from './../../interfaces/IFinanciador';
import {
  Observable
} from 'rxjs/Rx';
import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators
} from '@angular/forms';
import * as moment from 'moment';
import {
  BarrioService
} from './../../services/barrio.service';
import {
  LocalidadService
} from './../../services/localidad.service';
import {
  ProvinciaService
} from './../../services/provincia.service';
import {
  PaisService
} from './../../services/pais.service';
import {
  PacienteService
} from './../../services/paciente.service';
import * as enumerados from './../../utils/enumerados';
import {
  IPaciente
} from './../../interfaces/IPaciente';
import {
  IProvincia
} from './../../interfaces/IProvincia';
import {
  DomSanitizer,
  SafeHtml
} from '@angular/platform-browser';
import {
  Plex
} from '@andes/plex';
import {
  MapsComponent
} from './../../utils/mapsComponent';
import {
  patientFullNamePipe,
  patientRealAgePipe
} from './../../utils/patientPipe';


@Component({
  selector: 'paciente-create-update',
  templateUrl: 'paciente-create-update.html'
})
export class PacienteCreateUpdateComponent implements OnInit {

  @Input('seleccion') seleccion: IPaciente;
  @Input('isScan') isScan: IPaciente;
  @Input('escaneado') escaneado: Boolean;
  @Output() data: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();


  estados = [];
  sexos: any[];
  generos: any[];
  estadosCiviles: any[];
  tipoComunicacion: any[];
  relacionTutores: any[];

  paises: IPais[] = [];
  provincias: IProvincia[] = [];
  localidades: ILocalidad[] = [];
  barrios: IBarrio[] = [];
  obrasSociales: IFinanciador[] = [];
  pacRelacionados = [];
  familiaresPacientes = [];
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
  disableGuardar = false;
  enableIgnorarGuardar = false;
  sugerenciaAceptada = false;
  entidadValidadora = '';
  viveEnNeuquen = false;
  viveProvNeuquen = false;


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
    foto: '',
    relaciones: null,
    financiador: null,
    identificadores: null,
    claveBlocking: null,
    entidadesValidadoras: [this.entidadValidadora],
    scan: null,
    reportarError: false
  };


  constructor(private formBuilder: FormBuilder, private _sanitizer: DomSanitizer,
    private paisService: PaisService,
    private provinciaService: ProvinciaService,
    private localidadService: LocalidadService,
    private barrioService: BarrioService,
    private pacienteService: PacienteService,
    private financiadorService: FinanciadorService, public plex: Plex, private server: Server) { }

  ngOnInit() {
    // Se cargan los combos
    this.financiadorService.get().subscribe(resultado => {
      this.obrasSociales = resultado;
    });


    //Set País Argentina
    this.paisService.get({
      nombre: 'Argentina'
    }).subscribe(arg => {
      this.paisArgentina = arg[0];
    });

    this.provinciaService.get({}).subscribe(rta => {
      debugger;
      this.provincias = rta;
    });

    // Se cargan los enumerados
    this.showCargar = false;
    this.sexos = enumerados.getObjSexos();
    this.generos = enumerados.getObjGeneros();
    this.estadosCiviles = enumerados.getObjEstadoCivil();
    this.tipoComunicacion = enumerados.getObjTipoComunicacion();
    this.estados = enumerados.getEstados();
    this.relacionTutores = enumerados.getObjRelacionTutor();


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
              this.seleccion = Object.assign({}, resultado);
            }
            this.actualizarDatosPaciente();

          });
      }
    }
  }

  actualizarDatosPaciente() {
    debugger;
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
        this.seleccion.direccion[0] = this.direccion;
      } else {
        if (this.seleccion.direccion[0].ubicacion.pais && (!this.seleccion.direccion[0].ubicacion.pais.nombre)) {
          this.seleccion.direccion[0] = this.direccion;
        }
      }
    } else {
      this.seleccion.direccion = [this.direccion];
    }


    if (this.seleccion.direccion) {
      if (this.seleccion.direccion.length > 0) {
        if (this.seleccion.direccion[0].ubicacion) {

          if (this.seleccion.direccion[0].ubicacion.provincia !== null) {
            if (this.seleccion.direccion[0].ubicacion.provincia.nombre === 'Neuquén') {
              this.viveProvNeuquen = true;
              this.provinciaService.get({
                nombre: this.seleccion.direccion[0].ubicacion.provincia.nombre
              }).subscribe(Prov => {
                this.provinciaNeuquen = Prov[0];
                this.localidadService.get({}).subscribe(result => {
                  this.localidadesNeuquen = result;
                });
              });
            }

            this.localidadService.get({ provincia: this.seleccion.direccion[0].ubicacion.provincia.id }).subscribe(resultado => {
              this.localidadesNeuquen = resultado;
            });
          }

          if (this.seleccion.direccion[0].ubicacion.localidad !== null) {
            if (this.seleccion.direccion[0].ubicacion.localidad.nombre === 'Neuquén') {
              this.viveEnNeuquen = true;
              //Todos los barrios de la localidad de Neuquén
              let parametroNombre = {
                nombre: 'Neuquén'
              };
              this.localidadService.get(parametroNombre).subscribe(resultado => {
                this.localidadNeuquen = resultado[0];
                let param = { localidad: this.localidadNeuquen.id };
                this.barrioService.get(param).subscribe(rta => {
                  this.barriosNeuquen = rta;
                });
              });

            }
          }


        }
      }
    }

    if (!this.seleccion.reportarError) {
      this.seleccion.reportarError = false;
    }

    this.pacienteModel = Object.assign({}, this.seleccion);
    this.pacienteModel.genero = this.pacienteModel.genero ? this.pacienteModel.genero : this.pacienteModel.sexo;


  }


  loadProvincias(event, pais) {
    if (pais && pais.id) {
      this.provinciaService.get({
        'pais': pais.id
      }).subscribe(event.callback);
    }
  }

  loadLocalidades(provincia) {
    debugger;
    if (provincia && provincia.id) {
      this.localidadService.get({
        'provincia': provincia.id
      }).subscribe(result => { debugger; this.localidadesNeuquen = [...result]; });
    }
  }

  loadBarrios(event, localidad) {
    if (localidad && localidad.id) {
      this.barrioService.get({
        'localidad': localidad.id
      }).subscribe(event.callback)
    }
  }


  completarGenero() {
    if (!this.pacienteModel.genero) {
      this.pacienteModel.genero = ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id);
    }
  }


  // onSave(valid) {

  //   //El primer save
  //   let lista = [];
  //   if (valid.formValid) {

  //     let pacienteGuardar = Object.assign({}, this.pacienteModel);
  //     debugger;
  //     pacienteGuardar.sexo = ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id);
  //     pacienteGuardar.estadoCivil = this.pacienteModel.estadoCivil ? ((typeof this.pacienteModel.estadoCivil === 'string')) ? this.pacienteModel.estadoCivil : (Object(this.pacienteModel.estadoCivil).id) : null;
  //     pacienteGuardar.genero = this.pacienteModel.genero ? ((typeof this.pacienteModel.genero === 'string')) ? this.pacienteModel.genero : (Object(this.pacienteModel.genero).id) : undefined;


  //     pacienteGuardar.contacto.map(elem => {
  //       elem.tipo = ((typeof elem.tipo === 'string') ? elem.tipo : (Object(elem.tipo).id));
  //       return elem
  //     });

  //     // Luego aquí habría que validar pacientes de otras prov. y paises (Por ahora solo NQN)
  //     pacienteGuardar.direccion[0].ubicacion.pais = this.paisArgentina;
  //     pacienteGuardar.direccion[0].ubicacion.provincia = this.provinciaNeuquen;

  //     if (this.viveEnNeuquen.checkbox) {
  //       pacienteGuardar.direccion[0].ubicacion.localidad = null;
  //     }

  //     this.save(true);

  //     // Si quitan las relaciones.referencia inexistentes
  //     // this.pacienteModel.relaciones.forEach(rel => {
  //     //   if (rel.referencia === "") {
  //     //     rel.referencia = null;
  //     //   }
  //     // });
  //     // Se controla si existe el paciente

  //     // if (!this.pacienteModel.id) {
  //     //   let dto: PacienteSearch = {
  //     //     type: 'suggest',
  //     //     claveBlocking: 'documento',
  //     //     percentage: true,
  //     //     apellido: pacienteGuardar.apellido.toString(),
  //     //     nombre: pacienteGuardar.nombre.toString(),
  //     //     documento: pacienteGuardar.documento.toString(),
  //     //     sexo: pacienteGuardar.sexo.toString(),
  //     //     fechaNacimiento: pacienteGuardar.fechaNacimiento
  //     //   };
  //     //   this.pacienteService.get(dto).subscribe(resultado => {
  //     //     debugger;
  //     //     this.pacientesSimilares = resultado;
  //     //     console.log(resultado)
  //     //     if (this.pacientesSimilares.length > 0 && !this.sugerenciaAceptada) {
  //     //       this.disableGuardar = true;
  //     //       this.plex.alert('Existen pacientes con un alto procentaje de matcheo, verifique la lista');
  //     //     } else {
  //     //       this.save(true);
  //     //     }
  //     //   });

  //     // let dtoBusqueda = {
  //     //   'apellido': this.pacienteModel.apellido, 'nombre': this.pacienteModel.nombre, 'documento': this.pacienteModel.documento.toString(),
  //     //   'fechaNacimiento': this.pacienteModel.fechaNacimiento
  //     // };
  //     // this.pacienteService.searchMatch('documento', dtoBusqueda, 'exactMatch', true)
  //     //   .subscribe(valor => {
  //     //     this.pacientesSimilares = valor; console.log(valor)
  //     //     if (this.pacientesSimilares.length > 0 && !this.sugerenciaAceptada) {
  //     //       this.disableGuardar = true;
  //     //       //this.plex.alert('Existen pacientes con un alto procentaje de matcheo, verifique la lista');
  //     //       alert('Existen pacientes con un alto procentaje de matcheo, verifique la lista');
  //     //     } else {
  //     //       this.save(true);
  //     //     }
  //     //   });

  //     // } else {
  //     //   this.save(true);
  //     // }


  //   } else {
  //     this.plex.alert('Debe completar los datos obligatorios');
  //   }
  // }


  save(valid) {


    if (valid.formValid) {

      let pacienteGuardar = Object.assign({}, this.pacienteModel);

      pacienteGuardar.sexo = ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id);
      pacienteGuardar.estadoCivil = this.pacienteModel.estadoCivil ? ((typeof this.pacienteModel.estadoCivil === 'string')) ? this.pacienteModel.estadoCivil : (Object(this.pacienteModel.estadoCivil).id) : null;
      pacienteGuardar.genero = this.pacienteModel.genero ? ((typeof this.pacienteModel.genero === 'string')) ? this.pacienteModel.genero : (Object(this.pacienteModel.genero).id) : undefined;
      //pacienteGuardar.entidadesValidadoras = this.pacienteModel.entidadesValidadoras

      pacienteGuardar.contacto.map(elem => {
        elem.tipo = ((typeof elem.tipo === 'string') ? elem.tipo : (Object(elem.tipo).id));
        return elem
      });

      // Luego aquí habría que validar pacientes de otras prov. y paises (Por ahora solo NQN)
      pacienteGuardar.direccion[0].ubicacion.pais = this.paisArgentina;
      //pacienteGuardar.direccion[0].ubicacion.provincia = this.pro;

      if (this.viveProvNeuquen) {
        pacienteGuardar.direccion[0].ubicacion.provincia = this.provinciaNeuquen;
      }

      if (this.viveEnNeuquen) {
        pacienteGuardar.direccion[0].ubicacion.localidad = this.localidadNeuquen;
      }


      let operacionPac: Observable<IPaciente>;

      debugger;
      if (this.sugerenciaAceptada) {
        /*this.plex.confirm('¿Esta seguro que desea modificar los datos del paciente seleccionado? ').then(resultado => {
          if (resultado) {*/

        operacionPac = this.pacienteService.save(pacienteGuardar);
        operacionPac.subscribe(result => {

          this.plex.alert('Los datos se actualizaron correctamente');
          this.data.emit(result);
        });
        //   }
        // });
      } else {
        /*this.plex.confirm('¿Esta seguro que desea guardar los datos? ').then(resultado => {
          if (resultado) {*/

        operacionPac = this.pacienteService.save(pacienteGuardar);
        operacionPac.subscribe(result => {

          if (result) {
            this.plex.alert('Los datos se actualizaron correctamente');
            this.data.emit(result);
          } else {
            this.plex.alert('ERROR: Ocurrio un problema al actualizar los datos');
          }
        });
        //   }
        // })
      }
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
    this.sugerenciaAceptada = true;
  }


  // addContacto(event) {
  //   debugger;
  //   // if (event.formValid) {
  //   let cant = this.pacienteModel.contacto.length > 0 ? this.pacienteModel.contacto.length : 0;
  //   let _unConct = {
  //     tipo: '',
  //     valor: '',
  //     ranking: cant,
  //     activo: true,
  //     ultimaActualizacion: new Date()
  //   };
  //   this.pacienteModel.contacto.push(_unConct);
  //   // } else {
  //   //   this.plex.alert('Completar datos requeridos');
  //   // }
  // }

  // removeContacto(i: number) {
  //   const control = <FormArray>this.createForm.controls['contacto'];
  //   control.removeAt(i);
  // }

  // addDireccion(unaDireccion?) {
  //   // agrega una Direccion al array de direcciones
  //   const control = <FormArray>this.createForm.controls['direccion'];
  //   control.push(this.iniDireccion(control.length));
  // }

  // removeDireccion(indice: number) {
  //   const control = <FormArray>this.createForm.controls['direccion'];
  //   control.removeAt(indice);
  // }


  // addFinanciador() {
  //   // agrega form Financiador u obra Social
  //   const control = <FormArray>this.createForm.controls['financiador'];
  //   control.push(this.iniFinanciador(control.length));
  // }

  // removeFinanciador(i: number) {
  //   // elimina form Financiador u obra Social
  //   const control = <FormArray>this.createForm.controls['financiador'];
  //   control.removeAt(i);
  // }

  // addRelacion() {
  //   // agrega form de relaciones familiares
  //   const control = <FormArray>this.createForm.controls['relaciones'];
  //   control.push(this.iniRelacion());
  // }

  // removeRelacion(i: number) {
  //   // elimina form Financiador u obra Social
  //   const control = <FormArray>this.createForm.controls['relaciones'];
  //   control.removeAt(i);
  // }

  // addFamiliar(familiar, i) {
  //   // Se agrean los datos del familiar a relaciones
  //   let relaciones = this.createForm.value.relaciones;
  //   let relacionFamiliar = relaciones[i];
  //   relacionFamiliar.referencia = familiar.id;
  //   relacionFamiliar.documento = familiar.documento;
  //   relacionFamiliar.nombre = familiar.nombre;
  //   relacionFamiliar.apellido = familiar.apellido;
  //   // relacionFamiliar.relacion = relacionFamiliar.relacion.id;
  //   relaciones[i] = relacionFamiliar;
  //   this.createForm.patchValue({ relaciones: relaciones });
  //   this.familiaresPacientes = [];

  // }



  // onSelect(paciente: IPaciente) {
  //   this.seleccion = paciente;
  //   if (this.seleccion.estado === 'validado') {
  //     this.validado = true;
  //   }
  //   this.createForm.patchValue(this.seleccion);
  //   this.disableGuardar = false;
  //   this.sugerenciaAceptada = true;
  // }



  // Verifica paciente repetido y genera lista de candidatos
  verificaPacienteRepetido() {
    if (this.pacienteModel.sexo) {
      this.completarGenero();
    }

    if (this.pacienteModel.nombre && this.pacienteModel.apellido && this.pacienteModel.documento && this.pacienteModel.fechaNacimiento && this.pacienteModel.sexo) {

      if (!this.pacienteModel.id) {
        debugger;
        let dto: any = {
          type: 'suggest',
          claveBlocking: 'documento',
          percentage: true,
          apellido: this.pacienteModel.apellido.toString(),
          nombre: this.pacienteModel.nombre.toString(),
          documento: this.pacienteModel.documento.toString(),
          sexo: ((typeof this.pacienteModel.sexo === 'string')) ? this.pacienteModel.sexo : (Object(this.pacienteModel.sexo).id),
          fechaNacimiento: moment(this.pacienteModel.fechaNacimiento).format('YYYY-MM-DD')
        };
        this.pacienteService.get(dto).subscribe(resultado => {
          this.pacientesSimilares = resultado;
          if (this.pacientesSimilares.length > 0 && !this.sugerenciaAceptada) {
            if (this.pacientesSimilares[0].match >= 0.9) {
              debugger;
              this.server.post('/core/log/mpi/macheoAlto', { data: { pacienteDB: this.pacientesSimilares[0], pacienteForm: this.pacienteModel } }, { params: null, showError: false }).subscribe(() => { })
              if (this.pacientesSimilares[0].match >= 1.0) {
                this.onSelect(this.pacientesSimilares[0].paciente);
                this.pacientesSimilares = null;
              } else {
                this.plex.alert('El paciente que está cargando ya existe en el sistema, favor seleccionar');
                this.enableIgnorarGuardar = false;
                this.disableGuardar = true;
              }

            } else {
              this.server.post('/core/log/mpi/posibleDuplicado', { data: { pacienteDB: this.pacientesSimilares[0], pacienteForm: this.pacienteModel } }, { params: null, showError: false }).subscribe(() => { })
              this.plex.alert('Existen pacientes con un alto procentaje de matcheo, verifique la lista');
              this.enableIgnorarGuardar = true;
              this.disableGuardar = true;
            }
          } else {
            this.disableGuardar = false;
            this.enableIgnorarGuardar = false;
          }
        });
      }
    }
  }


}
