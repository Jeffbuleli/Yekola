#!/bin/sh
set -e
cd "$(dirname "$0")/.."

NODE="${NODE20:-$HOME/.local/node-v20/bin/node}"
if [ ! -x "$NODE" ]; then
  echo "Node 20 introuvable: $NODE" >&2
  echo "Le Node du système (24) provoque « bus error » sur ce Mac." >&2
  exit 1
fi

native="node_modules/@next/swc-darwin-x64/next-swc.darwin-x64.node"
if [ -f "$native" ]; then
  mv "$native" "$native.buserror"
fi

export NEXT_TEST_WASM=1
exec "$NODE" ./node_modules/next/dist/bin/next dev -p 3015
