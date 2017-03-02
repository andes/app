import { FinanciadorService } from './../../services/financiador.service';
import { IDireccion } from './../../interfaces/IDireccion';
import { IBarrio } from './../../interfaces/IBarrio';
import { ILocalidad } from './../../interfaces/ILocalidad';
import { IPais } from './../../interfaces/IPais';
import { IFinanciador } from './../../interfaces/IFinanciador';
import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { BarrioService } from './../../services/barrio.service';
import { LocalidadService } from './../../services/localidad.service';
import { ProvinciaService } from './../../services/provincia.service';
import { PaisService } from './../../services/pais.service';
import { PacienteService } from './../../services/paciente.service';
import * as enumerados from './../../utils/enumerados';
import { IPaciente } from './../../interfaces/IPaciente';
import { IProvincia } from './../../interfaces/IProvincia';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Plex } from 'andes-plex/src/lib/core/service';




@Component({
  selector: 'paciente-create-update',
  templateUrl: 'paciente-create-update.html'
})
export class PacienteCreateUpdateComponent implements OnInit {
  @Input('seleccion') seleccion: IPaciente;
  @Input('isScan') isScan: IPaciente;
  @Output() data: EventEmitter<IPaciente> = new EventEmitter<IPaciente>();

  matchingItems: Array<any>;

  createForm: FormGroup;
  estados = [];
  sexos: any[];
  generos: any[];
  estadosCiviles: any[];
  tipoComunicacion: any[];
  relacionTutores: any[];
  paises: IPais[] = [];
  provincias: IProvincia[] = [];
  localidades: ILocalidad[] = [];
  todasProvincias: IProvincia[] = [];
  todasLocalidades: ILocalidad[] = [];
  showCargar: boolean;
  error: boolean = false;
  mensaje: string = '';
  barrios: IBarrio[] = [];
  obrasSociales: IFinanciador[] = [];
  pacRelacionados = [];
  familiaresPacientes = [];
  pacientesSimilares = [];
  validado: boolean = false;
  disableGuardar: boolean = false;
  sugerenciaAceptada: boolean = false;

  constructor(private formBuilder: FormBuilder, private _sanitizer: DomSanitizer,
    private paisService: PaisService,
    private provinciaService: ProvinciaService,
    private localidadService: LocalidadService,
    private BarrioService: BarrioService,
    private pacienteService: PacienteService,
    private financiadorService: FinanciadorService, public plex: Plex) {

    this.createForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      alias: [''],
      documento: ['', Validators.minLength(5)],
      fechaNacimiento: [new Date(), Validators.required],
      estado: ['temporal'],
      sexo: ['', Validators.required],
      genero: [''],
      estadoCivil: [''],
      contacto: this.formBuilder.array([
        /* this.iniContacto(1)*/
      ]),
      direccion: this.formBuilder.array([
        this.iniDireccion(1)
      ]),
      financiador: this.formBuilder.array([
      ]),
      relaciones: this.formBuilder.array([
        /*this.iniRelacion()*/
      ]),
      activo: [true]
    });

  }

  ngOnInit() {
    // Se cargan los combos
    this.financiadorService.get().subscribe(resultado => { this.obrasSociales = resultado });
    // Se cargan los enumerados
    this.showCargar = false;
    this.sexos = enumerados.getObjSexos();
    this.generos = enumerados.getObjGeneros();
    this.estadosCiviles = enumerados.getObjEstadoCivil();
    this.tipoComunicacion = enumerados.getObjTipoComunicacion();
    this.estados = enumerados.getEstados();
    this.relacionTutores = enumerados.getObjRelacionTutor();

    // Se cargan los países, provincias y localidades
    debugger;
    if (this.seleccion) {

      if (this.seleccion.estado === 'validado') {
        this.validado = true;
      }
      if (this.seleccion.relaciones) {
        this.seleccion.relaciones.forEach(rel => {
          this.addRelacion();
        });
      }
      if (this.seleccion.contacto) {
        this.seleccion.contacto.forEach(rel => {
          this.addContacto();
        });
      }

      this.pacienteService.getById(this.seleccion.id)
        .subscribe(resultado => {
          this.seleccion = resultado;
          if (this.isScan) {
            this.seleccion.estado = 'validado';
            this.validado = true;
          }
          this.createForm.patchValue(this.seleccion);
        });
    }

    // this.detectarRelaciones();
    this.createForm.controls['relaciones'].valueChanges
      .debounceTime(1000)
      .subscribe((value) => {
        console.log(value);
        // Se busca el matcheo

        let relaciones = value;
        relaciones.forEach(rel => {
          let familiarPacientes;
          if (!rel.referencia) {
            if (rel.nombre && rel.documento && rel.apellido) {
              let dtoBusqueda = {
                'apellido': rel.apellido, 'nombre': rel.nombre, 'documento': rel.documento,
              };
              this.pacienteService.searchMatch('documento', dtoBusqueda, "suggest", false)
                .subscribe(valor => { this.familiaresPacientes = valor; console.log(valor) });
            }
          }
        })
      });


  }


  iniContacto(rank: Number) {
    // Inicializa los datos del contacto
    let fecha = new Date();
    return this.formBuilder.group({
      tipo: [''],
      valor: ['', Validators.required],
      ranking: [rank],
      ultimaActualizacion: [fecha],
      activo: [true]
    });
  }

  iniDireccion(rank: Number) {

    return this.formBuilder.group({
      valor: [''],
      ubicacion: this.formBuilder.group({
        pais: [''],
        provincia: [''],
        localidad: ['']
      }),
      ranking: [rank],
      codigoPostal: [''],
      ultimaActualizacion: [''],
      activo: [true]
    })

  }

  iniFinanciador(rank: Number) {
    // form Financiador u obra Social
    let fecha = new Date();
    return this.formBuilder.group({
      entidad: [''],
      ranking: [rank],
      fechaAlta: [fecha],
      fechaBaja: [''],
      activo: [true]
    });
  }

  iniRelacion() {

    return this.formBuilder.group({
      relacion: [''],
      referencia: [''],
      apellido: ['', Validators.required],
      nombre: ['', Validators.required],
      documento: ['', Validators.required]
    });
  }

  addContacto() {
    const control = <FormArray>this.createForm.controls['contacto'];
    control.push(this.iniContacto(control.length));
  }

  removeContacto(i: number) {
    const control = <FormArray>this.createForm.controls['contacto'];
    control.removeAt(i);
  }

  addDireccion(unaDireccion?) {
    // agrega una Direccion al array de direcciones
    const control = <FormArray>this.createForm.controls['direccion'];
    control.push(this.iniDireccion(control.length));
  }

  removeDireccion(indice: number) {
    const control = <FormArray>this.createForm.controls['direccion'];
    control.removeAt(indice);
  }


  addFinanciador() {
    // agrega form Financiador u obra Social
    const control = <FormArray>this.createForm.controls['financiador'];
    control.push(this.iniFinanciador(control.length));
  }

  removeFinanciador(i: number) {
    // elimina form Financiador u obra Social
    const control = <FormArray>this.createForm.controls['financiador'];
    control.removeAt(i);
  }

  addRelacion() {
    // agrega form de relaciones familiares
    const control = <FormArray>this.createForm.controls['relaciones'];
    control.push(this.iniRelacion());
  }

  removeRelacion(i: number) {
    // elimina form Financiador u obra Social
    const control = <FormArray>this.createForm.controls['relaciones'];
    control.removeAt(i);
  }

  addFamiliar(familiar, i) {
    // Se agrean los datos del familiar a relaciones
    let relaciones = this.createForm.value.relaciones;
    let relacionFamiliar = relaciones[i];
    relacionFamiliar.referencia = familiar.id;
    relacionFamiliar.documento = familiar.documento;
    relacionFamiliar.nombre = familiar.nombre;
    relacionFamiliar.apellido = familiar.apellido;
    // relacionFamiliar.relacion = relacionFamiliar.relacion.id;
    relaciones[i] = relacionFamiliar;
    this.createForm.patchValue({ relaciones: relaciones });
    this.familiaresPacientes = [];

  }

  /*Código de filtrado de combos*/
  loadPaises(event) {
    this.paisService.get().subscribe(event.callback);
  }

  loadProvincias(event, pais) {
    this.provinciaService.get({ 'pais': pais.value.id }).subscribe(event.callback);
  }

  loadLocalidades(event, provincia) {
    this.localidadService.get({ 'provincia': provincia.value.id }).subscribe(event.callback);
  }


  onSave(model: any, valid: boolean) {
    var lista = [];
    debugger
    if (valid) {

      // TODO se busca la relación de familiares, se crea dto con los datos en relaciones
      model.sexo = (typeof model.sexo == 'string') ? model.sexo : model.sexo.id;
      model.estadoCivil = (typeof model.estadoCivil == 'string') ? model.estadoCivil : model.estadoCivil.id;

      if (!model.genero) {
        model.genero = model.sexo;
      } else {
        model.genero = (typeof model.genero == 'string') ? model.genero : model.genero.id;
      }
      model.contacto = model.contacto.map(elem => { elem.tipo = ((typeof elem.tipo == 'string') ? elem.tipo : elem.tipo.id); return elem });
      if (this.seleccion) {
        model.id = this.seleccion.id;
      }

      if (model.relaciones) {
        model.relaciones = model.relaciones.map(elem => { elem.relacion = ((typeof elem.relacion == 'string') ? elem.relacion : elem.relacion.id); return elem });
      }

      //Si quitan las relaciones.referencia inexistentes
      model.relaciones.forEach(rel => {
        if (rel.referencia === "") {
          rel.referencia = null;
        }
      });
      // Se controla si existe el paciente
      if (!model.id) {

        let dtoBusqueda = {
          'apellido': model.apellido, 'nombre': model.nombre, 'documento': model.documento.toString(),
          'fechaNacimiento': model.fechaNacimiento
        };
        this.pacienteService.searchMatch('documento', dtoBusqueda, 'exactMatch', true)
          .subscribe(valor => {

            this.pacientesSimilares = valor; console.log(valor)
            if (this.pacientesSimilares.length > 0 && !this.sugerenciaAceptada) {
              this.disableGuardar = true;
              this.plex.alert('Existen pacientes con un alto procentaje de matcheo, verifique la lista');
            } else {
              this.save(model);
            }
          });
      } else {
        this.save(model);
      }

    } else {
      this.plex.alert('Debe completar los datos obligatorios');
    }
  }

  save(model: any) {
    let operacionPac: Observable<IPaciente>;
    if (this.sugerenciaAceptada) {
       this.plex.confirm('¿Esta seguro que desea modificar los datos del paciente seleccionado? ').then(resultado => {
        if (resultado) {
          debugger
          operacionPac = this.pacienteService.save(model);
          operacionPac.subscribe(result => {
            this.data.emit(result)
          });
        }
      })
    } else {
      this.plex.confirm('¿Esta seguro que desea guardar los datos? ').then(resultado => {
        if (resultado) {
          debugger
          operacionPac = this.pacienteService.save(model);
          operacionPac.subscribe(result => {
            this.data.emit(result)
          });
        }
      })
    }
  }

  onCancel() {
    this.data.emit(null)
  }

  onSelect(paciente: IPaciente) {
    this.seleccion = paciente;
    this.createForm.patchValue(this.seleccion);
    this.disableGuardar = false;
    this.sugerenciaAceptada = true;
  }

}
