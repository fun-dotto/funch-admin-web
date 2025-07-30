import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { Menu, OriginalMenu, MenuItem } from "../types/Menu";
import { MonthMenuService } from "../services/MonthMenuService";
import { ChangeMenuService } from "../services/ChangeMenuService";

export const useMonthMenuPresenter = (
  user: User | null,
  currentYear: number,
  currentMonth: number,
  monthMenuService: MonthMenuService,
  changeMenuService: ChangeMenuService
) => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [originalMenus, setOriginalMenus] = useState<OriginalMenu[]>([]);
  const [monthlyChangeData, setMonthlyChangeData] = useState<{
    commonMenuIds: Record<string, boolean>;
    originalMenuIds: Record<string, boolean>;
  }>({ commonMenuIds: {}, originalMenuIds: {} });
  const [allMenus, setAllMenus] = useState<Menu[]>([]);
  const [allOriginalMenus, setAllOriginalMenus] = useState<OriginalMenu[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMonthMenuData = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        // メニューデータを並行して取得（APIから最新データを取得）
        const [
          monthResult,
          menuResponse,
          originalMenuResponse,
          monthlyChange,
        ] = await Promise.all([
          monthMenuService.getMonthMenuData(currentYear, currentMonth),
          fetch("/api/menu"),
          fetch("/api/original_menu"),
          changeMenuService.getMonthlyChangeData(currentYear, currentMonth),
        ]);

        if (!menuResponse.ok || !originalMenuResponse.ok) {
          throw new Error("API呼び出しに失敗しました");
        }

        const menuData = await menuResponse.json();
        const originalMenuData = await originalMenuResponse.json();

        setMenus(monthResult.menus);
        setOriginalMenus(monthResult.originalMenus);
        setAllMenus(menuData.data.menus.map((item: any) => ({
          id: item.id,
          item_code: item.id,
          title: item.name,
          price: item.price,
          image: item.image,
          category: item.category_id,
          large: item.large,
          small: item.small,
          energy: item.energy,
        })));
        setAllOriginalMenus(originalMenuData.data.menus.map((item: any) => ({
          id: item.id,
          title: item.name,
          price: item.price,
          image: item.image,
          category: item.category_id,
          energy: item.energy,
        })));
        setMonthlyChangeData(monthlyChange);
      } catch (error) {
        console.error("月間メニューデータの取得に失敗しました:", error);
        setError("月間メニューデータの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchMonthMenuData();
  }, [user, currentYear, currentMonth, monthMenuService]);

  const saveMonthMenuData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await monthMenuService.saveMonthMenuData(
        currentYear,
        currentMonth,
        menus,
        originalMenus
      );
    } catch (error) {
      console.error("月間メニューデータの保存に失敗しました:", error);
      setError("月間メニューデータの保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const addMenu = (menu: Menu) => {
    setMenus((prev) => {
      const exists = prev.find((m) => m.item_code === menu.item_code);
      if (exists) return prev;

      return [...prev, menu];
    });
  };

  const addOriginalMenu = (originalMenu: OriginalMenu) => {
    setOriginalMenus((prev) => {
      const exists = prev.find((m) => m.id === originalMenu.id);
      if (exists) return prev;

      return [...prev, originalMenu];
    });
  };

  const removeMenu = async (menuItemCode: number) => {
    // 削除フラグをfunch_monthly_changeに記録（Firestoreからは削除しない）
    setLoading(true);
    setError(null);
    
    try {
      const menuItem: MenuItem = {
        id: menuItemCode,
        name: "",
        category_id: 0,
        prices: { medium: 0 },
      };
      await changeMenuService.saveMonthlyDeletion(
        currentYear,
        currentMonth,
        menuItem
      );

      // 🚀 削除後に月間変更データを即時更新
      const monthlyChange = await changeMenuService.getMonthlyChangeData(
        currentYear,
        currentMonth
      );
      setMonthlyChangeData(monthlyChange);
    } catch (error) {
      console.error("メニューの削除保存に失敗しました:", error);
      setError("メニューの削除保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const removeOriginalMenu = async (originalMenuId: string) => {
    // 削除フラグをfunch_monthly_changeに記録（Firestoreからは削除しない）
    setLoading(true);
    setError(null);
    
    try {
      const menuItem: MenuItem = {
        id: originalMenuId,
        name: "",
        category_id: 0,
        prices: { medium: 0 },
      };
      await changeMenuService.saveMonthlyDeletion(
        currentYear,
        currentMonth,
        menuItem
      );

      // 🚀 削除後に月間変更データを即時更新
      const monthlyChange = await changeMenuService.getMonthlyChangeData(
        currentYear,
        currentMonth
      );
      setMonthlyChangeData(monthlyChange);
    } catch (error) {
      console.error("オリジナルメニューの削除保存に失敗しました:", error);
      setError("オリジナルメニューの削除保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // メニューデータを並行して取得（APIから最新データを取得）
      const [
        monthResult,
        menuResponse,
        originalMenuResponse,
        monthlyChange,
      ] = await Promise.all([
        monthMenuService.getMonthMenuData(currentYear, currentMonth),
        fetch("/api/menu"),
        fetch("/api/original_menu"),
        changeMenuService.getMonthlyChangeData(currentYear, currentMonth),
      ]);

      if (!menuResponse.ok || !originalMenuResponse.ok) {
        throw new Error("API呼び出しに失敗しました");
      }

      const menuData = await menuResponse.json();
      const originalMenuData = await originalMenuResponse.json();

      setMenus(monthResult.menus);
      setOriginalMenus(monthResult.originalMenus);
      setAllMenus(menuData.data.menus.map((item: any) => ({
        id: item.id,
        item_code: item.id,
        title: item.name,
        price: item.price,
        image: item.image,
        category: item.category_id,
        large: item.large,
        small: item.small,
        energy: item.energy,
      })));
      setAllOriginalMenus(originalMenuData.data.menus.map((item: any) => ({
        id: item.id,
        title: item.name,
        price: item.price,
        image: item.image,
        category: item.category_id,
        energy: item.energy,
      })));
      setMonthlyChangeData(monthlyChange);
    } catch (error) {
      console.error("月間メニューデータの取得に失敗しました:", error);
      setError("月間メニューデータの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // メニューIDからメニュー名を取得する関数
  const getMenuNameById = (menuId: string): string => {
    // 数値IDの場合は共通メニューから検索
    const numericId = parseInt(menuId, 10);
    if (!isNaN(numericId)) {
      const menu = allMenus.find((m) => m.item_code === numericId);
      return menu ? menu.title : `メニュー(ID: ${menuId})`;
    }

    // 文字列IDの場合はオリジナルメニューから検索
    const originalMenu = allOriginalMenus.find((m) => m.id === menuId);
    return originalMenu ? originalMenu.title : `メニュー(ID: ${menuId})`;
  };

  // 🚀 最適化: 月間変更データのみを更新
  const refreshMonthlyChangeOnly = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // 月間変更データのみ取得（他は再取得しない）
      const monthlyChange = await changeMenuService.getMonthlyChangeData(
        currentYear,
        currentMonth
      );
      setMonthlyChangeData(monthlyChange);
    } catch (error) {
      console.error("月間変更データの取得に失敗しました:", error);
      setError("月間変更データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // 🚀 メニューデータのみ再取得（オリジナルメニュー追加時に使用）
  const refreshAllMenusData = async () => {
    if (!user) return;

    try {
      const [menuResponse, originalMenuResponse] = await Promise.all([
        fetch("/api/menu"),
        fetch("/api/original_menu"),
      ]);

      if (!menuResponse.ok || !originalMenuResponse.ok) {
        throw new Error("API呼び出しに失敗しました");
      }

      const menuData = await menuResponse.json();
      const originalMenuData = await originalMenuResponse.json();

      setAllMenus(menuData.data.menus.map((item: any) => ({
        id: item.id,
        item_code: item.id,
        title: item.name,
        price: item.price,
        image: item.image,
        category: item.category_id,
        large: item.large,
        small: item.small,
        energy: item.energy,
      })));
      setAllOriginalMenus(originalMenuData.data.menus.map((item: any) => ({
        id: item.id,
        title: item.name,
        price: item.price,
        image: item.image,
        category: item.category_id,
        energy: item.energy,
      })));
    } catch (error) {
      console.error("メニューデータの更新に失敗しました:", error);
    }
  };

  return {
    menus,
    originalMenus,
    monthlyChangeData,
    loading,
    error,
    addMenu,
    addOriginalMenu,
    removeMenu,
    removeOriginalMenu,
    saveMonthMenuData,
    refreshData,
    refreshMonthlyChangeOnly, // 🚀 新機能
    refreshAllMenusData, // 🚀 メニューデータ再取得
    getMenuNameById,
  };
};
