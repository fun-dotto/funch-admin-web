import { Menu, OriginalMenu, MenuItem } from "../../types/Menu";

export interface MenuRepository {
  getAllMenus(): Promise<Menu[]>;
  getOriginalMenus(): Promise<OriginalMenu[]>;
  getRawMenuWithPrices(): Promise<MenuItem[]>;
  getAllDailyMenuDates(): Promise<string[]>;
  getDailyMenuByDate(date: string): Promise<{
    common_menu_ids: number[];
    original_menu_ids: string[];
  } | null>;
  getAllMonthlyMenuMonths(): Promise<string[]>;
  getMonthlyMenuByMonth(month: string): Promise<{
    common_menu_ids: number[];
    original_menu_ids: string[];
  } | null>;
}
