import {
  ConfigPrestacionService
} from './../../services/turnos/configPrestacion.service';
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
  EventEmitter,
  ViewChildren
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
  pacientesScan = false;
  pacientesEncontrados = false;
  dniScan: string = '';
  nombreScan: string = '';
  apellidoScan: string = '';
  sexoScan: string = '';
  similitudScan: number = 0;
  fechaNacimientoScan: string = '';
  mensaje: string = '';
  pacientes: IPaciente[];
  estados: string[] = [];
  sexos: any[] = [];
  selectedPaciente: IPaciente;
  documentScanned = 'no';
  licenciaConductor = [];
  stringAnterior = '';
  pacientesSearch: boolean;
  /*La primera vez arranca con el slide off para la búsqueda por DNI o SUGGEST. En caso de activarlo debería mostrar los campos*/
  modeloSlide: any;
  modeloSearch: any;

  @ViewChildren('infoData') vc;


  constructor(private pacienteService: PacienteService) {}

  //checked: boolean = true;

  @Output()
  selected: EventEmitter < IPaciente > = new EventEmitter < IPaciente > ();

  ngOnInit() {
    this.modeloSlide = {
      activo: false
    };
    // this.sexos = enumerados.getObjSexos();
  }


  /*Activa la búsqueda por campos*/
  activate(event: any) {
    this.pacientesScan = false;
    this.error = false;

    if (event) {
      this.pacientesSearch = true;
      this.modeloSlide.activo = true;
    } else {
      this.pacientesSearch = false;
      this.modeloSlide.activo = false;
    }


  }

  /*Esta funciones hay que sacarlas a UTILS para hacerla generica*/
  formatDate(date) {
    if (date != null) {
      var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;

      return [year, month, day].join('-');
    } else {
      return null;
    }
  }
  verificarExpresion(cadena) {
    let du = new RegExp('[0-9]+".+".+"[M|F]"[0-9]{7,8}"[A-Z]"[0-9]{2}-[0-9]{2}-[0-9]{4}"[0-9]{2}-[0-9]{2}-[0-9]{4}');
    /*OJO se puede seguir parseando mejor pero no conozco bien el formato ya que está sacado de un ejemplo (Mi carnet)*/
    let lic = new RegExp('DNI\r\n[0-9]{7,8}\r\nM\r\n.+\r\n.+\r\n[0-9]{2}-[0-9]{2}-[0-9]{4}\r\n[A-Z]+\r\n.+\r\n.+');
    let resultado = !du.test(cadena) ? !lic.test(cadena) ? 0 : 2 : 1;
    return resultado;
  }
  /*Fin de funciones útiles */

  /*Método que verifica los datos de entrada y realiza la búsqueda*/
  searchInputData(data: string) {
    this.pacientesScan = false;
    this.error = false;
    if (data) {
      /*llamamos al método para ver si es una lectura a parsear o para búsqueda por suggest*/
      let tipoDocumentacion = this.verificarExpresion(data);
      this.parseDocument(data, tipoDocumentacion);
      /*Luego llamo al serivicio */
      /*this.loadPaciente(data);*/
    } else {
      this.mensaje = 'Debe ingresar datos para buscar';
      this.error = true;
    }
  }

  loadPaciente(dto) {
    this.error = false;
    this.pacienteService.postSearch(dto)
      .subscribe(
        pacientes => {
          this.pacientesEncontrados = true;
          this.pacientes = pacientes;
        },
        err => {
          if (err) {
            this.mensaje = ' ¡Error al intentar acceder a la base de datos! ';
            this.error = true;
            return;
          }

        }
      );
  }


  /*Blanquea los campos de búsqueda y el lector de barras*/
  limpiarCampos() {
    this.vc.first.nativeElement.focus();
    this.error = false;
    this.pacientes = null;
  }
  /*Parseo de documentos escaneados */
  parseDocument(informacion: string, tipoDocumento: number) {

    switch (tipoDocumento){
      case 1: {
        this.similitudScan = Math.round(Math.random() * (100 - 90) + 90);
        this.modeloSearch = '';
        this.pacientesScan = true;
        let data = informacion.split('"');
        let fecha = data[6].split('-');
        let fechaNac = fecha[0] + '/' + fecha[1] + '/' + fecha[2];
        this.apellidoScan = data[1];
        this.nombreScan = data[2];
        this.sexoScan = data[3] === 'F' ? 'FEMENINO' : 'MASCULINO';
        this.dniScan = data[4];
        this.fechaNacimientoScan = fechaNac;
        break;
      }
      case 2: {
             /*TODO: Para mejorar!! --------------------------
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
            //this.searchForm.patchValue({
            // info: "",
            // apellido: this.licenciaConductor[4],
            // nombre: this.licenciaConductor[3],
            // sexo: {
            //   id: this.licenciaConductor[2] == "F" ? "femenino" : "masculino",
            //   nombre: this.licenciaConductor[2] == "F" ? "Femenino" : "Masculino",
            // },
            // documento: this.licenciaConductor[1],
            // fechaNacimiento: new Date(fechaNac)
            //});

            //Limpiamos las variables globales de control
            this.licenciaConductor = [];
            this.documentScanned = "no";
            this.stringAnterior = "";
            }
            */
            break;
        }
      default: {
        /*Cuando no es un documento sino que es un sugerido para buscar por elasticsearch */
        break;
      }
    }
    
  }

  darTurno(paciente: IPaciente) {
    this.selected.emit(paciente);
  }
}
