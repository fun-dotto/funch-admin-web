"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import Header from "../../components/Header";
import Calendar, { CalendarRef } from "@/components/Calendar";
import MonthMenu, { MonthMenuRef } from "@/components/MonthMenu";
import { YearMonthDisplay } from "@/components/Date";
import SettingTab from "@/components/SettingTab";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { MenuItem } from "../types/Menu";
import { ChangeMenuService } from "../services/ChangeMenuService";
import { FirebaseChangeMenuRepository } from "../repositories/firebase/ChangeMenuRepository";

// ChangeMenuServiceのみpage.tsxで使用（ドラッグ&ドロップ処理用）
const changeMenuRepository = new FirebaseChangeMenuRepository();
const changeMenuService = new ChangeMenuService(changeMenuRepository);

export default function Home() {
  const { user } = useAuth();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [activeMenu, setActiveMenu] = useState<MenuItem | null>(null);
  const [monthlyChangeData, setMonthlyChangeData] = useState<{
    commonMenuIds: Record<string, boolean>;
    originalMenuIds: Record<string, boolean>;
  }>({ commonMenuIds: {}, originalMenuIds: {} });
  const calendarRef = useRef<CalendarRef>(null);
  const monthMenuRef = useRef<MonthMenuRef>(null);

  const handleYearMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  // 🚀 メニュー確定処理
  const handleConfirmMenuChanges = async () => {
    if (!user) return;

    try {
      // 全ての変更データを確定
      await changeMenuService.confirmAllChanges();

      // 確定後に各コンポーネントのデータを更新
      await calendarRef.current?.refreshData();
      await monthMenuRef.current?.refreshData();

      // 月間変更データをリセット
      setMonthlyChangeData({ commonMenuIds: {}, originalMenuIds: {} });

      console.log("メニューの確定処理が完了しました");
    } catch (error) {
      console.error("メニュー確定処理に失敗しました:", error);
    }
  };

  // 月間変更データを更新する関数
  const updateMonthlyChangeData = () => {
    const monthlyData = monthMenuRef.current?.getCurrentData();
    if (monthlyData) {
      setMonthlyChangeData(monthlyData.monthlyChangeData);
    }
  };

  // 年月が変わった時に月間変更データを更新
  useEffect(() => {
    if (user) {
      setTimeout(updateMonthlyChangeData, 100); // MonthMenuの読み込み完了を待つ
    }
  }, [currentYear, currentMonth, user]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.menu) {
      setActiveMenu(active.data.current.menu);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !active.data.current?.menu) {
      setActiveMenu(null);
      return;
    }

    const menu = active.data.current.menu as MenuItem;
    const overId = over.id as string;

    try {
      // カレンダーへのドロップの場合
      if (overId.includes("/")) {
        // overId形式: "2025/07/15" など
        const [year, month, day] = overId.split("/").map(Number);
        const targetDate = new Date(year, month - 1, day);
        const dateId = overId;

        // 🚀 現在のデータを取得
        const currentData = calendarRef.current?.getCurrentData(dateId);
        if (!currentData) {
          console.error("カレンダーデータが取得できません");
          setActiveMenu(null);
          return;
        }

        // 🚀 重複チェック付き保存
        const result =
          await changeMenuService.saveDailyChangeWithDuplicateCheck(
            targetDate,
            menu,
            currentData.menuData,
            currentData.originalMenuData,
            currentData.changeData
          );

        // 🚀 オリジナルメニュー追加時は全メニューデータも更新
        if (typeof menu.id === "string") {
          await calendarRef.current?.refreshAllMenusData();
        }

        // 🚀 最適化: 該当日のみ更新（全データ再取得なし）
        if (calendarRef.current?.refreshSingleDayChange) {
          await calendarRef.current.refreshSingleDayChange(targetDate);
        } else {
          await calendarRef.current?.refreshData();
        }

        // 即座に非表示にする
        setActiveMenu(null);
      }
      // 月間メニューへのドロップの場合
      else if (overId === "month-menu") {
        // 🚀 現在のデータを取得
        const currentData = monthMenuRef.current?.getCurrentData();
        if (!currentData) {
          console.error("月間メニューデータが取得できません");
          setActiveMenu(null);
          return;
        }

        // 🚀 重複チェック付き保存
        const result =
          await changeMenuService.saveMonthlyChangeWithDuplicateCheck(
            currentYear,
            currentMonth,
            menu,
            currentData.menus,
            currentData.originalMenus,
            currentData.monthlyChangeData
          );

        // 🚀 オリジナルメニュー追加時は全メニューデータも更新
        if (typeof menu.id === "string") {
          await monthMenuRef.current?.refreshAllMenusData();
        }

        // 🚀 最適化: 月間変更データのみ更新（全データ再取得なし）
        if (monthMenuRef.current?.refreshMonthlyChangeOnly) {
          await monthMenuRef.current.refreshMonthlyChangeOnly();
        } else {
          await monthMenuRef.current?.refreshData();
        }

        // 月間変更データを更新
        const updatedMonthlyData = monthMenuRef.current?.getCurrentData();
        if (updatedMonthlyData) {
          setMonthlyChangeData(updatedMonthlyData.monthlyChangeData);
        }

        // 即座に非表示にする
        setActiveMenu(null);
      } else {
        // ドロップ失敗
        setActiveMenu(null);
      }
    } catch (error) {
      console.error("Failed to save change:", error);
      setActiveMenu(null);
    }
  };

  return (
    <div className="bg-[#eee] w-screen h-screen flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto p-8">
        {user ? (
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex flex-row gap-8 h-full">
              <div className="flex flex-col">
                <div>
                  <div className="flex gap-6">
                    <YearMonthDisplay
                      year={currentYear}
                      month={currentMonth}
                      onYearMonthChange={handleYearMonthChange}
                      onConfirmMenuChanges={handleConfirmMenuChanges}
                    />
                    <MonthMenu
                      ref={monthMenuRef}
                      year={currentYear}
                      month={currentMonth}
                    />
                  </div>
                  <Calendar
                    ref={calendarRef}
                    year={currentYear}
                    month={currentMonth}
                    monthlyChangeData={monthlyChangeData}
                  />
                </div>
              </div>
              <div className="flex-1">
                <SettingTab />
              </div>
            </div>
            <DragOverlay>
              {activeMenu && (
                <div className="z-30 p-2 my-1 mx-4 border rounded bg-white select-none w-fit cursor-grabbing">
                  {typeof activeMenu.id === "number" ? (
                    <>
                      {activeMenu.name}
                      <span className="text-xs ml-2">
                        ¥{activeMenu.prices.medium}
                      </span>
                    </>
                  ) : (
                    <>
                      FUN {activeMenu.name}
                      <span className="text-xs ml-2">
                        ¥{activeMenu.prices.medium}
                      </span>
                    </>
                  )}
                </div>
              )}
            </DragOverlay>
          </DndContext>
        ) : (
          <div>
            <p>ログインしてください</p>
          </div>
        )}
      </main>
    </div>
  );
}
