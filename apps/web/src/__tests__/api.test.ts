/**
 * Script simples para testar a conectividade de cada endpoint exposto pelo Swagger.
 * Execute com: `RUN_CONNECTIVITY_SUITE=true npx ts-node apps/web/src/__tests__/api.test.ts`
 *
 * O foco é apenas verificar se a API responde e qual status retorna.
 */

export {};

const API_HOST = "http://86.48.22.80:3000";
const API_PREFIX = "/v1";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

type Method = "GET" | "POST" | "PATCH" | "DELETE";

type TestResult = {
  name: string;
  method: Method;
  path: string;
  status?: number;
  ok: boolean;
  note?: string;
};

type RequestOptions = {
  method?: Method;
  token?: string;
  query?: Record<string, string>;
  body?: unknown;
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function request(path: string, options: RequestOptions = {}) {
  const { method = "GET", token, query, body } = options;
  const headers: Record<string, string> = {};

  if (typeof body !== "undefined") {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const searchParams = query ? `?${new URLSearchParams(query).toString()}` : "";
  const url = `${API_HOST}${path}${searchParams}`;

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      data = undefined;
    }

    return { response, data };
  } catch (error) {
    return { response: null, data: error };
  }
}

async function runConnectivitySuite() {
  log("\n=== TESTE DE CONECTIVIDADE DA API ===", "cyan");

  const results: TestResult[] = [];
  const email = `test+${Date.now()}@example.com`;
  const username = `user${Date.now()}`;
  const password = "Password123@";

  // 1) Criar usuário e recuperar token
  const signUpPayload = { email, username, password, termsAccepted: true };
  const signUp = await request(`${API_PREFIX}/auth/sign_up`, {
    method: "POST",
    body: signUpPayload,
  });
  const signUpToken = (signUp.data as { access_token?: string } | null)?.access_token;
  results.push({
    name: "Auth - sign_up",
    method: "POST",
    path: "/auth/sign_up",
    status: signUp.response?.status,
    ok: Boolean(signUp.response?.ok),
  });

  const signIn = await request(`${API_PREFIX}/auth/sign_in`, {
    method: "POST",
    body: { email, password },
  });
  const loginToken = (signIn.data as { access_token?: string } | null)?.access_token;
  results.push({
    name: "Auth - sign_in",
    method: "POST",
    path: "/auth/sign_in",
    status: signIn.response?.status,
    ok: Boolean(signIn.response?.ok),
  });

  const token = loginToken ?? signUpToken ?? "";
  if (!token) {
    log("Não foi possível obter token para testar endpoints protegidos.", "red");
    printResults(results);
    return;
  }

  // 2) Endpoints protegidos
  const me = await request(`${API_PREFIX}/auth/me`, { token });
  const userSub = (me.data as { sub?: string } | null)?.sub;
  results.push({
    name: "Auth - me",
    method: "GET",
    path: "/auth/me",
    status: me.response?.status,
    ok: Boolean(me.response?.ok),
  });

  const signOut = await request(`${API_PREFIX}/auth/sign_out`, {
    method: "DELETE",
    token,
  });
  results.push({
    name: "Auth - sign_out",
    method: "DELETE",
    path: "/auth/sign_out",
    status: signOut.response?.status,
    ok: Boolean(signOut.response?.ok),
  });

  const recoverPassword = await request(`${API_PREFIX}/auth/recover_password`, {
    method: "POST",
    body: { email },
  });
  results.push({
    name: "Auth - recover_password",
    method: "POST",
    path: "/auth/recover_password",
    status: recoverPassword.response?.status,
    ok: Boolean(recoverPassword.response?.ok),
  });

  const resetPassword = await request(`${API_PREFIX}/auth/reset_password`, {
    method: "POST",
    query: { token: "dummy-token" },
    body: { newPassword: "NewPassword123@" },
  });
  results.push({
    name: "Auth - reset_password",
    method: "POST",
    path: "/auth/reset_password",
    status: resetPassword.response?.status,
    ok: Boolean(resetPassword.response?.ok),
  });

  // Recuperar novo token para testar os demais endpoints
  const auth = await request(`${API_PREFIX}/auth/sign_in`, {
    method: "POST",
    body: { email, password },
  });
  const authToken = (auth.data as { access_token?: string } | null)?.access_token;

  if (!authToken) {
    log("Não foi possível obter token após login. Encerrando testes protegidos.", "red");
    printResults(results);
    return;
  }

  // 3) KYC
  const kycPayload = {
    account_type: "CPF",
    document: `${Math.floor(Math.random() * 10 ** 11)}`,
    social_name: "Empresa Teste",
    phone: "62999999999",
    owner_name: "Usuário Teste",
    medium_ticket: "500",
    average_revenue: "1000",
    address: {
      address: "Rua Teste",
      number: "123",
      complement: "Sala 1",
      state: "GO",
      city: "Goiania",
      neighborhood: "Centro",
    },
  };

  const kycPost = await request(`${API_PREFIX}/kyc`, {
    method: "POST",
    token: authToken,
    body: kycPayload,
  });
  const kycId =
    (kycPost.data as { id?: string } | null)?.id ??
    (Array.isArray(kycPost.data) ? (kycPost.data[0] as { id?: string })?.id : undefined);
  results.push({
    name: "KYC - create",
    method: "POST",
    path: "/kyc",
    status: kycPost.response?.status,
    ok: Boolean(kycPost.response?.ok),
  });

  const kycGet = await request(`${API_PREFIX}/kyc`, { method: "GET", token: authToken });
  results.push({
    name: "KYC - list",
    method: "GET",
    path: "/kyc",
    status: kycGet.response?.status,
    ok: Boolean(kycGet.response?.ok),
  });

  if (kycId) {
    const kycPatch = await request(`${API_PREFIX}/kyc/${kycId}`, {
      method: "PATCH",
      token: authToken,
      body: { ...kycPayload, owner_name: "Atualizado" },
    });
    results.push({
      name: "KYC - update",
      method: "PATCH",
      path: `/kyc/${kycId}`,
      status: kycPatch.response?.status,
      ok: Boolean(kycPatch.response?.ok),
    });
  } else {
    results.push({
      name: "KYC - update",
      method: "PATCH",
      path: "/kyc/{id}",
      ok: false,
      note: "Sem ID retornado para testar PATCH",
    });
  }

  // 4) Sales
  const salePayload = {
    productId: `product-${Date.now()}`,
    userId: userSub ?? "user-uuid",
    amount: 199.9,
    payment_method: "CREDIT_CARD",
    saleType: "PRODUCTOR",
  };

  const salePost = await request(`${API_PREFIX}/sale`, {
    method: "POST",
    token: authToken,
    body: salePayload,
  });
  const saleId =
    (salePost.data as { sale_id?: string } | null)?.sale_id ??
    (salePost.data as { data?: { sale_id?: string } } | null)?.data?.sale_id;
  results.push({
    name: "Sale - create",
    method: "POST",
    path: "/sale",
    status: salePost.response?.status,
    ok: Boolean(salePost.response?.ok),
  });

  const saleGet = await request(`${API_PREFIX}/sale`, { token: authToken });
  results.push({
    name: "Sale - list",
    method: "GET",
    path: "/sale",
    status: saleGet.response?.status,
    ok: Boolean(saleGet.response?.ok),
  });

  if (saleId) {
    const saleById = await request(`${API_PREFIX}/sale/${saleId}`, {
      method: "GET",
      token: authToken,
    });
    results.push({
      name: "Sale - detail",
      method: "GET",
      path: `/sale/${saleId}`,
      status: saleById.response?.status,
      ok: Boolean(saleById.response?.ok),
    });
  } else {
    results.push({
      name: "Sale - detail",
      method: "GET",
      path: "/sale/{id}",
      ok: false,
      note: "Sem sale_id retornado",
    });
  }

  printResults(results);
}

function printResults(results: TestResult[]) {
  log("\nResumo da conectividade:", "magenta");
  for (const result of results) {
    const color = result.ok ? "green" : "red";
    const status = result.status ? `status ${result.status}` : "sem resposta";

    log(
      ` - [${result.method}] ${result.path} => ${result.ok ? "OK" : "ERRO"} (${status})${result.note ? ` - ${result.note}` : ""}`,
      color
    );
  }
}

/**
 * Execute manual testing only when RUN_CONNECTIVITY_SUITE=true.
 * Jest will import this file during unit tests but won't run the suite.
 */
if (process.env.RUN_CONNECTIVITY_SUITE === "true") {
  runConnectivitySuite().catch(error => {
    log(`Erro fatal: ${error}`, "red");
    process.exit(1);
  });
}

describe.skip("API connectivity manual suite", () => {
  it("é executada manualmente via RUN_CONNECTIVITY_SUITE", () => {
    expect(true).toBe(true);
  });
});
