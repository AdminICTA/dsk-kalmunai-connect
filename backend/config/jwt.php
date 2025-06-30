
<?php
class JWT {
    private $secret_key = "dsk_kalmunai_secret_2024_secure_key";
    private $issuer = "DSK_Kalmunai";
    private $audience = "DSK_Users";
    private $expiry = 86400; // 24 hours

    public function encode($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode(array_merge($payload, [
            'iss' => $this->issuer,
            'aud' => $this->audience,
            'iat' => time(),
            'exp' => time() + $this->expiry
        ]));
        
        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, $this->secret_key, true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }

    public function decode($jwt) {
        $parts = explode('.', $jwt);
        if (count($parts) != 3) {
            return false;
        }

        $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[0]));
        $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1]));
        $signature = str_replace(['-', '_'], ['+', '/'], $parts[2]);

        $expectedSignature = hash_hmac('sha256', $parts[0] . "." . $parts[1], $this->secret_key, true);
        $expectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($expectedSignature));

        if ($signature !== $expectedSignature) {
            return false;
        }

        $payload = json_decode($payload, true);
        if ($payload['exp'] < time()) {
            return false;
        }

        return $payload;
    }

    public function verifyToken($token, $requiredRole = null) {
        $decoded = $this->decode($token);
        if (!$decoded) {
            return false;
        }

        if ($requiredRole && $decoded['role'] !== $requiredRole) {
            return false;
        }

        return $decoded;
    }
}
?>
