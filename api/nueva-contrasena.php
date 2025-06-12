<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once 'db_config_local.php';

// Manejar solicitud GET (verificar token)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $token = $_GET['token'] ?? '';

    try {
        $stmt = $pdo->prepare("SELECT email FROM password_resets WHERE token = ? AND expires_at > NOW()");
        $stmt->execute([$token]);
        $result = $stmt->fetch();

        echo json_encode([
            'valid' => !!$result,
            'email' => $result['email'] ?? null
        ]);
    } catch (PDOException $e) {
        echo json_encode(['valid' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// Manejar solicitud POST (actualizar contraseña)
$data = json_decode(file_get_contents("php://input"), true);
$response = ['success' => false, 'message' => ''];

try {
    $stmt = $pdo->prepare("SELECT email FROM password_resets WHERE token = ? AND expires_at > NOW()");
    $stmt->execute([$data['token']]);
    $result = $stmt->fetch();

    if (!$result) {
        $response['message'] = 'Token inválido o expirado';
        echo json_encode($response);
        exit;
    }

    // Actualizar contraseña
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("UPDATE usuarios SET password = ? WHERE email = ?");
    $stmt->execute([$hashedPassword, $result['email']]);

    // Eliminar token usado
    $pdo->prepare("DELETE FROM password_resets WHERE token = ?")->execute([$data['token']]);

    $response['success'] = true;
    $response['message'] = 'Contraseña actualizada';
} catch (PDOException $e) {
    $response['message'] = 'Error al actualizar';
    error_log("Error en nueva-contrasena: " . $e->getMessage());
}

echo json_encode($response);
