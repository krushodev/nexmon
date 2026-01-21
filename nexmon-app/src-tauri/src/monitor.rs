use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter};
use sysinfo::{System, RefreshKind, MemoryRefreshKind, CpuRefreshKind, ProcessesToUpdate, ProcessRefreshKind};
use crate::models::{SystemMetrics, ProcessInfo};

const REFRESH_INTERVAL_SECS: u64 = 2;

pub fn start_monitor(app: AppHandle) {
    thread::spawn(move || {
        let mut sys = System::new_with_specifics(
            RefreshKind::nothing()
                .with_cpu(CpuRefreshKind::everything())
                .with_memory(MemoryRefreshKind::everything())
                // Inicializamos procesos
                .with_processes(ProcessRefreshKind::everything()),
        );

        loop {
            thread::sleep(Duration::from_secs(REFRESH_INTERVAL_SECS));
            
            // Refrescar métricas
            sys.refresh_cpu_all();
            sys.refresh_memory();
            
            // Refrescar procesos, pero solo la info necesaria para no matar el CPU
            sys.refresh_processes_specifics(
                ProcessesToUpdate::All,
                true,
                ProcessRefreshKind::everything().without_user().without_environ()
            );

            // 1. CPU
            let cpus = sys.cpus();
            let cpu_usage_avg = if !cpus.is_empty() {
                cpus.iter().map(|c| c.cpu_usage()).sum::<f32>() / cpus.len() as f32
            } else {
                0.0
            };

            // 2. RED (Network monitoring not available in current sysinfo version, using placeholder)
            let total_rx = 0;
            let total_tx = 0;

            // 3. DISCO (Simplificado: sysinfo no da I/O rate directo fácil en todas las plataformas
            // sin permisos elevados o llamadas complejas, por ahora enviaremos 0 o placeholder
            // hasta implementar una lectura de /proc más avanzada en Linux o PerformanceCounters en Win.
            // Para el MVP mantenemos el placeholder para no bloquear el build).
            let disk_read = 0; 
            let disk_write = 0;

            // 4. PROCESOS (Top 5 por CPU)
            let mut processes: Vec<ProcessInfo> = sys.processes().iter().map(|(pid, proc)| {
                ProcessInfo {
                    pid: pid.as_u32(),
                    name: proc.name().to_string_lossy().to_string(),
                    cpu: proc.cpu_usage(),
                    memory: proc.memory(),
                }
            }).collect();

            // Ordenar descendente por CPU y tomar top 5
            processes.sort_by(|a, b| b.cpu.partial_cmp(&a.cpu).unwrap_or(std::cmp::Ordering::Equal));
            processes.truncate(5);

            let metrics = SystemMetrics {
                cpu_usage: cpu_usage_avg,
                ram_total: sys.total_memory(),
                ram_used: sys.used_memory(),
                ram_free: sys.free_memory(),
                disk_read_speed: disk_read,
                disk_write_speed: disk_write,
                // Ajuste de tasa: bytes totales / segundos transcurridos
                net_rx_speed: total_rx / REFRESH_INTERVAL_SECS,
                net_tx_speed: total_tx / REFRESH_INTERVAL_SECS,
                top_processes: processes,
            };

            if let Err(e) = app.emit("metrics-update", &metrics) {
                eprintln!("Error emitiendo métricas: {}", e);
            }
        }
    });
}