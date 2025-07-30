import { ChangeMenuRepository } from "../interfaces/ChangeMenuRepository";
import { MenuItem } from "../../types/Menu";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteField,
  Timestamp, 
  collection, 
  getDocs,
  deleteDoc
} from "firebase/firestore";
import { database } from "../../infrastructure/firebase";

export class FirebaseChangeMenuRepository implements ChangeMenuRepository {
  async saveDailyChange(date: Date, menuItem: MenuItem): Promise<void> {
    const dateStr = this.formatDateToString(date);
    const docRef = doc(database, "funch_daily_change", dateStr);

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const existingData = docSnap.data();
      const isOriginalMenu = typeof menuItem.id === "string";

      if (isOriginalMenu) {
        const existingOriginalMenuIds = existingData.original_menu_ids || {};

        if (existingOriginalMenuIds[menuItem.id] === false) {
          const { [menuItem.id]: _, ...updatedOriginalMenuIds } =
            existingOriginalMenuIds;
          await updateDoc(docRef, {
            original_menu_ids: updatedOriginalMenuIds,
          });
        } else if (existingOriginalMenuIds[menuItem.id] === undefined) {
          const updatedOriginalMenuIds = {
            ...existingOriginalMenuIds,
            [menuItem.id]: true,
          };
          await updateDoc(docRef, {
            original_menu_ids: updatedOriginalMenuIds,
          });
        }
      } else {
        const existingCommonMenuIds = existingData.common_menu_ids || {};

        if (existingCommonMenuIds[menuItem.id] === false) {
          const { [menuItem.id]: _, ...updatedCommonMenuIds } =
            existingCommonMenuIds;
          await updateDoc(docRef, {
            common_menu_ids: updatedCommonMenuIds,
          });
        } else if (existingCommonMenuIds[menuItem.id] === undefined) {
          const updatedCommonMenuIds = {
            ...existingCommonMenuIds,
            [menuItem.id]: true,
          };
          await updateDoc(docRef, {
            common_menu_ids: updatedCommonMenuIds,
          });
        }
      }
    } else {
      const isOriginalMenu = typeof menuItem.id === "string";
      const saveData = {
        common_menu_ids: isOriginalMenu ? {} : { [menuItem.id]: true },
        original_menu_ids: isOriginalMenu ? { [menuItem.id]: true } : {},
        date: Timestamp.fromDate(date),
      };

      await setDoc(docRef, saveData);
    }
  }

  async saveMonthlyChange(year: number, month: number, menuItem: MenuItem): Promise<void> {
    const firstDayOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const monthStr = this.formatMonthToString(year, month);

    const docRef = doc(database, "funch_monthly_change", monthStr);

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const existingData = docSnap.data();
      const isOriginalMenu = typeof menuItem.id === "string";

      if (isOriginalMenu) {
        const existingOriginalMenuIds = existingData.original_menu_ids || {};

        if (existingOriginalMenuIds[menuItem.id] === false) {
          const { [menuItem.id]: _, ...updatedOriginalMenuIds } =
            existingOriginalMenuIds;
          await updateDoc(docRef, {
            original_menu_ids: updatedOriginalMenuIds,
          });
        } else if (existingOriginalMenuIds[menuItem.id] === undefined) {
          const updatedOriginalMenuIds = {
            ...existingOriginalMenuIds,
            [menuItem.id]: true,
          };
          await updateDoc(docRef, {
            original_menu_ids: updatedOriginalMenuIds,
          });
        }
      } else {
        const existingCommonMenuIds = existingData.common_menu_ids || {};

        if (existingCommonMenuIds[menuItem.id] === false) {
          const { [menuItem.id]: _, ...updatedCommonMenuIds } =
            existingCommonMenuIds;
          await updateDoc(docRef, {
            common_menu_ids: updatedCommonMenuIds,
          });
        } else if (existingCommonMenuIds[menuItem.id] === undefined) {
          const updatedCommonMenuIds = {
            ...existingCommonMenuIds,
            [menuItem.id]: true,
          };
          await updateDoc(docRef, {
            common_menu_ids: updatedCommonMenuIds,
          });
        }
      }
    } else {
      const isOriginalMenu = typeof menuItem.id === "string";
      const saveData = {
        common_menu_ids: isOriginalMenu ? {} : { [menuItem.id]: true },
        original_menu_ids: isOriginalMenu ? { [menuItem.id]: true } : {},
        date: Timestamp.fromDate(firstDayOfMonth),
      };

      await setDoc(docRef, saveData);
    }
  }

  async saveDailyDeletion(date: Date, menuItem: MenuItem): Promise<void> {
    const dateStr = this.formatDateToString(date);
    const docRef = doc(database, "funch_daily_change", dateStr);

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const existingData = docSnap.data();
      const isOriginalMenu = typeof menuItem.id === "string";

      if (isOriginalMenu) {
        const updatedOriginalMenuIds = {
          ...existingData.original_menu_ids,
          [menuItem.id]: false,
        };
        await updateDoc(docRef, {
          original_menu_ids: updatedOriginalMenuIds,
        });
      } else {
        const updatedCommonMenuIds = {
          ...existingData.common_menu_ids,
          [menuItem.id]: false,
        };
        await updateDoc(docRef, {
          common_menu_ids: updatedCommonMenuIds,
        });
      }
    } else {
      const isOriginalMenu = typeof menuItem.id === "string";
      const saveData = {
        common_menu_ids: isOriginalMenu ? {} : { [menuItem.id]: false },
        original_menu_ids: isOriginalMenu ? { [menuItem.id]: false } : {},
        date: Timestamp.fromDate(date),
      };

      await setDoc(docRef, saveData);
    }
  }

  async saveMonthlyDeletion(year: number, month: number, menuItem: MenuItem): Promise<void> {
    const firstDayOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const monthStr = this.formatMonthToString(year, month);
    const docRef = doc(database, "funch_monthly_change", monthStr);

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const existingData = docSnap.data();
      const isOriginalMenu = typeof menuItem.id === "string";

      if (isOriginalMenu) {
        const updatedOriginalMenuIds = {
          ...existingData.original_menu_ids,
          [menuItem.id]: false,
        };
        await updateDoc(docRef, {
          original_menu_ids: updatedOriginalMenuIds,
        });
      } else {
        const updatedCommonMenuIds = {
          ...existingData.common_menu_ids,
          [menuItem.id]: false,
        };
        await updateDoc(docRef, {
          common_menu_ids: updatedCommonMenuIds,
        });
      }
    } else {
      const isOriginalMenu = typeof menuItem.id === "string";
      const saveData = {
        common_menu_ids: isOriginalMenu ? {} : { [menuItem.id]: false },
        original_menu_ids: isOriginalMenu ? { [menuItem.id]: false } : {},
        date: Timestamp.fromDate(firstDayOfMonth),
      };

      await setDoc(docRef, saveData);
    }
  }

  async getDailyChangeData(date: Date): Promise<{
    commonMenuIds: Record<string, boolean>;
    originalMenuIds: Record<string, boolean>;
  }> {
    const dateStr = this.formatDateToString(date);
    const docRef = doc(database, "funch_daily_change", dateStr);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        commonMenuIds: data.common_menu_ids || {},
        originalMenuIds: data.original_menu_ids || {},
      };
    }

    return {
      commonMenuIds: {},
      originalMenuIds: {},
    };
  }

  async getMonthlyChangeData(year: number, month: number): Promise<{
    commonMenuIds: Record<string, boolean>;
    originalMenuIds: Record<string, boolean>;
  }> {
    const monthStr = this.formatMonthToString(year, month);
    const docRef = doc(database, "funch_monthly_change", monthStr);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        commonMenuIds: data.common_menu_ids || {},
        originalMenuIds: data.original_menu_ids || {},
      };
    }

    return {
      commonMenuIds: {},
      originalMenuIds: {},
    };
  }

  async removeDailyChangeEntry(date: Date, menuId: string | number, isOriginalMenu: boolean): Promise<void> {
    const dateStr = this.formatDateToString(date);
    const docRef = doc(database, "funch_daily_change", dateStr);

    const fieldPath = isOriginalMenu
      ? `original_menu_ids.${menuId}`
      : `common_menu_ids.${menuId}`;

    await updateDoc(docRef, {
      [fieldPath]: deleteField(),
    });
  }

  async removeMonthlyChangeEntry(year: number, month: number, menuId: string | number, isOriginalMenu: boolean): Promise<void> {
    const monthStr = this.formatMonthToString(year, month);
    const docRef = doc(database, "funch_monthly_change", monthStr);

    const fieldPath = isOriginalMenu
      ? `original_menu_ids.${menuId}`
      : `common_menu_ids.${menuId}`;

    await updateDoc(docRef, {
      [fieldPath]: deleteField(),
    });
  }

  async confirmAllChanges(): Promise<void> {
    const dailyChangeCollection = collection(database, "funch_daily_change");
    const dailyChangeSnapshot = await getDocs(dailyChangeCollection);

    const monthlyChangeCollection = collection(database, "funch_monthly_change");
    const monthlyChangeSnapshot = await getDocs(monthlyChangeCollection);

    for (const changeDoc of dailyChangeSnapshot.docs) {
      const changeData = changeDoc.data();
      const dateStr = changeDoc.id;
      const date = this.parseStringToDate(dateStr);

      const menuDocRef = doc(database, "funch_daily_menu", dateStr);
      const menuDoc = await getDoc(menuDocRef);

      let menuData = {
        common_menu_ids: [],
        original_menu_ids: [],
        date: Timestamp.fromDate(date),
      };

      if (menuDoc.exists()) {
        menuData = menuDoc.data() as any;
      }

      const updatedMenuData = this.applyChangesToMenu(menuData, changeData);
      await setDoc(menuDocRef, updatedMenuData);
    }

    for (const changeDoc of monthlyChangeSnapshot.docs) {
      const changeData = changeDoc.data();
      const monthStr = changeDoc.id;
      const { year, month } = this.parseMonthString(monthStr);
      const date = new Date(year, month - 1, 1);

      const menuDocRef = doc(database, "funch_monthly_menu", monthStr);
      const menuDoc = await getDoc(menuDocRef);

      let menuData = {
        common_menu_ids: [],
        original_menu_ids: [],
        date: Timestamp.fromDate(date),
      };

      if (menuDoc.exists()) {
        menuData = menuDoc.data() as any;
      }

      const updatedMenuData = this.applyChangesToMenu(menuData, changeData);
      await setDoc(menuDocRef, updatedMenuData);
    }

    for (const changeDoc of dailyChangeSnapshot.docs) {
      await deleteDoc(changeDoc.ref);
    }
    for (const changeDoc of monthlyChangeSnapshot.docs) {
      await deleteDoc(changeDoc.ref);
    }
  }

  private formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  }

  private formatMonthToString(year: number, month: number): string {
    return `${year}${String(month).padStart(2, "0")}`;
  }

  private parseStringToDate(dateStr: string): Date {
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    return new Date(year, month, day);
  }

  private parseMonthString(monthStr: string): { year: number; month: number } {
    const year = parseInt(monthStr.substring(0, 4));
    const month = parseInt(monthStr.substring(4, 6));
    return { year, month };
  }

  private applyChangesToMenu(menuData: any, changeData: any): any {
    let commonMenuIds = [...(menuData.common_menu_ids || [])];
    let originalMenuIds = [...(menuData.original_menu_ids || [])];

    const commonChanges = changeData.common_menu_ids || {};
    for (const [menuId, isAdd] of Object.entries(commonChanges)) {
      const numericId = parseInt(menuId);
      if (isAdd) {
        if (!commonMenuIds.includes(numericId)) {
          commonMenuIds.push(numericId);
        }
      } else {
        commonMenuIds = commonMenuIds.filter((id) => id !== numericId);
      }
    }

    const originalChanges = changeData.original_menu_ids || {};
    for (const [menuId, isAdd] of Object.entries(originalChanges)) {
      if (isAdd) {
        if (!originalMenuIds.includes(menuId)) {
          originalMenuIds.push(menuId);
        }
      } else {
        originalMenuIds = originalMenuIds.filter((id) => id !== menuId);
      }
    }

    return {
      ...menuData,
      common_menu_ids: commonMenuIds,
      original_menu_ids: originalMenuIds,
    };
  }
}