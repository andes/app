import { Component, AfterViewInit, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { PacienteService } from './../../services/paciente.service';
import { IPaciente } from './../../interfaces/IPaciente';
import { PacienteUpdateComponent } from './paciente-update.component';
import { PacienteCreateComponent } from './paciente-create.component';
import {
} from '@angular/common';


@Component({
  selector: 'pacientes',
  templateUrl: 'paciente.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PacienteComponent implements AfterViewInit {
  @Output()
  found: EventEmitter<Array<any>> = new EventEmitter<Array<any>>();
  @Output()
  selected: EventEmitter<any> = new EventEmitter<any>();
  showcreate: boolean = false;
  showupdate: boolean = false;
  error: boolean = false;
  mensaje: string = "";
  pacientes: IPaciente[];
  searchForm: FormGroup;
  selectedPaciente: IPaciente;
  seachTextModel: string;
  pacientesSearch: boolean = false;
  results$: Subject<Array<any>> = new Subject<Array<any>>();
  modeloSlide: any;
  active: boolean = false;
  seachText: FormControl = new FormControl('');
  nuevoPaciente: boolean = false;
  pacientesScan: boolean = false;
  pacienteScaneado: any = {};

  constructor(private formBuilder: FormBuilder, private pacienteService: PacienteService) {
    this.results$.subscribe((res) => {
      this.found.emit(res);
    });
  }

  //checked: boolean = true;

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      documento: [''],
      nombre: [''],
      apellido: [''],
    });
    this.modeloSlide = {
      activo: false
    };
  }

  /*Activa la búsqueda por campos*/
  activate(event: any) {
    if (event) {
      this.pacientesSearch = true;
      this.modeloSlide.activo = true;
    } else {
      this.pacientesSearch = false;
      this.modeloSlide.activo = false;
    }
  }

  ngAfterViewInit() {
    this.seachText
      .valueChanges
      .map((text: any) => text ? text.trim() : '')                                             // Se ignoran los espacios
      .do(searchString => searchString ? this.mensaje = 'Buscando...' : this.mensaje = '')
      .debounceTime(500)                          // Se esperan un milisegundos para que complete la busqueda
      .distinctUntilChanged()
      .switchMap(searchString => {
        this.nuevoPaciente = false;
        return new Promise<Array<any>>((resolve, reject) => {
          if (searchString) {
            // Se verifica mediante expresiones regulares el string recibido
            // para controlar si se realizó un escaneo de DNI
            this.verificarInput(searchString);
            this.pacienteService.search(searchString, this.pacienteScaneado)
              .subscribe(resultados => {
                let results: Array<any> = resultados;
                if (results.length > 0) {
                  this.mensaje = '';
                } else {
                  if (this.seachTextModel && this.seachTextModel.trim()) {
                    if (this.pacientesScan) {
                      this.mensaje = 'Presione - Nuevo Paciente - para dar de alta al paciente';
                    } else {
                      this.mensaje = 'Sin resultados';
                    }

                  }
                  this.nuevoPaciente = true;
                }
                resolve(results);
              },
              err => {
                reject(err);
              });
          } else {
            this.mensaje = 'Ingrese los datos del paciente';
            resolve([]);
          }
        });
      })
      .catch(this.handleError)
      .subscribe(this.results$);
  }

  private verificarInput(cadena) {
    debugger;
    // let du = new RegExp('[0-9]+".+".+"[M|F]"[0-9]{7,8}"[A-Z]"[0-9]{2}-[0-9]{2}-[0-9]{4}"[0-9]{2}-[0-9]{2}-[0-9]{4}');
    let parse = [];
    let datosDni = cadena.split('"');
    // Si la cadena, es la lectura del código del documento
    // la búsqueda se realiza por nombre, apellido, documento, sexo, fecha de nacimiento
    if (datosDni.length >= 9) {
      // Los datos se ordenan de la siguiente forma documento, apellido, nombre, sexo, fechadenacimiento
      let sexo = (datosDni[3] = 'F') ? 'femenino' : 'masculino';
      // parse = datosDni[4] + ' ' + datosDni[1] + ' ' + datosDni[2] + ' ' + sexo;
      parse = [datosDni[4], datosDni[1], datosDni[2], sexo];
      this.pacientesScan = true;
      this.pacienteScaneado.documento = datosDni[4];
      this.pacienteScaneado.apellido = datosDni[1];
      this.pacienteScaneado.nombre = datosDni[2];
      this.pacienteScaneado.sexo = sexo;
    } else {
      this.pacientesScan = false;
      this.pacienteScaneado.documento = '';
      this.pacienteScaneado.apellido = '';
      this.pacienteScaneado.nombre = '';
    }
    return parse;
  }

  findPacientes() {
    let dto = this.searchForm.value;
    debugger;
    var dtoBusqueda = {
      'apellido': dto.apellido, 'nombre': dto.nombre, 'documento': String(dto.documento),
    };
    this.pacienteService.searchMatch('documento', dto)
      .subscribe(resultados => {
        let results: Array<any> = resultados;
        if (results.length > 0) {
          this.mensaje = '';
        } else {
          if (this.seachTextModel && this.seachTextModel.trim()) {
            this.mensaje = 'Sin resultados';
          }
        }

        // resolve(results);
      },
      err => {
        // reject(err);
        this.mensaje = 'Error al realizar las búsquedas';
      });


  }


  resultSelected(result) {
    this.selected.next(result);
  }


  handleError(): any {
    this.mensaje = 'Error al realizar las búsquedas';
  }

  // onDisable(objPaciente: IPaciente) {
  //   this.error = false;
  //   this.pacienteService.disable(objPaciente)
  //     .subscribe(dato => this.loadPaciente(), //Bind to view
  //     err => {
  //       if (err) {
  //         console.log(err);
  //         this.error = true;
  //         this.mensaje = "Ha ocurrido un error";
  //         return;
  //       }
  //     });
  // }

  onReturn(objPaciente: IPaciente): void {
    this.showcreate = false;
    this.showupdate = false;
  }

  // onEnable(objPaciente: IPaciente) {
  //   this.error = false;
  //   this.pacienteService.enable(objPaciente)
  //     .subscribe(dato => this.loadPaciente(), //Bind to view
  //     err => {
  //       if (err) {
  //         console.log(err);
  //       }
  //     });
  // }

  onEdit(objPaciente: IPaciente) {
    this.showcreate = false;
    this.showupdate = true;
    this.selectedPaciente = objPaciente;
  }

}
