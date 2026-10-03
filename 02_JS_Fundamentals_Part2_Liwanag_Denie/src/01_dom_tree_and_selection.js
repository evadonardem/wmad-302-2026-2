export function initRouteStatusMonitor() {
  const syncBtn = document.getElementById('btn-sync-routes');
  const routeList = document.querySelectorAll('#route-list li');
  const activeStat = document.getElementById('stat-active');
  const delayedStat = document.getElementById('stat-delayed');

  if (!syncBtn) return;

  syncBtn.addEventListener('click', () => {
    let activeCount = 0;
    let delayedCount = 0;

    // Loop through route items and count statuses
    routeList.forEach((route) => {
      const status = route.dataset.status;

      if (status === 'active') {
        activeCount++;
      } else if (status === 'delayed') {
        delayedCount++;
      }
    });

    // Update DOM element text content
    if (activeStat) activeStat.textContent = activeCount;
    if (delayedStat) delayedStat.textContent = delayedCount;
  });
}