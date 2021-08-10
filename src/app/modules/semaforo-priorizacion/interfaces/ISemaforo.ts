export interface ISemaforo {
    name: String;
    options: [
        {
            id: Number,
            priority: Number,
            label: String,
            color: String,
            itemRowStyle: {
                border: String,
                hover: String,
                background: String
            }
        }
    ];
}
