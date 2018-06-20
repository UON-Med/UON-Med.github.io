until python amboss.py; do
    echo "Scraper crashed with exit code $?.  Respawning.." >&2
    sleep 1
done
