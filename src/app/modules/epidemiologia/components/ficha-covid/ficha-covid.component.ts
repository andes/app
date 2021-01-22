import { Component, Input, OnInit } from '@angular/core';
import { FormsService } from '../../../forms-builder/services/form.service';
import { Observable } from 'rxjs';
import { Auth } from '@andes/auth';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';


@Component({
  selector: 'app-ficha-covid',
  templateUrl: './ficha-covid.component.html'
})
export class FichaCovidComponent implements OnInit {
  @Input() paciente: IPaciente;

  public fields = [];
  public fieldSelected;
  public organizaciones$: Observable<any>;
  public secciones = [];

  constructor(
    private formsService: FormsService,
    private auth: Auth
  ) { }

  ngOnInit(): void {
    this.organizaciones$ = this.auth.organizaciones();
    // this.formsService.search({ name: 'covid10' }).subscribe((ficha: any) => {
    //   this.fields = ficha[0].fields;
    //   this.secciones.push({ seccion: 'Seccion 1', fields: this.fields });
    // });
    this.secciones.push({
      seccion: 'Seccion 2', fields: [
        {
          "id": "62060e5bc3623dcb27d5c521",
          "key": "apellido",
          "label": "Apellido",
          "type": "string",
          "description": "",
          "required": false,
          "subfilter": false,
          "resources": null,
          "preload": true
        },
        {
          "id": "62060e5bc3623dcb27d5c5w1",
          "key": "nombre",
          "label": "Nombre",
          "type": "string",
          "description": "",
          "required": false,
          "subfilter": true,
          "resources": null,
          "preload": false
        },
        {
          "id": "62060e5bc3623dcb27d2c5w1",
          "key": "organizaciones",
          "label": "Organizaciones",
          "type": "select",
          "resources": "profesionales",
          "description": "",
          "required": false,
          "subfilter": true,
          "preload": true
        }
      ]
    },
      {
        seccion: 'Seccion 1', fields: [
          {
            "id": "62060e5bc3623dcb27d5c521",
            "key": "dsa",
            "label": "dsa",
            "type": "string",
            "description": "",
            "required": false,
            "subfilter": false,
            "resources": null,
            "preload": true
          },
          {
            "id": "62060e5bc3623dcb27d5c5w1",
            "key": "ddsa",
            "label": "a",
            "type": "string",
            "description": "",
            "required": false,
            "subfilter": true,
            "resources": null,
            "preload": false
          },
          {
            "id": "62060e5bc3623dcb27d2c5w1",
            "key": "g",
            "label": "g",
            "type": "select",
            "resources": "profesionales",
            "description": "",
            "required": false,
            "subfilter": true,
            "preload": true
          }
        ]
      });
  }

  saveFicha(nuevaFicha) {
    console.log(nuevaFicha);
  }

}
