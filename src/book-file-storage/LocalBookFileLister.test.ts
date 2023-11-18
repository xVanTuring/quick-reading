import { describe, test, expect } from "bun:test";
import { LocalBookFileLister } from "./LocalBookFileLister";
import fs from 'fs/promises';
import path from 'path'
import os from 'os'
import { randomBytes } from 'crypto';

describe("LocalBookFileStorage", async () => {
    async function prepareTempFolder() {
        const tempFolder = await fs.mkdtemp(path.join(os.tmpdir(), "LocalBookFileStorageTest-"))
        return tempFolder;
    }
    async function generateFile(filePath: string, fileSize: number) {
        const data = randomBytes(fileSize);
        // Write the data to a file
        await fs.writeFile(filePath, data);
    }
    async function prepareEnvironment(): Promise<{
        tempFolder: string,
        files: Array<{ fileName: string, fileSize: number, filePath: string }>
    }> {
        const randomFolderName = await prepareTempFolder();
        let temp: Array<{ fileName: string, fileSize: number, filePath: string }> = [];
        for (let index = 0; index < 10; index++) {
            let item = {
                fileName: `example_${index}.pdf`,
                filePath: path.join(randomFolderName, `example_${index}.pdf`),
                fileSize: Math.floor(Math.random() * 10000) + 300
            }
            await generateFile(item.filePath, item.fileSize);
            temp.push(item);
        }
        return {
            tempFolder: randomFolderName,
            files: temp
        }
    }
    const environment = await prepareEnvironment();
    console.log(environment.tempFolder)
    const storage = new LocalBookFileLister(environment.tempFolder);

    test("getFiles should return an array of file names", async () => {
        const files = await storage.getFiles();
        expect(Array.isArray(files)).toBe(true);
        expect(files.length).toEqual(10);
        expect(files.every((file) => typeof file === "string")).toBe(true);
    });

    test("getFileInfo should return the file info for a given file name", async () => {
        const file = environment.files[Math.floor(Math.random() * 9999) % environment.files.length];
        const fileName = file.fileName;
        const fileInfo = await storage.getFileInfo(fileName);
        expect(fileInfo).toBeDefined();
        expect(fileInfo.name).toBe(fileName);
        expect(fileInfo.size).toBe(file.fileSize);
        expect(fileInfo.path.local).toBe(file.filePath);
    });

    test("getSupportedFileExtensions should return an array of supported file extensions", () => {
        const supportedExtensions = storage.getSupportedFileExtensions();
        expect(Array.isArray(supportedExtensions)).toBe(true);
        expect(supportedExtensions.length).toBeGreaterThan(0);
        expect(supportedExtensions.every((extension) => typeof extension === "string")).toBe(true);
    });
});