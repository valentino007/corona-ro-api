<?php

class GlobalCompareController
{

    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function read($limit, $order)
    {
        $query = "SELECT countries.iso, countries.country, 
                        confirmed, deaths, recovered, confirmed - (deaths + recovered) as still_sick, confirmed+deaths+recovered AS stacked 
                        FROM full_corona 
                        INNER JOIN countries ON full_corona.country = countries.country 
                        WHERE DATE = (SELECT MAX(DATE) FROM full_corona) 
                        ORDER BY " . $order . " DESC 
                        LIMIT " . $limit . ";";

        $stmt = $this->conn->prepare($query);

        $stmt->execute();

        return $stmt;
    }
}

?>