export interface Connection {
    get connected(): boolean;
    ready(): Promise<Connection>;
    get isConnecting(): boolean;
}