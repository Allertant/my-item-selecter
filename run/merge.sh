#!/bin/bash
# 合并 dev → master 并推送
set -e
git checkout master
git merge dev
git push origin master dev
git checkout dev
