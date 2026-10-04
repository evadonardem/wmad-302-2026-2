import { Settings } from "@mui/icons-material";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";

export default function GeneralSettings({ actions }) {
  return (
    <SpeedDial
      ariaLabel="General Setting"
      sx={{ position: "absolute", bottom: 16, right: 16, "& .MuiFab-primary": { backgroundColo:'#099ee4',  color: "#000000",}}}
      icon={<SpeedDialIcon icon={<Settings />} />}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          slotProps={{
            tooltip: {
              title: action.name,
            },
          }}
          onClick={action.onClick}
        />
      ))}
    </SpeedDial>
  );
}