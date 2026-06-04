# Генерация ICO иконки для FinanceTracker из SVG
# Требует .NET 4.7+ или .NET Core 3.0+

param(
    [string]$SvgPath = "..\electron\assets\icon.svg",
    [string]$IcoPath = "..\electron\assets\icon.ico"
)

Write-Host "Генерация иконки FinanceTracker..." -ForegroundColor Cyan

# Проверяем наличие SVG
if (-not (Test-Path $SvgPath)) {
    Write-Host "SVG файл не найден: $SvgPath" -ForegroundColor Red
    exit 1
}

# Создаём ICO с помощью .NET
try {
    Add-Type -AssemblyName System.Drawing
    
    # Создаём временную папку для PNG
    $tempDir = Join-Path $env:TEMP "financetracker-icon"
    New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
    
    # Создаём простую иконку через System.Drawing
    $icoPath = Resolve-Path $IcoPath -ErrorAction SilentlyContinue
    if (-not $icoPath) {
        $icoPath = Join-Path (Resolve-Path "..\electron\assets") "icon.ico"
    }
    
    Write-Host "Создание ICO файла..." -ForegroundColor Yellow
    
    # Создаём иконку программно (цветной квадрат с градиентом)
    $bitmap = New-Object System.Drawing.Bitmap(256, 256)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    
    # Рисуем градиентный фон
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point(0, 0)),
        (New-Object System.Drawing.Point(256, 256)),
        [System.Drawing.Color]::FromArgb(108, 99, 255),
        [System.Drawing.Color]::FromArgb(139, 92, 246)
    )
    $graphics.FillRoundedRectangle($brush, 0, 0, 256, 256, 48)
    
    # Рисуем символ денег
    $font = New-Object System.Drawing.Font("Segoe UI Emoji", 100, [System.Drawing.FontStyle]::Bold)
    $brush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $graphics.DrawString("💰", $font, $brush2, 128, 128, 
        [System.Drawing.StringFormat]::GenericDefault -bor [System.Drawing.StringFormatFlags]::DirectionRightToLeft)
    
    # Сохраняем как PNG
    $pngPath = Join-Path $tempDir "icon_256.png"
    $bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Создаём ICO вручную
    $fs = New-Object System.IO.FileStream($IcoPath, [System.IO.FileMode]::Create)
    $writer = New-Object System.IO.BinaryWriter($fs)
    
    # ICO Header
    $writer.Write([UInt16]0)  # Reserved
    $writer.Write([UInt16]1)  # ICO type
    $writer.Write([UInt16]1)  # Number of images
    
    # Directory entry (256x256 PNG)
    $writer.Write([Byte]0)    # Width (0 = 256)
    $writer.Write([Byte]0)    # Height (0 = 256)
    $writer.Write([Byte]0)    # Colors
    $writer.Write([Byte]0)    # Reserved
    $writer.Write([UInt16]1)  # Color planes
    $writer.Write([UInt16]32) # Bits per pixel
    $pngBytes = [System.IO.File]::ReadAllBytes($pngPath)
    $writer.Write([UInt32]$pngBytes.Length)  # Image size
    $writer.Write([UInt32]22)  # Offset (6 header + 16 directory)
    
    # PNG data
    $writer.Write($pngBytes)
    
    $writer.Close()
    $fs.Close()
    
    # Cleanup
    $graphics.Dispose()
    $bitmap.Dispose()
    $brush.Dispose()
    $font.Dispose()
    $brush2.Dispose()
    
    # Удаляем временные файлы
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    
    Write-Host "Иконка создана: $IcoPath" -ForegroundColor Green
    Write-Host "Готово!" -ForegroundColor Cyan
    
} catch {
    Write-Host "Ошибка при создании иконки: $_" -ForegroundColor Red
    Write-Host "Создаю простую иконку..." -ForegroundColor Yellow
    
    # Fallback: создаём минимальную ICO
    try {
        $icoPath = Resolve-Path $IcoPath
        if (-not $icoPath) {
            $icoPath = Join-Path (Resolve-Path "..\electron\assets") "icon.ico"
        }
        
        # Минимальная ICO (32x32)
        $fs = New-Object System.IO.FileStream($icoPath, [System.IO.FileMode]::Create)
        $writer = New-Object System.IO.BinaryWriter($fs)
        
        # Создаём 32x32 BMP
        $bmp = New-Object System.Drawing.Bitmap(32, 32)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.Clear([System.Drawing.Color]::FromArgb(108, 99, 255))
        $g.Dispose()
        
        # Сохраняем как BMP
        $ms = New-Object System.IO.MemoryStream
        $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Bmp)
        $bmpBytes = $ms.ToArray()
        $ms.Close()
        
        # ICO Header
        $writer.Write([UInt16]0)
        $writer.Write([UInt16]1)
        $writer.Write([UInt16]1)
        
        # Directory entry
        $writer.Write([Byte]32)
        $writer.Write([Byte]32)
        $writer.Write([Byte]0)
        $writer.Write([Byte]0)
        $writer.Write([UInt16]1)
        $writer.Write([UInt16]32)
        $writer.Write([UInt32]$bmpBytes.Length)
        $writer.Write([UInt32]22)
        
        # BMP data
        $writer.Write($bmpBytes)
        
        $writer.Close()
        $fs.Close()
        $bmp.Dispose()
        
        Write-Host "Простая иконка создана: $icoPath" -ForegroundColor Green
    } catch {
        Write-Host "Не удалось создать иконку: $_" -ForegroundColor Red
        exit 1
    }
}