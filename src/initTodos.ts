import type { Todo } from "./types";
import { v4 as uuid } from "uuid"; // v4 を uuid という名前でインポート

export const initTodos: Todo[] = [
  {
    id: uuid(), // UUID v4 を生成してIDにセット
    name: "解析2の宿題",
    isDone: false,
    priority: 2,
    deadline: new Date(2024, 10, 2, 17, 30),
  },
];