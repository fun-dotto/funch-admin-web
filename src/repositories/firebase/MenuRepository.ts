import { MenuRepository } from "../interfaces/MenuRepository";
import { Menu, OriginalMenu, MenuItem } from "../../types/Menu";
import { getBytes, ref } from "firebase/storage";
import { storage, database } from "../../infrastructure/firebase";
import { collection, getDocs, query, orderBy, doc, getDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";

export class FirebaseMenuRepository implements MenuRepository {
  async getAllMenus(): Promise<Menu[]> {
    const pathReference = ref(storage, "funch/menu.json");
    const bytes = await getBytes(pathReference);
    const jsonString = new TextDecoder().decode(bytes);
    const jsonData: {
      item_code: number;
      title: string;
      price: { large?: number; medium: number; small?: number };
      image: string;
      category: number;
      large: boolean;
      small: boolean;
      energy: number;
    }[] = JSON.parse(jsonString);

    return jsonData.map((data) => {
      return new Menu(
        data.item_code,
        data.title,
        data.price.medium,
        data.image,
        data.category,
        data.large,
        data.small,
        data.energy
      );
    });
  }

  async getOriginalMenus(): Promise<OriginalMenu[]> {
    const docOriginalMenuRef = query(
      collection(database, "funch_original_menu")
    );
    const docOriginalMenuSnap = await getDocs(docOriginalMenuRef);

    const originalMenus: OriginalMenu[] = [];
    docOriginalMenuSnap.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      const title = data.name; // name フィールドから取得
      const category = data.category_id; // category_id フィールドから取得

      // 新しい価格構造に対応
      let price = {
        medium: 0,
        small: undefined as number | undefined,
        large: undefined as number | undefined,
      };

      if (
        data.prices &&
        typeof data.prices === "object" &&
        !Array.isArray(data.prices)
      ) {
        // prices フィールドから取得
        price = {
          medium: data.prices.medium || 0,
          small: data.prices.small || undefined,
          large: data.prices.large || undefined,
        };
      }

      originalMenus.push({
        id: id,
        title: title,
        price: price,
        category: category,
      });
    });

    return originalMenus;
  }

  async createOriginalMenu(menu: OriginalMenu): Promise<OriginalMenu> {
    const priceMap: { [key: string]: number } = {};

    priceMap.medium = menu.price.medium;

    if (menu.price.large && menu.price.large > 0) {
      priceMap.large = menu.price.large;
    }
    if (menu.price.small && menu.price.small > 0) {
      priceMap.small = menu.price.small;
    }

    const menuData = {
      name: menu.title,
      category_id: menu.category,
      prices: priceMap,
    };

    const newMenuRef = await addDoc(
      collection(database, "funch_original_menu"),
      menuData
    );

    return {
      ...menu,
      id: newMenuRef.id,
    };
  }

  async updateOriginalMenu(menu: OriginalMenu): Promise<OriginalMenu> {
    if (!menu.id || menu.id === "0") {
      throw new Error("メニューIDが無効です");
    }

    const priceMap: { [key: string]: number } = {};

    priceMap.medium = menu.price.medium;

    if (menu.price.large && menu.price.large > 0) {
      priceMap.large = menu.price.large;
    }
    if (menu.price.small && menu.price.small > 0) {
      priceMap.small = menu.price.small;
    }

    const menuData = {
      name: menu.title,
      category_id: menu.category,
      prices: priceMap,
    };

    const menuRef = doc(database, "funch_original_menu", menu.id);
    await updateDoc(menuRef, menuData);

    return menu;
  }

  async deleteOriginalMenu(menuId: string): Promise<void> {
    const menuRef = doc(database, "funch_original_menu", menuId);
    await deleteDoc(menuRef);
  }

  async getRawMenuWithPrices(): Promise<MenuItem[]> {
    const pathReference = ref(storage, "funch/menu.json");
    const bytes = await getBytes(pathReference);
    const jsonString = new TextDecoder().decode(bytes);
    const jsonData: {
      item_code: number;
      title: string;
      price: { large?: number; medium: number; small?: number };
      image: string;
      category: number;
      large: boolean;
      small: boolean;
      energy: number;
    }[] = JSON.parse(jsonString);

    return jsonData.map((data) => {
      const prices: { small?: number; medium: number; large?: number } = {
        medium: data.price.medium,
      };

      if (data.price.small) {
        prices.small = data.price.small;
      }
      if (data.price.large) {
        prices.large = data.price.large;
      }

      return {
        name: data.title,
        category_id: data.category,
        prices,
        id: data.item_code,
      };
    });
  }

  async getAllDailyMenuDates(): Promise<string[]> {
    const docRef = query(
      collection(database, "funch_daily_menu"),
      orderBy("date", "asc")
    );
    const docSnap = await getDocs(docRef);

    const dates: string[] = [];
    docSnap.forEach((doc) => {
      dates.push(doc.id);
    });

    return dates;
  }

  async getDailyMenuByDate(date: string): Promise<{
    common_menu_ids: number[];
    original_menu_ids: string[];
  } | null> {
    const docRef = doc(database, "funch_daily_menu", date);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      common_menu_ids: data.common_menu_ids || [],
      original_menu_ids: data.original_menu_ids || [],
    };
  }

  async getAllMonthlyMenuMonths(): Promise<string[]> {
    const docRef = query(
      collection(database, "funch_monthly_menu"),
      orderBy("date", "asc")
    );
    const docSnap = await getDocs(docRef);

    const months: string[] = [];
    docSnap.forEach((doc) => {
      const docId = doc.id;
      const year = docId.substring(0, 4);
      const month = docId.substring(4, 6);
      months.push(`${year}-${month}`);
    });

    return months;
  }

  async getMonthlyMenuByMonth(month: string): Promise<{
    common_menu_ids: number[];
    original_menu_ids: string[];
  } | null> {
    const formattedMonth = month.replace(/-/g, "");

    const docRef = doc(database, "funch_monthly_menu", formattedMonth);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      common_menu_ids: data.common_menu_ids || [],
      original_menu_ids: data.original_menu_ids || [],
    };
  }
}
