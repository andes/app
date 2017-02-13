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
  selector: 'paciente-create',
  templateUrl: 'paciente-create.html'
})
export class PacienteCreateComponent implements OnInit {
  @Input('seleccion') seleccion: IPaciente;
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
  familiaresPacientes;

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
      estado: [''],
      sexo: ['', Validators.required],
      genero: [''],
      estadoCivil: [''],
      contacto: this.formBuilder.array([
        this.iniContacto(1)
      ]),
      direccion: this.formBuilder.array([
        this.iniDireccion()
      ]),
      financiador: this.formBuilder.array([
      ]),
      relaciones: this.formBuilder.array([
        //this.iniRelacion()
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

    if (this.seleccion) {
      this.createForm.patchValue(this.seleccion);
    }

    //this.detectarRelaciones();
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
              debugger;
              this.pacienteService.searchMatch('documento', dtoBusqueda)
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

  iniDireccion(unaDireccion?: IDireccion) {
    // Inicializa Direccion
    var myPais;
    var myProvincia;
    var myLocalidad;
    if (unaDireccion) {
      if (unaDireccion.ubicacion) {
        if (unaDireccion.ubicacion.pais) {
          myPais = unaDireccion.ubicacion.pais;
          if (unaDireccion.ubicacion.provincia) {
            this.provincias = this.todasProvincias.filter((p) => p.pais.id == myPais.id);
            myProvincia = unaDireccion.ubicacion.provincia;
            if (unaDireccion.ubicacion.localidad) {
              this.localidades = this.todasLocalidades.filter((loc) => loc.provincia.id == myProvincia.id);
              myLocalidad = unaDireccion.ubicacion.localidad;
            }
          }
        }
      }

      return this.formBuilder.group({
        valor: [unaDireccion.valor],
        ubicacion: this.formBuilder.group({
          pais: [myPais],
          provincia: [myProvincia],
          localidad: [myLocalidad]
        }),
        ranking: [unaDireccion.ranking],
        codigoPostal: [unaDireccion.codigoPostal],
        ultimaActualizacion: [unaDireccion.ultimaActualizacion],
        activo: [unaDireccion.activo]
      })
    } else {
      return this.formBuilder.group({
        valor: [''],
        ubicacion: this.formBuilder.group({
          pais: [''],
          provincia: [''],
          localidad: ['']
        }),
        ranking: [1],
        codigoPostal: [''],
        ultimaActualizacion: [''],
        activo: [true]
      })
    }
  }

  addDireccion(unaDireccion?) {
    // agrega una Direccion al array de direcciones
    const control = <FormArray>this.createForm.controls['direccion'];
    control.push(this.iniDireccion(unaDireccion));
  }

  loadDirecciones() {
    this.seleccion.direccion.forEach(element => {
      this.addDireccion(element);
    });
  }

  removeDireccion(indice: number) {
    const control = <FormArray>this.createForm.controls['direccion'];
    control.removeAt(indice);
  }

  /*Código de filtrado de combos*/
  loadPaises(event) {
    this.paisService.get().subscribe(event.callback);
  }

  loadProvincias(event, pais) {
    this.provinciaService.get({ "pais": pais.value.id }).subscribe(event.callback);
  }

  loadLocalidades(event, provincia) {
    this.localidadService.get({ "provincia": provincia.value.id }).subscribe(event.callback);
  }

  // detectarRelaciones(){
  //   this.createForm.controls['relaciones'].valueChanges.subscribe((value) => {
  //     console.log(value);
  //        // Se busca el matcheo
  //        debugger;
  //       //  value.forEach(rel => {
  //       //    let familiarPacientes;
  //       //    let dtoBusqueda = {
  //       //      'apellido': rel.apellido, 'nombre': rel.nombre, 'documento': rel.documento,
  //       //    };
  //        //
  //       //    this.pacienteService.searchMatch('documento', dtoBusqueda)
  //       //      .subscribe(value => { familiarPacientes = value });
  //        //
  //       //  })
  //   });
  // }

  onSave(model: any, isvalid: boolean) {

    if (isvalid) {
      let operacionPac: Observable<IPaciente>;
      // se busca la relación de familiares, se crea dto con los datos en relaciones
      model.sexo = (typeof model.sexo == 'string') ? model.sexo : model.sexo.id;
      model.estadoCivil = (typeof model.estadoCivil == 'string') ? model.estadoCivil : model.estadoCivil.id;

      if (!model.genero) {
        model.genero = model.sexo;
      } else {
        model.genero = (typeof model.genero == 'string') ? model.genero : model.genero.id;
      }
      model.contacto = model.contacto.map(elem => { elem.tipo = ((typeof elem.tipo == 'string') ? elem.tipo : elem.tipo.id); return elem });
      model.id = this.seleccion.id;
      this.plex.confirm('¿Esta seguro que desea guardar los datos? ').then(resultado => {
        if (resultado) {
          operacionPac = this.pacienteService.save(model);
          operacionPac.subscribe(result => {
            this.data.emit(result)
          });
        }
      })

    } else {
      this.plex.alert('Debe completar los datos obligatorios');
    }
  }

  onCancel() {
    this.data.emit(null)
  }

  filtrarProvincias(indexPais: number) {
    let pais = this.paises[(indexPais - 1)];
    this.provincias = this.todasProvincias.filter((p) => (p.pais.id == pais.id));
  }

  filtrarLocalidades(indexProvincia: number) {
    let provincia = this.provincias[(indexProvincia - 1)];
    this.localidades = this.todasLocalidades.filter((loc) => (loc.provincia.id == provincia.id));
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

    // Se agrega servicio de matcheo de pacientes
  }

  removeRelacion(i: number) {
    // elimina form Financiador u obra Social
    const control = <FormArray>this.createForm.controls['relaciones'];
    control.removeAt(i);
  }

  addFamiliar(familiar, i) {
    debugger;
    // Se agrean los datos del familiar a relaciones
    let relaciones = this.createForm.value.relaciones;
    let relacionFamiliar = relaciones[i];
    relacionFamiliar.referencia = familiar.id;
    relacionFamiliar.documento = familiar.documento;
    relacionFamiliar.nombre = familiar.nombre;
    relacionFamiliar.apellido = familiar.apellido;
    //relacionFamiliar.relacion = relacionFamiliar.relacion.id;
    relaciones[i] = relacionFamiliar;
    this.createForm.patchValue({relaciones: relaciones });

  }



}
