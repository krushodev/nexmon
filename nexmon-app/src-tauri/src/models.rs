use serde::Serialize;

#[derive(Serialize, Clone)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub cpu: f32,
    pub memory: u64,
}

#[derive(Serialize, Clone)]
pub struct SystemMetrics {
    pub cpu_usage: f32,
    pub ram_total: u64,
    pub ram_used: u64,
    pub ram_free: u64,
    pub disk_read_speed: u64,
    pub disk_write_speed: u64,
    pub net_rx_speed: u64,
    pub net_tx_speed: u64,
    
    pub all_processes: Vec<ProcessInfo>,
}

#[derive(Serialize, Clone)]
pub struct SystemInfo {
    pub username: String,
    pub hostname: String,
    pub os: String,
}
