const btnSyncRoutes = document.querySelector('#btn-sync-routes');
const statActive = document.querySelector('#stat-active');
const statDelayed = document.querySelector('#stat-delayed');

if (btnSyncRoutes) {
  btnSyncRoutes.addEventListener('click', () => {
    const routeItems = document.querySelectorAll('#route-list li');
    
    let activeCount = 0;
    let delayedCount = 0;

    routeItems.forEach((item) => {
      const status = item.dataset.status;
      if (status === 'active') {
        activeCount++;
      } else if (status === 'delayed') {
        delayedCount++;
      }
    });

    if (statActive) statActive.textContent = `Active Routes: ${activeCount}`;
    if (statDelayed) statDelayed.textContent = `Delayed/Full: ${delayedCount}`;
  });
}