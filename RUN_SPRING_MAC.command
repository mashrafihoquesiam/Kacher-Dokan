#!/bin/bash
cd "$(dirname "$0")/kaser-dokan-backend" || exit 1
command -v java >/dev/null || { echo "Java 21 is required."; exit 1; }
command -v mvn >/dev/null || { echo "Apache Maven is required. Install with: brew install maven"; exit 1; }
echo "Kacher Dokan Spring Boot backend + web: http://localhost:3000"
mvn spring-boot:run
