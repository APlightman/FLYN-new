; Inno Setup скрипт для FinanceTracker
; Современный установщик с красивым интерфейсом

#define MyAppName "FinanceTracker"
#define MyAppVersion "1.0.6"
#define MyAppPublisher "FinanceTracker Team"
#define MyAppURL "https://github.com/APlightman/FLYN-new"
#define MyAppExeName "FinanceTracker.exe"

[Setup]
AppId={{B8F4A3D2-1C5E-4A7B-9D6F-8E2C3A1B5D7F}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName=C:\FinanceTracker
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
LicenseFile=..\LICENSE.txt
OutputDir=..\dist-electron
OutputBaseFilename=FinanceTracker_Setup_{#MyAppVersion}
SetupIconFile=..\electron\assets\icon.ico
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
WizardSizePercent=100
DisableProgramGroupPage=yes
DisableReadyPage=no
DisableFinishedPage=no
PrivilegesRequired=admin
PrivilegesRequiredOverridesAllowed=dialog
ShowLanguageDialog=no
LanguageDetectionMethod=locale

[Languages]
Name: "russian"; MessagesFile: "compiler:Languages\Russian.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Создать ярлык на рабочем столе"; GroupDescription: "Дополнительные задачи:"; Flags: checkedonce
Name: "startmenuicon"; Description: "Создать ярлык в меню «Пуск»"; GroupDescription: "Дополнительные задачи:"; Flags: checkedonce

[Files]
Source: "..\dist-electron\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs; Check: DirExists(ExpandConstant('{src}\..\dist-electron\win-unpacked'))

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: startmenuicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#MyAppName}}"; Flags: nowait postinstall skipifsilent

[UninstallRun]
Filename: "{app}\{#MyAppExeName}"; Parameters: "--uninstall"; Flags: runhidden

[Code]
// Современный интерфейс с кастомными страницами
var
  WelcomePage: TWizardPage;
  WelcomeImage: TBitmapImage;
  WelcomeLabel: TLabel;
  WelcomeSubLabel: TLabel;
  FeaturesLabel: TLabel;
  FeatureItems: array of TLabel;

procedure InitializeWizard;
var
  I: Integer;
  FeatureTexts: array[0..5] of string;
begin
  // Кастомная страница приветствия
  WelcomePage := CreateCustomPage(wpWelcome, 'Добро пожаловать в FinanceTracker', 
    'Этот мастер установит FinanceTracker на ваш компьютер.');

  WelcomeLabel := TLabel.Create(WelcomePage);
  WelcomeLabel.Parent := WelcomePage.Surface;
  WelcomeLabel.Left := 0;
  WelcomeLabel.Top := 16;
  WelcomeLabel.Width := WelcomePage.SurfaceWidth;
  WelcomeLabel.Height := 32;
  WelcomeLabel.Font.Size := 18;
  WelcomeLabel.Font.Style := [fsBold];
  WelcomeLabel.Caption := 'FinanceTracker ' + '{#MyAppVersion}';
  WelcomeLabel.Alignment := taCenter;

  WelcomeSubLabel := TLabel.Create(WelcomePage);
  WelcomeSubLabel.Parent := WelcomePage.Surface;
  WelcomeSubLabel.Left := 0;
  WelcomeSubLabel.Top := 52;
  WelcomeSubLabel.Width := WelcomePage.SurfaceWidth;
  WelcomeSubLabel.Height := 20;
  WelcomeSubLabel.Font.Size := 10;
  WelcomeSubLabel.Caption := 'Современное приложение для управления личными финансами';
  WelcomeSubLabel.Alignment := taCenter;

  FeaturesLabel := TLabel.Create(WelcomePage);
  FeaturesLabel.Parent := WelcomePage.Surface;
  FeaturesLabel.Left := 20;
  FeaturesLabel.Top := 90;
  FeaturesLabel.Width := WelcomePage.SurfaceWidth - 40;
  FeaturesLabel.Height := 16;
  FeaturesLabel.Font.Size := 9;
  FeaturesLabel.Font.Style := [fsBold];
  FeaturesLabel.Caption := 'Возможности:';

  FeatureTexts[0] := '✓ Учёт доходов и расходов';
  FeatureTexts[1] := '✓ Бюджеты и финансовые цели';
  FeatureTexts[2] := '✓ Регулярные платежи и напоминания';
  FeatureTexts[3] := '✓ Календарь событий';
  FeatureTexts[4] := '✓ Калькуляторы: ипотека, кредиты, вклады';
  FeatureTexts[5] := '✓ Полная конфиденциальность — данные хранятся локально';

  SetArrayLength(FeatureItems, 6);
  for I := 0 to 5 do
  begin
    FeatureItems[I] := TLabel.Create(WelcomePage);
    FeatureItems[I].Parent := WelcomePage.Surface;
    FeatureItems[I].Left := 40;
    FeatureItems[I].Top := 112 + I * 22;
    FeatureItems[I].Width := WelcomePage.SurfaceWidth - 60;
    FeatureItems[I].Height := 20;
    FeatureItems[I].Font.Size := 9;
    FeatureItems[I].Caption := FeatureTexts[I];
  end;
end;

// Проверка свободного места
function GetSpaceOnDisk(const Path: string): Int64;
var
  Drive: string;
begin
  Drive := ExtractFileDrive(Path);
  if Drive = '' then
    Drive := 'C:';
  Result := GetSpaceOnDisk(Drive);
end;

function GetRequiredSpace: Int64;
begin
  Result := 500 * 1024 * 1024; // 500 MB
end;

function NextButtonClick(CurPageID: Integer): Boolean;
var
  FreeSpace: Int64;
begin
  Result := True;
  
  if CurPageID = wpSelectDir then
  begin
    FreeSpace := GetSpaceOnDisk(WizardDirValue);
    if FreeSpace < GetRequiredSpace then
    begin
      MsgBox('Недостаточно свободного места на диске. Требуется не менее 500 МБ.', 
        mbError, MB_OK);
      Result := False;
    end;
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    // Установка завершена
  end;
end;

// Кастомная иконка в заголовке
function ShouldSkipPage(PageID: Integer): Boolean;
begin
  Result := False;
end;