import { Component, OnInit, ElementRef, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { Observable } from 'rxjs';
import { PacientePortalService } from '../services/paciente-portal.service';
import { IPacienteMatch } from 'src/app/modules/mpi/interfaces/IPacienteMatch.inteface';
import { map } from 'rxjs/operators';
import { Plex } from '@andes/plex';
import { PlexModalComponent } from '@andes/plex/src/lib/modal/modal.component';

@Component({
    selector: 'pdp-paciente-detalle',
    templateUrl: './paciente-detalle.html'
})

export class PacienteDetalleComponent implements OnInit {

    public paciente$: Observable<IPacienteMatch[]>;
    public width: number;
    public datosSecundarios = true;
    public registros$: Observable<any>;

    // modal
    public motivoSelected = null;
    public modelo2 = {
        select: null,
        soloLectura: false,
        selectMultiple: null
    };
    public prueba = '';
    public cambio = '';
    public errores: any[];

    public paciente = {
        id: 1,
        documento: '36307632',
        cuil: '20-36307632-5',
        activo: true,
        estado: 'temporal',
        nombre: 'Nombre completo',
        apellido: 'Apellido del paciente',
        nombreCompleto: 'Nombre y apellido del paciente',
        alias: '',
        contacto: 2993420134,
        sexo: 'femenino',
        genero: 'femenino',
        fechaNacimiento: '20/09/1992',
        tipoIdentificacion: '',
        numeroIdentificacion: '',
        edad: 27,
        edadReal: 'null',
        fechaFallecimiento: null,
        domicilio: 'Avenida San Juan 798',
        estadoCivil: undefined,
        foto: 'https://http2.mlstatic.com/fotos-4x4-3x3-5x5-varios-embajada-pasaporte-6-fotos-carnet-D_NQ_NP_990542-MLA31020537999_062019-O.webp',
        relaciones: 'hermana',
        financiador: 'HOSPITAL PROVINCIAL NEUQUEN - CASTRO RENDON',
        identificadores: 'HOSPITAL PROVINCIAL NEUQUEN - CASTRO RENDON',
        claveBlocking: 'null',
        entidadesValidadoras: 'HOSPITAL PROVINCIAL NEUQUEN - CASTRO RENDOM',
        scan: 'null',
        reportarError: false,
        notaError: '',
    };

    @ViewChildren('modal') modalRefs: QueryList<PlexModalComponent>;

    constructor(
        private pacienteService: PacientePortalService,
        private el: ElementRef,
        private plex: Plex
    ) { }

    ngOnInit() {
        const snomedExpression = '<<27113001 OR (<<50373000 OR 14456009) OR 46973005 OR <<166312007';
        this.registros$ = this.pacienteService.getHuds('58d918500bb1a96b254db3af', snomedExpression).pipe(
            map(huds => {
                const registros = [];
                huds.forEach((data: any) => {
                    if (data.registro?.registros?.length) {
                        data.registro.registros.map(reg => registros.push(reg));
                    } else {
                        registros.push(data.registro);
                    }
                });
                return registros;
            })
        );
        this.errores = [{
            id: 1,
            nombre: 'Error en mis registros de salud',
        },
        {
            id: 2,
            nombre: 'Error en mis datos personales',
        },
        {
            id: 3,
            nombre: 'Otro error',
        }
        ];
    }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return this.width >= 980;
    }

    openModal(index) {
        this.modalRefs.find((x, i) => i === index).show();
    }

    closeModal(index, formulario?) {
        this.modalRefs.find((x, i) => i === index).close();
        if (formulario) {
            formulario.reset();
        }
    }

    motivoSelect() {
        return this.motivoSelected === null;
    }

    notificarAccion(flag: boolean) {
        // pendiente
    }
}
