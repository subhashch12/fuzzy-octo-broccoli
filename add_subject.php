<?php
include 'config.php';

$user_id = $_POST['user_id'];
$course_code = $_POST['course_code'];
$course_title = $_POST['course_title'];
$credits = $_POST['credits'];
$grade = $_POST['grade'];

$sql = "INSERT INTO subjects (user_id, course_code, course_title, credits, grade) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("issii", $user_id, $course_code, $course_title, $credits, $grade);

if ($stmt->execute()) {
    echo "Subject added successfully";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$stmt->close();
$conn->close();
?>
