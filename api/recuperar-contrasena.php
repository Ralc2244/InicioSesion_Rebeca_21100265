<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Permitir solicitudes OPTIONS para CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_config.php';

$data = json_decode(file_get_contents("php://input"), true);
$response = ['success' => false, 'message' => ''];

if (empty($data['email'])) {
    $response['message'] = 'Email requerido';
    echo json_encode($response);
    exit;
}

$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);

try {
    // 1. Verificar si el email existe
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);

    if ($stmt->rowCount() === 0) {
        // Por seguridad, no revelamos si el email existe
        $response['message'] = 'Si el email existe, recibirás un enlace';
        echo json_encode($response);
        exit;
    }

    // 2. Generar token (válido por 1 hora)
    $token = bin2hex(random_bytes(32));
    $expires = date("Y-m-d H:i:s", strtotime("+1 hour"));

    // 3. Guardar en base de datos
    $stmt = $pdo->prepare("REPLACE INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)");
    $stmt->execute([$email, $token, $expires]);

    // 4. Enviar email (simulado en local)
    $resetLink = "http://localhost:4200/nueva-contrasena?token=$token";

    // Guardar en log para pruebas
    file_put_contents('reset_logs.txt', date('Y-m-d H:i:s') . " - $email - $resetLink\n", FILE_APPEND);

    $response['success'] = true;
    $response['message'] = 'Enlace generado (ver logs)';
    $response['debug_link'] = $resetLink; // Solo para desarrollo

} catch (PDOException $e) {
    $response['message'] = 'Error en el servidor';
    error_log("Error en recuperar-contrasena: " . $e->getMessage());
}

echo json_encode($response);
