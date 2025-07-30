import { Menu, OriginalMenu, MenuItem } from "../../types/Menu";

export interface MenuRepository {
  getAllMenus(): Promise<Menu[]>;
  getOriginalMenus(): Promise<OriginalMenu[]>;
  createOriginalMenu(menu: OriginalMenu): Promise<OriginalMenu>;
  updateOriginalMenu(menu: OriginalMenu): Promise<OriginalMenu>;
  deleteOriginalMenu(menuId: string): Promise<void>;
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
