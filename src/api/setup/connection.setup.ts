import Elysia from "elysia";
import { PDFiumLibrary } from "@hyzyla/pdfium";
import { SurrealConnection } from "../../connection/surreal-connection";

const RETRY_CONNECTION = 10;
export async function prepareConnection(): Promise<SetupResource> {
    const connections = createAllConnection();
    let pdfium: PDFiumLibrary | null = null;
    try {
        pdfium = await PDFiumLibrary.init();
    } catch (error) {
        console.error("error when init pdfium")
        console.error(error)
        throw new Error("Unable to initial pdfium")
    }
    for (let index = 0; index < RETRY_CONNECTION; index++) {
        try {
            for (const connection of Object.values(connections)) {
                await connection?.ready();
            }
            break;
        } catch (error) {
            console.error("error when connect")
            console.error(error)
            console.error(`Sleeping 2s. Retrying ${index + 1}/${RETRY_CONNECTION}`)
            await Bun.sleep(2000);
        }
    }
    return {
        pdfium,
        connections,
    }
}

export interface SetupResource {
    pdfium: PDFiumLibrary,
    connections: ConnectionMap
}

export function setupConnection({ pdfium, connections }: SetupResource) {
    return (app: Elysia<string>) => {
        return app.decorate('pdfium', pdfium).decorate('connections', connections);
    };
}
export type SetupConnection = ReturnType<ReturnType<typeof setupConnection>>

export interface ConnectionMap {
    surrealConnection: SurrealConnection | null
}
function createAllConnection(): ConnectionMap {
    const surrealConnection = createSurrealDBConnection()
    return { surrealConnection }
}

function createSurrealDBConnection(): SurrealConnection | null {
    if (process.env["SURREAL_DISBALE"]) {
        return null
    }
    const dbUrl = process.env["SURREAL_URL"] ?? 'ws://localhost:8000';
    const dbName = process.env["SURREAL_NAME"] ?? 'root';
    const dbPass = process.env["SURREAL_PASS"] ?? 'root';
    const dbNS = process.env["SURREAL_NS"] ?? 'test';
    const dbDB = process.env["SURREAL_DB"] ?? 'test';
    return new SurrealConnection({
        url: dbUrl,
        username: dbName,
        password: dbPass,
        namespace: dbNS,
        database: dbDB,
    })
}