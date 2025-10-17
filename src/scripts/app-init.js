// Регистрируем Service Worker как можно раньше
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Скрываем загрузочный экран после загрузки
window.addEventListener('load', () => {
  setTimeout(() => {
    document.body.classList.add('loaded');
    setTimeout(() => {
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.remove();
      }
    }, 500);
  }, 1000);
});

// Предотвращаем зум на iOS
document.addEventListener('gesturestart', function (e) {
  e.preventDefault();
});

// Отключаем контекстное меню на мобильных
document.addEventListener('contextmenu', function (e) {
  if (window.innerWidth < 768) {
    e.preventDefault();
  }
});

// Обработка viewport для мобильных устройств
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setViewportHeight();
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', () => {
  setTimeout(setViewportHeight, 100);
});