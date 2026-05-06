# ReSTAR App React Library

`novelaid-editor`等で使用している機能を一部抜き出して再利用可能としたもの。
アプリを実装する際に共通して利用できるUIコンポーネントを提供します。

## 共通のCSS
```typescript
import 'restar-app/index.css'
```

## ProjectLauncher

特定のフォルダーと関連して動作するアプリの最初のフォルダー選択用UI部分。

`novelaid-editor`では、フォルダー単位で小説を管理しています。
アプリ起動時に、最近使ったフォルダーの履歴からの選択や、特定のフォルダーを選択するUIを提供します。

なお、実際のフォルダー選択部分等は外部から与える必要があります。
ElectronやTauri等のフレームワークで実装が異なるためです。



