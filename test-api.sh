#!/bin/bash
# Script de testes da API de Autenticação Zuptos
# Uso: bash test-api.sh

API_URL="http://86.48.22.80:3000/api"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        Teste de Autenticação - Zuptos API v1             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

# Função para imprimir seções
print_section() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Função para testar conexão
test_connection() {
    print_section "TESTE DE CONEXÃO"
    
    echo "Testando conexão com: $API_URL/v1/auth/me"
    
    response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/v1/auth/me" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer invalid-token" 2>/dev/null)
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [[ $http_code -eq 200 || $http_code -eq 401 || $http_code -eq 403 ]]; then
        echo -e "${GREEN}✓ Conexão estabelecida com sucesso!${NC}"
        echo -e "Status Code: ${BLUE}$http_code${NC}"
        return 0
    else
        echo -e "${RED}✗ Erro ao conectar com a API${NC}"
        echo -e "Status Code: ${RED}$http_code${NC}"
        echo -e "Body: $body"
        return 1
    fi
}

# Função para fazer signup
test_signup() {
    print_section "TESTE DE CADASTRO (SIGN UP)"
    
    EMAIL="test-$(date +%s)@example.com"
    PASSWORD="TestPass123!@#"
    FULLNAME="Test User"
    
    echo -e "Email: ${YELLOW}$EMAIL${NC}"
    echo -e "Senha: ${YELLOW}$PASSWORD${NC}"
    echo -e "Nome: ${YELLOW}$FULLNAME${NC}\n"
    
    response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/v1/auth/sign_up" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$EMAIL\",
            \"password\": \"$PASSWORD\",
            \"fullName\": \"$FULLNAME\",
            \"accessType\": \"purchases\"
        }" 2>/dev/null)
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    echo "Response Code: $http_code"
    echo "Response Body:"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
    
    if [[ $http_code -eq 200 || $http_code -eq 201 ]]; then
        # Extrair token se disponível
        TOKEN=$(echo "$body" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('token', ''))" 2>/dev/null)
        if [ -n "$TOKEN" ]; then
            echo -e "${GREEN}✓ Cadastro realizado com sucesso!${NC}"
            echo "$TOKEN"
            return 0
        fi
    fi
    
    echo -e "${YELLOW}ℹ Cadastro pode ter falhado ou usuário já existe${NC}"
    return 1
}

# Função para fazer signin
test_signin() {
    print_section "TESTE DE LOGIN (SIGN IN)"
    
    EMAIL="teste@gmail.com"  # Email que deve existir na API
    PASSWORD="senha123"
    
    echo -e "Email: ${YELLOW}$EMAIL${NC}"
    echo -e "Senha: ${YELLOW}$PASSWORD${NC}\n"
    
    response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/v1/auth/sign_in" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$EMAIL\",
            \"password\": \"$PASSWORD\"
        }" 2>/dev/null)
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    echo "Response Code: $http_code"
    echo "Response Body:"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
    
    if [[ $http_code -eq 200 ]]; then
        # Extrair token
        TOKEN=$(echo "$body" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('token', ''))" 2>/dev/null)
        if [ -n "$TOKEN" ]; then
            echo -e "${GREEN}✓ Login realizado com sucesso!${NC}"
            echo "$TOKEN"
            return 0
        fi
    fi
    
    echo -e "${RED}✗ Login falhou${NC}"
    return 1
}

# Função para obter usuário atual
test_get_user() {
    local token=$1
    
    if [ -z "$token" ]; then
        echo -e "${RED}✗ Token não fornecido${NC}"
        return 1
    fi
    
    print_section "TESTE DE OBTENÇÃO DE USUÁRIO ATUAL"
    
    echo -e "Token: ${YELLOW}${token:0:20}...${NC}\n"
    
    response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/v1/auth/me" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" 2>/dev/null)
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    echo "Response Code: $http_code"
    echo "Response Body:"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
    
    if [[ $http_code -eq 200 ]]; then
        echo -e "${GREEN}✓ Dados obtidos com sucesso!${NC}"
        return 0
    else
        echo -e "${RED}✗ Erro ao obter dados${NC}"
        return 1
    fi
}

# Função para fazer logout
test_logout() {
    local token=$1
    
    if [ -z "$token" ]; then
        echo -e "${RED}✗ Token não fornecido${NC}"
        return 1
    fi
    
    print_section "TESTE DE LOGOUT (SIGN OUT)"
    
    echo -e "Token: ${YELLOW}${token:0:20}...${NC}\n"
    
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$API_URL/v1/auth/sign_out" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" 2>/dev/null)
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    echo "Response Code: $http_code"
    echo "Response Body:"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
    
    if [[ $http_code -eq 200 ]]; then
        echo -e "${GREEN}✓ Logout realizado com sucesso!${NC}"
        return 0
    else
        echo -e "${RED}✗ Erro no logout${NC}"
        return 1
    fi
}

# Executar testes
if test_connection; then
    echo ""
    read -p "Deseja testar signup? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        TOKEN=$(test_signup)
    fi
    
    echo ""
    read -p "Deseja testar signin? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        TOKEN=$(test_signin)
    fi
    
    if [ -n "$TOKEN" ]; then
        echo ""
        read -p "Deseja testar obtenção de usuário? (s/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            test_get_user "$TOKEN"
        fi
        
        echo ""
        read -p "Deseja testar logout? (s/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            test_logout "$TOKEN"
        fi
    fi
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Testes Concluídos                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"
