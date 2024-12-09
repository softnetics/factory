extends_volta() {
    echo "Extending volta $1"
    jq ".volta.extends=\"../../package.json\"" $1 > $1.tmp
    mv $1.tmp $1
}