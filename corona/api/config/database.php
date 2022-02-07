<?php

class Database
{

    private $host = "localhost";

    private $database = "corona";

    private $username = "root";

    private $password = "root";

    // well, you don't think these are the real user/pwd@host :-P
    public $conn;

    public function getConnection()
    {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->$host . ';dbname=' . $this->$database, $this->$username, $this->$password);
        } catch (PDOException $e) {
            echo "Error : " . $e->getMessage() . "<br/>";
        }

        return $this->$conn;
    }
}

?>
