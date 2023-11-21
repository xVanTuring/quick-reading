import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { randomBytes } from 'crypto';

export async function prepareTempFolder(prefix: string) {
    const tempFolder = await fs.mkdtemp(path.join(os.tmpdir(), `quicking-test-${prefix}`))
    return tempFolder;
}
export async function generateFile(filePath: string, fileSize: number) {
    const data = randomBytes(fileSize);
    await fs.writeFile(filePath, data);
}