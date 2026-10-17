import { Settings } from "@mui/icons-material";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";

export default function GeneralSettings({ actions }) {
    // TODO 12 [Dynamic Actions Overlay]: Implement the component structure below:
    return (
        <SpeedDial
            ariaLabel="App Settings SpeedDial"
            // a. Anchored to the absolute position: bottom 16, right 16
            sx={{ position: 'absolute', bottom: 16, right: 16 }}
            icon={<SpeedDialIcon icon={<Settings />} />}
        >
            {/* b. Map through the 'actions' prop array to render a nested SpeedDialAction */}
            {actions.map((action) => (
                <SpeedDialAction
                    // c. Configure unique key, icon asset, tooltip title, and custom onClick callback
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    onClick={action.onClick}
                />
            ))}
        </SpeedDial>
    );
}

