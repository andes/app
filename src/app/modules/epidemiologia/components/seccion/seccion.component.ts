import { Auth } from '@andes/auth';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { OrganizacionService } from '../../../../services/organizacion.service';

@Component({
  selector: 'app-seccion',
  templateUrl: './seccion.component.html'
})
export class SeccionComponent implements OnInit {
  @Input() seccion
  @Input() fichaPaciente
  @Output() onSave = new EventEmitter<any>();

  public disabledEditar = false;
  public disabledGuardar = true;
  public organizaciones$: Observable<any>;

  public laborPersonalSalud = [
    { id: 'asistencial', nombre: 'Asistencial' },
    { id: 'administrativa', nombre: 'Administrativa' }
  ];
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
    { id: 'social', nombre: 'Social' }
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
    { id: 'criterioClinicoEpidemiologico', nombre: 'Criterio clínico epidemiológico' },
    { id: 'antigeno', nombre: 'Antígeno' },
    { id: 'pcr', nombre: 'PCR' },
  ];
  public tipoMuestra = [
    { id: 'aspirad', nombre: 'Aspirado' },
    { id: 'hisopado', nombre: 'Hisopado' },
    { id: 'esputo', nombre: 'Esputo' },
    { id: 'lavadoBroncoalveolar', nombre: 'Lavado broncoalveolar' },
  ];
  public resultadoTest = [
    { id: 'positivo', nombre: 'Positivo' },
    { id: 'negativo', nombre: 'Negativo' }
  ]
  constructor(
    private auth: Auth,
    private organizacionService: OrganizacionService
  ) { }

  ngOnInit(): void {
    if (this.fichaPaciente) { // caso en el que es una ficha a editar/visualizar
      this.fichaPaciente.secciones.map(sec => {
        if (this.seccion.name === sec.name) {
          sec.fields.map(field => {
            let key = Object.keys(field);
            this.seccion.fields[key[0]] = field[key[0]];
          });
        }
      })
    }
    this.organizaciones$ = this.auth.organizaciones();

    //Esto no va mas cuando tenga el finalizar ficha disabled si no estan los requeridos
    if (this.seccion.id === 'usuario') {
      this.getOrganizacion();
      this.getUsuario();
    };

    if (this.seccion.id === 'clasificacionFinal') {
      this.seccion.fields['fechamuestra'] = new Date();
    }
  }

  save() {
    const campos = [];
    this.seccion.fields.forEach(arg => {
      let params = {};
      const key = arg.key;
      if (key) {
        const valor = this.seccion.fields[key];
        if (valor !== undefined) {
          params[key] = valor;
          if (valor instanceof Date) {
            params[key] = valor;
          } else {
            if (valor && valor.id) {
              params[key] = valor.id;
            } else if (valor === undefined) {
              params[key] = arg.check;
            }
          }
          campos.push(params);
        }
      }
    });
    this.disabledEditar = false;
    this.disabledGuardar = true;
    // this.onSave.emit({ campos, seccion: this.seccion.name });
  }

  edit(seccion) {
    this.disabledEditar = true;
    this.disabledGuardar = false;
  }

  getOrganizacion() {
    const resultOrganizacion = this.seccion.fields.some(field => field.key === 'organizacion');
    if (resultOrganizacion) {
      this.seccion.fields['organizacion'] = this.auth.organizacion.id;
      this.organizacionService.getById(this.auth.organizacion.id).subscribe(res => {
        this.seccion.fields['telefonoinstitucion'] = res.contacto[0].valor;
        this.seccion.fields['localidad'] = res.direccion.ubicacion.localidad.id;
        this.seccion.fields['provincia'] = res.direccion.ubicacion.provincia.id;
      })
    }
  }

  getUsuario() {
    const resultUsuario = this.seccion.fields.some(field => field.key === 'responsable');
    if (resultUsuario) {
      this.seccion.fields['responsable'] = this.auth.usuario.nombreCompleto;
    }
  }

  resultadoFinal() {
    if (this.seccion.fields['antigeno']?.id === 'positivo' && this.seccion.fields['pcr']?.id === 'positivo') {
      this.seccion.fields['clasificacionfinal'] = "Confirmado";
    } else {
      if (this.seccion.fields['pcr']?.id === 'negativo') {
        this.seccion.fields['clasificacionfinal'] = "Descartado";
      }
    }
  }

  setSemanaEpidemiologica(event) {
    const fechaSintoma = moment(this.seccion.fields['fechasintomas'])
    const hoy = moment(new Date());
    this.seccion.fields['semanaepidemiologica'] = Math.round(hoy.diff(fechaSintoma, 'days') / 7)
  }
}
