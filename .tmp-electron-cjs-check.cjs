if (electron.app) { electron.app.whenReady().then(() => { console.log('ready'); electron.app.quit(); }); }) 
