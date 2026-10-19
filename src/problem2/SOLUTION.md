# Problem 2: DevOps Incident - NGINX Storage Full

**Scenario:** A virtual machine (Ubuntu 24.04, 64GB storage) running a dedicated NGINX load balancer is consistently operating at 99% disk usage.

---

## 1. Impact assessment
The high disk usage on the NGINX load balancer can lead to several critical issues:

- **Service Disruption:** NGINX may fail to write logs or cache files, potentially causing service interruptions.
- **Performance Degradation:** Disk I/O operations may slow down, affecting the overall performance of the load balancer.
- **System Instability:** The operating system may become unstable if it cannot allocate disk space for essential processes.
- **Data Loss:** In extreme cases, lack of disk space can result in data corruption or loss.

## 2. Immediate Actions to identify issues
To mitigate the impact of high disk usage, I would take the following immediate actions:

- ** Check Disk Usage:** Use command `df -h` to check the current disk usage and identify which partitions are critically full. Very likely `/` or `/var` will be the most affected partitions.

- ** Investigate Large Files:** After identifying the partitions that are critically full, use commands like `sudo du -sh /var/log/` or `sudo du -sh /var/log/nginx/* | sort -rh | head -5` to locate largest files and directories.

- ** Remove Unnecessary Files:** Once large files and directories are identified, remove unnecessary files using commands like`sudo truncate -s 0 /var/log/large-log-file.log` to free up disk space.

- ** Check zombie files:** Use commands like `lsof | grep deleted` or `sudo lsof +L1` to identify deleted files that are still held open by processes, which can consume disk space until the processes are restarted.

## Scenario 1: Zombies Files

- ** Reload nginx:** If zombie files were found and still in use by nginx, reload the service using command `sudo systemctl reload nginx`

## Scenario 2: Large NGINX Log Files

If large files are nginx logs files, we have 2 options depending on the if the available space is less than 15% of the target log file's size.

- If less, truncate the largest NGINX log files immediately to free up space using commands like `sudo truncate -s 0 /var/log/nginx/access.log` and/or `sudo truncate -s 0 /var/log/nginx/error.log`.

- If more, rotate the NGINX log files to free up space without losing historical logs `sudo logrotate -f /etc/logrotate.d/nginx`.

In our case, 1% of 64GB is approximately 0.64GB, if the largest log file exceeds 4GB, we must truncate it immediately to free up space.


## Scenario 3: Nginx Cache
Nginx might be configured to cache content from upstream to disk, it can consume significant disk space over time if not configured properly.

- ** Clear Nginx Cache:** Manually remove all files or the oldest files from cache directory, typically located at `/var/cache/nginx`.

** Restart Services if Necessary:** If reloading NGINX is not sufficient, consider restarting the service using `sudo systemctl restart nginx` to ensure all changes take effect and the service operates correctly. It may disrupt ongoing connections temporarily.

### 3. Long-term Mitigation Strategies