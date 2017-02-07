import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { PacienteService } from './../../services/paciente.service';
import { IPaciente } from './../../interfaces/IPaciente';
import { PacienteUpdateComponent } from './paciente-update.component';
import { PacienteCreateComponent } from './paciente-create.component';
import {
} from '@angular/common';


@Component({
  selector: 'pacientes',
  templateUrl: 'paciente.html'
})

export class PacienteComponent implements OnInit {
  @Output()
  selected: EventEmitter<any> = new EventEmitter<any>();
  showcreate: boolean = false;
  showupdate: boolean = false;
  error: boolean = false;
  mensaje: string = "";
  searchForm: FormGroup;
  selectedPaciente: IPaciente;
  searchTextModel: string;
  pacientesSearch: boolean = false;
  //results$: Subject<Array<any>> = new Subject<Array<any>>();
  resultados$: Observable<any>;
  modeloSlide: any;
  active: boolean = false;
  searchText: FormControl = new FormControl('');
  nuevoPaciente: boolean = false;
  pacientesScan: boolean = false;
  pacienteScaneado: any = {};
  pacientesLista: Array<any> = new Array<any>();


  constructor(private formBuilder: FormBuilder, private pacienteService: PacienteService) {
  }

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      documento: [''],
      nombre: [''],
      apellido: [''],
    });
    this.modeloSlide = {
      activo: false
    };

    this.resultados$ = this.searchText
      .valueChanges
      .map((value: any) => value ? value.trim() : '')             // ignore spaces
      .do(value => value ? this.mensaje = 'Buscando...' : this.mensaje = "")
      .debounceTime(700)                                          // wait when input completed
      .distinctUntilChanged()
      .switchMap(searchString => {
        return new Promise<Array<any>>((resolve, reject) => {
          if (searchString) {
            // Se verifica mediante expresiones regulares el string recibido
            // para controlar si se realizó un escaneo de DNI
            this.verificarInput(searchString);
            this.pacienteService.search(searchString, this.pacienteScaneado)
              .subscribe(resultados => {
                let results: Array<any> = resultados;
                resolve(results);
              },
              err => {
                reject(err);

              });
          } else {
            this.mensaje = 'Ingrese los datos del paciente';
            this.nuevoPaciente = false;
            resolve([]);
          }
        })
      })                  // request switchable
      .map((esResult: any) => {
        // extract results
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

  // Otra opción en caso para realizar la búsquedas searchMatch
  //   this.searchText.valueChanges
  //     .map((text: any) => text ? text : '')                                             // Se ignoran los espacios
  //     .do(searchString => searchString ? this.mensaje = 'Buscando...' : this.mensaje = '')
  //     .debounceTime(500)
  //     .distinctUntilChanged()
  //     // .subscribe(searchString => {
  //     //   console.log(searchString);
  //     //   if (searchString) {
  //     //     this.pacienteService.search(searchString, this.pacienteScaneado)
  //     //       .subscribe(resultados => {
  //     //         this.pacientesLista = resultados;
  //     //       });
  //     //
  //     //   }
  //     //   else {
  //     //     this.pacientesLista = [];
  //     //   }
  //     //
  //     // });

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
    let dtoBusqueda = {
      'apellido': dto.apellido, 'nombre': dto.nombre, 'documento': dto.documento.toString(),
    };
    this.pacienteService.searchMatch('documento', dtoBusqueda)
      .subscribe(value => { this.pacientesLista = value });

  }


  handleError(): any {
    this.mensaje = 'Error al realizar las búsquedas';
  }


  onReturn(objPaciente: IPaciente): void {
    this.showcreate = false;
    this.showupdate = false;
  }


  onEdit(objPaciente: IPaciente) {
    this.showcreate = false;
    this.showupdate = true;
    this.selectedPaciente = objPaciente;
  }

}
