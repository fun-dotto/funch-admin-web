import { OriginalMenu } from "../types/Menu";
import { MenuRepository } from "../repositories/interfaces/MenuRepository";

export class OriginalMenuCRUDService {
  constructor(private menuRepository: MenuRepository) {}

  async saveOriginalMenu(menu: OriginalMenu): Promise<OriginalMenu> {
    if (menu.id && menu.id !== "0") {
      return await this.menuRepository.updateOriginalMenu(menu);
    } else {
      return await this.menuRepository.createOriginalMenu(menu);
    }
  }

  convertFirebaseDataToMenu(id: string, data: any): OriginalMenu {
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
      price = {
        medium: data.prices.medium || 0,
        small: data.prices.small || undefined,
        large: data.prices.large || undefined,
      };
    }

    return {
      id,
      title: data.name,
      price,
      category: data.category_id,
    };
  }

  async deleteOriginalMenu(menuId: string): Promise<void> {
    await this.menuRepository.deleteOriginalMenu(menuId);
  }
}
