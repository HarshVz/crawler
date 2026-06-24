import fs from "fs";
import path from "path";
import os from "os";

class FileService {
  private basePath: string;

  constructor(basePath?: string) {
    this.basePath = basePath || path.join(os.homedir(), "knowledgeBase");
  }

  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  getFolderPath(url: string): string {
    const hostname = new URL(url).hostname;
    const folderName = hostname.replace(/[^a-zA-Z0-9]/g, "_");
    return path.join(this.basePath, folderName);
  }

  getFilePath(url: string, endpoint: string, ext: string): string {
    const safeName = endpoint === "/" ? "home" : endpoint.replace(/\//g, "_");
    const folder = this.getFolderPath(url);
    this.ensureDir(folder);
    return path.join(folder, `${safeName}.${ext}`);
  }

  save(url: string, endpoint: string, content: string, ext: string): string {
    const filePath = this.getFilePath(url, endpoint, ext);
    fs.writeFileSync(filePath, content, "utf-8");
    return filePath;
  }

  saveJson(url: string, endpoint: string, data: unknown): string {
    return this.save(url, endpoint, JSON.stringify(data, null, 2), "json");
  }

  saveMarkdown(url: string, endpoint: string, content: string): string {
    return this.save(url, endpoint, content, "md");
  }

  saveCsv(url: string, endpoint: string, content: string): string {
    return this.save(url, endpoint, content, "csv");
  }
}

export default FileService;
