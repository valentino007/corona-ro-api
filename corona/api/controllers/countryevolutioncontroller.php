<?php

class CountryEvolutionController
{

    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function read($country)
    {
        $query = "SELECT
                	   DATE                            		AS raw_date
                     , DATE_FORMAT(date, '%d/%m/%Y')        AS formatted_date
                     , confirmed                            AS confirmed
                     , deaths                               AS deaths
                     , recovered                            AS recovered
                     , confirmed - (deaths + recovered)		AS still_sick
                FROM full_corona
                INNER JOIN countries
                ON full_corona.country = countries.country
                WHERE countries.iso = :country
                AND confirmed > 0
                ORDER BY DATE ASC;";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':country', $country);

        $stmt->execute();

        return $stmt;
    }
}

?>