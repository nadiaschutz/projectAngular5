#!/bin/bash

echo "[REMOVING OLD APP]"
rm -rf dist
echo "[COMPLETED, REMOVING PACKAGE-LOCK.JSON]"
rm package-lock.json
echo "[COMLETED, REMOVING OLD NODE MODULE]"
rm -rf node_modules
echo "[INSTALLING NODE MODULES]"
npm i
echo "[COMPILING APP]"
npm run build
