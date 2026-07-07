#!/bin/bash
# Script d'installation PostgreSQL pour Fedora 44

echo "📦 Installation PostgreSQL..."
sudo dnf install -y postgresql-server postgresql-contrib

echo "🔧 Initialisation de la base de données..."
sudo postgresql-setup --initdb

echo "🚀 Démarrage PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

echo "👤 Création utilisateur et base de données cpro..."
sudo -u postgres psql << EOF
CREATE DATABASE cpro;
CREATE USER cpro WITH PASSWORD 'cpro2026';
GRANT ALL PRIVILEGES ON DATABASE cpro TO cpro;
\q
EOF

echo "✅ PostgreSQL configuré !"
echo ""
echo "Pour tester: psql -U cpro -d cpro -h localhost"
