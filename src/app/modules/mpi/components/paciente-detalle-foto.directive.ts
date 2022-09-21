import { Directive, ElementRef, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { AdjuntosService } from '../../rup/services/adjuntos.service';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { Auth } from '@andes/auth';
import { APP_HOST } from '@andes/shared';

@Directive({
    selector: '[mpiFotoPaciente]'
})
export class FotoDirective implements OnDestroy {
    private io: IntersectionObserver;

    @Input() set mpiFotoPaciente(paciente: IPaciente) {
        this.setSource(PROFILE_PICTURE);
        // if (this.io) {
        //     this.io.disconnect();
        // }
        // if (paciente && paciente.id && paciente.fotoId) {
        //     this.fileService.token$.subscribe((data: any) => {
        //         const { token } = data;
        //         this.watchVisibility(paciente, token);
        //     });
        // } else {
        //     this.setSource(PROFILE_PICTURE);
        // }
    }

    constructor(
        private el: ElementRef,
        private fileService: AdjuntosService,
        private auth: Auth,
        @Inject(APP_HOST) private appHost: string
    ) { }

    ngOnDestroy() {
        if (this.io) {
            this.io.disconnect();
        }
    }

    watchVisibility(paciente, token) {
        if (window.IntersectionObserver) {
            this.io = new IntersectionObserver(
                (entries) => {
                    const isIntersecting = entries.some(entry => entry.isIntersecting);
                    if (isIntersecting) {
                        this.io.unobserve(this.el.nativeElement);
                        this.showImage(paciente, token);
                    }

                },
                { rootMargin: '20px', threshold: 0 }
            );
            this.io.observe(this.el.nativeElement);
        } else {
            this.showImage(paciente, token);
        }
    }

    private showImage(paciente: IPaciente, token: string) {
        const url = this.makeURL(paciente, token);
        this.setSource(url);
    }

    private makeURL(paciente: IPaciente, token: string) {
        const url = `${this.appHost}/core-v2/mpi/pacientes/${paciente.id}/foto/${paciente.fotoId}?token=${token}`;
        return url;
    }

    private setSource(url: string) {
        this.el.nativeElement.src = url;
    }
}

const PROFILE_PICTURE = 'data:image/svg+xml;charset=utf-8,<svg%20version%3D"1.1"%20id%3D"Layer_4"%20xmlns%3D"http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg"%20xmlns%3Axlink%3D"http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink"%20x%3D"0px"%20y%3D"0px"%0D%0A%09%20width%3D"480px"%20height%3D"535px"%20viewBox%3D"0%200%20480%20535"%20enable-background%3D"new%200%200%20480%20535"%20xml%3Aspace%3D"preserve">%0D%0A<g%20id%3D"Layer_3">%0D%0A%09<linearGradient%20id%3D"SVGID_1_"%20gradientUnits%3D"userSpaceOnUse"%20x1%3D"240"%20y1%3D"535"%20x2%3D"240"%20y2%3D"4.882812e-04">%0D%0A%09%09<stop%20%20offset%3D"0"%20style%3D"stop-color%3A%23C5C5C5"%2F>%0D%0A%09%09<stop%20%20offset%3D"1"%20style%3D"stop-color%3A%239A9A9A"%2F>%0D%0A%09<%2FlinearGradient>%0D%0A%09<rect%20fill%3D"url%28%23SVGID_1_%29"%20width%3D"480"%20height%3D"535"%2F>%0D%0A<%2Fg>%0D%0A<g%20id%3D"Layer_2">%0D%0A%09<path%20fill%3D"%23FFFFFF"%20d%3D"M347.5%2C250c0%2C59.375-48.125%2C107.5-107.5%2C107.5c-59.375%2C0-107.5-48.125-107.5-107.5%0D%0A%09%09c0-59.375%2C48.125-107.5%2C107.5-107.5C299.375%2C142.5%2C347.5%2C190.625%2C347.5%2C250z"%2F>%0D%0A%09<path%20fill%3D"%23FFFFFF"%20d%3D"M421.194%2C535C413.917%2C424.125%2C335.575%2C336.834%2C240%2C336.834c-95.576%2C0-173.917%2C87.291-181.194%2C198.166%0D%0A%09%09H421.194z"%2F>%0D%0A<%2Fg>%0D%0A<%2Fsvg>';
