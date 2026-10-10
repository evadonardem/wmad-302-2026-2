import { Settings } from '@mui/icons-material';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';

export default function GeneralSettings({ actions }) {
  return (
    <SpeedDial
      ariaLabel="Application settings"
      icon={<SpeedDialIcon icon={<Settings />} />}
      sx={{ position: 'absolute', bottom: 16, right: 16 }}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          slotProps={{ tooltip: { title: action.name } }}
          onClick={action.onClick}
        />
      ))}
    </SpeedDial>
  );
}
