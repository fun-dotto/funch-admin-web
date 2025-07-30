import { MenuItem } from "../../types/Menu";

export interface ChangeMenuRepository {
  saveDailyChange(date: Date, menuItem: MenuItem): Promise<void>;
  saveMonthlyChange(year: number, month: number, menuItem: MenuItem): Promise<void>;
  saveDailyDeletion(date: Date, menuItem: MenuItem): Promise<void>;
  saveMonthlyDeletion(year: number, month: number, menuItem: MenuItem): Promise<void>;
  getDailyChangeData(date: Date): Promise<{
    commonMenuIds: Record<string, boolean>;
    originalMenuIds: Record<string, boolean>;
  }>;
  getMonthlyChangeData(year: number, month: number): Promise<{
    commonMenuIds: Record<string, boolean>;
    originalMenuIds: Record<string, boolean>;
  }>;
  removeDailyChangeEntry(date: Date, menuId: string | number, isOriginalMenu: boolean): Promise<void>;
  removeMonthlyChangeEntry(year: number, month: number, menuId: string | number, isOriginalMenu: boolean): Promise<void>;
  confirmAllChanges(): Promise<void>;
}