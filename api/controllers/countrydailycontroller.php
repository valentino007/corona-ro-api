<?php

class CountryDailyController
{

    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function read($country, $avg)
    {
        $query = "SELECT DATE
                    , date_format(cur.date,'%d/%m/%Y')    AS formatted_date
                    , confirmed - COALESCE(
                    (
                    	SELECT confirmed
                    	FROM full_corona prev
                    	INNER JOIN countries ON prev.country = countries.country
                    	WHERE iso = :country
                    	AND prev.date = date_sub(cur.date, INTERVAL 1 DAY)
                    	ORDER BY DATE asc
                    	LIMIT 1 ), 0) AS diff_confirmed
                    , deaths - COALESCE(
                    (
                    	SELECT deaths
                    	FROM full_corona prev
                    	INNER JOIN countries ON prev.country = countries.country
                    	WHERE iso = :country
                    	AND prev.date = date_sub(cur.date, INTERVAL 1 DAY)
                    	ORDER BY DATE asc
                    	LIMIT 1 ), 0) AS diff_deaths
                    , recovered - COALESCE(
                    (
                    	SELECT recovered
                    	FROM full_corona prev
                    	INNER JOIN countries ON prev.country = countries.country
                    	WHERE iso = :country
                    	AND prev.date = date_sub(cur.date, INTERVAL 1 DAY)
                    	ORDER BY DATE asc
                    	LIMIT 1 ), 0) AS diff_recovered
                    , (confirmed - (deaths + recovered)) - COALESCE(
                    (
                    	SELECT confirmed - (deaths + recovered)
                    	FROM full_corona prev
                    	INNER JOIN countries ON prev.country = countries.country
                    	WHERE iso = :country
                    	AND prev.date = date_sub(cur.date, INTERVAL 1 DAY)
                    	ORDER BY DATE asc
                    	LIMIT 1 ), 0) AS diff_still_sick
                    , ROUND((confirmed - COALESCE(
                    (
                    	SELECT confirmed
                    	FROM full_corona prev
                    	INNER JOIN countries ON prev.country = countries.country
                    	WHERE iso = :country
                    	AND prev.date = date_sub(cur.date, INTERVAL " . $avg . " DAY)
                    	ORDER BY DATE asc
                    	LIMIT 1 ), 0)) / " . $avg . ", 2) AS avg_confirmed
                    FROM full_corona cur
                    INNER JOIN countries ON cur.country = countries.country
                    WHERE iso = :country
                    AND confirmed > 0
                    ORDER BY DATE ASC;";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':country', $country);

        $stmt->execute();

        return $stmt;
    }
}

?>