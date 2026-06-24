import { type Page } from "playwright-core";

export interface IBrowserService {
  getPage(): Promise<Page>;
  closePage(page: Page): Promise<void>;
  closeAll(): Promise<void>;
}
