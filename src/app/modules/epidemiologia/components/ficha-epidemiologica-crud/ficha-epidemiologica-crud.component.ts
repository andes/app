import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { cache } from '@andes/shared';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SnomedService } from 'src/app/apps/mitos/services/snomed.service';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { LocalidadService } from 'src/app/services/localidad.service';
import { ProvinciaService } from 'src/app/services/provincia.service';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { FormsService } from '../../../forms-builder/services/form.service';
import { FormsEpidemiologiaService } from '../../services/ficha-epidemiologia.service';


@Component({
  selector: 'app-ficha-epidemiologica-crud',
  templateUrl: './ficha-epidemiologica-crud.component.html'
})
export class FichaEpidemiologicaCrudComponent implements OnInit, OnChanges {
  @Input() paciente: IPaciente;
  @Input() fichaPaciente: any;
  @Input() editFicha: boolean;
  @Input() hideVolver: boolean;
  @Input() fichaName: string;
  @Input() form: any;
  @Output() volver = new EventEmitter<any>();

  public laborPersonalSalud = [
    { id: 'asistencial', nombre: 'Asistencial' },
    { id: 'administrativa', nombre: 'Administrativa' }
  ];
  // Ver cuales son las funciones (no figuran en la planilla)
  public funcionPersonalSalud = [
    { id: 'func1', nombre: 'Funcion 1' },
    { id: 'func2', nombre: 'Funcion 2' }
  ];
  public funcionSeguridad = [
    { id: 'policia', nombre: 'Policia' },
    { id: 'gendarmeria', nombre: 'Gendarmería' },
    { id: 'penitenciario', nombre: 'Penitenciario' },
    { id: 'ejercito', nombre: 'Ejercito' }
  ];
  public tipoContacto = [
    { id: 'conviviente', nombre: 'Conviviente' },
    { id: 'laboral', nombre: 'Laboral' },
    { id: 'social', nombre: 'Social' },
    { id: 'noConviviente', nombre: 'Familiar no conviviente' }
  ];
  public tipoInstitucion = [
    { id: 'residencia', nombre: 'Residencia de larga estadía' },
    { id: 'hogarMenores', nombre: 'Hogar de menores' },
    { id: 'carcel', nombre: 'Carcel' }
  ];
  public clasificacion = [
    { id: 'casoSospechoso', nombre: 'Caso sospechoso' },
    { id: 'contactoEstrecho', nombre: 'Contacto estrecho' },
    { id: 'otrasEstrategias', nombre: 'Otras estrategias' }
  ];
  public tipoBusqueda = [
    { id: 'activa', nombre: 'Activa' },
    { id: 'demandaEspontanea', nombre: 'Demanda espontanea' },
  ];
  public segundaClasificacion = [
    { id: 'confirmado', nombre: 'Criterio clínico epidemiológico (Nexo)' },
    { id: 'antigeno', nombre: 'Antígeno' },
    { id: 'pcr', nombre: 'PCR-RT' },
    { id: 'lamp', nombre: 'LAMP (NeoKit)' }
  ];
  public tipoMuestra = [
    { id: 'aspirado', nombre: 'Aspirado' },
    { id: 'hisopado', nombre: 'Hisopado' },
    { id: 'esputo', nombre: 'Esputo' },
    { id: 'lavadoBroncoalveolar', nombre: 'Lavado broncoalveolar' },
  ];
  public resultadoAntigeno = [
    { id: 'confirmado', nombre: 'Reactivo' },
    { id: 'muestra', nombre: 'No reactivo' }
  ];
  public resultadoDetectable = [
    { id: 'confirmado', nombre: 'Se detecta genoma de SARS-CoV-2' },
    { id: 'descartado', nombre: 'No se detecta genoma de SARS-CoV-2' },
    { id: 'muestra', nombre: 'Muestra tomada' }
  ];
  public trabajaInstitucion = [
    { id: 'residenciaAdultos', nombre: 'Residencia adultos mayores' },
    { id: 'comisaria', nombre: 'Comisarias' },
    { id: 'penales', nombre: 'Penales' },
    { id: 'monovalentes', nombre: 'Monovalentes' }
  ];
  public estadoCovid = [
    { id: 'completa', nombre: 'Completa' },
    { id: 'incompleta', nombre: 'Incompleta' }
  ];
  public tipoConglomerado = [
    { id: 'hospital', nombre: 'Hospital/Clínica/Centro asistencial' },
    { id: 'penitenciaria', nombre: 'Institución penitenciaria' },
    { id: 'saludMental', nombre: 'Institución de Salud Mental' },
    { id: 'residenciaMayores', nombre: 'Residencia para adultos mayores' },
    { id: 'empresas', nombre: 'Empresas' },
    { id: 'instituciones', nombre: 'Instituciones educativas/Instituciones de asistencia infantil (jardín, guarderías, etc)' }
  ];
  public reqCuidado = [
    { id: 'salaGeneral', nombre: 'Sala General' },
    { id: 'uce', nombre: 'UCE' },
    { id: 'ut', nombre: 'UT Intermedia' },
    { id: 'uti', nombre: 'UTI' },
  ];
  public selectGral = [
    { id: 'si', nombre: 'SI' },
    { id: 'no', nombre: 'NO' }
  ];

  public contacto = {
    apellidoNombre: '',
    dni: '',
    telefono: '',
    domicilio: '',
    fechaUltimoContacto: '',
    tipoContacto: ''
  };


  public columns = [
    {
      key: 'apellidoNombre',
      label: 'Apellido y Nombre'
    },
    {
      key: 'dni',
      label: 'Dni'
    },
    {
      key: 'telefono',
      label: 'Teléfono'
    },
    {
      key: 'domicilio',
      label: 'Domicilio'
    },
    {
      key: 'fechaContacto',
      label: 'Fecha último contacto'
    },
    {
      key: 'tipoContacto',
      label: 'Tipo de contacto'
    },
    {
      key: 'acciones',
      label: 'Acciones'
    }
  ];


  public fields = [];
  public fieldSelected;
  public organizaciones$: Observable<any>;
  public secciones = [];
  public ficha = [];
  public telefono = null;
  public contactosEstrechos = [];
  public nuevoContacto = false;
  public zonaSanitaria = null;
  public localidades$: Observable<any>;
  public provincias$: Observable<any>;

  constructor(
    private formsService: FormsService,
    private formEpidemiologiaService: FormsEpidemiologiaService,
    private localidadService: LocalidadService,
    private provinciaService: ProvinciaService,
    private plex: Plex,
    private auth: Auth,
    private organizacionService: OrganizacionService,
    private router: Router,
    private snomedService: SnomedService,
    public servicePaciente: PacienteService
  ) { }

  ngOnChanges(): void {
    this.contactosEstrechos = [];
    this.formsService.search({ name: this.fichaName }).subscribe((ficha: any) => {
      this.secciones = ficha[0].sections;
      if (this.fichaPaciente) { // caso en el que es una ficha a editar/visualizar
        this.fichaPaciente.secciones.map(sec => {
          if (sec.name !== 'Contactos Estrechos') {
            const buscado = this.secciones.findIndex(seccion => seccion.name === sec.name);
            if (buscado !== -1) {
              sec.fields.map(field => {
                let key = Object.keys(field);
                this.secciones[buscado].fields[key[0]] = field[key[0]];
              });
            }
          } else {
            this.contactosEstrechos = sec.fields;
          }
        });
      } else {
        this.setFields();
      }
    });
  }

  ngOnInit(): void {
    if (!this.auth.getPermissions('epidemiologia:?').length) {
      this.router.navigate(['inicio']);
    }
    this.organizaciones$ = this.auth.organizaciones();
    this.provincias$ = this.provinciaService.get({}).pipe(
      cache()
    );
  }

  registrarFicha() {
    this.getValues();
    this.setFicha();
  }

  getValues() {
    this.secciones.map(seccion => {
      let campos = [];
      if (seccion.name !== 'Contactos Estrechos') {
        seccion.fields.forEach(arg => {
          let params = {};
          const key = arg.key;
          if (key) {
            const valor = seccion.fields[key];
            if (valor !== undefined && valor !== null) {
              params[key] = valor;
              if (valor instanceof Date) {
                params[key] = valor;
              } else {
                if (valor?.id) {
                  // caso en el que los select usan el select-search.directive que viene con los dos campos
                  if (valor?.nombre) {
                    params[key] = {
                      id: valor.id,
                      nombre: valor.nombre
                    };
                  } else {
                    params[key] = valor.id;
                  }
                } else if (valor === undefined) {
                  params[key] = arg.check;
                }
              }
              campos.push(params);
            }
          }
        });
      } else {
        campos = this.contactosEstrechos;
      }

      if (campos.length) {
        const buscado = this.ficha.findIndex(sec => sec.name === seccion.seccion);
        if (buscado !== -1) {
          // si ya existe la sección, la reemplazo
          this.ficha[buscado] = { name: seccion.name, fields: campos };
        } else {
          this.ficha.push({ name: seccion.name, fields: campos });
        }
      }
    });
  }

  setFicha() {
    const type = this.form ? { id: this.form.id, name: this.form.name } : this.fichaPaciente.type;
    const fichaFinal = {
      type,
      secciones: this.ficha,
      paciente: {
        id: this.paciente.id,
        documento: this.paciente.documento,
        nombre: this.paciente.nombre,
        apellido: this.paciente.apellido,
        fechaNacimiento: this.paciente.fechaNacimiento,
        sexo: this.paciente.sexo,
        genero: this.paciente.sexo,
        estado: this.paciente.estado
      },
      zonaSanitaria: this.zonaSanitaria
    };
    const contactosPaciente = fichaFinal.secciones.find(elem => elem.name === 'Mpi');
    if (contactosPaciente) {
      this.setMpiPaciente(contactosPaciente.fields);
    }
    if (this.fichaPaciente) {
      this.formEpidemiologiaService.update(this.fichaPaciente._id, fichaFinal).subscribe(
        res => {
          this.plex.toast('success', 'Su ficha fue actualizada correctamente');
          this.toBack();
        },
        error => {
          this.plex.toast('danger', 'ERROR: La ficha no pudo ser actualizada');
        });
    } else {
      this.formEpidemiologiaService.save(fichaFinal).subscribe(
        res => {
          this.plex.toast('success', 'Su ficha fue registrada correctamente');
          this.toBack();
        },
        error => {
          this.plex.toast('danger', 'ERROR: La ficha no pudo ser registrada');

        });
    }
  }

  setFields() {
    this.secciones.map(seccion => {
      switch (seccion.id) {
        case 'usuario':
          seccion.fields['responsable'] = this.auth.usuario.nombreCompleto;
          seccion.fields['organizacion'] = this.auth.organizacion.id;
          seccion.fields['fechanotificacion'] = new Date();
          this.setOrganizacion(seccion, this.auth.organizacion.id);
          break;
        case 'clasificacionFinal':
          seccion.fields['fechamuestra'] = new Date();
          break;
        case 'informacionClinica':
          seccion.fields['establecimientoconsulta'] = {
            id: this.auth.organizacion.id,
            nombre: this.auth.organizacion.nombre
          };
          seccion.fields['fechaprimerconsulta'] = new Date();
          break;
      }
    });
  }

  // Funcion para calcular automáticamente la clasificacion final segun resultados de los hisopados
  resultadoFinal(key) {
    this.secciones.map(seccion => {
      if (seccion.id === 'clasificacionFinal') {
        const clasificaciones = {
          segundaclasificacion: seccion.fields['segundaclasificacion']?.id,
          antigeno: seccion.fields['antigeno']?.id,
          pcr: seccion.fields['pcr'] ? 'muestra' : '',
          lamp: seccion.fields['lamp']?.id
        };
        if (seccion.fields['segundaclasificacion']?.nombre === 'Criterio clínico epidemiológico (Nexo)') {
          this.clearDependencias({ value: false }, seccion.id, ['tipomuestra', 'fechamuestra', 'antigeno', 'lamp', 'pcr', 'identificadorpcr']);
        }
        switch (clasificaciones[key]) {
          case 'confirmado':
            seccion.fields['clasificacionfinal'] = 'Confirmado';
            break;
          case 'descartado':
            seccion.fields['clasificacionfinal'] = 'Descartado';
            break;
          case 'muestra':
            seccion.fields['clasificacionfinal'] = clasificaciones.antigeno === 'confirmado' ? 'Confirmado' : 'Sospechoso';
            break;
          default:
            if (!clasificaciones.antigeno && !clasificaciones.pcr && !clasificaciones.lamp) {
              seccion.fields['clasificacionfinal'] = '';
            }
            break;
        }
      }
    });
  }

  // Función para calcular automaticamente la semana epidemiológica segun la fecha de inicio de primer sintoma
  setSemanaEpidemiologica() {
    this.secciones.map(seccion => {
      if (seccion.id === 'informacionClinica') {
        const fechaSintoma = moment(seccion.fields['fechasintomas']);
        const hoy = moment(new Date());
        seccion.fields['semanaepidemiologica'] = Math.round(hoy.diff(fechaSintoma, 'days') / 7);
      }
    });
  }

  setOrganizacion(seccion, organizacion) {
    const idOrganizacion = organizacion.value ? organizacion.value.id : organizacion;
    this.organizacionService.getById(idOrganizacion).subscribe(res => {
      seccion.fields['telefonoinstitucion'] = res.contacto[0]?.valor;
      seccion.fields['localidad'] = {
        id: res.direccion.ubicacion.localidad.id,
        nombre: res.direccion.ubicacion.localidad.nombre
      };
      seccion.fields['provincia'] = {
        id: res.direccion.ubicacion.provincia.id,
        nombre: res.direccion.ubicacion.provincia.nombre
      };
      this.zonaSanitaria = res.zonaSanitaria;
    });
  }

  toBack() {
    this.volver.emit();
  }

  showNuevoContacto() {
    this.nuevoContacto = true;
  }

  addContacto() {
    this.contactosEstrechos.push(this.contacto);
    this.contacto = {
      apellidoNombre: '',
      dni: '',
      telefono: '',
      domicilio: '',
      fechaUltimoContacto: '',
      tipoContacto: ''
    };
    this.nuevoContacto = false;
  }

  deleteContacto(contacto) {
    let index = this.contactosEstrechos.findIndex(item => item.dni === contacto.dni);
    if (index >= 0) {
      this.contactosEstrechos.splice(index, 1);
      this.contactosEstrechos = [...this.contactosEstrechos];
    }
  }

  setLocalidades(event) {
    if (event.value) {
      this.localidades$ = this.localidadService.get({ codigo: event.value.codigo });
    }
  }

  clearDependencias(event, idSeccion, keys) {
    if (event.value?.id === 'no' || event.value === false) {
      this.secciones.map(seccion => {
        if (seccion.id === idSeccion) {
          keys.map(element => {
            if (seccion.fields[element]) {
              seccion.fields[element] = null;
            }
          });
        }
      });
    }
  }

  getSnomed(query, event) {
    this.snomedService.getQuery({ expression: query }).subscribe(res => {
      event.callback(res);
    });
  }

  setMpiPaciente(contactosPaciente) {
    const nuevoContacto = contactosPaciente.findIndex(elem => (Object.keys(elem))[0] === 'telefonocaso');
    if (nuevoContacto >= 0) {
      this.addContactoMpi('celular', Object.values(contactosPaciente[nuevoContacto])[0]);
    }
    const dirPaciente = contactosPaciente.findIndex(elem => (Object.keys(elem))[0] === 'direccioncaso');
    const provinciaPaciente = contactosPaciente.findIndex(elem => (Object.keys(elem))[0] === 'lugarresidencia');
    const localidadPaciente = contactosPaciente.findIndex(elem => (Object.keys(elem))[0] === 'localidadresidencia');
    if (dirPaciente >= 0 || provinciaPaciente >= 0 || localidadPaciente >= 0) {
      const nuevaLocalidad = Object.values(contactosPaciente[localidadPaciente])[0];
      const nuevaProvincia = Object.values(contactosPaciente[provinciaPaciente])[0];
      const nuevaDireccion = {
        valor: dirPaciente >= 0 ? Object.values(contactosPaciente[dirPaciente])[0]?.toString() : null,
        ultimaActualizacion: new Date(),
        activo: true,
        ubicacion: {
          localidad: nuevaLocalidad ? {
            id: nuevaLocalidad['id'],
            nombre: nuevaLocalidad['nombre'],
          } : null,
          provincia: nuevaProvincia ? {
            id: nuevaProvincia['id'],
            nombre: nuevaProvincia['nombre'],
          } : null,
          barrio: null,
          pais: null
        },
        codigoPostal: '',
        ranking: 0,
        geoReferencia: null
      };
      this.paciente.direccion[0] = nuevaDireccion.ubicacion.localidad?.id ||
        nuevaDireccion.ubicacion.provincia?.id ||
        nuevaDireccion.valor ? nuevaDireccion : this.paciente.direccion[0];
    }
    this.servicePaciente.save(this.paciente).subscribe();
  }

  addContactoMpi(key, value) {
    let index = this.paciente.contacto.findIndex(item => item.tipo === key);
    if (index >= 0) {
      this.paciente.contacto[index].valor = value;
    } else {
      let nuevo = {
        tipo: key,
        valor: value,
        ranking: 1,
        activo: true,
        ultimaActualizacion: new Date()
      };
      this.paciente.contacto.push(nuevo);
    }
  }
}
