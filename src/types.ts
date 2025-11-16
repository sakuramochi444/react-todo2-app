export type Todo = {
  id: string;
  name: string;
  isDone: boolean;
  priority: number;
  deadline: Date | null;
  description: string; // ◀◀◀ この行を追加
  x: number; // 位置 (X座標)
  y: number; // 位置 (Y座標)
  rotate: number; // 角度
};