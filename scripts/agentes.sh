#!/bin/bash

# Script para rodar agentes do cash-tracking
# Uso: agentes [report|db|all]

PROJETO_DIR="/home/gabriel/cash-tracking"
OPCAO="${1:-all}"

cd "$PROJETO_DIR" || exit 1

case "$OPCAO" in
  "report")
    echo "📋 Rodando Agente de Relatórios..."
    npm run agent:report
    ;;
  "db")
    echo "🗄️ Rodando Agente de Banco..."
    npm run agent:db
    ;;
  "all"|"")
    echo "📊 Rodando todos os agentes..."
    npm run agentes
    ;;
  *)
    echo "Uso: $0 [report|db|all]"
    echo ""
    echo "Opções:"
    echo "  report  - Rodar apenas agente de relatórios"
    echo "  db      - Rodar apenas agente de banco"
    echo "  all     - Rodar todos os agentes (padrão)"
    exit 1
    ;;
esac
