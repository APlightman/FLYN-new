; FinanceTracker — современный установщик
; Modern UI 2 — профессиональный интерфейс

!define PRODUCT_NAME "FinanceTracker"
!define PRODUCT_VERSION "1.0.20"
!define PRODUCT_PUBLISHER "FinanceTracker Team"
!define PRODUCT_WEB_SITE "https://github.com/APlightman/FLYN-new"
!define PRODUCT_DIR_REGKEY "Software\Microsoft\Windows\CurrentVersion\App Paths\FinanceTracker.exe"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
!define PRODUCT_UNINST_ROOT_KEY "HKLM"

;-------------------------------------------------------
; Modern UI 2 — настройка внешнего вида
;-------------------------------------------------------
!include "MUI2.nsh"
!include "FileFunc.nsh"
!include "LogicLib.nsh"
!include "WinVer.nsh"

; Иконка установщика
!define MUI_ICON "electron\assets\icon.ico"
!define MUI_UNICON "electron\assets\icon.ico"

; Заголовок окна
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP ""
!define MUI_HEADERIMAGE_RIGHT

; Цветовая схема
!define MUI_UI ""

;-------------------------------------------------------
; Страницы установщика
;-------------------------------------------------------

; Страница приветствия
!define MUI_WELCOMEPAGE_TITLE "Добро пожаловать в FinanceTracker"
!define MUI_WELCOMEPAGE_TEXT "Этот мастер установит FinanceTracker v${PRODUCT_VERSION} на ваш компьютер.$\r$\n$\r$\nFinanceTracker — это современное приложение для управления личными финансами.$\r$\n$\r$\nНажмите «Далее», чтобы продолжить."

; Страница лицензии
!define MUI_LICENSEPAGE_RADIOBUTTONS
!define MUI_LICENSEPAGE_TEXT_TOP "Пожалуйста, ознакомьтесь с условиями лицензионного соглашения перед установкой."

; Страница выбора папки
!define MUI_DIRECTORYPAGE_TEXT_TOP "Выберите папку для установки FinanceTracker:"

; Страница выбора компонентов
!define MUI_COMPONENTSPAGE_TEXT_TOP "Выберите компоненты для установки:"

; Страница установки
!define MUI_INSTFILESPAGE_COLORS "FFFFFF 000000"
!define MUI_INSTFILESPAGE_PROGRESSBAR "colored"
!define MUI_INSTFILESPAGE_FINISHHEADER_TEXT "Установка завершена"
!define MUI_INSTFILESPAGE_FINISHHEADER_SUBTEXT "FinanceTracker успешно установлен на ваш компьютер."

; Страница завершения
!define MUI_FINISHPAGE_TITLE "Установка завершена"
!define MUI_FINISHPAGE_TEXT "FinanceTracker v${PRODUCT_VERSION} успешно установлен.$\r$\n$\r$\nСпасибо, что выбрали FinanceTracker!"
!define MUI_FINISHPAGE_RUN "$INSTDIR\FinanceTracker.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Запустить FinanceTracker"
!define MUI_FINISHPAGE_SHOWREADME ""
!define MUI_FINISHPAGE_LINK "Посетить сайт проекта"
!define MUI_FINISHPAGE_LINK_LOCATION "https://github.com/APlightman/FLYN-new"
!define MUI_FINISHPAGE_NOREBOOT_SUPPORT

;-------------------------------------------------------
; Порядок страниц
;-------------------------------------------------------
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

; Страницы деинсталлятора
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

;-------------------------------------------------------
; Язык
;-------------------------------------------------------
!insertmacro MUI_LANGUAGE "Russian"
!insertmacro MUI_LANGUAGE "English"

;-------------------------------------------------------
; Переменные
;-------------------------------------------------------
Var STARTMENU_FOLDER

;-------------------------------------------------------
; Секции установки
;-------------------------------------------------------

; Основное приложение (обязательно)
Section "FinanceTracker (обязательно)" SEC_MAIN
  SectionIn RO
  
  ; Установка файлов приложения
  SetOutPath "$INSTDIR"
  File /r "dist-electron\win-unpacked\*.*"
  
  ; Создание ярлыков
  CreateDirectory "$SMPROGRAMS\${PRODUCT_NAME}"
  CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\FinanceTracker.lnk" "$INSTDIR\FinanceTracker.exe"
  CreateShortCut "$DESKTOP\FinanceTracker.lnk" "$INSTDIR\FinanceTracker.exe"
  
  ; Запись в реестр для деинсталляции
  WriteUninstaller "$INSTDIR\uninst.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayName" "${PRODUCT_NAME}"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\uninst.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayIcon" "$INSTDIR\FinanceTracker.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "URLInfoAbout" "${PRODUCT_WEB_SITE}"
  WriteRegDWORD ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "NoModify" 1
  WriteRegDWORD ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "NoRepair" 1
SectionEnd

; Ярлык на рабочем столе
Section "Ярлык на рабочем столе" SEC_DESKTOP
  CreateShortCut "$DESKTOP\FinanceTracker.lnk" "$INSTDIR\FinanceTracker.exe"
SectionEnd

; Ярлык в меню Пуск
Section "Ярлык в меню Пуск" SEC_STARTMENU
  CreateDirectory "$SMPROGRAMS\${PRODUCT_NAME}"
  CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\FinanceTracker.lnk" "$INSTDIR\FinanceTracker.exe"
  CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\Удалить FinanceTracker.lnk" "$INSTDIR\uninst.exe"
SectionEnd

;-------------------------------------------------------
; Описание секций
;-------------------------------------------------------
LangString DESC_SEC_MAIN ${LANG_RUSSIAN} "Основные файлы приложения FinanceTracker"
LangString DESC_SEC_DESKTOP ${LANG_RUSSIAN} "Создать ярлык на рабочем столе"
LangString DESC_SEC_STARTMENU ${LANG_RUSSIAN} "Создать ярлык в меню Пуск"

!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
  !insertmacro MUI_DESCRIPTION_TEXT ${SEC_MAIN} $(DESC_SEC_MAIN)
  !insertmacro MUI_DESCRIPTION_TEXT ${SEC_DESKTOP} $(DESC_SEC_DESKTOP)
  !insertmacro MUI_DESCRIPTION_TEXT ${SEC_STARTMENU} $(DESC_SEC_STARTMENU)
!insertmacro MUI_FUNCTION_DESCRIPTION_END

;-------------------------------------------------------
; Функции установщика
;-------------------------------------------------------
Function .onInit
  ; Проверка прав администратора
  UserInfo::GetAccountType
  Pop $0
  ${If} $0 != "admin"
    MessageBox MB_ICONSTOP "Для установки FinanceTracker требуются права администратора.$\r$\nЗапустите установщик от имени администратора."
    Abort
  ${EndIf}
  
  ; Проверка версии Windows
  ${IfNot} ${AtLeastWin7}
    MessageBox MB_ICONSTOP "FinanceTracker требует Windows 7 или новее."
    Abort
  ${EndIf}
  
  ; Автоматическое удаление предыдущей версии (без диалога)
  ReadRegStr $0 HKLM "${PRODUCT_UNINST_KEY}" "UninstallString"
  ${If} $0 != ""
    ExecWait '$0 /S _?=$INSTDIR'
    DeleteRegKey HKLM "${PRODUCT_UNINST_KEY}"
  ${EndIf}
FunctionEnd

;-------------------------------------------------------
; Секция деинсталляции
;-------------------------------------------------------
Section "Uninstall"
  ; Удаление файлов
  RMDir /r "$INSTDIR\*.*"
  RMDir "$INSTDIR"
  
  ; Удаление ярлыков
  Delete "$DESKTOP\FinanceTracker.lnk"
  RMDir /r "$SMPROGRAMS\${PRODUCT_NAME}"
  
  ; Удаление записей реестра
  DeleteRegKey ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}"
  DeleteRegKey HKLM "${PRODUCT_DIR_REGKEY}"
  
  ; Удаление пользовательских данных (опционально)
  MessageBox MB_YESNO "Удалить пользовательские данные (базу данных, настройки)?$\r$\n$\r$\nРекомендуется оставить, если вы планируете переустановить приложение." IDNO skip_userdata
    RMDir /r "$APPDATA\${PRODUCT_NAME}"
  skip_userdata:
SectionEnd