#!/usr/bin/env bash
# Production feature smoke test for thelawncareworkshop.com
set -uo pipefail
BASE="${1:-https://thelawncareworkshop.com}"

pass=0
fail=0
warn=0

ok()   { echo "  ✓ $1"; pass=$((pass+1)); }
bad()  { echo "  ✗ $1"; fail=$((fail+1)); }
note() { echo "  ⚠ $1"; warn=$((warn+1)); }

check_http() {
  local label="$1" url="$2" expect="${3:-200}"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 15 "$url")
  if [[ "$code" == "$expect" ]]; then ok "$label ($code)"; else bad "$label expected $expect got $code — $url"; fi
}

check_json() {
  local label="$1" url="$2" jqtest="$3"
  local body
  body=$(curl -s --connect-timeout 15 "$url")
  if echo "$body" | jq -e "$jqtest" >/dev/null 2>&1; then
    ok "$label"
  else
    bad "$label — $url"
    echo "    $(echo "$body" | head -c 200)"
  fi
}

echo "=== Production check: $BASE ==="
echo ""

echo "## Core"
check_http "Health" "$BASE/health"
check_json "Home API" "$BASE/api/home" '.expert_corner != null'
check_json "Landing settings" "$BASE/api/settings/landing-page" '.'
check_json "Deals API" "$BASE/api/deals" '.'
check_json "Grass types" "$BASE/api/grass-types" 'length >= 0'
check_json "Care plans" "$BASE/api/lawn-care-plans" 'length >= 0'
check_json "Lessons" "$BASE/api/lessons" 'length >= 0'
check_json "Calendars" "$BASE/api/calendars" 'length >= 0'
check_json "Self-diagnosis" "$BASE/api/self-diagnosis" 'length >= 0'
check_json "Ebooks/library" "$BASE/api/ebooks" 'length >= 0'
check_json "Competitions" "$BASE/api/competitions" 'length >= 0'
check_json "Blog" "$BASE/api/blog" 'length >= 0'
check_json "FAQs" "$BASE/api/faqs" 'length >= 0'
check_json "Testimonials" "$BASE/api/testimonials" 'length >= 0'
check_json "Public questions" "$BASE/api/questions/public" 'length >= 0'
check_http "Auth me (unauth)" "$BASE/api/auth/me" "401"

echo ""
echo "## SPA routes (HTML shell)"
for path in / /login /signup /pricing /deals /blog /help-center /contact /app /app/section/expert_corner /app/library /app/forum /app/lessons /app/competitions /app/questions /app/calendars /app/self-diagnosis /app/ai /app/deals /app/privacy /admin/login; do
  check_http "Route $path" "$BASE$path"
done

echo ""
echo "## Public → member redirects (SPA — same shell, client-side redirect)"
for pair in "/library:/app/library" "/forum:/app/forum" "/calendars:/app/calendars" "/lessons:/app/lessons"; do
  from="${pair%%:*}"; to="${pair##*:}"
  check_http "Redirect shell $from" "$BASE$from"
done

echo ""
echo "## Premium gating in JS bundle"
JS=$(curl -s "$BASE/" | grep -oE 'assets/index-[A-Za-z0-9_-]+\.js' | head -1)
if [[ -n "$JS" ]]; then
  BUNDLE=$(curl -s "$BASE/$JS")
  echo "$BUNDLE" | grep -q 'lawncare_guest_browse' && ok "Guest browse mode key in bundle" || bad "Guest browse mode missing"
  echo "$BUNDLE" | grep -q 'expert_corner' && ok "Expert corner section in bundle" || bad "Expert corner missing"
  echo "$BUNDLE" | grep -q 'memberPathRequiresPremium\|/app/library' && ok "Premium path checks present" || note "Premium path helper may be minified"
else
  bad "Could not find JS bundle"
fi

echo ""
echo "## Home data content"
HOME=$(curl -s "$BASE/api/home")
for section in expert_corner tips_tricks equipments fertilizer_herbicide soil_water insects_disease; do
  count=$(echo "$HOME" | jq ".${section} | length" 2>/dev/null || echo 0)
  if [[ "$count" -gt 0 ]]; then ok "Home/$section: $count items"; else note "Home/$section: empty"; fi
done
banner_count=$(echo "$HOME" | jq '.banners | length' 2>/dev/null || echo 0)
if [[ "$banner_count" -gt 0 ]]; then ok "Banners: $banner_count"; else note "Banners: none (using fallbacks)"; fi
video_count=$(echo "$HOME" | jq '.videos | length' 2>/dev/null || echo 0)
if [[ "$video_count" -gt 0 ]]; then
  ok "Videos: $video_count"
  placeholder=$(echo "$HOME" | jq -r '.videos[0].media_url // empty' | grep -c example.com || true)
  [[ "$placeholder" -gt 0 ]] && note "Videos have placeholder example.com URLs"
fi
deal_count=$(echo "$HOME" | jq '.deals | length' 2>/dev/null || echo 0)
[[ "$deal_count" -gt 0 ]] && ok "Deals in home: $deal_count" || note "Deals in home: empty"

echo ""
echo "## Media URL sampling"
# Sample up to 5 image URLs from home data
echo "$HOME" | jq -r '
  [.banners[]?.image_url,
   .expert_corner[]?.thumbnail_url, .expert_corner[]?.media_url,
   .deals[]?.image_url, .lawn_library[]?.image_url] | map(select(. != null and . != "")) | .[0:8][]' 2>/dev/null | while read -r url; do
  if [[ "$url" == http* ]]; then
    full="$url"
  else
    full="$BASE${url#/}"
  fi
  code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 -L "$full" 2>/dev/null || echo "000")
  if [[ "$code" == "200" ]]; then ok "Image $code ${full:0:80}"; elif [[ "$code" == "404" ]]; then bad "Image 404 ${full:0:80}"; else note "Image $code ${full:0:80}"; fi
done

echo ""
echo "## Uploads path"
upload_sample=$(echo "$HOME" | jq -r '[.expert_corner[]?.media_url, .deals[]?.image_url] | map(select(. != null and (. | startswith("/uploads")))) | .[0] // empty')
if [[ -n "$upload_sample" ]]; then
  check_http "Uploads sample" "$BASE$upload_sample"
else
  note "No /uploads/ URLs in home data to test"
fi

echo ""
echo "=== Summary: $pass passed, $fail failed, $warn warnings ==="
[[ "$fail" -eq 0 ]] && exit 0 || exit 1
