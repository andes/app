import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Plex } from '@andes/plex';
import { snomedIngreso, snomedEgreso } from '../../constantes-internacion';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { Observable } from 'rxjs';
import { ListadoInternacionService } from './listado-internacion.service';
import { map } from 'rxjs/operators';
import { PermisosMapaCamasService } from '../../services/permisos-mapa-camas.service';

@Component({
    selector: 'app-internacion-listado',
    templateUrl: './listado-internacion.component.html',
})

export class InternacionListadoComponent implements OnInit {
    listaInternacion$: Observable<IPrestacion[]>;
    selectedPrestacion$: Observable<IPrestacion>;
    fechaIngresoHasta$ = this.listadoInternacionService.fechaIngresoHasta;

    // VARIABLES
    public mostrar = 'datosInternacion';
    public cambiarUO = false;
    public puedeValidar = false;
    public puedeRomper = false;
    public editando = false;

    constructor(
        private plex: Plex,
        private location: Location,
        private prestacionService: PrestacionesService,
        private mapaCamasService: MapaCamasService,
        private listadoInternacionService: ListadoInternacionService,
        private permisosMapaCamasService: PermisosMapaCamasService
    ) { }

    ngOnInit() {
        this.permisosMapaCamasService.setAmbito('internacion');
        this.mapaCamasService.setView('listado-internacion');
        this.mapaCamasService.setCapa('estadistica');
        this.mapaCamasService.setAmbito('internacion');

        this.plex.updateTitle([{
            route: '/inicio',
            name: 'Andes'
        }, {
            name: 'Internacion'
        }, {
            name: 'Listado de Internacion'
        }]);
        this.mapaCamasService.select({ id: ' ' } as any); // Pequeño HACK
        this.selectedPrestacion$ = this.mapaCamasService.selectedPrestacion.pipe(
            map((prestacion) => {
                this.puedeValidar = false;
                this.puedeRomper = false;
                if (prestacion?.ejecucion?.registros[1] && prestacion.ejecucion.registros[1].valor?.InformeEgreso) {
                    const informeEgreso = prestacion.ejecucion.registros[1].valor.InformeEgreso;
                    this.puedeValidar = prestacion.estados[prestacion.estados.length - 1].tipo !== 'validada' &&
                        informeEgreso.fechaEgreso &&
                        informeEgreso.tipoEgreso &&
                        informeEgreso.diagnosticoPrincipal;
                    this.puedeRomper = (prestacion.ejecucion && prestacion.ejecucion.registros[1] && prestacion.estados[prestacion.estados.length - 1].tipo === 'validada');
                }
                return prestacion;
            })
        );
        this.listaInternacion$ = this.listadoInternacionService.listaInternacionFiltrada$;
    }

    devuelveFecha(internacion, tipo) {
        const informe = this.verRegistro(internacion, tipo);
        if (tipo === 'ingreso') {
            return informe.informeIngreso.fechaIngreso;
        } else {
            return informe ? informe.InformeEgreso.fechaEgreso : null;

        }
    }

    verRegistro(prestacion, tipoRegistro) {
        let registro = null;
        if (tipoRegistro === 'ingreso') {
            registro = prestacion.ejecucion.registros.find(r => r.concepto.conceptId === snomedIngreso.conceptId);
        }
        if (tipoRegistro === 'egreso') {
            registro = prestacion.ejecucion.registros.find(r => r.concepto.conceptId === snomedEgreso.conceptId);
        }

        if (registro) {
            return registro.valor;
        }
        return null;
    }

    seleccionarPrestacion(prestacion, selectedPrestacion) {
        if (this.mostrar === 'datosInternacion') {
            if (selectedPrestacion._id === prestacion._id) {
                this.mapaCamasService.selectPrestacion(null);
                this.mapaCamasService.select(null);
            } else {

                this.mapaCamasService.selectPrestacion(prestacion);
                this.mapaCamasService.setFecha(prestacion.ejecucion.registros[0].valor.informeIngreso.fechaIngreso);
                this.verificarPrestacion(prestacion);
            }
        }
    }

    cancelar() {
        this.mapaCamasService.selectPrestacion(null);
    }

    volver() {
        this.location.back();
    }

    cambiarCama() {
        this.mostrar = 'desocuparCama';
    }

    refresh() {
        this.listadoInternacionService.refresh.next(true);
        this.volverADetalle();
    }

    volverADetalle() {
        this.mostrar = 'datosInternacion';
    }

    accionDesocupar(accion) {
        this.mostrar = 'cambiarCama';
        this.cambiarUO = accion.cambiarUO;
    }

    verificarPrestacion(prestacion: IPrestacion) {
        this.puedeValidar = false;
        this.puedeRomper = false;
        if (prestacion.ejecucion) {
            if (prestacion.ejecucion.registros[1]) {
                if (prestacion.estados[prestacion.estados.length - 1].tipo !== 'validada') {
                    const informeEgreso = prestacion.ejecucion.registros[1].valor.InformeEgreso;
                    if (informeEgreso) {
                        if (informeEgreso.fechaEgreso && informeEgreso.tipoEgreso && informeEgreso.diagnosticoPrincipal) {
                            this.puedeValidar = true;
                        }
                    }
                } else {
                    this.puedeRomper = true;
                }
            }
        }
    }

    onAccion($event) {
        this.editando = $event?.accion === 'editando';
    }

    validar(selectedPrestacion: IPrestacion, fechaHasta: Date) {
        this.plex.confirm('Luego de validar la prestación ya no podrá editarse.<br />¿Desea continuar?', 'Confirmar validación').then(validar => {
            if (validar) {
                if (selectedPrestacion.ejecucion.registros[1]) {
                    let egresoExiste = selectedPrestacion.ejecucion.registros[1].valor;
                    if (egresoExiste && selectedPrestacion.estados[selectedPrestacion.estados.length - 1].tipo !== 'validada') {
                        if (egresoExiste.InformeEgreso.fechaEgreso && egresoExiste.InformeEgreso.tipoEgreso &&
                            egresoExiste.InformeEgreso.diagnosticoPrincipal) {
                            this.prestacionService.validarPrestacion(selectedPrestacion).subscribe(prestacion => {
                                this.listadoInternacionService.setFechaHasta(fechaHasta);
                                this.mapaCamasService.selectPrestacion(prestacion);
                                this.verificarPrestacion(prestacion);
                            }, (err) => {
                                this.plex.info('danger', 'ERROR: No es posible validar la prestación');
                            });
                        } else {
                            this.plex.info('danger', 'ERROR: Faltan datos');
                        }
                    } else {
                        this.plex.info('danger', 'ERROR: Debe completar los datos mínimos de egreso para validar la internación');
                    }
                }
            }
        });
    }

    romperValidacion(selectedPrestacion: IPrestacion, fechaHasta: Date) {
        this.plex.confirm('Esta acción puede traer consecuencias <br />¿Desea continuar?', 'Romper validación').then(validar => {
            if (validar) {
                // guardamos una copia de la prestacion antes de romper la validacion.
                let prestacionCopia = JSON.parse(JSON.stringify(selectedPrestacion));
                // Agregamos el estado de la prestacion copiada.
                let estado = { tipo: 'modificada', idOrigenModifica: prestacionCopia.id };
                // Guardamos la prestacion copia
                this.prestacionService.clonar(prestacionCopia, estado).subscribe(prestacionClonada => {
                    let prestacionModificada = prestacionClonada;
                    // hacemos el patch y luego creamos los planes
                    let cambioEstado: any = {
                        op: 'romperValidacion',
                        estado: { tipo: 'ejecucion', idOrigenModifica: prestacionModificada.id },
                        desdeInternacion: true
                    };
                    // Vamos a cambiar el estado de la prestación a ejecucion
                    this.prestacionService.patch(selectedPrestacion.id, cambioEstado).subscribe(prestacion => {
                        this.listadoInternacionService.setFechaHasta(fechaHasta);
                        this.mapaCamasService.selectPrestacion(prestacion);
                        this.verificarPrestacion(prestacion);
                    }, (err) => {
                        this.plex.toast('danger', 'ERROR: No es posible romper la validación de la prestación');
                    });
                });
            }
        });
    }
}
