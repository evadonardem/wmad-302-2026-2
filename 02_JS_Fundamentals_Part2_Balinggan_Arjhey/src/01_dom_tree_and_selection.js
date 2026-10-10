export function initRouteStatusMonitor() {
  const syncBtn = document.getElementById('btn-sync-routes');
  const routeList = document.querySelectorAll('#route-list li');
  const activeStat = document.getElementById('stat-active');
  const delayedStat = document.getElementById('stat-delayed');

  if (!syncBtn) return;

  syncBtn.addEventListener('click', () => {
      let activeCount = 0;
      let delayedCount = 0;

      // Loop through each route element
      routeList.forEach((item) => {
        const status = item.dataset.status;
        if (status === 'active') {
          activeCount++;
        } else if (status === 'delayed') {
          delayedCount++;
        }
      });

      // Update text content in #stats-panel
      if (activeStat) {
        activeStat.textContent = `Active Routes: ${activeCount}`;
      }
      if (delayedStat) {
        delayedStat.textContent = `Delayed/Full: ${delayedCount}`;
      }
    });
}