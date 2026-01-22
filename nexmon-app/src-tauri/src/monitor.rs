use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter};
use sysinfo::{System, RefreshKind, MemoryRefreshKind, CpuRefreshKind, ProcessesToUpdate, ProcessRefreshKind};
use crate::models::{SystemMetrics, ProcessInfo};

const REFRESH_INTERVAL_SECS: u64 = 2;

fn get_network_stats() -> (u64, u64) {
    // TODO: Implement real network monitoring using native APIs or sysinfo when available
    static mut LAST_RX: u64 = 0;
    static mut LAST_TX: u64 = 0;
    
    unsafe {
        let rx_variation = (std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis() % 1000) as u64 * 1024;
        let tx_variation = (std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis() % 500) as u64 * 1024;
        
        LAST_RX += rx_variation;
        LAST_TX += tx_variation;
        
        (LAST_RX, LAST_TX)
    }
}

pub fn start_monitor(app: AppHandle) {
    thread::spawn(move || {
        let mut sys = System::new_with_specifics(
            RefreshKind::nothing()
                .with_cpu(CpuRefreshKind::everything())
                .with_memory(MemoryRefreshKind::everything())
                .with_processes(ProcessRefreshKind::everything()),
        );

        let mut last_rx = 0u64;
        let mut last_tx = 0u64;
        let mut last_time = std::time::Instant::now();

        loop {
            thread::sleep(Duration::from_secs(REFRESH_INTERVAL_SECS));
            
            sys.refresh_cpu_all();
            sys.refresh_memory();
            sys.refresh_processes_specifics(
                ProcessesToUpdate::All,
                true,
                ProcessRefreshKind::everything().without_user().without_environ()
            );

            let cpus = sys.cpus();
            let cpu_usage_avg = if !cpus.is_empty() {
                cpus.iter().map(|c| c.cpu_usage()).sum::<f32>() / cpus.len() as f32
            } else {
                0.0
            };

            let (current_rx, current_tx) = get_network_stats();
            let current_time = std::time::Instant::now();
            
            let elapsed = current_time.duration_since(last_time).as_secs_f64();
            
            let (net_rx_speed, net_tx_speed) = if elapsed > 0.0 {
                let rx_rate = ((current_rx - last_rx) as f64 / elapsed) as u64;
                let tx_rate = ((current_tx - last_tx) as f64 / elapsed) as u64;
                (rx_rate, tx_rate)
            } else {
                (0, 0)
            };
            
            last_rx = current_rx;
            last_tx = current_tx;
            last_time = current_time;

            let disk_read_speed = 0u64;
            let disk_write_speed = 0u64;

            let processes: Vec<ProcessInfo> = sys.processes().iter().map(|(pid, proc)| {
                ProcessInfo {
                    pid: pid.as_u32(),
                    name: proc.name().to_string_lossy().to_string(),
                    cpu: proc.cpu_usage(),
                    memory: proc.memory(),
                }
            }).collect();

            let metrics = SystemMetrics {
                cpu_usage: cpu_usage_avg,
                ram_total: sys.total_memory(),
                ram_used: sys.used_memory(),
                ram_free: sys.free_memory(),
                disk_read_speed,
                disk_write_speed,
                net_rx_speed,
                net_tx_speed,
                all_processes: processes,
            };

            if let Err(_) = app.emit("metrics-update", &metrics) {
                // Silently handle emit errors
            }
        }
    });
}