<?php
include 'config.php';

$username = $_POST['username'];
$password = $_POST['password'];

$sql = "SELECT * FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    if (password_verify($password, $user['password'])) {
        echo json_encode(['user_id' => $user['id'], 'username' => $user['username']]);
    } else {
        echo "Invalid password";
    }
} else {
    echo "No user found";
}

$stmt->close();
$conn->close();
?>
