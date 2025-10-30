import React from "react";

// 引数の型を定義
// Propsという名前で定義することが一般的です。
type Props = {
  name: string;
  uncompletedCount: number;
};

// WelcomeMessage という関数コンポーネントの定義
// 関数コンポーネントはパスカルケースで名前を設定します。
const WelcomeMessage = ({ name, uncompletedCount }: Props) => {
  // いわゆる普通のロジックを記述する
  const currentTime = new Date();
  const greeting =
    currentTime.getHours() < 12 ? "おはようございます" : "こんにちは";

  //【重要!】JSX構文で描いた「JSX要素」を return で返す
  return (
    <div className="text-blue-700">
      {greeting}、{name}さん。
      {uncompletedCount === 0 ? (
        <p>すべてのタスクが完了しています！🎉</p>
      ) : (
        <p>未完了のタスクが{uncompletedCount}件あります。</p>
      )}
    </div>
  );
};

// 他のファイルで WelcomeMessage を import できるようにする
export default WelcomeMessage;