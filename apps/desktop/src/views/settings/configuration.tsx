import { SettingContext } from "@/App";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useConfigValue } from "@/hooks/use-config-value";
import { invoke } from "@tauri-apps/api/core";
import { useContext } from "react";

export const Configuration = () => {
  const { value: telemetry } = useConfigValue("telemetry");
  const { value: showOnlyTalkingUsers } = useConfigValue("showOnlyTalkingUsers");
  const { value: showOwnUser } = useConfigValue("showOwnUser");
  const { value: opacity } = useConfigValue("opacity");
  const { value: pin } = useConfigValue("pin");
  const store = useContext(SettingContext);

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex h-8 items-center justify-between">
        <label
          htmlFor="show-own-user"
          className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Always show own user
        </label>
        <Switch
          id="show-own-user"
          checked={showOwnUser}
          onCheckedChange={async () => {
            const flag = !showOwnUser;
            store.set("showOwnUser", flag);
          }}
        />
      </div>
      <div className="flex h-8 items-center justify-between">
        <label
          htmlFor="only-talking-users"
          className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Only show users who are speaking
        </label>
        <Switch
          id="only-talking-users"
          checked={showOnlyTalkingUsers}
          onCheckedChange={async () => {
            const flag = !showOnlyTalkingUsers;
            store.set("showOnlyTalkingUsers", flag);
          }}
        />
      </div>
      <div className="flex h-8 items-center justify-between">
        <label
          htmlFor="opacity"
          className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Overlay opacity
        </label>
        <Input
          id="opacity"
          type="number"
          value={opacity}
          onChange={async event => {
            const newOpacity = event.target.value;
            store.set("opacity", Number(newOpacity));
          }}
          className="w-20"
        />
      </div>
      <div className="flex h-8 items-center justify-between">
        <label
          htmlFor="telemetry"
          className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Telemetry
        </label>
        <Switch
          id="telemetry"
          checked={telemetry}
          onCheckedChange={async () => {
            const flag = !telemetry;
            store.set("telemetry", flag);
          }}
        />
      </div>

      <div className="flex h-8 items-center justify-between">
        <label
          htmlFor="pin"
          className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Pin
        </label>
        <Switch
          id="pin"
          checked={pin}
          onCheckedChange={async () => {
            const flag = !pin;
            store.set("pin", flag);

            // let rust know to update the tray
            await invoke("set_pin", {
              value: flag,
            });
          }}
        />
      </div>
    </div>
  );
};
