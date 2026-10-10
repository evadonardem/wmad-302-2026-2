import { Settings } from "@mui/icons-material";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";

export default function GeneralSettings({ actions }) {
    return (
        <SpeedDial
            ariaLabel="settings actions"
            sx={{ position: 'absolute', bottom: 16, right: 16 }}
            icon={<SpeedDialIcon openIcon={<Settings />} />}
        >
            {actions.map((action, index) => (
                <SpeedDialAction
                    key={`${action.name ?? 'action'}-${index}`}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    onClick={action.onClick}
                />
            ))}
        </SpeedDial>
    );
}
