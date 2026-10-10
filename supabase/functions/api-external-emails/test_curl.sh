#!/usr/bin/env bash
#
# Test script for the `api-external-emails` Edge Function.
#
# Usage (local, default):
#   EXTERNAL_EMAILS_TOKEN="<token>" bash supabase/functions/api-external-emails/test_curl.sh
#
# Usage (production):
#   BASE_URL="https://<PROJECT-REF>.supabase.co" \
#   EXTERNAL_EMAILS_TOKEN="<token>" \
#     bash supabase/functions/api-external-emails/test_curl.sh
#
# Environment variables:
#   BASE_URL                Base URL of the Supabase instance (default: http://localhost:54321)
#   FUNCTION_PATH           Function path (default: /functions/v1/api-external-emails)
#   EXTERNAL_EMAILS_TOKEN   Secret token. Required for the success cases (202).
#
# The script sends an intentionally fake `to`/`from` in one case to show they are ignored;
# verify the stored row afterwards with:
#   SELECT id, email, from_email, subject, status, type
#   FROM email_queue ORDER BY created_at DESC LIMIT 5;

set -u

BASE_URL="${BASE_URL:-http://localhost:54321}"
FUNCTION_PATH="${FUNCTION_PATH:-/functions/v1/api-external-emails}"
ENDPOINT="${BASE_URL}${FUNCTION_PATH}"
TOKEN="${EXTERNAL_EMAILS_TOKEN:-}"

pass=0
fail=0

if [ -z "$TOKEN" ]; then
  echo "WARNING: EXTERNAL_EMAILS_TOKEN is not set."
  echo "         The authenticated success cases (expecting 202) will fail with 401."
  echo
fi

# post <expected_status> <description> <token> <json_data>
post() {
  local expected="$1"
  local description="$2"
  local token="$3"
  local data="$4"

  local args=(-s -o /dev/null -w '%{http_code}' -X POST "$ENDPOINT" -H 'Content-Type: application/json')
  if [ -n "$token" ]; then
    args+=(-H "x-api-token: ${token}")
  fi
  args+=(-d "$data")

  local status
  status="$(curl "${args[@]}" 2>/dev/null || echo "000")"

  if [ "$status" = "$expected" ]; then
    echo "  PASS  [${status}] ${description}"
    pass=$((pass + 1))
  else
    echo "  FAIL  [got ${status}, expected ${expected}] ${description}"
    fail=$((fail + 1))
  fi
}

echo "Testing ${ENDPOINT}"
echo

echo "1) Authorization"
post 401 "sem token" "" '{"subject":"Oi","body":"Teste"}'
post 401 "token inválido" "invalid-token-xyz" '{"subject":"Oi","body":"Teste"}'

echo
echo "2) Validação do payload (com token)"
post 400 "sem subject" "$TOKEN" '{"body":"Teste"}'
post 400 "sem body" "$TOKEN" '{"subject":"Oi"}'
post 400 "subject longo demais" "$TOKEN" "{\"subject\":\"$(head -c 250 < /dev/zero | tr '\0' 'a')\",\"body\":\"Teste\"}"
post 400 "replyTo inválido" "$TOKEN" '{"subject":"Oi","body":"Teste","replyTo":"nao-e-email"}'

echo
echo "3) Sucesso (com token)"
post 202 "solicitação válida" "$TOKEN" '{"subject":"Teste de integração","body":"<p>Corpo de teste</p>","replyTo":"visitante@exemplo.com"}'
post 202 "to/from enviados são ignorados" "$TOKEN" '{"subject":"Ignora to/from","body":"<p>Teste</p>","to":"alguem@malicioso.example","from":"spoof@malicioso.example"}'

echo
echo "Mostrando o corpo da última solicitação aceita:"
curl -s -X POST "$ENDPOINT" \
  -H 'Content-Type: application/json' \
  -H "x-api-token: ${TOKEN}" \
  -d '{"subject":"Resposta de exemplo","body":"<p>Veja o JSON de retorno</p>"}' \
  -w '\nHTTP %{http_code}\n' || true

echo
echo "Verifique os registros criados (remetente/destinatário devem ser contato@tekua.com.br):"
echo "  SELECT id, email, from_email, subject, status, type FROM email_queue ORDER BY created_at DESC LIMIT 5;"
echo
echo "Resultado: ${pass} passaram, ${fail} falharam."

[ "$fail" -eq 0 ]
