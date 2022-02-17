<?php

class CountryInfoController
{

    private $conn;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function read($country)
    {
        $query = "SELECT countries.iso
                    ,countries.iso3
                    ,countries.country as country_name
                    ,countries.population
                    ,full_corona.confirmed
                    ,full_corona.deaths
                    ,full_corona.recovered
                    ,full_corona.confirmed - (full_corona.recovered + full_corona.deaths) AS still_sick
                    ,full_corona.confirmed - view_previous_date.confirmed as new_cases
                    ,full_corona.deaths - view_previous_date.deaths as new_deaths
                    ,full_corona.recovered - view_previous_date.recovered as new_recovered
                    ,(full_corona.confirmed - (full_corona.recovered + full_corona.deaths)) -
                    	(view_previous_date.confirmed - (view_previous_date.recovered + view_previous_date.deaths)) AS new_still_sick
                    ,full_corona.date as last_date
                    FROM
                        full_corona
                    INNER JOIN countries
                    ON full_corona.country = countries.country
                    AND countries.iso    = :country
                    AND full_corona.date = (SELECT MAX(DATE) FROM full_corona )
                    INNER JOIN view_previous_date
                    ON countries.iso = view_previous_date.iso";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':country', $country);

        $stmt->execute();

        return $stmt;
    }
}

?>