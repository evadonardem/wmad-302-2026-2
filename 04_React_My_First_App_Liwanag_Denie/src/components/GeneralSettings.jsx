import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import { Settings } from '@mui/icons-material';

export default function GeneralSettings({ actions = [] }) {
  return (
    // TODO 12: Render an MUI SpeedDial positioned at the bottom-right corner 
    // and map through the 'actions' prop to display SpeedDialAction items.
    <SpeedDial
      ariaLabel="General Settings SpeedDial"
      sx={{ position: 'fixed', bottom: 16, right: 16 }}
      icon={<SpeedDialIcon icon={<Settings />} />}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={action.onClick}
        />
      ))}
    </SpeedDial>
  );
}