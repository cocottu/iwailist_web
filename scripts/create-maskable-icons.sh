#!/bin/bash

# マスカブルアイコン作成スクリプト
# ImageMagickが必要です

echo "マスカブルアイコンを作成しています..."

cd public

# 192x192のマスカブル版を作成（中央80%に画像を配置）
convert pwa-192x192.png -resize 154x154 -background white -gravity center -extent 192x192 pwa-maskable-192x192.png

# 512x512のマスカブル版を作成（中央80%に画像を配置）
convert pwa-512x512.png -resize 410x410 -background white -gravity center -extent 512x512 pwa-maskable-512x512.png

echo "✅ マスカブルアイコンを作成しました！"
ls -lh pwa-maskable-*.png
