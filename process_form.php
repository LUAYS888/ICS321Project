<?php
$servername = "10.94.1.129";
$username = "root";
$password = "";
$dbname = "blood donations";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Retrieve form data
$fname = $_POST['Fname'];
$lname = $_POST['Lname'];
$uname = $_POST['Uname'];
$password = $_POST['passwordInput'];
$email = $_POST['email'];
$gender = $_POST['gender'];
$userType = $_POST['userType'];
$bloodType = $_POST['bloodType'];


// SQL query to insert data into the table
$sql = "INSERT INTO person (Fname, Lname,Uname,passwordInput,email,gender,userType,bloodType) VALUES ('$fname', '$lname','$uname','$password','$email','$gender','$userType','$bloodType')";

if ($conn->query($sql) === TRUE) {
    echo "Record inserted successfully";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>