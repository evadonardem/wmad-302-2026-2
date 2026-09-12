export function initRouteStatusMonitor() {
  const syncBtn = document.getElementById('btn-sync-routes');
  const routeList = document.querySelectorAll('#route-list li');
  const activeStat = document.getElementById('stat-active');
  const delayedStat = document.getElementById('stat-delayed');

  if (!syncBtn) return;

  syncBtn.addEventListener('click', () => {

    let active = 0;
    let delayed = 0;

    routeList.forEach(function(route){
      if(route.getAttribute('data-status') === 'active'){
        active = active + 1;
      }else if(route.getAttribute('data-status') === 'delayed'){
        delayed = delayed + 1;
      }
    });

    active.textContent = 'Active Routes: ' + active;
    delayed.textContent = 'Delayed/Full: ' + delayed;

    // TODO:
    // 1. Loop through routeList items
    // 2. Count active (data-status="active") vs delayed items
    // 3. Update activeStat and delayedStat text content
  });
}