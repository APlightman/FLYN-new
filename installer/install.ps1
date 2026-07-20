# FinanceTracker — графический установщик
# Запуск: powershell -ExecutionPolicy Bypass -File install.ps1

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# ===== ФОРМА =====
$form = New-Object System.Windows.Forms.Form
$form.Text = "FinanceTracker — Установка"
$form.Size = New-Object System.Drawing.Size(620, 520)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.BackColor = [System.Drawing.Color]::FromArgb(15, 15, 26)
$form.Icon = $null
$form.Font = New-Object System.Drawing.Font("Segoe UI", 10)

# ===== ЗАГОЛОВОК =====
$headerPanel = New-Object System.Windows.Forms.Panel
$headerPanel.Size = New-Object System.Drawing.Size(620, 140)
$headerPanel.BackColor = [System.Drawing.Color]::FromArgb(26, 26, 46)
$headerPanel.Dock = "Top"

$logoLabel = New-Object System.Windows.Forms.Label
$logoLabel.Text = "💰"
$logoLabel.Font = New-Object System.Drawing.Font("Segoe UI Emoji", 36)
$logoLabel.Size = New-Object System.Drawing.Size(80, 60)
$logoLabel.Location = New-Object System.Drawing.Point(270, 16)
$logoLabel.TextAlign = "MiddleCenter"
$headerPanel.Controls.Add($logoLabel)

$titleLabel = New-Object System.Windows.Forms.Label
$titleLabel.Text = "FinanceTracker"
$titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)
$titleLabel.ForeColor = [System.Drawing.Color]::White
$titleLabel.Size = New-Object System.Drawing.Size(400, 36)
$titleLabel.Location = New-Object System.Drawing.Point(110, 80)
$titleLabel.TextAlign = "MiddleCenter"
$headerPanel.Controls.Add($titleLabel)

$subtitleLabel = New-Object System.Windows.Forms.Label
$subtitleLabel.Text = "Управление личными финансами"
$subtitleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$subtitleLabel.ForeColor = [System.Drawing.Color]::FromArgb(144, 144, 168)
$subtitleLabel.Size = New-Object System.Drawing.Size(400, 20)
$subtitleLabel.Location = New-Object System.Drawing.Point(110, 112)
$subtitleLabel.TextAlign = "MiddleCenter"
$headerPanel.Controls.Add($subtitleLabel)

$form.Controls.Add($headerPanel)

# ===== ПАНЕЛЬ СТРАНИЦ =====
$pagePanel = New-Object System.Windows.Forms.Panel
$pagePanel.Size = New-Object System.Drawing.Size(580, 260)
$pagePanel.Location = New-Object System.Drawing.Point(20, 150)
$pagePanel.BackColor = [System.Drawing.Color]::FromArgb(15, 15, 26)
$form.Controls.Add($pagePanel)

# ===== СТРАНИЦА 1: ИНФОРМАЦИЯ =====
$infoGroup = New-Object System.Windows.Forms.GroupBox
$infoGroup.Text = "Будет установлено:"
$infoGroup.ForeColor = [System.Drawing.Color]::FromArgb(144, 144, 168)
$infoGroup.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
$infoGroup.Size = New-Object System.Drawing.Size(540, 120)
$infoGroup.Location = New-Object System.Drawing.Point(20, 10)
$infoGroup.BackColor = [System.Drawing.Color]::FromArgb(26, 26, 46)
$infoGroup.ForeColor = [System.Drawing.Color]::FromArgb(200, 200, 220)

$features = @(
    "✓ Учёт доходов и расходов",
    "✓ Бюджеты и финансовые цели",
    "✓ Регулярные платежи и напоминания",
    "✓ Календарь и калькуляторы",
    "✓ Полная конфиденциальность — данные локально"
)

$yPos = 28
foreach ($feature in $features) {
    $featLabel = New-Object System.Windows.Forms.Label
    $featLabel.Text = $feature
    $featLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $featLabel.ForeColor = [System.Drawing.Color]::FromArgb(180, 180, 200)
    $featLabel.Size = New-Object System.Drawing.Size(500, 18)
    $featLabel.Location = New-Object System.Drawing.Point(16, $yPos)
    $infoGroup.Controls.Add($featLabel)
    $yPos += 22
}

$pagePanel.Controls.Add($infoGroup)

# Информация о версии
$versionLabel = New-Object System.Windows.Forms.Label
$versionLabel.Text = "Версия: 1.0.34  |  Размер: ~180 МБ  |  Windows 7+"
$versionLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$versionLabel.ForeColor = [System.Drawing.Color]::FromArgb(144, 144, 168)
$versionLabel.Size = New-Object System.Drawing.Size(540, 20)
$versionLabel.Location = New-Object System.Drawing.Point(20, 140)
$versionLabel.TextAlign = "MiddleCenter"
$pagePanel.Controls.Add($versionLabel)

# ===== СТРАНИЦА 2: ПУТЬ (скрыта) =====
$pathGroup = New-Object System.Windows.Forms.GroupBox
$pathGroup.Text = "Путь установки:"
$pathGroup.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
$pathGroup.Size = New-Object System.Drawing.Size(540, 80)
$pathGroup.Location = New-Object System.Drawing.Point(20, 10)
$pathGroup.BackColor = [System.Drawing.Color]::FromArgb(26, 26, 46)
$pathGroup.ForeColor = [System.Drawing.Color]::FromArgb(200, 200, 220)
$pathGroup.Visible = $false
$pagePanel.Controls.Add($pathGroup)

$pathTextBox = New-Object System.Windows.Forms.TextBox
$pathTextBox.Text = "C:\FinanceTracker"
$pathTextBox.Font = New-Object System.Drawing.Font("Consolas", 10)
$pathTextBox.Size = New-Object System.Drawing.Size(400, 24)
$pathTextBox.Location = New-Object System.Drawing.Point(16, 28)
$pathTextBox.BackColor = [System.Drawing.Color]::FromArgb(15, 15, 26)
$pathTextBox.ForeColor = [System.Drawing.Color]::White
$pathTextBox.BorderStyle = "FixedSingle"
$pathGroup.Controls.Add($pathTextBox)

$browseButton = New-Object System.Windows.Forms.Button
$browseButton.Text = "Обзор"
$browseButton.Size = New-Object System.Drawing.Size(100, 28)
$browseButton.Location = New-Object System.Drawing.Point(424, 26)
$browseButton.BackColor = [System.Drawing.Color]::FromArgb(26, 26, 46)
$browseButton.ForeColor = [System.Drawing.Color]::FromArgb(200, 200, 220)
$browseButton.FlatStyle = "Flat"
$browseButton.FlatAppearance.BorderColor = [System.Drawing.Color]::FromArgb(42, 42, 74)
$browseButton.Cursor = "Hand"
$browseButton.Add_Click({
    $folderDialog = New-Object System.Windows.Forms.FolderBrowserDialog
    $folderDialog.Description = "Выберите папку для установки FinanceTracker"
    $folderDialog.SelectedPath = $pathTextBox.Text
    if ($folderDialog.ShowDialog() -eq "OK") {
        $pathTextBox.Text = $folderDialog.SelectedPath
    }
})
$pathGroup.Controls.Add($browseButton)

# Опции установки
$optionsGroup = New-Object System.Windows.Forms.GroupBox
$optionsGroup.Text = "Параметры:"
$optionsGroup.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
$optionsGroup.Size = New-Object System.Drawing.Size(540, 100)
$optionsGroup.Location = New-Object System.Drawing.Point(20, 100)
$optionsGroup.BackColor = [System.Drawing.Color]::FromArgb(26, 26, 46)
$optionsGroup.ForeColor = [System.Drawing.Color]::FromArgb(200, 200, 220)
$optionsGroup.Visible = $false
$pagePanel.Controls.Add($optionsGroup)

$desktopCheck = New-Object System.Windows.Forms.CheckBox
$desktopCheck.Text = "Создать ярлык на рабочем столе"
$desktopCheck.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$desktopCheck.ForeColor = [System.Drawing.Color]::FromArgb(180, 180, 200)
$desktopCheck.Size = New-Object System.Drawing.Size(300, 24)
$desktopCheck.Location = New-Object System.Drawing.Point(16, 24)
$desktopCheck.Checked = $true
$desktopCheck.BackColor = [System.Drawing.Color]::FromArgb(26, 26, 46)
$optionsGroup.Controls.Add($desktopCheck)

$startMenuCheck = New-Object System.Windows.Forms.CheckBox
$startMenuCheck.Text = "Создать ярлык в меню «Пуск»"
$startMenuCheck.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$startMenuCheck.ForeColor = [System.Drawing.Color]::FromArgb(180, 180, 200)
$startMenuCheck.Size = New-Object System.Drawing.Size(300, 24)
$startMenuCheck.Location = New-Object System.Drawing.Point(16, 48)
$startMenuCheck.Checked = $true
$startMenuCheck.BackColor = [System.Drawing.Color]::FromArgb(26, 26, 46)
$optionsGroup.Controls.Add($startMenuCheck)

$launchCheck = New-Object System.Windows.Forms.CheckBox
$launchCheck.Text = "Запустить после установки"
$launchCheck.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$launchCheck.ForeColor = [System.Drawing.Color]::FromArgb(180, 180, 200)
$launchCheck.Size = New-Object System.Drawing.Size(300, 24)
$launchCheck.Location = New-Object System.Drawing.Point(16, 72)
$launchCheck.Checked = $true
$launchCheck.BackColor = [System.Drawing.Color]::FromArgb(26, 26, 46)
$optionsGroup.Controls.Add($launchCheck)

# ===== СТРАНИЦА 3: ПРОГРЕСС (скрыта) =====
$progressGroup = New-Object System.Windows.Forms.GroupBox
$progressGroup.Text = "Установка..."
$progressGroup.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
$progressGroup.Size = New-Object System.Drawing.Size(540, 120)
$progressGroup.Location = New-Object System.Drawing.Point(20, 10)
$progressGroup.BackColor = [System.Drawing.Color]::FromArgb(26, 26, 46)
$progressGroup.ForeColor = [System.Drawing.Color]::FromArgb(200, 200, 220)
$progressGroup.Visible = $false
$pagePanel.Controls.Add($progressGroup)

$progressBar = New-Object System.Windows.Forms.ProgressBar
$progressBar.Size = New-Object System.Drawing.Size(500, 24)
$progressBar.Location = New-Object System.Drawing.Point(20, 30)
$progressBar.Style = "Continuous"
$progressBar.ForeColor = [System.Drawing.Color]::FromArgb(108, 99, 255)
$progressBar.BackColor = [System.Drawing.Color]::FromArgb(15, 15, 26)
$progressGroup.Controls.Add($progressBar)

$progressLabel = New-Object System.Windows.Forms.Label
$progressLabel.Text = "Подготовка..."
$progressLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$progressLabel.ForeColor = [System.Drawing.Color]::FromArgb(180, 180, 200)
$progressLabel.Size = New-Object System.Drawing.Size(500, 24)
$progressLabel.Location = New-Object System.Drawing.Point(20, 60)
$progressLabel.TextAlign = "MiddleCenter"
$progressGroup.Controls.Add($progressLabel)

$progressPercent = New-Object System.Windows.Forms.Label
$progressPercent.Text = "0%"
$progressPercent.Font = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)
$progressPercent.ForeColor = [System.Drawing.Color]::FromArgb(108, 99, 255)
$progressPercent.Size = New-Object System.Drawing.Size(500, 36)
$progressPercent.Location = New-Object System.Drawing.Point(20, 80)
$progressPercent.TextAlign = "MiddleCenter"
$progressGroup.Controls.Add($progressPercent)

# ===== СТРАНИЦА 4: ЗАВЕРШЕНИЕ (скрыта) =====
$completeGroup = New-Object System.Windows.Forms.GroupBox
$completeGroup.Size = New-Object System.Drawing.Size(540, 120)
$completeGroup.Location = New-Object System.Drawing.Point(20, 10)
$completeGroup.BackColor = [System.Drawing.Color]::FromArgb(26, 26, 46)
$completeGroup.ForeColor = [System.Drawing.Color]::FromArgb(200, 200, 220)
$completeGroup.Visible = $false
$pagePanel.Controls.Add($completeGroup)

$completeIcon = New-Object System.Windows.Forms.Label
$completeIcon.Text = "✅"
$completeIcon.Font = New-Object System.Drawing.Font("Segoe UI Emoji", 36)
$completeIcon.Size = New-Object System.Drawing.Size(60, 60)
$completeIcon.Location = New-Object System.Drawing.Point(240, 10)
$completeIcon.TextAlign = "MiddleCenter"
$completeGroup.Controls.Add($completeIcon)

$completeLabel = New-Object System.Windows.Forms.Label
$completeLabel.Text = "Установка завершена!"
$completeLabel.Font = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$completeLabel.ForeColor = [System.Drawing.Color]::White
$completeLabel.Size = New-Object System.Drawing.Size(500, 30)
$completeLabel.Location = New-Object System.Drawing.Point(20, 70)
$completeLabel.TextAlign = "MiddleCenter"
$completeGroup.Controls.Add($completeLabel)

$completePathLabel = New-Object System.Windows.Forms.Label
$completePathLabel.Text = "FinanceTracker установлен в: C:\FinanceTracker"
$completePathLabel.Font = New-Object System.Drawing.Font("Segoe UI", 9)
$completePathLabel.ForeColor = [System.Drawing.Color]::FromArgb(144, 144, 168)
$completePathLabel.Size = New-Object System.Drawing.Size(500, 20)
$completePathLabel.Location = New-Object System.Drawing.Point(20, 96)
$completePathLabel.TextAlign = "MiddleCenter"
$completeGroup.Controls.Add($completePathLabel)

# ===== КНОПКИ =====
$buttonPanel = New-Object System.Windows.Forms.Panel
$buttonPanel.Size = New-Object System.Drawing.Size(620, 60)
$buttonPanel.Location = New-Object System.Drawing.Point(0, 420)
$buttonPanel.BackColor = [System.Drawing.Color]::FromArgb(15, 15, 26)
$form.Controls.Add($buttonPanel)

$cancelButton = New-Object System.Windows.Forms.Button
$cancelButton.Text = "Отмена"
$cancelButton.Size = New-Object System.Drawing.Size(120, 36)
$cancelButton.Location = New-Object System.Drawing.Point(370, 12)
$cancelButton.BackColor = [System.Drawing.Color]::FromArgb(26, 26, 46)
$cancelButton.ForeColor = [System.Drawing.Color]::FromArgb(180, 180, 200)
$cancelButton.FlatStyle = "Flat"
$cancelButton.FlatAppearance.BorderColor = [System.Drawing.Color]::FromArgb(42, 42, 74)
$cancelButton.Cursor = "Hand"
$cancelButton.Add_Click({ $form.Close() })
$buttonPanel.Controls.Add($cancelButton)

$nextButton = New-Object System.Windows.Forms.Button
$nextButton.Text = "Далее →"
$nextButton.Size = New-Object System.Drawing.Size(120, 36)
$nextButton.Location = New-Object System.Drawing.Point(240, 12)
$nextButton.BackColor = [System.Drawing.Color]::FromArgb(108, 99, 255)
$nextButton.ForeColor = [System.Drawing.Color]::White
$nextButton.FlatStyle = "Flat"
$nextButton.Cursor = "Hand"
$buttonPanel.Controls.Add($nextButton)

# ===== ЛОГИКА НАВИГАЦИИ =====
$script:step = 0

function ShowStep($step) {
    $infoGroup.Visible = ($step -eq 0)
    $versionLabel.Visible = ($step -eq 0)
    $pathGroup.Visible = ($step -eq 1)
    $optionsGroup.Visible = ($step -eq 1)
    $progressGroup.Visible = ($step -eq 2)
    $completeGroup.Visible = ($step -eq 3)
    
    if ($step -eq 0) {
        $nextButton.Text = "Далее →"
        $cancelButton.Text = "Отмена"
        $cancelButton.Visible = $true
    } elseif ($step -eq 1) {
        $nextButton.Text = "Установить"
        $cancelButton.Text = "Назад"
        $cancelButton.Visible = $true
    } elseif ($step -eq 2) {
        $nextButton.Visible = $false
        $cancelButton.Visible = $false
    } elseif ($step -eq 3) {
        $nextButton.Text = "Запустить"
        $cancelButton.Text = "Закрыть"
        $cancelButton.Visible = $true
        $nextButton.Visible = $true
    }
}

function Start-Installation {
    $installPath = $pathTextBox.Text
    $sourcePath = Join-Path (Split-Path $script:MyInvocation.MyCommand.Path -Parent) "..\dist-electron\win-unpacked"
    
    # Проверяем источник
    if (-not (Test-Path $sourcePath)) {
        $sourcePath = Join-Path (Split-Path $script:MyInvocation.MyCommand.Path -Parent) "..\dist-electron\win-unpacked"
        $sourcePath = Resolve-Path $sourcePath -ErrorAction SilentlyContinue
        if (-not $sourcePath) {
            [System.Windows.Forms.MessageBox]::Show(
                "Не найдена папка с собранным приложением (dist-electron\win-unpacked).`nСначала соберите приложение: npm run build:desktop",
                "Ошибка", "OK", "Error"
            )
            ShowStep 1
            return
        }
    }
    
    ShowStep 2
    
    try {
        # Создаём целевую папку
        if (-not (Test-Path $installPath)) {
            New-Item -ItemType Directory -Force -Path $installPath | Out-Null
        }
        
        # Копируем файлы
        $totalItems = (Get-ChildItem -Path $sourcePath -Recurse -File).Count
        $currentItem = 0
        
        Get-ChildItem -Path $sourcePath -Recurse | ForEach-Object {
            $currentItem++
            $percent = [Math]::Round(($currentItem / $totalItems) * 100)
            $relativePath = $_.FullName.Substring($sourcePath.Length + 1)
            $destPath = Join-Path $installPath $relativePath
            
            if ($_.PSIsContainer) {
                New-Item -ItemType Directory -Force -Path $destPath | Out-Null
            } else {
                Copy-Item -Path $_.FullName -Destination $destPath -Force
            }
            
            # Обновляем прогресс (каждые 10 элементов для производительности)
            if ($currentItem % 10 -eq 0 -or $currentItem -eq $totalItems) {
                $progressBar.Value = $percent
                $progressLabel.Text = "Копирование: $($_.Name)"
                $progressPercent.Text = "$percent%"
                $form.Refresh()
            }
        }
        
        # Создаём ярлыки
        $progressLabel.Text = "Создание ярлыков..."
        $form.Refresh()
        Start-Sleep -Milliseconds 200
        
        $exePath = Join-Path $installPath "FinanceTracker.exe"
        
        if ($desktopCheck.Checked) {
            $desktopPath = [Environment]::GetFolderPath("Desktop")
            $shortcutPath = Join-Path $desktopPath "FinanceTracker.lnk"
            $wsh = New-Object -ComObject WScript.Shell
            $shortcut = $wsh.CreateShortcut($shortcutPath)
            $shortcut.TargetPath = $exePath
            $shortcut.Description = "FinanceTracker — управление личными финансами"
            $shortcut.WorkingDirectory = $installPath
            $shortcut.Save()
        }
        
        if ($startMenuCheck.Checked) {
            $startMenuPath = Join-Path ([Environment]::GetFolderPath("Programs")) "FinanceTracker.lnk"
            $wsh = New-Object -ComObject WScript.Shell
            $shortcut = $wsh.CreateShortcut($startMenuPath)
            $shortcut.TargetPath = $exePath
            $shortcut.Description = "FinanceTracker — управление личными финансами"
            $shortcut.WorkingDirectory = $installPath
            $shortcut.Save()
        }
        
        # Завершение
        $progressBar.Value = 100
        $progressLabel.Text = "Установка завершена!"
        $progressPercent.Text = "100%"
        $form.Refresh()
        Start-Sleep -Milliseconds 500
        
        $completePathLabel.Text = "FinanceTracker установлен в: $installPath"
        $script:installPath = $installPath
        ShowStep 3
        
    } catch {
        [System.Windows.Forms.MessageBox]::Show(
            "Ошибка при установке: $_",
            "Ошибка", "OK", "Error"
        )
        ShowStep 1
    }
}

$nextButton.Add_Click({
    if ($script:step -eq 0) {
        $script:step = 1
        ShowStep 1
    } elseif ($script:step -eq 1) {
        $nextButton.Enabled = $false
        $nextButton.Text = "Установка..."
        $form.Refresh()
        Start-Installation
        $nextButton.Enabled = $true
    } elseif ($script:step -eq 3) {
        # Запуск
        $exePath = Join-Path $script:installPath "FinanceTracker.exe"
        if (Test-Path $exePath) {
            Start-Process -FilePath $exePath
        }
        $form.Close()
    }
})

$cancelButton.Add_Click({
    if ($script:step -eq 1) {
        $script:step = 0
        ShowStep 0
    } elseif ($script:step -eq 3) {
        $form.Close()
    } else {
        $form.Close()
    }
})

# ===== ЗАПУСК =====
ShowStep 0
$form.ShowDialog() | Out-Null