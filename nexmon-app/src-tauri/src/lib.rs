// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod models;
pub mod monitor;
use models::SystemInfo;

#[tauri::command]
fn get_system_info() -> SystemInfo {
    let username = whoami::username();
    let hostname = whoami::fallible::hostname().unwrap_or_else(|_| "Unknown Host".to_string());
    
    SystemInfo {
        username,
        hostname,
        os: std::env::consts::OS.to_string(),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_system_info])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
