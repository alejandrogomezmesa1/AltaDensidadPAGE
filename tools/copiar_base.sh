#!/usr/bin/env bash
# ============================================================
# Copia una base MySQL completa a otra (p. ej. al mover servicios entre proyectos de Railway)
# y verifica que cada tabla tenga el mismo número de filas.
#
# Uso:
#   ./tools/copiar_base.sh "mysql://usuario:clave@host:puerto/base_origen" "mysql://usuario:clave@host:puerto/base_destino"
#
# En Railway usa la variable MYSQL_PUBLIC_URL de cada servicio MySQL (requiere activar TCP Proxy).
# Recomendado: hacerlo sin ventas en curso; al terminar, desactiva el acceso público y cambia las claves.
# ============================================================
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "Uso: $0 URL_ORIGEN URL_DESTINO   (formato mysql://usuario:clave@host:puerto/base)" >&2
  exit 1
fi

urldecode() { local v="${1//+/ }"; printf '%b' "${v//%/\\x}"; }

parse() {
  # mysql://usuario:clave@host:puerto/base → variables
  # La clave puede contener ':' o '@' (se corta en el ÚLTIMO '@') y venir codificada (%40…)
  local url="${1#mysql://}"
  local cred="${url%@*}" rest="${url##*@}"
  U="$(urldecode "${cred%%:*}")"; P="$(urldecode "${cred#*:}")"
  local hp="${rest%%/*}"
  DB="${rest#*/}"; DB="${DB%%\?*}"
  H="${hp%%:*}"
  if [ "$hp" = "$H" ]; then PORT=3306; else PORT="${hp#*:}"; fi
}

parse "$1"; SU=$U; SP=$P; SH=$H; SPORT=$PORT; SDB=$DB
parse "$2"; DU=$U; DP=$P; DH=$H; DPORT=$PORT; DDB=$DB

src()  { MYSQL_PWD="$SP" mysql -u"$SU" -h"$SH" -P"$SPORT" -N -B "$SDB" "$@"; }
dest() { MYSQL_PWD="$DP" mysql -u"$DU" -h"$DH" -P"$DPORT" -N -B "$DDB" "$@"; }

echo "Origen : $SU@$SH:$SPORT/$SDB"
echo "Destino: $DU@$DH:$DPORT/$DDB"

existentes=$(dest -e "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()")
if [ "$existentes" != "0" ]; then
  echo "La base destino ya tiene $existentes tabla(s). Por seguridad solo se copia a una base vacía." >&2
  exit 1
fi

ARCHIVO="respaldo_${SDB}_$(date +%Y%m%d_%H%M%S).sql"
echo "1/3 Respaldo del origen → $ARCHIVO"
MYSQL_PWD="$SP" mysqldump -u"$SU" -h"$SH" -P"$SPORT" \
  --single-transaction --routines --triggers --events \
  --set-gtid-purged=OFF --no-tablespaces --hex-blob \
  --default-character-set=utf8mb4 "$SDB" > "$ARCHIVO"

echo "2/3 Restaurando en el destino"
MYSQL_PWD="$DP" mysql -u"$DU" -h"$DH" -P"$DPORT" --default-character-set=utf8mb4 "$DDB" < "$ARCHIVO"

echo "3/3 Verificando filas por tabla"
fallos=0
for t in $(src -e "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' ORDER BY 1"); do
  a=$(src -e "SELECT COUNT(*) FROM \`$t\`")
  b=$(dest -e "SELECT COUNT(*) FROM \`$t\`" 2>/dev/null || echo "falta")
  if [ "$a" = "$b" ]; then
    printf "  ✔ %-32s %8s\n" "$t" "$a"
  else
    printf "  ✘ %-32s origen %s · destino %s\n" "$t" "$a" "$b"
    fallos=$((fallos + 1))
  fi
done

if [ $fallos -eq 0 ]; then
  echo "Copia verificada. El respaldo queda en $ARCHIVO (contiene datos personales: guárdalo en un lugar seguro o bórralo)."
else
  echo "$fallos tabla(s) no coinciden. No uses la base destino hasta revisar." >&2
  exit 1
fi
