
import { NotaComponent } from './notas-paciente.component';
import { Plex } from '@andes/plex';

describe('Notas Component', () => {
    let notaComponent: NotaComponent = null;

    beforeEach(() => {
        let plex: Plex;
        notaComponent = new NotaComponent(plex);
    });

    it('should set instance correctly', () => {
        expect(notaComponent).not.toBeNull();
    });

    it('should be no notes if there is no data', () => {
        expect(notaComponent.notas.length).toBe(0);
    });

    it('should be add nota', () => {
        const newNote = {
            'fecha': new Date(),
            'nota': 'prueba 1',
            'destacada': false
        };
        notaComponent.notas.push(newNote);
        expect(notaComponent.notas.length).toBe(1);
    });

});
