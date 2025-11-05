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

// Admin login endpoint using php api.php?action=admin_login
// Expects POST { email, password }
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'admin_login') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
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

    // JWT helpers
    function base64url_encode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    $jwt_secret = getenv('JWT_SECRET') ?: 'secret-key';
    $header = base64url_encode(json_encode(["alg" => "HS256", "typ" => "JWT"]));
    $payloadArr = [
        "id" => isset($user['id']) ? (int)$user['id'] : 0,
        "iat" => time(),
        "exp" => time() + 7 * 24 * 60 * 60
    ];
    $payload = base64url_encode(json_encode($payloadArr));
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
$input = json_decode(file_get_contents('php://input'), true) ?: [];
$table = isset($_GET['table']) ? $_GET['table'] : (isset($input['table']) ? $input['table'] : null);

// validate table name (simple whitelist: letters, numbers, underscore)
function valid_identifier($s) {
    return is_string($s) && preg_match('/^[A-Za-z0-9_]+$/', $s);
}

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
                if (!valid_identifier($new_name)) continue;
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

?>
