use tauri::{AppHandle, CustomMenuItem, LogicalSize, Manager, SystemTrayEvent, SystemTrayMenu};

use anyhow::Result;
use tauri_plugin_window_state::{AppHandleExt, StateFlags};

use crate::{
  toggle_pin, Pinned, MAIN_WINDOW_NAME, OVERLAYED, SETTINGS_WINDOW_NAME, TRAY_OPEN_DEVTOOLS_MAIN,
  TRAY_OPEN_DEVTOOLS_SETTINGS, TRAY_QUIT, TRAY_RELOAD, TRAY_SETTINGS, TRAY_SHOW_APP,
  TRAY_TOGGLE_PIN,
};

pub struct Tray {}

impl Tray {
  pub fn create_tray_menu(app_handle: &AppHandle) -> SystemTrayMenu {
    let version = app_handle.package_info().version.to_string();
    SystemTrayMenu::new()
      .add_item(CustomMenuItem::new(TRAY_TOGGLE_PIN, "Pin"))
      .add_item(CustomMenuItem::new(TRAY_SHOW_APP, "Show Overlayed"))
      .add_item(CustomMenuItem::new(TRAY_RELOAD, "Reload App"))
      .add_item(CustomMenuItem::new(
        TRAY_OPEN_DEVTOOLS_MAIN,
        "Open Devtools (main window)",
      ))
      .add_item(CustomMenuItem::new(
        TRAY_OPEN_DEVTOOLS_SETTINGS,
        "Open Devtools (settings window)",
      ))
      .add_item(CustomMenuItem::new(TRAY_SETTINGS, "Settings"))
      .add_native_item(tauri::SystemTrayMenuItem::Separator)
      .add_item(CustomMenuItem::new(
        OVERLAYED,
        format!("Overlayed v{}", version),
      ))
      .add_item(CustomMenuItem::new(TRAY_QUIT, "Quit"))
  }

  pub fn update_tray(app_handle: &AppHandle) -> Result<()> {
    app_handle
      .tray_handle()
      .set_menu(Tray::create_tray_menu(app_handle))?;
    Ok(())
  }

  pub fn handle_tray_events(app: &AppHandle, event: SystemTrayEvent) {
    match event {
      SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
        TRAY_TOGGLE_PIN => {
          let window = app.get_window(MAIN_WINDOW_NAME).unwrap();

          window.show().unwrap();

          toggle_pin(window, app.state::<Pinned>())
        }
        TRAY_SHOW_APP => {
          let window = app.get_window(MAIN_WINDOW_NAME).unwrap();
          window.show().unwrap();

          // center and resize the window
          window.center();
          window.set_size(LogicalSize::new(400, 700)).unwrap();

          window.set_focus().unwrap();
        }
        TRAY_RELOAD => {
          let window = app.get_window(MAIN_WINDOW_NAME).unwrap();
          window.eval("window.location.reload();").unwrap();
        }
        TRAY_SETTINGS => {
          // find the settings window and show it
          let settings_window = app.get_window(SETTINGS_WINDOW_NAME).unwrap();
          settings_window.show().unwrap();
          settings_window.set_focus().unwrap();
        }
        TRAY_OPEN_DEVTOOLS_MAIN => {
          let window = app.get_window(MAIN_WINDOW_NAME).unwrap();
          window.open_devtools();
          window.show().unwrap();
        }
        TRAY_OPEN_DEVTOOLS_SETTINGS => {
          let window = app.get_window(SETTINGS_WINDOW_NAME).unwrap();
          window.open_devtools();
          window.show().unwrap();
        }
        TRAY_QUIT => {
          app.save_window_state(StateFlags::all()); // will save the state of all open windows to disk
          std::process::exit(0)
        }
        _ => {}
      },
      _ => {}
    }
  }
}
