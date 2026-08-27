<?php
/**
 * Template de configuração do banco — Sketium Engenharia
 * Copie para db-config.php NO SERVIDOR e preencha. Nunca versione o db-config.php.
 */
if (!defined('DB_HOST')) define('DB_HOST', 'localhost');
if (!defined('DB_NAME')) define('DB_NAME', 'u000000_exemplo');
if (!defined('DB_USER')) define('DB_USER', 'u000000_exemplo');
if (!defined('DB_PASS')) define('DB_PASS', '');
if (!defined('DB_CHARSET')) define('DB_CHARSET', 'utf8mb4');

// Credenciais do painel de administração (Fornecedores / Trabalhe Conosco)
if (!defined('ADMIN_USER')) define('ADMIN_USER', 'admin');
// Gere com: password_hash('sua-senha', PASSWORD_DEFAULT)
if (!defined('ADMIN_PASS_HASH')) define('ADMIN_PASS_HASH', '');
