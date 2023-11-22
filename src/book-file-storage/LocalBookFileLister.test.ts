import { describe, test, expect, beforeAll, beforeEach } from "bun:test";
import { LocalBookFileLister } from "./LocalBookFileLister";
import path from 'path'
import { generateFile as generateDummyFile, prepareTempFolder } from "../util/test/temps";

describe("unit: LocalBookFileStorage", async () => {
    type file = { fileName: string, fileSize: number, filePath: string };
    type Env = {
        tempFolder: string,
        files: Array<file>,
        randomFile(): file
    };
    async function prepareEnvironment(): Promise<Env> {
        const randomFolderName = await prepareTempFolder("LocalBookFileStorageTest");
        let files: Array<{ fileName: string, fileSize: number, filePath: string }> = [];
        for (let index = 0; index < 10; index++) {
            let item = {
                fileName: `example_${index}.pdf`,
                filePath: path.join(randomFolderName, `example_${index}.pdf`),
                fileSize: Math.floor(Math.random() * 10000) + 300
            }
            await generateDummyFile(item.filePath, item.fileSize);
            files.push(item);
        }
        return {
            tempFolder: randomFolderName,
            files,
            randomFile(): file {
                return files[Math.floor(Math.random() * 9999) % files.length]
            }
        }
    }
    let environment: Env;
    let storage: LocalBookFileLister
    beforeEach(async () => {
        environment = await prepareEnvironment();
        storage = new LocalBookFileLister(environment.tempFolder);
    });


    test("getFiles should return an array of file names", async () => {
        const files = await storage.getFiles();
        expect(Array.isArray(files)).toBe(true);
        expect(files.length).toEqual(10);
        expect(files.every((file) => typeof file === "string")).toBe(true);
    });

    test("getFileInfo should return the file info for a given file name", async () => {
        const file = environment.randomFile();
        const fileInfo = await storage.getFileInfo(file.fileName);
        expect(fileInfo).toBeDefined();
        expect(fileInfo.name).toBe(file.fileName);
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