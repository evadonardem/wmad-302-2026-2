export function initRouteStatusMonitor() {
  const syncBtn = document.getElementById('btn-sync-routes');
  const routeList = document.querySelectorAll('#route-list li');
  const activeStat = document.getElementById('stat-active');
  const delayedStat = document.getElementById('stat-delayed');

  if (!syncBtn) return;

  syncBtn.addEventListener('click', () => {
   let activeCount = 0;
let delayedCount = 0;

for (const route of routeList) {
  if (route.dataset.status === 'active') {
    activeCount++;
  } else if (route.dataset.status === 'delayed') {
    delayedCount++;
  }
}

activeStat.textContent = activeCount;
delayedStat.textContent = delayedCount;
    
  });
}