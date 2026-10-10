import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const mode = process.argv[2];
const users = [["teste.admin.folha@chlorumsolutions.com","admin",["*"]],["teste.bp.folha@chlorumsolutions.com","bp",["igarassu","palmeira","uberlandia"]]] as const;
for (const [email, role, unidades] of users) {
  if (mode === "del") {
    const { data } = await sb.auth.admin.listUsers(); const u = data.users.find(x=>x.email===email);
    if (u) await sb.auth.admin.deleteUser(u.id);
    console.log("del", email, (await sb.from("user_roles").delete().eq("email", email)).error);
    continue;
  }
  await sb.from("user_roles").insert({ email, role, unidades: [...unidades], nome: role==="admin"?"Teste Admin":"Teste BP" });
  const r = await sb.auth.admin.createUser({ email, password: "Teste-Folha-2026!x", email_confirm: true, user_metadata: { jornada: { boasVindas: true } } });
  console.log(email, r.error?.message ?? "ok");
}
