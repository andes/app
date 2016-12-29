import {
  IPaciente
} from './../../interfaces/IPaciente';
import {
  PacienteService
} from './../../services/paciente.service';
import * as enumerados from './../../utils/enumerados';
import {
  Observable
} from 'rxjs/Rx';
import {
  Component,
  OnInit,
  Output,
  Input,
  Renderer,
  EventEmitter
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import {} from '@angular/common';


@Component({
  selector: 'pacientesSearch',
  templateUrl: 'pacienteSearch.html'
})
export class PacienteSearchComponent implements OnInit {

  error: boolean = false;
  mensaje: string = "";
  pacientes: IPaciente[];
  estados: string[] = [];
  sexos: any[] = [];
  searchForm: FormGroup;
  selectedPaciente: IPaciente;
  documentScanned = "no";
  licenciaConductor = [];
  stringAnterior = "";

  constructor(private formBuilder: FormBuilder, private pacienteService: PacienteService) {}

  checked: boolean = true;

  ngOnInit() {

    this.sexos = enumerados.getObjSexos();

    this.searchForm = this.formBuilder.group({
      nombre: [''],
      apellido: [''],
      documento: [''],
      sexo: [''],
      estado: [''],
      fechaNacimiento: [null],
      info: ['']
    });

  }

  //Esta función hay que sacarla a UTILS para hacerla generica
  formatDate(date) {
    if(date!= null){
      var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
    }else
    {
      return null
    }
    
  }

  loadPaciente() {
    this.error = false;
    var dto = null;
    var formulario = this.searchForm.value;
    console.log('Esta es la fecha de nacimiento posta: ',formulario.fechaNacimiento);
    console.log('Esta es la que mando al filtro:', this.formatDate(formulario.fechaNacimiento));

    dto = {
        nombre: formulario.nombre != "" ? formulario.nombre != null ? formulario.nombre + "*" : "*" : "*",
        apellido: formulario.apellido != "" ? formulario.apellido != null ? formulario.apellido + "*" : "*" : "*",
        documento: formulario.documento != "" ? formulario.documento != null ? formulario.documento + "*": "*" : "*",
        fechaNacimiento: formulario.fechaNacimiento != null ? formulario.fechaNacimiento ? this.formatDate(formulario.fechaNacimiento) : "*" : "*",
        sexo: formulario.sexo != "" ? formulario.sexo != null ? formulario.sexo.id : "*" : "*",
      }
    console.log(dto)
    this.pacienteService.postSearch(dto)
      .subscribe(
        pacientes => {
          this.pacientes = pacientes
        },
        err => {
          if (err) {
            this.mensaje = "¡Error al intentar acceder a la base de datos!";
            this.error = true;
            return;
          }
        });
  }

  findPacientes() {
    //Cambiar esta parte ya que las consultas se va a mandar por campos
    this.error = false;
    var formulario = this.searchForm.value;
    if (this.documentScanned == "no") {
      //Debo chequear porque no fue con código de barras
      if (formulario.nombre == "" && formulario.apellido == "" && formulario.documento == "" && formulario.fechaNacimiento == null && formulario.sexo == "") {
        this.error = true;
        this.mensaje = "Debe ingresar datos en algún campo de búsqueda";
        return;
      }
    }
    this.loadPaciente();
  }

  //Blanquea los campos de búsqueda y el lector de barras
  limpiarCampos() {
    var formulario = this.searchForm.value;
    this.error = false;
    this.pacientes = null;
    this.searchForm.patchValue({
      info: "",
      apellido: "",
      nombre: "",
      sexo: "",
      documento: "",
      fechaNacimiento: ""
    }, );
  }

  //Método que verifica que tipo de documento se va a escanear (DU o Licencia de Conductor NACIONAL)
  verifyDocument(data: string) {

    if (data) {

      if (data == "DNI") {
        //Corresponde a la licencia de conductor
        this.documentScanned = "LICENCIA_CONDUCIR";
        //inicializo cadena anterior
        this.stringAnterior = data

      } else {
        if (this.documentScanned != "LICENCIA_CONDUCIR" && this.documentScanned != "DU") {
          var datosLector = data.split('"');
          if (datosLector.length == 9) {
            //Corresponde a DU
            this.documentScanned = "DU";
          }
        }
      }

      if (this.documentScanned == "LICENCIA_CONDUCIR" || this.documentScanned == "DU") {
        this.parseDocument(data, this.documentScanned)
      }
    }
  }

  parseDocument(informacion: string, tipoDocumento: string) {

    if (tipoDocumento == "DU") {
      var data = informacion.split('"');
      //Parseo la fecha para darle el formato adecuado
      var fecha = data[6].split('-');
      var fechaNac = fecha[1] + '/' + fecha[0] + '/' + fecha[2];
      //fin parseo de fecha
      this.searchForm.patchValue({
        info: "", //Limpio el buscador
        apellido: data[1],
        nombre: data[2],
        sexo:{
          id:data[3] == "F" ? "femenino" : "masculino",
          nombre:data[3] == "F" ? "Femenino" : "Masculino",
        },
        documento: data[4],
        fechaNacimiento: new Date(fechaNac)
      }, );
      this.documentScanned = "no";


    } else {

      if (this.licenciaConductor.length < 18) {

        var pos;

        if (this.stringAnterior.length == informacion.length) {
          pos = 0;
        } else {
          pos = this.stringAnterior.length;
        }

        this.stringAnterior = informacion;
        this.licenciaConductor.push(this.stringAnterior.substring(pos));
        console.log(this.licenciaConductor)
      } else {

        var d = this.licenciaConductor[5].split('-');
        var fechaNac = d[1] + '/' + d[0] + '/' + d[2]
        this.searchForm.patchValue({
          info: "",
          apellido: this.licenciaConductor[4],
          nombre: this.licenciaConductor[3],
          sexo: {
            id:this.licenciaConductor[2] == "F" ? "femenino" : "masculino",
          nombre:this.licenciaConductor[2] == "F" ? "Femenino" : "Masculino",
          },
          documento: this.licenciaConductor[1],
          fechaNacimiento: new Date(fechaNac)
        });

        //Limpiamos las variables globales de control
        this.licenciaConductor = [];
        this.documentScanned = "no";
        this.stringAnterior = "";
      }
    }
  }
}
