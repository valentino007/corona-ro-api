<?php

class Judet
{

    private $conn;

    // private
    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function read($judet)
    {
        $query = "SELECT
                judet
                , DATE_FORMAT(data, '%d/%m/%Y')        AS formatted_date
                , confirmed
                , incidence
                , avg_confirmed
                , case
                	when diff_confirmed < 0 then 0
                	ELSE diff_confirmed
                END diff_confirmed
                FROM (
                SELECT *
                , confirmed - COALESCE(
                (
                	SELECT confirmed
                	FROM full_corona_ro prev
                	WHERE judet = :judet
                	AND prev.data = date_sub(cur.data, INTERVAL 1 DAY)
                	ORDER BY DATa asc
                	LIMIT 1 ), 0) AS diff_confirmed
                , ROUND((confirmed - COALESCE(
                (
                	SELECT confirmed
                	FROM full_corona_ro prev
                	WHERE judet = :judet
                	AND prev.data = date_sub(cur.data, INTERVAL 14 DAY)
                	ORDER BY DATa asc
                	LIMIT 1 ), 0)) / 14, 2) avg_confirmed
                FROM full_corona_ro cur
                WHERE judet= :judet
                ORDER BY DATA ASC
                ) tab;";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':judet', $judet);

        $stmt->execute();

        return $stmt;
    }
}

?>