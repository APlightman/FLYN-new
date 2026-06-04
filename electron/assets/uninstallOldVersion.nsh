; NSIS скрипт для автоматического удаления старой версии приложения перед установкой новой
;
; Этот макрос вызывается electron-builder'ом на этапе customInstallMode.
; Он проверяет оба возможных ключа реестра:
;   1. ${APP_ID}!${APP_GUID} — ключ, создаваемый стандартным NSIS-шаблоном electron-builder
;   2. "FinanceTracker" — ключ, создаваемый кастомным installer.nsi
;
; ВНИМАНИЕ: installer.nsi имеет свою собственную функцию .onInit,
; которая переопределяет MUI_CUSTOMFUNCTION_ONINIT.
; Этот файл оставлен как fallback для случаев, когда сборка идёт
; без кастомного installer.nsi (через стандартный шаблон electron-builder).

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