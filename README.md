## Zusammenfassung

Dieses System kombiniert **NestJS**-Microservices in **TypeScript** mit **gRPC/Protocol Buffers**, **RabbitMQ** und **Docker Compose**, arbeitet aber **ohne** persistente Datenbank und **ohne** ORM-Entities – stattdessen nutzt jeder Service **In-Memory-Stores** für schnelle und schlanke Demos.
Für asynchrone Events nutzen wir RabbitMQ-Queues `order.created` und `order.status` sowie einen **Fanout-Exchange** `logs`, der Kopien jeder Nachricht an den Logging-Service ausliefert
Die gesamte Umgebung wird über ein einziges `docker-compose.yml` orchestriert, das RabbitMQ und alle vier Container startet

## Projektarchitektur

![image](https://github.com/user-attachments/assets/10d2fbc8-f65b-401a-9087-538c8dd04ceb)


## Stack

- NestJS & Node.js
	- Für Microservices
- TypeScript
	- Einfache und typsichere Entwicklung
- gRPC & Protocol Buffers
	- gRPC ist ein leistungsfähiges RPC-Framework von Google, das HTTP/2 für den Transport und Protocol Buffers als Interface Definition Language und Serialisierungsformat verwendet
	- Die gemeinsame Datei `order.proto` definiert die Nachrichten `OrderRequest` und `OrderReply` sowie den Service `ERPService`, aus denen automatisch TypeScript-Client- und Server-Stubs generiert werden
- RabbitMQ & amqplib
	- RabbitMQ als Message-Broker für asynchrone Events
	- Ein **Fanout-Exchange** broadcastet Nachrichten an alle gebundenen Queues
- Docker & Docker Compose
	- Docker-Container isolieren jeden Service mit exakt definiertem Image, Abhängigkeiten und Laufzeitumgebung.  
	- Docker Compose orchestriert RabbitMQ und alle vier Microservices in einem einzigen `docker-compose.yml`-File, das Startreihenfolge und Konfigurationen beschreibt. Dadurch startet die gesamte Anwendung mit einem einzigen Befehl (`docker-compose up -d`)
	- reproduzierbar auf jedem System

## Ablauf des Prozesses

- **Bestellung aufgeben (REST)**
    - Client → `POST /orders` → E-Commerce-Service validiert, speichert in Map und publiziert `order.created` via RabbitMQ
- **CRM-Aktualisierung (Event-Driven)**
    - CRM-Service konsumiert `order.created`, aktualisiert Kunden-Bestellhistorie und ackt die Nachricht
- **Lieferdatum per gRPC**
    - E-Commerce-Service ruft synchron `ProcessOrder` am ERP-Service auf (gRPC über Protobuf), erhält `deliveryDate` und `status` zurück
- **Asynchrone Status‐Updates**
    - ERP-Service sendet `order.status` via RabbitMQ an E-Commerce-Service, der den internen Status in seiner Map aktualisiert
- **Zentrales Logging (Fanout)**
    - Jeder Service publiziert seine Events an den Fanout-Exchange
    - Logging-Service empfängt alle Events und schreibt sie zeilenweise in `.log`

## HOW-TO

1. Tools herunterladen
	- Docker Desktop (latest)
	- Postman (latest)
	- node (latest)
2. Repo Klonen
3. `npm install` in jedem service ordner ausführen
4. `docker-compose up --build -d` im root ausführen
