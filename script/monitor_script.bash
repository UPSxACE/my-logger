API_ENDPOINT="<URL>"
API_KEY="<APIKEY>"

while true; do
    memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    disk_usage=$(df -h / | awk 'NR==2{print $5}' | sed 's/%//')
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{printf "%.0f", 100 - $1}')
    network_traffic_rx=0
    network_traffic_tx=0
    # Loop through all network interfaces and sum up the RX and TX values
    while read -r interface; do
        rx_bytes=$(ifconfig "$interface" | awk '/RX packets/{print $5}')
        tx_bytes=$(ifconfig "$interface" | awk '/TX packets/{print $5}')
        network_traffic_rx=$((network_traffic_rx + rx_bytes))
        network_traffic_tx=$((network_traffic_tx + tx_bytes))
    done < <(ifconfig -a | awk '/^[a-zA-Z0-9]+:/ {print substr($1, 1, length($1)-1)}')  # Get all interface names

    network_traffic="{\"rx\": $network_traffic_rx, \"tx\": $network_traffic_tx}"
    current_time=$(date +%s)  # Get current timestamp

    json_data="{\"timestamp\": $current_time, \"memory_usage\": $memory_usage, \"disk_usage\": $disk_usage, \"cpu_usage\": $cpu_usage, \"network\": $network_traffic}"
    curl -X POST -H "Content-Type: application/json" -H "X-Api-Key: $API_KEY" -d "$json_data" "$API_ENDPOINT"

    sleep 5
done
