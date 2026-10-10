export function initRouteStatusMonitor() {
  const syncBtn = document.getElementById('btn-sync-routes');
  const routeList = document.querySelectorAll('#route-list li');
  const activeStat = document.getElementById('stat-active');
  const delayedStat = document.getElementById('stat-delayed');

  if (!syncBtn) return;

  syncBtn.addEventListener('click', () => {
    // TODO:
    let active = 0;
    let delayed = 0;

    // 1. Loop through routeList items
    routeList.forEach((item) => {
      // 2. Count active (data-status="active") vs delayed items
      const status = item.dataset.status;
      if (status === 'active') active++;
      else if (status === 'delayed') delayed++;
    });

    // 3. Update activeStat and delayedStat text content
    if (activeStat) activeStat.textContent = active;
    if (delayedStat) delayedStat.textContent = delayed;
  });
}