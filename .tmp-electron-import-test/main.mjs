import electronMain from 'electron/main';

const { app } = electronMain;

console.log('app-exists', typeof app, Boolean(app));

app.whenReady().then(() => {
  console.log('ready-ok');
  app.quit();
});
