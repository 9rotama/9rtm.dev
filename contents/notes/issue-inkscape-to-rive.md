---
title: Riveで使うパスをInkscapeで作るのに苦労した
emoji: "✒️"
published_at: 2026-09-17
published: true
tags: [svg, rive]
---

タイトルで名前を出したがSVG経由の問題かも

## tldv

## riveとは

## svgをインポート

inkscape特有のメタデータ　svgの構造の作り方

## 作るもの

体の部位、マスクでクリップしたい単位でレイヤー・グループを切っている

## ①swatch

swatchの説明
![inkscapeのswatch]()

riveにもってくと色がなくなる
![壊れた画像]()

### 原因

```svg
<path id="path16" style="fill:#ffffff;stroke:none" />
```

```svg
<defs>
  <linearGradient id="swatch150" inkscape:swatch="solid">
    <stop offset="0" style="stop-color:#10212b" />
  </linearGradient>

  <linearGradient id="linearGradient150"
                  xlink:href="#swatch150"
                  x1="14.215462" y1="38.924416"
                  x2="67.562681" y2="38.924416" />
</defs>

<path id="path244" style="fill:none;stroke:url(#linearGradient150)" />
```

```svg
<defs>
  <linearGradient id="linearGradient53">
    <stop offset="0" style="stop-color:#0984ff" />
    <stop offset="1" style="stop-color:#ffffff" />
  </linearGradient>

  <linearGradient id="linearGradient54"
                  xlink:href="#linearGradient53"
                  x1="51.544155" y1="25.724709"
                  x2="50.816551" y2="46.767464" />
</defs>

<path id="path10" style="fill:url(#linearGradient54)" />
```

単色であることが問題
![4つのテストSVGをimportすると、1stopのsvgだけ落ちる]()

### 解決策

claudeにファイルを直してもらった
スウォッチ部分を単色に展開するスクリプトを組んでも良いかも

## ②レイヤー名が表示されない

![inkscapeのレイヤーで見えてる]()
![riveのレイヤーだと]()

### 原因

```svg
<g id="layer11"
   inkscape:groupmode="layer"
   inkscape:label="futon">
  <!-- レイヤー内のオブジェクト -->
</g>
```

![inkscapeでもidを変更できる]

### 解決策

プラグインかスクリプトを作る

### ③クリッピングするとレイヤー構造が変わる

![inkscapeのレイヤーではまとまっている]()
![riveのレイヤーだと別の場所に...]()  
![ただしclipプロパティでの接続は維持できている]()

### 原因

```svg
<defs>
  <clipPath id="clipPath92">
    <path id="path93" d="..." />
  </clipPath>
</defs>

<g id="layer11"
   inkscape:groupmode="layer"
   inkscape:label="futon">
  <g id="g92" clip-path="url(#clipPath92)">
    <!-- クリップされるパスは省略 -->
  </g>
</g>
```

SVGのdefsにまとまる時点でレイヤーの位置からは外れてしまう

### 解決策

ない。自分でレイヤーに突っ込むしかない

## 所感

riveでもパス機能があり、それで十分であれば寄せるのがいいかも
