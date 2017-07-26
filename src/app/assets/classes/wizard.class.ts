import { default as swal } from 'sweetalert2';

export class Wizard {
    private steps = [];

    constructor(private name: string) { }

    /**
     * Agrega un paso a este wizard
     *
     * @param {string} title Título del mensaje
     * @param {string} text Mensaje
     *
     * @memberof Wizard
     */
    public addStep(title: string, text: string) {
        this.steps.push({
            title: title,
            html: text,
            // Empty gif
            imageUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
            imageClass: `wizard wizard-${this.name}-${this.steps.length + 1}`,
            imageWidth: 500,
            imageHeight: 250,
            confirmButtonText: 'Continuar',
            // animation: false,
            // customClass: 'animated fadeInLeft'
        });
    }

    /**
     * Indica si este wizard está oculto para este usuario
     *
     * @returns {boolean} True si está oculto
     *
     * @memberof Wizard
     */
    private isHidden(): boolean {
        return localStorage[`wizard-${this.name}-hide`];
    }

    /**
     * Oculta este wizard para el usuario actual
     *
     * @memberof Wizard
     */
    private hide() {
        localStorage[`wizard-${this.name}-hide`] = true;
    }

    /**
     * Muestra el wizard
     * 
     * @param {boolean} [forceShow=false] Indica si fuerza el wizard, independiente si el usuario eligió no volver a verlo
     * @returns {Promise<any>} Si el wizard está oculto devuelve null, sino devuelve un Promise que recibe un parámetro booleano, indicado si el usuario vio todo el wizard o no
     *
     * @memberof Wizard
     */
    public render(forceShow: boolean = false): Promise<any> {
        if (!forceShow && this.isHidden()) {
            return null;
        }

        // Corrije los textos
        this.steps[0].confirmButtonText = 'Comenzar';
        let last = this.steps[this.steps.length - 1];
        last.confirmButtonText = 'Cerrar y no volver a mostrar';
        last.showCancelButton = true;
        last.cancelButtonText = 'Cerrar';

        // Crea el modal
        let modal: Promise<any>;
        if (this.steps.length === 1) {
            modal = swal(this.steps[0]);
        } else {
            // Computa el array progressSteps
            let progressSteps: number[] = [];
            this.steps.forEach((element, index) => progressSteps.push(index + 1));

            // Lo injecta en cada paso
            this.steps.forEach((element, value, index) => element.progressSteps = progressSteps);

            // Renderea con SweetAlert
            modal = swal.queue(this.steps);
        }

        // Crea la promise
        let resolve: any;
        let promise = new Promise((res, rej) => {
            resolve = res;
        });
        modal.then((reason) => {
            this.hide();
            resolve(true);
        }).catch((reason) => {
            if (reason === 'cancel') {
                resolve(true);
            } else {
                resolve(false);
            }
        });

        return promise;
    }
}
