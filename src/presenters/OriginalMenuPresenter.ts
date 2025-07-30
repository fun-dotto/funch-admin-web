import { useState, useEffect } from "react";
import { OriginalMenu } from "../types/Menu";
import { MenuService } from "../services/MenuService";

export const useOriginalMenuPresenter = (menuService: MenuService) => {
  const [originalMenus, setOriginalMenus] = useState<OriginalMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOriginalMenus = async () => {
    try {
      setLoading(true);
      setError(null);


      const originalMenus = await menuService.getOriginalMenus();

      // カテゴリで並び替え
      const sortedMenus = originalMenus.sort((a, b) => a.category - b.category);
      setOriginalMenus(sortedMenus);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "オリジナルメニューデータの取得に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOriginalMenus();
  }, []);

  const getMenusByCategory = (category: number): OriginalMenu[] => {
    return originalMenus.filter((menu) => menu.category === category);
  };

  const getAllMenus = (): OriginalMenu[] => {
    return originalMenus;
  };

  const refresh = () => {
    fetchOriginalMenus();
  };

  return {
    originalMenus,
    loading,
    error,
    getMenusByCategory,
    getAllMenus,
    refresh,
  };
};
