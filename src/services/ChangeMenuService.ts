import { MenuItem, Menu, OriginalMenu } from "../types/Menu";
import { ChangeMenuRepository } from "../repositories/interfaces/ChangeMenuRepository";

export class ChangeMenuService {
  constructor(private changeMenuRepository: ChangeMenuRepository) {}

  async saveDailyChange(date: Date, menuItem: MenuItem): Promise<void> {
    await this.changeMenuRepository.saveDailyChange(date, menuItem);
  }

  async saveMonthlyChange(
    year: number,
    month: number,
    menuItem: MenuItem
  ): Promise<void> {
    await this.changeMenuRepository.saveMonthlyChange(year, month, menuItem);
  }


  async saveDailyDeletion(date: Date, menuItem: MenuItem): Promise<void> {
    await this.changeMenuRepository.saveDailyDeletion(date, menuItem);
  }

  async saveMonthlyDeletion(
    year: number,
    month: number,
    menuItem: MenuItem
  ): Promise<void> {
    await this.changeMenuRepository.saveMonthlyDeletion(year, month, menuItem);
  }


  async getDailyChangeData(date: Date): Promise<{
    commonMenuIds: Record<string, boolean>;
    originalMenuIds: Record<string, boolean>;
  }> {
    return await this.changeMenuRepository.getDailyChangeData(date);
  }

  async getMonthlyChangeData(
    year: number,
    month: number
  ): Promise<{
    commonMenuIds: Record<string, boolean>;
    originalMenuIds: Record<string, boolean>;
  }> {
    return await this.changeMenuRepository.getMonthlyChangeData(year, month);
  }

  // 🚀 新機能: 重複チェック付き日次追加
  async saveDailyChangeWithDuplicateCheck(
    date: Date,
    menuItem: MenuItem,
    existingMenuData: Menu[],
    existingOriginalMenuData: OriginalMenu[],
    existingChangeData: {
      commonMenuIds: Record<string, boolean>;
      originalMenuIds: Record<string, boolean>;
    }
  ): Promise<"added" | "revived" | "ignored"> {
    const isOriginalMenu = typeof menuItem.id === "string";

    // 1. menuに既存かチェック
    const existsInMenu = isOriginalMenu
      ? existingOriginalMenuData.some((m) => m.id === menuItem.id)
      : existingMenuData.some(
          (m) => m.item_code.toString() === menuItem.id.toString()
        );

    if (existsInMenu) {
      // 2. 削除フラグチェック
      const hasDeletionFlag = isOriginalMenu
        ? existingChangeData.originalMenuIds[menuItem.id] === false
        : existingChangeData.commonMenuIds[menuItem.id] === false;

      if (hasDeletionFlag) {
        // 3a. 削除フラグ除去（復活）
        await this.removeChangeEntry(date, menuItem.id, isOriginalMenu);
        return "revived";
      } else {
        // 3b. 何もしない（重複回避）- changeに追加しない
        return "ignored";
      }
    } else {
      // 4. menuに存在しない場合のみ通常の追加処理
      await this.saveDailyChange(date, menuItem);
      return "added";
    }
  }

  // 重複チェック付き月間追加
  async saveMonthlyChangeWithDuplicateCheck(
    year: number,
    month: number,
    menuItem: MenuItem,
    existingMenuData: Menu[],
    existingOriginalMenuData: OriginalMenu[],
    existingChangeData: {
      commonMenuIds: Record<string, boolean>;
      originalMenuIds: Record<string, boolean>;
    }
  ): Promise<"added" | "revived" | "ignored"> {
    const isOriginalMenu = typeof menuItem.id === "string";

    // 1. menuに既存かチェック
    const existsInMenu = isOriginalMenu
      ? existingOriginalMenuData.some((m) => m.id === menuItem.id)
      : existingMenuData.some(
          (m) => m.item_code.toString() === menuItem.id.toString()
        );

    if (existsInMenu) {
      // 2. 削除フラグチェック
      const hasDeletionFlag = isOriginalMenu
        ? existingChangeData.originalMenuIds[menuItem.id] === false
        : existingChangeData.commonMenuIds[menuItem.id] === false;

      if (hasDeletionFlag) {
        // 3a. 削除フラグ除去（復活）
        await this.removeMonthlyChangeEntry(
          year,
          month,
          menuItem.id,
          isOriginalMenu
        );
        return "revived";
      } else {
        // 3b. 何もしない（重複回避）- changeに追加しない
        return "ignored";
      }
    } else {
      // 4. menuに存在しない場合のみ通常の追加処理
      await this.saveMonthlyChange(year, month, menuItem);
      return "added";
    }
  }

  private async removeChangeEntry(
    date: Date,
    menuId: string | number,
    isOriginalMenu: boolean
  ): Promise<void> {
    await this.changeMenuRepository.removeDailyChangeEntry(date, menuId, isOriginalMenu);
  }

  async removeMonthlyChangeEntry(
    year: number,
    month: number,
    menuId: string | number,
    isOriginalMenu: boolean
  ): Promise<void> {
    await this.changeMenuRepository.removeMonthlyChangeEntry(year, month, menuId, isOriginalMenu);
  }

  // 🚀 日次変更のリバート処理（change要素の削除）
  async revertDailyChange(
    date: Date,
    menuId: string,
    isCommonMenu: boolean
  ): Promise<void> {
    await this.removeChangeEntry(date, menuId, !isCommonMenu);
  }

  async confirmAllChanges(): Promise<void> {
    await this.changeMenuRepository.confirmAllChanges();
  }



}
