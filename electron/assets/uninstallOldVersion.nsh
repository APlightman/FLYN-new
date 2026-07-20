; NSIS скрипт для автоматического удаления старой версии приложения перед установкой новой
;
; Этот файл подключается electron-builder'ом как NSIS include.
; Он проверяет оба возможных ключа реестра:
;   1. ${APP_ID}!${APP_GUID} — ключ, создаваемый стандартным NSIS-шаблоном electron-builder
;   2. "FinanceTracker" — ключ, создаваемый кастомным installer.nsi
;
; Полный installer.nsi не подключён к electron-builder. Поэтому необходимые
; действия установки определены в поддерживаемых macro hooks этого файла.

!macro customInstallMode
  ; Проверяем ключ electron-builder (APP_ID!APP_GUID)
  ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}!${APP_GUID}" "UninstallString"
  ${If} $0 == ""
    ; Если не нашли по APP_ID!APP_GUID, проверяем кастомный ключ (installer.nsi)
    ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\FinanceTracker" "UninstallString"
  ${EndIf}

  ${If} $0 != ""
    ; Автоматически удаляем старую версию (тихий режим)
    ExecWait '$0 /S _?=$INSTDIR'
    ; Очищаем оба ключа реестра
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}!${APP_GUID}"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\FinanceTracker"
  ${EndIf}
!macroend

; Выполняется electron-builder после распаковки файлов приложения.
; Инициализация не должна блокировать установку: приложение повторит её при
; первом запуске, если создание БД по какой-либо причине не удалось.
!macro customInstall
  DetailPrint "Инициализация локальной базы данных..."
  ExecWait '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" --init-db' $0
  ${If} $0 == 0
    DetailPrint "Локальная база данных успешно создана"
  ${Else}
    DetailPrint "Не удалось создать базу данных (код: $0); она будет создана при первом запуске"
  ${EndIf}
!macroend
