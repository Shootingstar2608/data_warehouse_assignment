#!/bin/bash

# Script to start Pentaho using the portable Java 11
PROJECT_DIR="/home/peter/data_warehouse_assignment"
JAVA_HOME="$PROJECT_DIR/java"
PDI_DIR="$PROJECT_DIR/pentaho/data-integration"

if [ ! -d "$JAVA_HOME" ]; then
    echo "Error: Java directory not found at $JAVA_HOME"
    exit 1
fi

if [ ! -d "$PDI_DIR" ]; then
    echo "Error: Pentaho directory not found at $PDI_DIR"
    echo "Please extract your Pentaho zip file into $PROJECT_DIR/pentaho/"
    exit 1
fi

# Set Java for Pentaho
export PENTAHO_JAVA_HOME="$JAVA_HOME"
export JAVA_HOME="$JAVA_HOME"
export PATH="$JAVA_HOME/bin:$PATH"

echo "Starting Pentaho Spoon with Portable Java 11..."
cd "$PDI_DIR"
./spoon.sh
