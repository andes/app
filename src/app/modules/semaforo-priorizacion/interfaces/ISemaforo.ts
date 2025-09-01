export interface ISemaforo {
    name: string;
    options: [
        {
            id: number;
            priority: number;
            label: string;
            color: string;
            itemRowStyle: {
                border: string;
                hover: string;
                background: string;
            };
        }
    ];
}
