#!/bin/bash
# Venom Racing — full production verification.
# Run from this directory. Exits non-zero if any suite fails.
cd "$(dirname "$0")"
P="https://znuozxezktzoeozffddk.supabase.co"
K="sb_publishable_pTsbhKPwEQjoifiOvS0Lvw_XKkHdMDr"
fail=0
line(){ printf '%s\n' "------------------------------------------------------------"; }

echo "PORTAL"; line
for t in boot crud url firstrun preconf a11y seed contrast; do
  r=$(node $t.js 2>&1 | tail -1)
  printf "  %-10s %s\n" "$t" "$r"
  echo "$r" | grep -q "PASS\|no issues" || fail=1
done

echo; echo "WEBSITE"; line
for t in web sync sync2 site-a11y site-contrast responsive; do
  r=$(node $t.js 2>&1 | tail -1)
  printf "  %-10s %s\n" "$t" "$r"
  echo "$r" | grep -q PASS || fail=1
done

echo; echo "SECURITY (live database)"; line
H=(-H "apikey: $K" -H "Authorization: Bearer $K" -H "Content-Type: application/json" -H "Prefer: return=representation")
for t in builds services stages products brands faqs testimonials offers site_settings; do
  w=$(curl -s -X POST "$P/rest/v1/$t" "${H[@]}" -d '{"id":"sec_probe"}' --max-time 12 -o /dev/null -w "%{http_code}")
  [ "$w" = "201" ] && { echo "  WRITE LEAK on $t"; fail=1; }
done
echo "  anon write on 9 content tables: blocked"
o=$(curl -s -X POST "$P/rest/v1/portal_owners" "${H[@]}" -d '{"user_id":"00000000-0000-0000-0000-000000000000","email":"x@x.com"}' --max-time 12)
echo "$o" | grep -q 42501 && echo "  anon cannot self-add as owner: blocked" || { echo "  OWNER LEAK"; fail=1; }
e=$(curl -s "$P/rest/v1/enquiries?select=id" "${H[@]}" --max-time 12)
[ "$e" = "[]" ] && echo "  anon cannot read enquiries: blocked" || { echo "  ENQUIRY LEAK: $e"; fail=1; }
ins=$(curl -s -X POST "$P/rest/v1/enquiries" -H "apikey: $K" -H "Authorization: Bearer $K" \
  -H "Content-Type: application/json" -o /dev/null -w "%{http_code}" \
  -d '{"id":"probe_verify_'$(date +%s)'","name":"verify probe","message":"automated"}' --max-time 12)
[ "$ins" = "201" ] && echo "  anon may insert an enquiry: allowed (by design)" || { echo "  ENQUIRY INSERT BROKEN: $ins"; fail=1; }

echo; echo "DEPLOYMENTS"; line
for u in "https://strauss3-coder.github.io/venom-racing-portal/" "https://venomracing.co.za/" "https://venomracing.co.za/performance.html"; do
  c=$(curl -s -o /dev/null -w "%{http_code}" -L "$u?v=$(date +%s)" --max-time 20)
  printf "  %-58s %s\n" "$u" "$c"
  [ "$c" = "200" ] || fail=1
done

echo; echo "DATABASE CONTENT"; line
for t in services stages products brands faqs testimonials builds; do
  n=$(curl -s "$P/rest/v1/$t?select=id" -H "apikey: $K" -H "Authorization: Bearer $K" --max-time 12 \
      | python3 -c "import sys,json;d=json.load(sys.stdin);print(len(d) if isinstance(d,list) else 0)" 2>/dev/null)
  printf "  %-14s %s rows\n" "$t" "$n"
done

echo; line
[ $fail -eq 0 ] && echo "ALL AUTOMATED CHECKS PASSED" || echo "FAILURES PRESENT"
exit $fail
