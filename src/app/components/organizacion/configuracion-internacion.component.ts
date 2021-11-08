import { Component, OnInit } from '@angular/core';
import { MaquinaEstadosHTTP } from 'src/app/apps/rup/mapa-camas/services/maquina-estados.http';
import { Router, ActivatedRoute } from '@angular/router';
import { SnomedService } from 'src/app/apps/mitos';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { switchMap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { Plex } from '@andes/plex';

@Component({
    selector: 'configuracion-internacion',
    templateUrl: 'configuracion-internacion.html'
})
export class ConfiguracionInternacionComponent implements OnInit {

    private idOrgReferencia = '57e9670e52df311059bc8964'; /* id de castro rendon. Se usa como referencia para
                                                    la carga por defecto de acciones y otras propiedades   */
    private organizacionActual: any = {};
    public capas = [
        { id: 'estadistica', nombre: 'Estadística' },
        { id: 'medica', nombre: 'Médica' },
        { id: 'enfermeria', nombre: 'Enfermería' }
    ];
    public capaSelected;
    public unidadesOrganizativas;
    public configuracionDefaultCapa; // configuración del efector en una capa determinada
    private expression = '<<284548004'; // con esta query de snomed se traen todos los servicios
    public columns = [
        {
            key: 'registro',
            label: 'Registro',
            sorteable: false,
            opcional: false
        },
        {
            key: 'unidadOrganizativa',
            label: 'Unidad Organizativa',
            sorteable: false,
            opcional: false
        },
        {
            key: 'concepto',
            label: 'Concepto',
            sorteable: false,
            opcional: false
        },
        {
            key: 'acciones',
            label: 'Acciones',
            sorteable: false,
            opcional: false
        }
    ];

    constructor(
        private maquinaEstadosService: MaquinaEstadosHTTP,
        private organizacionService: OrganizacionService,
        private router: Router,
        private route: ActivatedRoute,
        public snomed: SnomedService,
        private plex: Plex
    ) {}

    ngOnInit() {
        this.route.params.pipe(
            switchMap(params =>
                forkJoin([
                    this.maquinaEstadosService.get('internacion', undefined, params['id']),
                    this.maquinaEstadosService.get('internacion', undefined, this.idOrgReferencia),
                    this.organizacionService.getById(params['id'])
                ])
            )
        ).subscribe(([capasOrgActual, capasOrgRef, orgActual]) => {
            /* Se cargan las capas de la organizacion actual. Si no existe registro se copian las de la organizacion de referencia */
            this.organizacionActual.estadistica = capasOrgActual.find(item => item.capa === 'estadistica') || capasOrgRef.find(item => item.capa === 'estadistica');
            this.organizacionActual.medica = capasOrgActual.find(item => item.capa === 'medica') || capasOrgRef.find(item => item.capa === 'medica');
            this.organizacionActual.enfermeria = capasOrgActual.find(item => item.capa === 'enfermeria') || capasOrgRef.find(item => item.capa === 'enfermeria');
            // Se recuperan las UO del efector
            this.organizacionActual.unidadesOrganizativas = orgActual.unidadesOrganizativas;
        });
    }

    changeCapa() {
        if (this.configuracionDefaultCapa) {
            this.organizacionActual[this.configuracionDefaultCapa] = this.configuracionDefaultCapa;
        }
        this.configuracionDefaultCapa = this.organizacionActual[this.capaSelected?.id];
        this.configuracionDefaultCapa.historialMedico = this.configuracionDefaultCapa.historialMedico || false;
        this.configuracionDefaultCapa.estados[1]?.acciones.map(acc => {
            acc.parametros.unidadOrganizativa = acc.parametros.unidadOrganizativa || [];
            const unidadOrg = acc.parametros.unidadOrganizativa[0];
            // se agrega opción de exceptuar la unidad organizativa seleccionada (En la db la UO se precede con '!')
            acc.parametros.unidadExceptuada = unidadOrg?.substring(0, 1) === '!' || false;
            if (acc.parametros.unidadExceptuada) {
                acc.parametros.unidadOrganizativa[0] = unidadOrg.substring(1);
            }
        });
    }

    loadListadoUO(event) {
        if (event) {
            this.snomed.getQuery({ expression: this.expression }).subscribe(result => event.callback(result));
        }
    }

    loadConceptos(event) {
        if (event.query) {
            this.snomed.get({
                search: event.query,
                semanticTag: ['procedimiento']
            }).subscribe(result => event.callback(result));
        } else {
            event.callback([]);
        }
    }

    nuevaAccion() {
        const nueva = {
            tipo: 'nuevo-registro',
            label: 'Valoración inicial',
            parametros: {
                unidadOrganizativa: [],
                concepto: []
            }
        };
        this.configuracionDefaultCapa?.estados[1]?.acciones.push(nueva);
    }

    deleteAccion(index) {
        this.configuracionDefaultCapa?.estados[1]?.acciones.splice(index, 1);
    }

    volver() {
        this.router.navigate(['/tm/organizacion/']);
    }

    guardar(formValid) {
        if (formValid) {
            const saveArray = [];
            // se recorre cada capa del efector ...
            this.capas.map((c: any) => {
                const organizacionCapa = this.organizacionActual[c.id];
                // por cada acción se buscan unidades organizativas exceptuadas
                organizacionCapa.estados[1]?.acciones.map(acc => {
                    const unidadOrg = acc.parametros.unidadOrganizativa[0];
                    if (acc.parametros.unidadExceptuada) {
                        acc.parametros.unidadOrganizativa[0] = `!${unidadOrg?.conceptId || unidadOrg}`;
                    } else {
                        acc.parametros.unidadOrganizativa[0] = unidadOrg?.conceptId || unidadOrg;
                    }
                    delete acc.parametros.unidadExceptuada;
                });
                saveArray.push(this.maquinaEstadosService.save(organizacionCapa));
            });
            forkJoin(saveArray).subscribe(resp => {
                if (resp) {
                    this.plex.toast('success', 'Cambios guardados exitosamente');
                }
                this.volver();
            }, error => {
                this.plex.info('danger', 'Ocurrió un error guardando los cambios');
            });
        }
    }
}
