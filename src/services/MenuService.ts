import { MenuRepository } from "../repositories/interfaces/MenuRepository";
import {
  Menu,
  OriginalMenu,
  MenuItem,
  getCategoryMenu,
  convertOriginalMenuToMenuItem,
} from "../types/Menu";
import { OriginalMenuCRUDService } from "./OriginalMenuCRUDService";

type MenuResponse = {
  menus: MenuItem[];
};

export class MenuService {
  private originalMenuCRUDService: OriginalMenuCRUDService;

  constructor(private menuRepository: MenuRepository) {
    this.originalMenuCRUDService = new OriginalMenuCRUDService(menuRepository);
  }

  async getAllMenus(): Promise<Menu[]> {
    return await this.menuRepository.getAllMenus();
  }

  async getOriginalMenus(): Promise<OriginalMenu[]> {
    return await this.menuRepository.getOriginalMenus();
  }

  getCategoryMenus(allMenus: Menu[], categoryCode: number): Menu[] {
    return getCategoryMenu(allMenus, categoryCode);
  }

  async getRawMenuWithPrices(): Promise<MenuItem[]> {
    return await this.menuRepository.getRawMenuWithPrices();
  }

  async getFormattedMenus(): Promise<MenuResponse> {
    const rawMenus = await this.getRawMenuWithPrices();

    return {
      menus: rawMenus.sort((a, b) => a.name.localeCompare(b.name, "ja")),
    };
  }

  async getFormattedOriginalMenus(): Promise<MenuResponse> {
    const originalMenus = await this.getOriginalMenus();

    return {
      menus: originalMenus
        .map((originalMenu) => convertOriginalMenuToMenuItem(originalMenu))
        .sort((a, b) => a.name.localeCompare(b.name, "ja")),
    };
  }

  // Original menu CRUD methods removed - now handled by direct OriginalMenuCRUDService usage

  async getMenuById(id: number): Promise<MenuItem | null> {
    const rawMenus = await this.getRawMenuWithPrices();
    return rawMenus.find((menu) => menu.id === id) || null;
  }

  // getOriginalMenuById removed - no longer needed for API endpoints

  async getAllDailyMenuDates(): Promise<string[]> {
    return await this.menuRepository.getAllDailyMenuDates();
  }

  async getDailyMenuByDate(date: string): Promise<{
    common_menu_ids: number[];
    original_menu_ids: string[];
  } | null> {
    return await this.menuRepository.getDailyMenuByDate(date);
  }

  async getDailyMenuItemsByDate(date: string): Promise<MenuItem[] | null> {
    const dailyMenu = await this.getDailyMenuByDate(date);
    if (!dailyMenu) {
      return null;
    }

    const menuItems: MenuItem[] = [];

    // 通常メニューを取得
    for (const menuId of dailyMenu.common_menu_ids) {
      const menuItem = await this.getMenuById(menuId);
      if (menuItem) {
        menuItems.push(menuItem);
      }
    }

    // オリジナルメニューを取得
    const originalMenus = await this.getOriginalMenus();
    for (const originalMenuId of dailyMenu.original_menu_ids) {
      const originalMenu = originalMenus.find(
        (menu) => menu.id === originalMenuId
      );
      if (originalMenu) {
        const originalMenuItem = convertOriginalMenuToMenuItem(originalMenu);
        menuItems.push(originalMenuItem);
      }
    }

    return menuItems;
  }

  async getAllMonthlyMenuMonths(): Promise<string[]> {
    return await this.menuRepository.getAllMonthlyMenuMonths();
  }

  async getMonthlyMenuByMonth(month: string): Promise<{
    common_menu_ids: number[];
    original_menu_ids: string[];
  } | null> {
    return await this.menuRepository.getMonthlyMenuByMonth(month);
  }

  async getMonthlyMenuItemsByMonth(month: string): Promise<MenuItem[] | null> {
    const monthlyMenu = await this.getMonthlyMenuByMonth(month);
    if (!monthlyMenu) {
      return null;
    }

    const menuItems: MenuItem[] = [];

    // 通常メニューを取得
    for (const menuId of monthlyMenu.common_menu_ids) {
      const menuItem = await this.getMenuById(menuId);
      if (menuItem) {
        menuItems.push(menuItem);
      }
    }

    // オリジナルメニューを取得
    const originalMenus = await this.getOriginalMenus();
    for (const originalMenuId of monthlyMenu.original_menu_ids) {
      const originalMenu = originalMenus.find(
        (menu) => menu.id === originalMenuId
      );
      if (originalMenu) {
        const originalMenuItem = convertOriginalMenuToMenuItem(originalMenu);
        menuItems.push(originalMenuItem);
      }
    }

    return menuItems;
  }
}
