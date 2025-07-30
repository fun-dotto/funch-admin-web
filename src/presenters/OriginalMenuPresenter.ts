import { useState, useEffect, useMemo } from "react";
import { OriginalMenu } from "../types/Menu";
import { ServiceFactory } from "../services/ServiceFactory";

export const useOriginalMenuPresenter = () => {
  // Presenter層はService層のみに依存（Repository層は知らない）
  const services = useMemo(() => {
    const menuService = ServiceFactory.createMenuService();
    const originalMenuCRUDService = ServiceFactory.createOriginalMenuCRUDService();
    const imageService = ServiceFactory.createImageService();
    return { menuService, originalMenuCRUDService, imageService };
  }, []);

  const { menuService, originalMenuCRUDService, imageService } = services;
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

  const saveOriginalMenu = async (menu: OriginalMenu): Promise<OriginalMenu> => {
    return await originalMenuCRUDService.saveOriginalMenu(menu);
  };

  const deleteOriginalMenu = async (menuId: string): Promise<void> => {
    await originalMenuCRUDService.deleteOriginalMenu(menuId);
  };

  // 画像関連の処理をPresenter層で提供
  const uploadMenuImage = async (menuId: string, imageFile: File): Promise<void> => {
    await imageService.uploadMenuImage(menuId, imageFile);
  };

  const deleteMenuImage = async (menuId: string): Promise<void> => {
    await imageService.deleteMenuImage(menuId);
  };

  const getMenuImageUrl = async (menuId: string): Promise<string | null> => {
    try {
      return await imageService.getMenuImageUrlById(menuId);
    } catch (error) {
      console.error("画像の取得に失敗しました:", error);
      return null;
    }
  };

  return {
    originalMenus,
    loading,
    error,
    getMenusByCategory,
    getAllMenus,
    refresh,
    saveOriginalMenu,
    deleteOriginalMenu,
    // 画像操作メソッドを追加
    uploadMenuImage,
    deleteMenuImage,
    getMenuImageUrl,
  };
};
