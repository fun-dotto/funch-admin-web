import { MenuService } from "./MenuService";
import { OriginalMenuCRUDService } from "./OriginalMenuCRUDService";
import { ImageService } from "./ImageService";
import { MonthMenuService } from "./MonthMenuService";
import { ChangeMenuService } from "./ChangeMenuService";
import { CalendarMenuService } from "./CalendarService";
import { FirebaseMenuRepository } from "../repositories/firebase/MenuRepository";
import { FirebaseMonthMenuRepository } from "../repositories/firebase/MonthMenuRepository";
import { FirebaseChangeMenuRepository } from "../repositories/firebase/ChangeMenuRepository";
import { FirebaseCalendarMenuRepository } from "../repositories/firebase/CalendarRepository";

/**
 * Service層のファクトリークラス
 * Presenter層がRepository層を知らなくて済むようにする
 */
export class ServiceFactory {
  static createMenuService(): MenuService {
    return new MenuService(new FirebaseMenuRepository());
  }

  static createOriginalMenuCRUDService(): OriginalMenuCRUDService {
    return new OriginalMenuCRUDService(new FirebaseMenuRepository());
  }

  static createImageService(): ImageService {
    return new ImageService();
  }

  static createMonthMenuService(): MonthMenuService {
    return new MonthMenuService(new FirebaseMonthMenuRepository());
  }

  static createChangeMenuService(): ChangeMenuService {
    return new ChangeMenuService(new FirebaseChangeMenuRepository());
  }

  static createCalendarMenuService(): CalendarMenuService {
    return new CalendarMenuService(
      new FirebaseCalendarMenuRepository(),
      new FirebaseChangeMenuRepository()
    );
  }
}