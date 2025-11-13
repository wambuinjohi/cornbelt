<?php
// Lightweight api.php compatible with existing cornbelt API
// Reads DB credentials from environment variables: DB_HOST, DB_USER, DB_PASS, DB_NAME

// CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

// Don't leak HTML errors to clients; ensure JSON responses for errors
ini_set('display_errors', '0');
error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);

set_exception_handler(function($e) {
    http_response_code(500);
    error_log("Unhandled exception in api.php: " . $e->getMessage());
    echo json_encode(["error" => "Server error: " . $e->getMessage()]);
    exit;
});

register_shutdown_function(function() {
    $err = error_get_last();
    if ($err && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        http_response_code(500);
        error_log("Fatal error in api.php: " . $err['message']);
        echo json_encode(["error" => "Fatal server error: " . $err['message']]);
        exit;
    }
});

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Try to load environment variables from a .env file in the same directory if any required vars are missing
function load_dotenv_if_needed($path = __DIR__ . '/.env') {
    if (!file_exists($path)) return;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) !== 2) continue;
        $k = trim($parts[0]);
        $v = trim($parts[1]);
        // strip optional surrounding quotes
        if ((substr($v,0,1) === '"' && substr($v,-1) === '"') || (substr($v,0,1) === "'" && substr($v,-1) === "'")) {
            $v = substr($v,1,-1);
        }
        if (getenv($k) === false) putenv("$k=$v");
        if (!isset($_ENV[$k])) $_ENV[$k] = $v;
        if (!isset($_SERVER[$k])) $_SERVER[$k] = $v;
    }
}

load_dotenv_if_needed();

// Quick ping endpoint so clients can detect this PHP backend is active
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'ping') {
    echo json_encode(["backend" => "php", "message" => "pong"]);
    exit;
}

$DB_HOST = getenv('DB_HOST');
$DB_USER = getenv('DB_USER');
$DB_PASS = getenv('DB_PASS');
$DB_NAME = getenv('DB_NAME');

if (!$DB_HOST || !$DB_USER || $DB_PASS === false || !$DB_NAME) {
    http_response_code(500);
    echo json_encode(["error" => "Database credentials not configured. Please set DB_HOST, DB_USER, DB_PASS and DB_NAME environment variables (or provide a .env file)."]);
    exit;
}

// Connect
$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $conn->connect_error]);
    exit;
}

// Public endpoint for footer settings (no authentication required)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && strpos($_SERVER['REQUEST_URI'], '/api/footer-settings') !== false) {
    // Check if table exists, create if not
    $tableExists = $conn->query("SHOW TABLES LIKE 'footer_settings'");
    if (!$tableExists || $tableExists->num_rows === 0) {
        // Create the table
        $createTableSql = "CREATE TABLE IF NOT EXISTS `footer_settings` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `phone` VARCHAR(255),
            `email` VARCHAR(255),
            `location` VARCHAR(255),
            `facebookUrl` VARCHAR(500),
            `instagramUrl` VARCHAR(500),
            `twitterUrl` VARCHAR(500),
            `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";
        $conn->query($createTableSql);
    }

    // Try to fetch existing settings
    $res = $conn->query("SELECT * FROM `footer_settings` LIMIT 1");
    if ($res && $res->num_rows > 0) {
        $row = $res->fetch_assoc();
        echo json_encode($row);
    } else {
        // Table is empty, auto-insert default settings
        $defaultPhone = '+254 (0) XXX XXX XXX';
        $defaultEmail = 'info@cornbelt.co.ke';
        $defaultLocation = 'Kenya';
        $defaultFacebook = '';
        $defaultInstagram = '';
        $defaultTwitter = '';

        $insertSql = "INSERT INTO `footer_settings` (`phone`, `email`, `location`, `facebookUrl`, `instagramUrl`, `twitterUrl`) VALUES (
            '" . $conn->real_escape_string($defaultPhone) . "',
            '" . $conn->real_escape_string($defaultEmail) . "',
            '" . $conn->real_escape_string($defaultLocation) . "',
            '" . $conn->real_escape_string($defaultFacebook) . "',
            '" . $conn->real_escape_string($defaultInstagram) . "',
            '" . $conn->real_escape_string($defaultTwitter) . "'
        )";

        if ($conn->query($insertSql) === TRUE) {
            // Return the newly inserted record
            $newId = $conn->insert_id;
            echo json_encode([
                'id' => $newId,
                'phone' => $defaultPhone,
                'email' => $defaultEmail,
                'location' => $defaultLocation,
                'facebookUrl' => $defaultFacebook,
                'instagramUrl' => $defaultInstagram,
                'twitterUrl' => $defaultTwitter
            ]);
        } else {
            // Insert failed, return fallback
            echo json_encode([
                'id' => 0,
                'phone' => $defaultPhone,
                'email' => $defaultEmail,
                'location' => $defaultLocation,
                'facebookUrl' => $defaultFacebook,
                'instagramUrl' => $defaultInstagram,
                'twitterUrl' => $defaultTwitter
            ]);
        }
    }
    $conn->close();
    exit;
}

// Helper: simple identifier validation
function valid_identifier($s) {
    return is_string($s) && preg_match('/^[A-Za-z0-9_]+$/', $s);
}

// IP Geolocation helper using free ip-api.com API
function fetch_ip_location($ip) {
    if (empty($ip) || $ip === '0.0.0.0') {
        return null;
    }

    // Skip private/local IPs
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
        return null;
    }

    $cache_key = 'ip_location_' . md5($ip);
    // Check cache in /tmp (60 minute TTL via file mtime)
    $cache_file = sys_get_temp_dir() . '/' . $cache_key;
    if (file_exists($cache_file) && (time() - filemtime($cache_file)) < 3600) {
        return json_decode(file_get_contents($cache_file), true);
    }

    try {
        $url = "http://ip-api.com/json/" . urlencode($ip) . "?fields=status,country,countryCode,city,timezone";

        // Use stream context with timeout
        $context = stream_context_create([
            'http' => [
                'timeout' => 3,
                'method' => 'GET',
            ]
        ]);

        $response = @file_get_contents($url, false, $context);

        if ($response === false) {
            return null;
        }

        $data = json_decode($response, true);

        if (!$data || $data['status'] !== 'success') {
            return null;
        }

        $location = [
            'country' => $data['country'] ?? '',
            'country_code' => $data['countryCode'] ?? '',
            'city' => $data['city'] ?? '',
            'timezone' => $data['timezone'] ?? ''
        ];

        // Cache result
        @file_put_contents($cache_file, json_encode($location), LOCK_EX);

        return $location;
    } catch (Exception $e) {
        error_log("IP location fetch error for $ip: " . $e->getMessage());
        return null;
    }
}

// JWT helpers for admin endpoints
function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
function base64url_decode($data) {
    $pad = 4 - (strlen($data) % 4);
    if ($pad < 4) $data .= str_repeat('=', $pad);
    return base64_decode(strtr($data, '-_', '+/'));
}
function verify_jwt($token) {
    $jwt_secret = getenv('JWT_SECRET') ?: 'secret-key';
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;
    list($h, $p, $s) = $parts;
    $rawSig = base64url_decode($s);
    $expected = hash_hmac('sha256', $h . '.' . $p, $jwt_secret, true);
    if (!hash_equals($expected, $rawSig)) return false;
    $payloadJson = base64url_decode($p);
    $payload = json_decode($payloadJson, true);
    if (!is_array($payload)) return false;
    if (isset($payload['exp']) && time() > intval($payload['exp'])) return false;
    return $payload;
}

// Read incoming raw JSON body once
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?: [];

// Support legacy action=upload so clients can POST to /api.php?action=upload with JSON {fileData,fileName}
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'upload') {
    // Auth required
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
    $token = null; if ($authHeader && preg_match('/Bearer\s+(\S+)/', $authHeader, $m)) $token = $m[1];
    if (!$token || !verify_jwt($token)) { http_response_code(401); echo json_encode(['error'=>'Unauthorized']); $conn->close(); exit; }

    $publicDir = __DIR__ . '/public';
    if (!is_dir($publicDir)) mkdir($publicDir, 0755, true);
    $uploadsDir = $publicDir . '/uploads';
    if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0755, true);

    if (isset($input['fileData']) && isset($input['fileName'])) {
        $fileData = $input['fileData'];
        $fileName = basename($input['fileName']);
        $ext = pathinfo($fileName, PATHINFO_EXTENSION);
        $filename = time() . '-' . bin2hex(random_bytes(4)) . ($ext ? '.' . $ext : '');
        $dest = $uploadsDir . '/' . $filename;
        $decoded = base64_decode($fileData);
        if ($decoded === false) { http_response_code(400); echo json_encode(['error'=>'Invalid base64 data']); $conn->close(); exit; }
        if (file_put_contents($dest, $decoded) === false) { http_response_code(500); echo json_encode(['error'=>'Failed to write file']); $conn->close(); exit; }
        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $url = $scheme . '://' . $host . '/uploads/' . $filename;
        echo json_encode(['imageUrl' => $url, 'path' => '/uploads/' . $filename]);
        $conn->close();
        exit;
    }
    http_response_code(400); echo json_encode(['error'=>'No file provided']); $conn->close(); exit;
}

// ADMIN ROUTING shim for deployments without the Node /api/admin server
$uri = $_SERVER['REQUEST_URI'] ?? '';
if (strpos($uri, '/api/admin') !== false) {
    // extract path after /api/admin
    $path = preg_replace('#^.*?/api/admin#', '', $uri);
    $path = preg_replace('#\?.*$#', '', $path);
    $path = trim($path, '/');
    $segments = $path === '' ? [] : explode('/', $path);
    $resource = $segments[0] ?? '';
    $resourceId = $segments[1] ?? null;

    // map resource names (from client) to table names
    $map = [
        'contact-submissions' => 'contact_submissions',
        'hero-images' => 'hero_slider_images',
        'product-images' => 'product_images',
        'testimonials' => 'testimonials',
        'orders' => 'orders',
        'bot-responses' => 'bot_responses',
        'chat-sessions' => 'chats',
        'chat' => 'chats',
        'visitor-tracking' => 'visitor_tracking',
        'support-chat' => 'support_chat',
        'admin-users' => 'admin_users',
        'footer-settings' => 'footer_settings',
        'newsletter-requests' => 'newsletter_requests'
    ];

    // check-initialized: returns whether admin_users has any rows
    if ($resource === 'check-initialized' && $_SERVER['REQUEST_METHOD'] === 'GET') {
        $res = $conn->query("SELECT COUNT(*) as c FROM `admin_users`");
        $count = 0;
        if ($res) {
            $r = $res->fetch_assoc();
            $count = intval($r['c'] ?? 0);
        }
        echo json_encode(['initialized' => $count > 0]);
        $conn->close();
        exit;
    }

    // setup: create initial admin user (only allowed if no admin exists)
    if ($resource === 'setup' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $email = isset($input['email']) ? $conn->real_escape_string($input['email']) : '';
        $password = isset($input['password']) ? $input['password'] : '';
        $fullName = isset($input['fullName']) ? $conn->real_escape_string($input['fullName']) : '';
        if (!$email || !$password || !$fullName) {
            http_response_code(400);
            echo json_encode(['error' => 'email, password and fullName required']);
            $conn->close();
            exit;
        }
        // ensure no admin exists
        $res = $conn->query("SELECT id FROM `admin_users` LIMIT 1");
        if ($res && $res->num_rows > 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Admin already initialized']);
            $conn->close();
            exit;
        }
        $hashed = hash('sha256', $password);
        $createdAt = date('c');
        $sql = "INSERT INTO `admin_users` (`email`,`password`,`fullName`,`createdAt`) VALUES ('" . $conn->real_escape_string($email) . "','" . $conn->real_escape_string($hashed) . "','" . $conn->real_escape_string($fullName) . "','" . $conn->real_escape_string($createdAt) . "')";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => $conn->error]);
        }
        $conn->close();
        exit;
    }

    // login via /api/admin/login -> delegate to existing admin_login flow
    if ($resource === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $email = isset($input['email']) ? $conn->real_escape_string($input['email']) : '';
        $password = isset($input['password']) ? $input['password'] : '';
        if (!$email || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            $conn->close();
            exit;
        }
        $sql = "SELECT * FROM `admin_users` WHERE `email`='" . $conn->real_escape_string($email) . "' LIMIT 1";
        $res = $conn->query($sql);
        if (!$res || $res->num_rows === 0) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            $conn->close();
            exit;
        }
        $user = $res->fetch_assoc();
        $hashed = hash('sha256', $password);
        if (!isset($user['password']) || $user['password'] !== $hashed) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            $conn->close();
            exit;
        }
        // create JWT
        $header = base64url_encode(json_encode(["alg" => "HS256", "typ" => "JWT"]));
        $payloadArr = [
            "id" => isset($user['id']) ? (int)$user['id'] : 0,
            "iat" => time(),
            "exp" => time() + 7 * 24 * 60 * 60
        ];
        $payload = base64url_encode(json_encode($payloadArr));
        $jwt_secret = getenv('JWT_SECRET') ?: 'secret-key';
        $signature = base64url_encode(hash_hmac('sha256', $header . "." . $payload, $jwt_secret, true));
        $token = $header . "." . $payload . "." . $signature;
        $response = [
            "success" => true,
            "token" => $token,
            "user" => [
                "id" => isset($user['id']) ? (int)$user['id'] : null,
                "email" => $user['email'] ?? null,
                "fullName" => $user['fullName'] ?? null,
                "createdAt" => $user['createdAt'] ?? null
            ]
        ];
        echo json_encode($response);
        $conn->close();
        exit;
    }

    // Upload endpoint - accept JSON base64 (fileData,fileName) or multipart file under 'file' — supports /api/admin/upload
    if ($resource === 'upload' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        // Authentication
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
        $token = null;
        if ($authHeader && preg_match('/Bearer\s+(\S+)/', $authHeader, $m)) $token = $m[1];
        if (!$token || !verify_jwt($token)) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            $conn->close();
            exit;
        }

        // Destination dir
        $publicDir = __DIR__ . '/public';
        if (!is_dir($publicDir)) mkdir($publicDir, 0755, true);
        $uploadsDir = $publicDir . '/uploads';
        if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0755, true);

        // Handle multipart
        if (!empty($_FILES) && isset($_FILES['file'])) {
            $file = $_FILES['file'];
            if ($file['error'] !== UPLOAD_ERR_OK) {
                http_response_code(400);
                echo json_encode(['error' => 'File upload error']);
                $conn->close();
                exit;
            }
            $orig = basename($file['name']);
            $ext = pathinfo($orig, PATHINFO_EXTENSION);
            $filename = time() . '-' . bin2hex(random_bytes(4)) . ($ext ? '.' . $ext : '');
            $dest = $uploadsDir . '/' . $filename;
            if (!move_uploaded_file($file['tmp_name'], $dest)) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to save file']);
                $conn->close();
                exit;
            }
            $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
            $url = $scheme . '://' . $host . '/uploads/' . $filename;
            echo json_encode(['imageUrl' => $url, 'path' => '/uploads/' . $filename]);
            $conn->close();
            exit;
        }

        // Handle JSON base64 { fileData, fileName }
        if (isset($input['fileData']) && isset($input['fileName'])) {
            $fileData = $input['fileData'];
            $fileName = basename($input['fileName']);
            $ext = pathinfo($fileName, PATHINFO_EXTENSION);
            $filename = time() . '-' . bin2hex(random_bytes(4)) . ($ext ? '.' . $ext : '');
            $dest = $uploadsDir . '/' . $filename;
            $decoded = base64_decode($fileData);
            if ($decoded === false) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid base64 data']);
                $conn->close();
                exit;
            }
            if (file_put_contents($dest, $decoded) === false) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to write file']);
                $conn->close();
                exit;
            }
            $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
            $url = $scheme . '://' . $host . '/uploads/' . $filename;
            echo json_encode(['imageUrl' => $url, 'path' => '/uploads/' . $filename]);
            $conn->close();
            exit;
        }

        http_response_code(400);
        echo json_encode(['error' => 'No file provided']);
        $conn->close();
        exit;
    }

    // Reseed hero active: ensure at least one isActive
    if ($resource === 'reseed-hero-active' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        // auth
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
        $token = null; if ($authHeader && preg_match('/Bearer\s+(\S+)/', $authHeader, $m)) $token = $m[1];
        if (!$token || !verify_jwt($token)) { http_response_code(401); echo json_encode(['error'=>'Unauthorized']); $conn->close(); exit; }

        // get images
        $res = $conn->query("SELECT * FROM `hero_slider_images`");
        $images = [];
        if ($res) {
            while ($r = $res->fetch_assoc()) $images[] = $r;
        }
        if (count($images) === 0) { echo json_encode(['success'=>true,'message'=>'No images to update']); $conn->close(); exit; }
        foreach ($images as $img) {
            if (isset($img['isActive']) && ($img['isActive'] === '1' || $img['isActive'] === 1 || $img['isActive'] === true)) {
                echo json_encode(['success'=>true,'message'=>'Active images present']); $conn->close(); exit;
            }
        }
        // pick lowest displayOrder or first
        usort($images, function($a,$b){ $aa = isset($a['displayOrder'])?(int)$a['displayOrder']:0; $bb = isset($b['displayOrder'])?(int)$b['displayOrder']:0; return $aa - $bb; });
        $first = $images[0];
        $id = isset($first['id']) ? intval($first['id']) : null;
        if ($id) {
            $conn->query("UPDATE `hero_slider_images` SET `isActive`=1 WHERE id=".intval($id));
            echo json_encode(['success'=>true,'message'=>'Set first image active','id'=>$id]);
            $conn->close();
            exit;
        }
        echo json_encode(['error'=>'Unable to reseed']);
        $conn->close();
        exit;
    }

    // Reseed bot responses
    if ($resource === 'reseed-bot-responses' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
        $token = null; if ($authHeader && preg_match('/Bearer\s+(\S+)/', $authHeader, $m)) $token = $m[1];
        if (!$token || !verify_jwt($token)) { http_response_code(401); echo json_encode(['error'=>'Unauthorized']); $conn->close(); exit; }

        $defaultResponses = [
            ['keyword'=>'hours','answer'=>'Our business hours are Monday - Friday: 8:00 AM - 5:00 PM, Saturday: 9:00 AM - 2:00 PM, Sunday: Closed.'],
            ['keyword'=>'location','answer'=>'We are located at Cornbelt Flour Mill Limited, National Cereals & Produce Board Land, Kenya.'],
            ['keyword'=>'contact','answer'=>'You can reach us via email at info@cornbeltmill.com or support@cornbeltmill.com, or use the contact form on our website.'],
            ['keyword'=>'products','answer'=>'We offer a range of fortified maize meal and other products. Visit our Products page for more details.'],
            ['keyword'=>'shipping','answer'=>'For shipping inquiries, please contact our support team via email and provide your location so we can advise on availability and rates.']
        ];
        $count = 0;
        foreach ($defaultResponses as $r) {
            $k = $conn->real_escape_string($r['keyword']);
            $a = $conn->real_escape_string($r['answer']);
            if ($conn->query("INSERT INTO `bot_responses` (`keyword`,`answer`,`createdAt`) VALUES ('$k','$a','" . $conn->real_escape_string(date('c')) . "')")) $count++;
        }
        echo json_encode(['success'=>true,'message'=>'Bot responses reseeded successfully','count'=>$count]);
        $conn->close();
        exit;
    }

    // Chat sessions list
    if ($resource === 'chat-sessions' && $_SERVER['REQUEST_METHOD'] === 'GET') {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
        $token = null; if ($authHeader && preg_match('/Bearer\s+(\S+)/', $authHeader, $m)) $token = $m[1];
        if (!$token || !verify_jwt($token)) { http_response_code(401); echo json_encode(['error'=>'Unauthorized']); $conn->close(); exit; }
        $res = $conn->query("SELECT * FROM `chats` ORDER BY createdAt ASC");
        $sessions = [];
        if ($res) {
            while ($r = $res->fetch_assoc()) {
                $sid = $r['sessionId'] ?? '';
                if (!isset($sessions[$sid])) $sessions[$sid] = [];
                $sessions[$sid][] = $r;
            }
        }
        $out = [];
        foreach ($sessions as $sid => $msgs) {
            $last = end($msgs);
            $out[] = ['sessionId'=>$sid,'lastMessageAt'=>$last['createdAt'] ?? null,'messages'=>$msgs];
        }
        echo json_encode($out);
        $conn->close();
        exit;
    }

    // Chat messages for a specific session
    if ($resource === 'chat' && $resourceId && $_SERVER['REQUEST_METHOD'] === 'GET') {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
        $token = null; if ($authHeader && preg_match('/Bearer\s+(\S+)/', $authHeader, $m)) $token = $m[1];
        if (!$token || !verify_jwt($token)) { http_response_code(401); echo json_encode(['error'=>'Unauthorized']); $conn->close(); exit; }
        $sessionId = $conn->real_escape_string(urldecode($resourceId));
        $res = $conn->query("SELECT * FROM `chats` WHERE sessionId='" . $sessionId . "' ORDER BY createdAt ASC");
        $messages = [];
        if ($res) {
            while ($r = $res->fetch_assoc()) $messages[] = $r;
        }
        echo json_encode($messages);
        $conn->close();
        exit;
    }

    // Footer settings GET - return single record
    if ($resource === 'footer-settings' && $_SERVER['REQUEST_METHOD'] === 'GET') {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
        $token = null; if ($authHeader && preg_match('/Bearer\s+(\S+)/', $authHeader, $m)) $token = $m[1];
        if (!$token || !verify_jwt($token)) { http_response_code(401); echo json_encode(['error'=>'Unauthorized']); $conn->close(); exit; }

        $res = $conn->query("SELECT * FROM `footer_settings`");
        $records = [];
        if ($res) {
            while ($r = $res->fetch_assoc()) $records[] = $r;
        }
        echo json_encode($records);
        $conn->close();
        exit;
    }

    // Visitor tracking with IP-to-location enrichment
    if ($resource === 'visitor-tracking' && $_SERVER['REQUEST_METHOD'] === 'GET') {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
        $token = null; if ($authHeader && preg_match('/Bearer\s+(\S+)/', $authHeader, $m)) $token = $m[1];
        if (!$token || !verify_jwt($token)) { http_response_code(401); echo json_encode(['error'=>'Unauthorized']); $conn->close(); exit; }

        $res = $conn->query("SELECT * FROM `visitor_tracking` ORDER BY timestamp DESC");
        $records = [];
        if ($res) {
            while ($r = $res->fetch_assoc()) {
                // Enrich with IP location if IP exists and location columns are empty
                if (!empty($r['ip_address']) && (empty($r['geolocation_country']) || empty($r['geolocation_city']))) {
                    $location = fetch_ip_location($r['ip_address']);
                    if ($location) {
                        $r['geolocation_country'] = $location['country'] ?? '';
                        $r['geolocation_country_code'] = $location['country_code'] ?? '';
                        $r['geolocation_city'] = $location['city'] ?? '';
                        $r['geolocation_timezone'] = $location['timezone'] ?? '';

                        // Optionally update database to cache the location
                        $update_sql = "UPDATE `visitor_tracking` SET
                            `geolocation_country`='" . $conn->real_escape_string($location['country'] ?? '') . "',
                            `geolocation_country_code`='" . $conn->real_escape_string($location['country_code'] ?? '') . "',
                            `geolocation_city`='" . $conn->real_escape_string($location['city'] ?? '') . "',
                            `geolocation_timezone`='" . $conn->real_escape_string($location['timezone'] ?? '') . "'
                            WHERE id=" . intval($r['id']);
                        $conn->query($update_sql);
                    }
                }
                $records[] = $r;
            }
        }
        echo json_encode($records);
        $conn->close();
        exit;
    }

    // Allow unauthenticated visitor tracking inserts from client-side tracking
    if ($resource === 'visitor-tracking' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        // Insert visitor tracking record without requiring JWT auth
        $payload = $input;
        // remove control keys
        unset($payload['create_table'], $payload['alter_table'], $payload['drop_table'], $payload['table']);

        $keys = [];
        $escaped = [];
        foreach ($payload as $k => $v) {
            if (!valid_identifier($k)) continue;
            $keys[] = $k;
            $s = (string)$v;
            if (mb_strlen($s, 'UTF-8') > 1024) $s = mb_substr($s, 0, 1024, 'UTF-8');
            $escaped[] = $conn->real_escape_string($s);
        }

        if (count($keys) === 0) {
            echo json_encode(["error" => "No valid fields to insert"]);
            $conn->close();
            exit;
        }

        $sql = "INSERT INTO `visitor_tracking` (`" . implode('`, `', array_map(function($k) use ($conn) { return $conn->real_escape_string($k); }, $keys)) . "`) VALUES ('" . implode("', '", $escaped) . "')";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true, "id" => $conn->insert_id]);
        } else {
            http_response_code(500);
            error_log("Visitor tracking insert error: " . $conn->error . " SQL: " . $sql);
            echo json_encode(["error" => $conn->error]);
        }
        $conn->close();
        exit;
    }

    // For other admin resources, map resource to a table and require JWT auth
    if ($resource && isset($map[$resource])) {
        // Authenticate
        $authHeader = null;
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        elseif (function_exists('apache_request_headers')) {
            $hdrs = apache_request_headers();
            if (isset($hdrs['Authorization'])) $authHeader = $hdrs['Authorization'];
        }
        $token = null;
        if ($authHeader && preg_match('/Bearer\s+(\S+)/', $authHeader, $m)) $token = $m[1];
        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            $conn->close();
            exit;
        }
        $payload = verify_jwt($token);
        if (!$payload) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            $conn->close();
            exit;
        }

        // set table and id for reuse in main CRUD handling below
        $table = $map[$resource];
        $_GET['table'] = $table;
        if ($resourceId) {
            $_GET['id'] = $resourceId;
        }

        // Special-case GET sorting/behavior for certain tables
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            if ($resource === 'hero-images') {
                $q = $conn->query("SELECT * FROM `hero_slider_images` ORDER BY COALESCE(displayOrder,0) ASC");
                $out = [];
                if ($q) while ($r = $q->fetch_assoc()) $out[] = $r;
                echo json_encode($out);
                $conn->close();
                exit;
            }
            if ($resource === 'product-images') {
                $q = $conn->query("SELECT * FROM `product_images` ORDER BY COALESCE(displayOrder,0) ASC");
                $out = [];
                if ($q) while ($r = $q->fetch_assoc()) $out[] = $r;
                echo json_encode($out);
                $conn->close();
                exit;
            }
            if ($resource === 'testimonials') {
                $q = $conn->query("SELECT * FROM `testimonials` ORDER BY COALESCE(displayOrder,0) ASC");
                $out = [];
                if ($q) while ($r = $q->fetch_assoc()) $out[] = $r;
                echo json_encode($out);
                $conn->close();
                exit;
            }
            if ($resource === 'bot-responses') {
                $q = $conn->query("SELECT * FROM `bot_responses` ORDER BY id ASC");
                $out = [];
                if ($q) while ($r = $q->fetch_assoc()) $out[] = $r;
                echo json_encode($out);
                $conn->close();
                exit;
            }
            if ($resource === 'newsletter-requests') {
                $q = $conn->query("SELECT * FROM `newsletter_requests` ORDER BY createdAt DESC");
                $out = [];
                if ($q) while ($r = $q->fetch_assoc()) $out[] = $r;
                echo json_encode($out);
                $conn->close();
                exit;
            }
            if ($resource === 'footer-settings') {
                // Public endpoint - no authentication required
                $q = $conn->query("SELECT * FROM `footer_settings` LIMIT 1");
                $out = null;
                if ($q && $q->num_rows > 0) {
                    $out = $q->fetch_assoc();
                } else {
                    // Auto-seed default footer settings if table is empty
                    $defaultSettings = [
                        'phone' => '+254 (0) XXX XXX XXX',
                        'email' => 'info@cornbelt.co.ke',
                        'location' => 'Kenya',
                        'facebookUrl' => '',
                        'instagramUrl' => '',
                        'twitterUrl' => ''
                    ];
                    $keys = array_keys($defaultSettings);
                    $vals = array_map(fn($v) => $conn->real_escape_string((string)$v), $defaultSettings);
                    $insertSql = "INSERT INTO `footer_settings` (`" . implode('`, `', $keys) . "`) VALUES ('" . implode("', '", $vals) . "')";
                    if ($conn->query($insertSql) === TRUE) {
                        $out = array_merge(['id' => $conn->insert_id], $defaultSettings);
                    } else {
                        $out = array_merge(['id' => 0], $defaultSettings);
                    }
                }
                echo json_encode($out);
                $conn->close();
                exit;
            }
            // default falls through to generic CRUD below
        }
        // continue to generic CRUD handler
    } else {
        // resource not mapped -> return 404
        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
        $conn->close();
        exit;
    }
}

// Admin login endpoint using php api.php?action=admin_login (legacy)
// Expects POST { email, password }
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'admin_login') {
    $email = isset($input['email']) ? $conn->real_escape_string($input['email']) : '';
    $password = isset($input['password']) ? $input['password'] : '';

    if (!$email || !$password) {
        // Log the raw request body for debugging (do not enable in production)
        $raw = file_get_contents('php://input');
        error_log("admin_login failed - missing fields. Raw input: " . $raw);

        http_response_code(400);
        echo json_encode(["error" => "Email and password are required"]);
        $conn->close();
        exit;
    }

    // Find admin user
    $sql = "SELECT * FROM `admin_users` WHERE `email`='" . $conn->real_escape_string($email) . "' LIMIT 1";
    $res = $conn->query($sql);
    if (!$res || $res->num_rows === 0) {
        error_log("admin_login: user not found for email: " . $email);
        http_response_code(401);
        echo json_encode(["error" => "Invalid credentials"]);
        $conn->close();
        exit;
    }

    $user = $res->fetch_assoc();
    $hashed = hash('sha256', $password);
    if (!isset($user['password']) || $user['password'] !== $hashed) {
        // Avoid logging raw passwords; log hashed comparison and user id/email for debugging
        error_log(sprintf("admin_login: password mismatch for user id=%s email=%s hashed_given=%s stored=%s", isset($user['id']) ? $user['id'] : 'unknown', $email, $hashed, isset($user['password']) ? substr($user['password'],0,16) . '...' : 'none'));
        http_response_code(401);
        echo json_encode(["error" => "Invalid credentials"]);
        $conn->close();
        exit;
    }

    $header = base64url_encode(json_encode(["alg" => "HS256", "typ" => "JWT"]));
    $payloadArr = [
        "id" => isset($user['id']) ? (int)$user['id'] : 0,
        "iat" => time(),
        "exp" => time() + 7 * 24 * 60 * 60
    ];
    $payload = base64url_encode(json_encode($payloadArr));
    $jwt_secret = getenv('JWT_SECRET') ?: 'secret-key';
    $signature = base64url_encode(hash_hmac('sha256', $header . "." . $payload, $jwt_secret, true));
    $token = $header . "." . $payload . "." . $signature;

    $response = [
        "success" => true,
        "token" => $token,
        "user" => [
            "id" => isset($user['id']) ? (int)$user['id'] : null,
            "email" => $user['email'] ?? null,
            "fullName" => $user['fullName'] ?? null,
            "createdAt" => $user['createdAt'] ?? null
        ]
    ];

    echo json_encode($response);
    $conn->close();
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
// $input is already set above
$table = isset($_GET['table']) ? $_GET['table'] : (isset($input['table']) ? $input['table'] : null);

if (!$table && !isset($input['drop_table']) && !isset($input['create_table']) && !isset($input['alter_table'])) {
    echo json_encode(["error" => "Table name is required"]);
    exit;
}

if ($table && !valid_identifier($table)) {
    echo json_encode(["error" => "Invalid table name"]);
    exit;
}

// CREATE TABLE
if (isset($input['create_table'])) {
    if (!$table) {
        echo json_encode(["error" => "Table name required for create_table"]);
        exit;
    }
    $columns = $input['columns'] ?? [];
    if (!is_array($columns) || count($columns) === 0) {
        echo json_encode(["error" => "No columns provided"]);
        exit;
    }
    $fields = [];
    foreach ($columns as $name => $type) {
        if (!valid_identifier($name) || !is_string($type)) {
            continue;
        }
        // allow type string as-is (developer responsibility)
        $fields[] = "`" . $conn->real_escape_string($name) . "` " . $type;
    }
    if (count($fields) === 0) {
        echo json_encode(["error" => "No valid columns provided"]);
        exit;
    }
    $sql = "CREATE TABLE IF NOT EXISTS `" . $conn->real_escape_string($table) . "` (" . implode(", ", $fields) . ")";
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => "Table created or already exists"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => $conn->error]);
    }
    $conn->close();
    exit;
}

// ALTER TABLE
if (isset($input['alter_table'])) {
    if (!$table) {
        echo json_encode(["error" => "Table name required for alter_table"]);
        exit;
    }
    $actions = $input['actions'] ?? [];
    if (!is_array($actions) || count($actions) === 0) {
        echo json_encode(["error" => "No ALTER actions provided"]);
        exit;
    }
    $alter_parts = [];
    foreach ($actions as $action) {
        $type = isset($action['type']) ? strtoupper($action['type']) : '';
        $name = $action['name'] ?? '';
        $definition = $action['definition'] ?? '';
        $new_name = $action['new_name'] ?? '';
        if (!valid_identifier($name) && $type !== 'CHANGE') {
            continue;
        }
        switch ($type) {
            case 'ADD':
                $alter_parts[] = "ADD COLUMN `" . $conn->real_escape_string($name) . "` " . $definition;
                break;
            case 'MODIFY':
                $alter_parts[] = "MODIFY COLUMN `" . $conn->real_escape_string($name) . "` " . $definition;
                break;
            case 'CHANGE':
                if (!valid_identifier($new_name)) continue 2;
                $alter_parts[] = "CHANGE `" . $conn->real_escape_string($name) . "` `" . $conn->real_escape_string($new_name) . "` " . $definition;
                break;
            case 'DROP':
                $alter_parts[] = "DROP COLUMN `" . $conn->real_escape_string($name) . "`";
                break;
            default:
                http_response_code(400);
                echo json_encode(["error" => "Unsupported ALTER type: $type"]);
                $conn->close();
                exit;
        }
    }
    if (count($alter_parts) === 0) {
        echo json_encode(["error" => "No valid ALTER parts"]);
        $conn->close();
        exit;
    }
    $sql = "ALTER TABLE `" . $conn->real_escape_string($table) . "` " . implode(", ", $alter_parts);
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => "Table altered successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => $conn->error]);
    }
    $conn->close();
    exit;
}

// DROP TABLE
if (isset($input['drop_table'])) {
    $tableToDrop = $input['drop_table'];
    if (!valid_identifier($tableToDrop)) {
        echo json_encode(["error" => "Invalid table name to drop"]);
        exit;
    }
    $sql = "DROP TABLE IF EXISTS `" . $conn->real_escape_string($tableToDrop) . "`";
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => "Table $tableToDrop dropped successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => $conn->error]);
    }
    $conn->close();
    exit;
}

// CRUD operations
switch ($method) {
    case 'GET':
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        $sql = "SELECT * FROM `" . $conn->real_escape_string($table) . "`" . ($id ? " WHERE id=" . intval($id) : "");
        $result = $conn->query($sql);
        $data = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
        }
        echo json_encode($data);
        break;

    case 'POST':
        // insert record
        $payload = $input;
        // remove control keys
        unset($payload['create_table'], $payload['alter_table'], $payload['drop_table'], $payload['table']);
        if (!is_array($payload) || count($payload) === 0) {
            echo json_encode(["error" => "No data provided for insert"]);
            break;
        }
        $keys = [];
        $escaped = [];
        // Only include valid identifier keys and sanitize/truncate values to avoid DB errors
        foreach ($payload as $k => $v) {
            if (!valid_identifier($k)) continue;
            $keys[] = $k;
            $s = (string)$v;
            // truncate long strings to 1024 characters (adjust if your schema allows more)
            if (mb_strlen($s, 'UTF-8') > 1024) {
                $s = mb_substr($s, 0, 1024, 'UTF-8');
            }
            $escaped[] = $conn->real_escape_string($s);
        }

        if (count($keys) === 0) {
            echo json_encode(["error" => "No valid fields to insert"]);
            break;
        }

        $sql = "INSERT INTO `" . $conn->real_escape_string($table) . "` (`" . implode('`, `', array_map(function($k) use ($conn) { return $conn->real_escape_string($k); }, $keys)) . "`) VALUES ('" . implode("', '", $escaped) . "')";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true, "id" => $conn->insert_id]);
        } else {
            http_response_code(500);
            $err = $conn->error;
            error_log("DB insert error for table $table: $err; SQL: $sql");
            // If DEBUG env is set, include SQL/err in response for easier debugging (do not enable in production)
            $response = ["error" => $err];
            if (getenv('API_DEBUG') === '1') {
                $response['sql'] = $sql;
            }
            echo json_encode($response);
        }
        break;

    case 'PUT':
    case 'PATCH':
        $id = isset($_GET['id']) ? intval($_GET['id']) : (isset($input['id']) ? intval($input['id']) : null);
        if (!$id) {
            echo json_encode(["error" => "ID required for update"]);
            break;
        }
        $updates = [];
        foreach ($input as $key => $value) {
            if ($key === 'id' || $key === 'table' || in_array($key, ['create_table','alter_table','drop_table'])) continue;
            if (!valid_identifier($key)) continue;
            $updates[] = "`" . $conn->real_escape_string($key) . "`='" . $conn->real_escape_string((string)$value) . "'";
        }
        if (count($updates) === 0) {
            echo json_encode(["error" => "No valid fields to update"]);
            break;
        }
        $sql = "UPDATE `" . $conn->real_escape_string($table) . "` SET " . implode(", ", $updates) . " WHERE id=" . intval($id);
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => $conn->error]);
        }
        break;

    case 'DELETE':
        $id = isset($_GET['id']) ? intval($_GET['id']) : (isset($input['id']) ? intval($input['id']) : null);
        if (!$id) {
            echo json_encode(["error" => "ID required for delete"]);
            break;
        }
        $sql = "DELETE FROM `" . $conn->real_escape_string($table) . "` WHERE id=" . intval($id);
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => $conn->error]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Unsupported request method"]);
        break;
}

$conn->close();
