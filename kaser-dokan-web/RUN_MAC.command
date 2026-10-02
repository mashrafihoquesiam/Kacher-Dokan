#!/bin/bash
cd "$(dirname "$0")/../kaser-dokan-backend" || exit 1
echo "Starting Kacher Dokan Spring Boot backend + web on port 3000..."
mvn spring-boot:run
