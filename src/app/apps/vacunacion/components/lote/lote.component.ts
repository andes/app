import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { VacunasService } from 'src/app/services/vacunas.service';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lote',
  templateUrl: './lote.component.html',
})
export class LoteComponent implements OnInit {
  public vacunaSelected: any;
  public dosisSeleccionada: any;
  public showSidebar = false;
  public vacunas$: Observable<any[]>;
  public lotes$: Observable<any[]>;
  public dosis$: Observable<any[]>;
  public esquemaNuevo$: Observable<any[]>;
  public esquemas$: Observable<any>;
  public creando = false;
  public creandoDosis = false;
  public detalle = false;
  public seEncuentra = false;
  public esquemaDosis;
  public esquemaVacunas;
  public mostrarCondiciones = {};

  public dosisNombre = [
    {
      id: 1,
      dosis: '1ra Dosis'
    },
    {
      id: 2,
      dosis: '2da Dosis'
    }
  ];

  public loteSelected =
    {
      codigo: '',
      descripcion: '',
      habilitado: true,
      vacuna: null
    };

  public dosisSelected =
    {
      codigo: null,
      nombre: null,
      vacuna: null,
      esquema: null,
      habilitado: true
    };

  constructor(
    private vacunasService: VacunasService,
    private plex: Plex,
    private auth: Auth,
    private router: Router,
  ) { }

  ngOnInit(): void {
    if (!this.auth.getPermissions('vacunacion:crear-dosis-lote:?').length) {
      this.router.navigate(['inicio']);
    }
    this.vacunas$ = this.vacunasService.getNomivacVacunas({
      habilitado: true,
      calendarioNacional: 'NO',
      sort: 'nombre'
    });
  }

  showInSideBar(vacuna) {
    if (vacuna) {
      vacuna.id = vacuna._id;
      this.loteSelected.vacuna = vacuna;
      this.vacunaSelected = vacuna;
      this.dosisSelected.vacuna = vacuna;
      this.showSidebar = true;
      this.loadLote();
      this.loadDosis();
      this.cargarEsquema();
      this.atras();
      this.cerrar();
    }
  }

  cargarEsquema() {
    this.esquemaNuevo$ = this.vacunasService.getNomivacEsquemas({
      habilitado: true,
      vacuna: this.vacunaSelected._id,
      sort: 'codigo'
    });
  }

  loadLote() {
    this.lotes$ = this.vacunasService.getNomivacLotes({
      habilitado: true,
      vacuna: this.vacunaSelected._id,
      sort: 'codigo'
    });
  }

  loadDosis() {
    this.dosis$ = this.vacunasService.getNomivacDosis({
      habilitado: true,
      vacuna: this.vacunaSelected._id,
      sort: 'codigo'
    });
  }

  closeSidebar() {
    this.showSidebar = false;
  }

  crearLote() {
    this.creando = true;
  }

  crearDosis() {
    this.creandoDosis = true;
  }

  mostrarDosis(dosis) {
    this.dosisSeleccionada = dosis;
    this.esquemaDosis = dosis.esquema;
    this.esquemaVacunas = dosis.vacuna;
    if (this.mostrarCondiciones[dosis._id]) {
      this.mostrarCondiciones[dosis._id] = false;
    } else {
      this.mostrarCondiciones[dosis._id] = true;
    }
  }

  cerrar() {
    this.creando = false;
    this.creandoDosis = false;
    this.limpiarForm();
  }

  atras() {
    this.detalle = false;
  }

  limpiarForm() {
    this.loteSelected.codigo = '';
    this.loteSelected.descripcion = '';
    this.dosisSelected.codigo = '';
    this.dosisSelected.nombre = null;
    this.dosisSelected.esquema = null;
  }

  guardarLote() {
    this.seEncuentra = false;
    this.lotes$.subscribe(lotes => {
      this.seEncuentra = lotes.some(lote => lote.codigo.toUpperCase() === this.loteSelected.codigo.toUpperCase());
      if (this.seEncuentra) {
        this.plex.toast('danger', 'El lote que esta creando ya existe.');
      } else {
        this.vacunasService.guardarNomivacLotes(this.loteSelected).subscribe(resultado => {
          if (resultado) {
            this.plex.toast('success', 'Lote creado con éxito.');
            this.cerrar();
          }
        });
      }
    });
  }

  guardarDosis() {
    this.dosisSelected.nombre = this.dosisSelected.nombre.dosis;
    this.vacunasService.guardarNomivacDosis(this.dosisSelected).subscribe(resultado => {
      if (resultado) {
        this.plex.toast('success', 'Dosis creada con éxito.');
        this.cerrar();
      }
    });

  }
}