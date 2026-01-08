# 同步上游更新工作流

当原作者发布新版本时，使用以下步骤同步更新：

## 步骤

### 1. 切换到 main 分支并拉取最新代码
```bash
git checkout main
git pull origin main
```

### 2. 切换回你的定制分支
```bash
git checkout my-custom
```

### 3. 将定制分支 rebase 到最新的 main 上
```bash
git rebase main
```

### 4. 如果有冲突
Git 会提示你解决。解决冲突后执行：
```bash
git add <冲突文件>
git rebase --continue
```

### 5. 如果 rebase 太复杂想放弃
```bash
git rebase --abort
```

## 注意事项

- 你的定制修改在 `my-custom` 分支
- `main` 分支保持与上游一致
- 每次同步后，你的定制提交会被放在最新代码之上
- 建议在同步前确保没有未提交的修改

## 当前定制内容

- 在设置界面添加了"故障转移配置"
  - 黑名单阈值（1-10）
  - 黑名单时长（分钟）
- 涉及文件：
  - `cmd/desktop/frontend/src/modules/ui.js`
  - `cmd/desktop/frontend/src/modules/settings.js`
  - `cmd/desktop/frontend/src/i18n/zh-CN.js`
  - `cmd/desktop/frontend/src/i18n/en.js`

## 我的修改起点

```
起始 Commit: 9f156dd4bc80e0e9bcd19acb24a1f14ee3bbf8d4
描述: feat: add blacklist config to settings UI
```

## 冲突快速恢复方案

如果 rebase 冲突太多太乱，可以重新应用你的修改：

```bash
# 1. 放弃当前 rebase
git rebase --abort

# 2. 切到最新 main
git checkout main
git pull upstream main

# 3. 创建新分支
git checkout -b my-custom-v2

# 4. Cherry-pick 你的修改提交
git cherry-pick 9f156dd4bc80e0e9bcd19acb24a1f14ee3bbf8d4

# 5. 如果还是有冲突，解决后：
git add .
git cherry-pick --continue

# 6. 推送新分支
git push origin my-custom-v2
```
