import { useState, useEffect } from "react";
import { MenuItem } from "../types/Menu";
import { MenuService } from "../services/MenuService";
import { FirebaseMenuRepository } from "../repositories/firebase/MenuRepository";

export const useMenuListPresenter = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [originalMenuItems, setOriginalMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        setError(null);

        const menuRepository = new FirebaseMenuRepository();
        const menuService = new MenuService(menuRepository);

        const [menuData, originalMenuData] = await Promise.all([
          menuService.getFormattedMenus(),
          menuService.getFormattedOriginalMenus(),
        ]);

        setMenuItems(menuData.menus);
        setOriginalMenuItems(originalMenuData.menus);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "メニューデータの取得に失敗しました"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  const getCategoryMenus = (categoryCode: number): MenuItem[] => {
    return menuItems.filter((menu) => menu.category_id === categoryCode);
  };

  return {
    menuItems,
    originalMenuItems,
    loading,
    error,
    getCategoryMenus,
  };
};
