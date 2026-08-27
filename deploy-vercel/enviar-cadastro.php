<?php
/**
 * Sketium Engenharia — recebimento do cadastro de Fornecedores / Trabalhe Conosco.
 *
 * Requer PHP + MySQL (Hostinger/cPanel). Em hospedagem estática (Vercel) este
 * arquivo não executa — ver a pendência "hospedagem" no state.json.
 *
 * Credenciais NUNCA ficam aqui: copie db-config.example.php para db-config.php
 * no servidor e preencha lá. O db-config.php está no .gitignore.
 */

declare(strict_types=1);

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Método não permitido.');
}

$configPath = __DIR__ . '/db-config.php';
if (!file_exists($configPath)) {
    error_log('Sketium: db-config.php ausente no servidor.');
    responder(false, 'O formulário ainda não está configurado. Fale conosco pelo WhatsApp (62) 99318-8227.');
}
require_once $configPath;

/* ---------------------------------------------------------------- helpers */

function limpar(string $v, int $max): string
{
    $v = trim($v);
    $v = str_replace(["\r\n", "\r"], "\n", $v);
    $v = strip_tags($v);
    return mb_substr($v, 0, $max, 'UTF-8');
}

function responder(bool $ok, string $mensagem): void
{
    $titulo = $ok ? 'Cadastro enviado' : 'Não foi possível enviar';
    http_response_code($ok ? 200 : 400);
    echo '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">'
       . '<meta name="viewport" content="width=device-width, initial-scale=1">'
       . '<title>' . htmlspecialchars($titulo, ENT_QUOTES, 'UTF-8') . ' | Sketium Engenharia</title>'
       . '<link rel="stylesheet" href="css/styles.css"></head><body>'
       . '<main id="conteudo"><section class="pagina-topo" style="padding-top:6rem"><div class="container">'
       . '<h1>' . htmlspecialchars($titulo, ENT_QUOTES, 'UTF-8') . '</h1>'
       . '<p class="lede">' . htmlspecialchars($mensagem, ENT_QUOTES, 'UTF-8') . '</p>'
       . '<p style="margin-top:2rem"><a class="btn btn-primario" href="fornecedores.html">Voltar ao formulário</a></p>'
       . '</div></section></main></body></html>';
    exit;
}

/* -------------------------------------------------------------- validação */

// Armadilha anti-robô: se veio preenchida, é bot. Responde "ok" e descarta.
if (!empty($_POST['website'])) {
    responder(true, 'Cadastro recebido. Obrigado!');
}

$tipo          = limpar($_POST['tipo']      ?? '', 20);
$nome          = limpar($_POST['nome']      ?? '', 120);
$empresa       = limpar($_POST['empresa']   ?? '', 120);
$email         = limpar($_POST['email']     ?? '', 160);
$telefone      = limpar($_POST['telefone']  ?? '', 20);
$area          = limpar($_POST['area']      ?? '', 120);
$mensagem      = limpar($_POST['mensagem']  ?? '', 2000);
$consentimento = isset($_POST['consentimento']) ? 1 : 0;

$erros = [];
if (!in_array($tipo, ['fornecedor', 'candidato'], true)) $erros[] = 'tipo de cadastro';
if ($nome === '')                                        $erros[] = 'nome';
if (!filter_var($email, FILTER_VALIDATE_EMAIL))          $erros[] = 'e-mail';
if (strlen(preg_replace('/\D/', '', $telefone)) < 10)    $erros[] = 'telefone';
if ($area === '')                                        $erros[] = 'área de atuação';
if ($mensagem === '')                                    $erros[] = 'mensagem';
if ($consentimento !== 1)                                $erros[] = 'autorização de tratamento de dados';

if ($erros) {
    responder(false, 'Revise estes campos: ' . implode(', ', $erros) . '.');
}

/* ----------------------------------------------------------------- upload */

$arquivoNome = null;
if (!empty($_FILES['arquivo']['name']) && $_FILES['arquivo']['error'] === UPLOAD_ERR_OK) {
    $tmp  = $_FILES['arquivo']['tmp_name'];
    $tam  = (int) $_FILES['arquivo']['size'];

    if ($tam > 5 * 1024 * 1024) {
        responder(false, 'O arquivo enviado passa de 5 MB.');
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime  = $finfo->file($tmp);
    $permitidos = [
        'application/pdf' => 'pdf',
        'application/msword' => 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
    ];
    if (!isset($permitidos[$mime])) {
        responder(false, 'Envie o arquivo em PDF ou DOC/DOCX.');
    }

    $destinoDir = __DIR__ . '/uploads';
    if (!is_dir($destinoDir) && !mkdir($destinoDir, 0755, true)) {
        error_log('Sketium: não foi possível criar a pasta uploads.');
        responder(false, 'Não conseguimos salvar o arquivo. Tente novamente.');
    }

    // Nome gerado pelo servidor — nunca o nome enviado pelo usuário.
    $arquivoNome = date('Ymd-His') . '-' . bin2hex(random_bytes(8)) . '.' . $permitidos[$mime];
    if (!move_uploaded_file($tmp, $destinoDir . '/' . $arquivoNome)) {
        error_log('Sketium: falha ao mover o upload.');
        responder(false, 'Não conseguimos salvar o arquivo. Tente novamente.');
    }
}

/* ------------------------------------------------------------------ banco */

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET,
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS cadastros (
            id            INT AUTO_INCREMENT PRIMARY KEY,
            tipo          VARCHAR(20)  NOT NULL,
            nome          VARCHAR(120) NOT NULL,
            empresa       VARCHAR(120) NULL,
            email         VARCHAR(160) NOT NULL,
            telefone      VARCHAR(20)  NOT NULL,
            area          VARCHAR(120) NOT NULL,
            mensagem      TEXT         NOT NULL,
            arquivo       VARCHAR(80)  NULL,
            consentimento TINYINT(1)   NOT NULL DEFAULT 0,
            ip            VARCHAR(45)  NULL,
            criado_em     DATETIME     NOT NULL,
            INDEX idx_tipo (tipo),
            INDEX idx_criado (criado_em)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    $sql = 'INSERT INTO cadastros
            (tipo, nome, empresa, email, telefone, area, mensagem, arquivo, consentimento, ip, criado_em)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    $pdo->prepare($sql)->execute([
        $tipo, $nome, ($empresa !== '' ? $empresa : null), $email, $telefone,
        $area, $mensagem, $arquivoNome, $consentimento,
        $_SERVER['REMOTE_ADDR'] ?? null, date('Y-m-d H:i:s'),
    ]);
} catch (Throwable $e) {
    // Nunca exibe detalhes do banco ao visitante.
    error_log('Sketium: erro ao gravar cadastro — ' . $e->getMessage());
    responder(false, 'Tivemos um problema ao registrar seu cadastro. Fale conosco pelo WhatsApp (62) 99318-8227.');
}

responder(true, 'Recebemos seu cadastro. Nossa equipe analisa e entra em contato quando houver oportunidade.');
