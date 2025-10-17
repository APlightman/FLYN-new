; NSIS скрипт для автоматического удаления старой версии приложения перед установкой новой

!macro customInstallMode
  ; Проверяем, установлена ли уже предыдущая версия
  ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}!${APP_GUID}" "DisplayVersion"
  ${If} $0 != ""
    ; Если версия установлена, автоматически удаляем её
    ; Получаем путь к деинсталлятору старой версии
    ReadRegStr $1 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}!${APP_GUID}" "UninstallString"
    ${If} $1 != ""
      ; Запускаем деинсталлятор старой версии и ждем завершения
      ExecWait '$1 /S _?=$INSTDIR'
      ; Удаляем оставшиеся записи в реестре
      DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}!${APP_GUID}"
    ${EndIf}
  ${EndIf}
!macroend

; Вызываем макрос customInstallMode при инициализации установки
!define MUI_CUSTOMFUNCTION_ONINIT customInstallMode