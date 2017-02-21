import {
  Component,
  Output,
  EventEmitter,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl
} from '@angular/forms';
import {
  Subject,
  Observable
} from 'rxjs';
import {
  PacienteService
} from './../../services/paciente.service';
import {
  IPaciente
} from './../../interfaces/IPaciente';
import {
  PacienteCreateUpdateComponent
} from './paciente-create-update.component';
import {} from '@angular/common';


@Component({
  selector: 'pacientesSearch',
  templateUrl: 'paciente-search.html'
})

export class PacienteSearchComponent implements OnInit {
  @Output()
  selected: EventEmitter < any > = new EventEmitter < any > ();
  showcreate: boolean = false;
  // showupdate: boolean = false;
  error: boolean = false;
  mensaje: string = '';
  searchForm: FormGroup;
  selectedPaciente: IPaciente = null;
  searchTextModel: string;
  pacientesSearch: boolean = false;
  resultados$: Observable < any > ;
  modeloSlide: any;
  active: boolean = false;
  searchText: FormControl = new FormControl('');
  nuevoPaciente: boolean = false;
  pacientesScan: boolean = false;
  pacienteScaneado: any = {};
  pacientesLista: Array < any > = new Array < any > ();
  fechaActual: Date = new Date();
  cantPacientesValidados:number = 0;
  cantPacientesFallecidos: number = 0;


  constructor(private formBuilder: FormBuilder, private pacienteService: PacienteService) {}

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      documento: [''],
      nombre: [''],
      apellido: [''],
    });
    this.modeloSlide = {
      activo: false
    };
    
    this.inicializaPanelInformacion();
    
    this.resultados$ = this.searchText
      .valueChanges
      .map((value: any) => value ? value.trim() : '') // ignore spaces
      .do(value => value ? this.active = true : this.active = false)
      // .do(value => value ? this.mensaje = 'Buscando...' : this.mensaje = "")
      .debounceTime(700) // wait when input completed
      .distinctUntilChanged()
      .switchMap(searchString => {
        return new Promise < Array < any >> ((resolve, reject) => {
          if (searchString) {
            // Se verifica mediante expresiones regulares el string recibido
            // para controlar si se realizó un escaneo de DNI
            this.verificarInput(searchString);
            this.pacienteService.search(searchString, this.pacienteScaneado)
              .subscribe(resultados => {
                  //Tengo que limpiar la variable
                 
                  let results: Array < any > = resultados;
                  this.active = false;
                  resolve(results);
                },
                err => {
                  reject(err);

                });
          } else {
            this.mensaje = 'Ingrese los datos del paciente';
            this.selectedPaciente = null;
            this.pacientesScan = false;
            this.nuevoPaciente = false;
            resolve([]);
          }
        })
      }) // request switchable
      .map((esResult: any) => {
        // extract results
        //debugger;
        this.nuevoPaciente = true;
       
        if (esResult.length > 0) {
          this.mensaje = '';
          return esResult;
        } else {
          if (this.searchTextModel && this.searchTextModel.trim()) {
            if (this.pacientesScan) {
              this.mensaje = 'Presione - Nuevo Paciente - para dar de alta al paciente';
            } else {
              this.mensaje = 'Sin resultados';
            }

          }

          return [];
        }
      })
      .catch(this.handleError);
  }

  /*Activa la búsqueda por campos*/
  activate(event: any) {

    this.searchText.setValue('');
    this.pacientesLista = [];
    this.nuevoPaciente = false;

    if (event) {
      this.pacientesSearch = true;
      this.modeloSlide.activo = true;

    } else {
      this.pacientesSearch = false;
      this.modeloSlide.activo = false;

    }
  }

  private verificarInput(cadena) {
    // let du = new RegExp('[0-9]+".+".+"[M|F]"[0-9]{7,8}"[A-Z]"[0-9]{2}-[0-9]{2}-[0-9]{4}"[0-9]{2}-[0-9]{2}-[0-9]{4}');
    let parse = [];
    let datosDni = cadena.split('"');
    // Si la cadena, es la lectura del código del documento
    // la búsqueda se realiza por nombre, apellido, documento, sexo, fecha de nacimiento
    if (datosDni.length >= 8) {
      this.parseDocument(datosDni);

    } else {
      this.pacientesScan = false;
      this.pacienteScaneado.documento = '';
      this.pacienteScaneado.apellido = '';
      this.pacienteScaneado.nombre = '';
    }

    return parse;
  }


  parseDocument(datosDni) {

    this.pacientesScan = true;
    // Los datos se ordenan de la siguiente forma documento, apellido, nombre, sexo, fechadenacimiento
    let sexo = (datosDni[3] === 'F') ? 'femenino' : 'masculino';
    let fecha = datosDni[6].split('-');
    this.pacienteScaneado.documento = datosDni[4];
    this.pacienteScaneado.apellido = datosDni[1];
    this.pacienteScaneado.nombre = datosDni[2];
    this.pacienteScaneado.sexo = sexo;
    this.pacienteScaneado.estado = 'validado';
    this.pacienteScaneado.fechaNacimiento = new Date(fecha[2], (parseInt(fecha[1]) - 1), fecha[0]);
    this.selectedPaciente = this.pacienteScaneado;

  }

  findPacientes() {
    let dto = this.searchForm.value;
    let dtoBusqueda;


    dtoBusqueda = {
      'apellido': dto.apellido,
      'nombre': dto.nombre,
      'documento': dto.documento.toString(),
    }

    this.pacienteService.searchMatch('documento', dtoBusqueda)
      .subscribe(value => {
        this.pacientesLista = value
      });

  }


  handleError(): any {
    this.mensaje = 'Error al realizar las búsquedas';
  }


  onReturn(objPaciente: IPaciente): void {
    this.showcreate = false;
  }


  onSelect(objPaciente: IPaciente) {
   
    this.showcreate = false;
    this.selectedPaciente = objPaciente;
    this.selected.emit(objPaciente);
  }

  mostrarPaciente(paciente: any) {
    //Si el paciente está validado no debería permitir generar uno nuevo
    if (paciente.estado === 'validado')
      this.nuevoPaciente = false;

    this.selectedPaciente = paciente;
  }

  inicializaPanelInformacion(){
    
    /*todas las queries que irian en el panel */
    this.cantPacientesValidados = 6;
    this.cantPacientesFallecidos = 2;
    //  this.pacienteService.getConsultas("validados")
    //    .subscribe(resultado => {
    //               this.cantPacientesValidados = resultado
    //             });

    // this.pacienteService.getConsultas("fallecidos")
    //   .subscribe(resultado => {
    //     this.cantPacientesFallecidos = resultado
    //   })

  }

}
