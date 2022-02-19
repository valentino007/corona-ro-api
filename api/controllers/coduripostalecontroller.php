<?php

class CoduriPostaleController
{

    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function getListByCodPostal($cod)
    {
        $query = "SELECT * FROM coduri_postale WHERE cod LIKE :cod;";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':cod', $cod . '%');

        $stmt->execute();

        return $stmt;
    }
}

?>