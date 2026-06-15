// Show the screen matching `name` and hide all others.
// Also updates which nav button is highlighted as active.
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(function (screen) {
    screen.classList.remove('active');
  });

  const target = document.getElementById('screen-' + name);
  if (target) {
    target.classList.add('active');
  }

  document.querySelectorAll('.nav-btn').forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.screen === name);
  });
}

// Wire up nav buttons
document.querySelectorAll('.nav-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    showScreen(btn.dataset.screen);
  });
});
