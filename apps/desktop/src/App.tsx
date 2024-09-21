import { Routes, Route } from "react-router-dom";
import { MainView } from "./views/main";
import { ChannelView } from "./views/channel";

import { SettingsView } from "./views/settings";
import { ErrorView } from "./views/error";
import { NavBar } from "./components/nav-bar";
import { usePin } from "./hooks/use-pin";
import { useAlign } from "./hooks/use-align";
import { useDisableWebFeatures } from "./hooks/use-disable-context-menu";
import { useUpdate } from "./hooks/use-update";
import { useAppStore } from "./store";
import { Toaster } from "./components/ui/toaster";
import { useEffect } from "react";
import { useSocket } from "./rpc/manager";
import { cn } from "./utils/tw";
import { listen } from "@tauri-apps/api/event";
import { RPCCommand } from "./rpc/command";

function App() {
  useDisableWebFeatures();
  const socket = useSocket();
  const { visible, me } = useAppStore();

  useEffect(() => {
    const styleForLog = "font-size: 20px; color: #00dffd";
    console.log(`%cOverlayed ${window.location.hash} Window`, styleForLog);
  }, []);

  useEffect(() => {
    (async () => {
      if (!me) return;
      await listen("mute_toggle", async () => {
        const voiceStatus = await socket?.getSelfVoiceStatus();
        const newVoiceStatus = !voiceStatus.mute;
        console.log("voiceStatus", { voiceStatus, newVoiceStatus, crr: voiceStatus.mute });
        await socket?.send({
          cmd: RPCCommand.SET_VOICE_SETTINGS,
          args: {
            mute: me.selfMuted,
          },
        });
      });
    })();
  }, [me]);

  const { update } = useUpdate();

  const { pin } = usePin();
  const { horizontal, setHorizontalDirection } = useAlign();
  const visibleClass = visible ? "opacity-100" : "opacity-0";

  return (
    <div
      className={cn(
        `text-white h-screen select-none rounded-lg ${visibleClass}`,
        pin ? null : "border border-zinc-600"
      )}
    >
      {!pin && (
        <NavBar
          isUpdateAvailable={update?.available ?? false}
          pin={pin}
          alignDirection={horizontal}
          setAlignDirection={setHorizontalDirection}
        />
      )}
      <Toaster />
      <Routes>
        <Route path="/" Component={MainView} />
        <Route path="/channel" element={<ChannelView alignDirection={horizontal} />} />
        <Route path="/settings" element={<SettingsView update={update} />} />
        <Route path="/error" Component={ErrorView} />
      </Routes>
    </div>
  );
}

export default App;
