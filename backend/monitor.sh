# monitor.sh — runs schedule.py periodically

INTERVAL=3600  # 1 hour = 3600 seconds. Adjust as needed.

echo "🌤️  Starting storm monitoring loop..."
while true
do
    echo "🔁 Running schedule.py at $(date)"
    python -m app.services.schedule
    echo "⏳ Sleeping for $INTERVAL seconds..."
    sleep $INTERVAL
done
